from flask import Flask, request, jsonify
from flask_migrate import Migrate
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
import os
import litellm
from litellm.exceptions import RateLimitError

from modules.plan import Plan, db
from modules.user import User

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)

def normalize_chat_message(message):
    if isinstance(message, str):
        return message.strip()

    if isinstance(message, dict):
        content = message.get("content")
        details = []

        if content:
            details.append(str(content))

        labels = {
            "discipline": "Disciplina",
            "resume": "Resumo",
            "title": "Titulo",
        }

        for key, label in labels.items():
            value = message.get(key)
            if value:
                details.append(f"{label}: {value}")

        return "\n".join(details).strip()

    return ""

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

# Home route
@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Make-Plan-Class API'}), 200

@app.route("/users/<int:user_id>/plans/<string:title>/chat", methods=["POST"])
def chat(user_id, title):
    plan = Plan.query.filter_by(user_id=user_id, title=title).first()

    if not plan:
        return jsonify({"error": "Plan not found"}), 404

    data = request.get_json(silent=True) or {}
    mensagem = normalize_chat_message(data.get("message"))

    if not mensagem:
        return jsonify({"error": "No message provided"}), 400

    # Adiciona a mensagem do usuÃ¡rio ao histÃ³rico
    plan.add_history(f"user: {mensagem}")
    historico = [
        {
            "role": "user",
            "content": [{"type": "text", "text": mensagem}]
        }
    ]

    try:
        response = litellm.completion(
            model=f"{os.getenv('LLM_OPENAI')}/{os.getenv('LLM_MODEL_OPENAI')}",
            messages=[
                {
                    "role": "system",
                    "content": [{"type": "text", "text": "Assistente Pedagogico. Fazendo o seguinte: sugestões de conteúdos complementares, tópicos relacionados e 3 tags recomendadas."}]
                },
                *historico
            ],
            #max_tokens=int(os.getenv('LLM_MAX_TOKENS', 500)),
        )
    except RateLimitError:
        return jsonify({"error": "LLM quota exceeded. Check your OpenAI billing/quota."}), 429
    except Exception as exc:
        return jsonify({"error": "Failed to call LLM", "details": str(exc)}), 500

    choice = response["choices"][0] if isinstance(response, dict) else response.choices[0]
    message = choice["message"] if isinstance(choice, dict) else choice.message
    resposta = message["content"] if isinstance(message, dict) else message.content
    plan.set_content(resposta)
    # Adiciona a resposta da IA ao histÃ³rico
    historico.append({"role": "assistant", "content": resposta})
    plan.add_history(f"assistant: {resposta}")

    return jsonify({"response": resposta})

@app.route('/create_user', methods=['POST'])
def create_user():
    data = request.get_json(silent=True) or {}

    if not data.get('username'):
        return jsonify({'error': 'username is required'}), 400
    
    user = User(username=data['username'])
    
    try:
        db.session.add(user)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({'error': 'Failed to create user', 'details': str(exc)}), 500
    
    return jsonify({'message': 'User created successfully', 'user': {'user_id': user.user_id, 'username': user.username}}), 201

@app.route('/create_plan', methods=['POST'])
def create_plan():
    data = request.get_json(silent=True) or {}

    if not data.get('title'):
        return jsonify({'error': 'title is required'}), 400
    
    plan = Plan(
        user_id=data['user_id'],
        title=data['title'],
        objective=data['objective'],
        resume=data['resume'],
        pre_data=data['pre_data'],
        discipline=data['discipline'],
        content=data['content'],
        resources=data['resources'],
    )
    
    try:
        db.session.add(plan)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({'error': 'Failed to create plan', 'details': str(exc)}), 500
    
    return jsonify({'message': 'Plan created successfully', 'plan': plan.to_dict()}), 201

@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        result = [{'user_id': user.user_id, 'username': user.username} for user in users]
        return jsonify({'users': result}), 200
    except SQLAlchemyError as exc:
        return jsonify({'error': 'Failed to list users', 'details': str(exc)}), 500

@app.route('/plans', methods=['GET'])
def get_plans():
    try:
        plans = Plan.query.all()
        result = [plan.to_dict() for plan in plans]
        return jsonify({'plans': result}), 200
    except SQLAlchemyError as exc:
        return jsonify({'error': 'Failed to list plans', 'details': str(exc)}), 500

@app.route('/user/<int:user_id>/plans', methods=['GET'])
def get_user_plans(user_id):
    try:
        plans = Plan.query.filter_by(user_id=user_id).all()
        result = [plan.to_dict() for plan in plans]
        return jsonify({'plans': result}), 200
    except SQLAlchemyError as exc:
        return jsonify({'error': 'Failed to list user plans', 'details': str(exc)}), 500

@app.route('/users/<int:user_id>/plans/<string:title>', methods=['GET'])
def get_user_plan_by_title(user_id, title):
    plan = Plan.query.filter_by(user_id=user_id, title=title).first()

    if not plan:
        return jsonify({'error': 'Plan not found'}), 404

    return jsonify({'plan': plan.to_dict()}), 200

if __name__ == '__main__':
    # Inicializar banco de dados e tabelas
    with app.app_context():
        try:
            db.create_all()
            print('Database tables initialized.')
        except Exception as exc:
            print(f'Database initialization failed: {exc}')
    
    app.run(debug=True, host='0.0.0.0', port=5000)
