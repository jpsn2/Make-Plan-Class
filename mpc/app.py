from flask import Flask, request, jsonify
from flask_migrate import Migrate
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
import os
import re
from urllib.parse import quote_plus, unquote

import litellm
import pymysql
from litellm.exceptions import RateLimitError

from modules.plan import Plan, db


load_dotenv()

app = Flask(__name__)


def get_database_config():
    password = unquote(os.getenv('DB_PASSWORD', ''))

    return {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'user': os.getenv('DB_USER', 'root'),
        'password': password,
        'name': os.getenv('DB_NAME', 'mpc_db_no_user'),
    }


def build_database_uri():
    config = get_database_config()
    password = quote_plus(config['password'])

    return (
        f"mysql+pymysql://{config['user']}:{password}"
        f"@{config['host']}:{config['port']}/{config['name']}"
    )


def ensure_database_exists():
    config = get_database_config()

    if not re.match(r'^[A-Za-z0-9_]+$', config['name']):
        raise ValueError('DB_NAME must contain only letters, numbers, and underscores')

    connection = pymysql.connect(
        host=config['host'],
        port=config['port'],
        user=config['user'],
        password=config['password'],
        charset='utf8mb4',
    )

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{config['name']}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        connection.commit()
    finally:
        connection.close()


app.config['SQLALCHEMY_DATABASE_URI'] = build_database_uri()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

db.init_app(app)
migrate = Migrate(app, db)


def normalize_recommendation_message(message):
    if isinstance(message, str):
        return message.strip()

    if isinstance(message, dict):
        content = message.get('content')
        details = []

        if content:
            details.append(str(content))

        labels = {
            'discipline': 'Disciplina',
            'resume': 'Resumo',
            'title': 'Titulo',
        }

        for key, label in labels.items():
            value = message.get(key)
            if value:
                details.append(f'{label}: {value}')

        return '\n'.join(details).strip()

    return ''


def generate_recommendations(message):
    response = litellm.completion(
        model=f"{os.getenv('LLM_OPENAI')}/{os.getenv('LLM_MODEL_OPENAI')}",
        messages=[
            {
                'role': 'system',
                'content': [
                    {
                        'type': 'text',
                        'text': (
                            'Assistente pedagogico. Gere sugestoes de conteudos '
                            'complementares, topicos relacionados e 3 tags recomendadas.'
                        ),
                    }
                ],
            },
            {
                'role': 'user',
                'content': [{'type': 'text', 'text': message}],
            },
        ],
        # max_tokens=int(os.getenv('LLM_MAX_TOKENS', 500)),
    )

    choice = response['choices'][0] if isinstance(response, dict) else response.choices[0]
    response_message = choice['message'] if isinstance(choice, dict) else choice.message
    return response_message['content'] if isinstance(response_message, dict) else response_message.content


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200


@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Make-Plan-Class API'}), 200


@app.route('/recommendations', methods=['GET'])
def recommendations():
    data = request.get_json(silent=True) or {}
    title = data.get('title') or request.args.get('title')

    if not title:
        return jsonify({'error': 'title is required'}), 400

    plan = Plan.query.filter_by(title=title).first()

    if not plan:
        return jsonify({'error': 'Plan not found'}), 404

    message = normalize_recommendation_message({
        'title': plan.title,
        'discipline': plan.discipline,
        'resume': plan.resume,
    })

    try:
        response = generate_recommendations(message)
    except RateLimitError:
        return jsonify({'error': 'LLM quota exceeded. Check your OpenAI billing/quota.'}), 429
    except Exception as exc:
        return jsonify({'error': 'Failed to call LLM', 'details': str(exc)}), 500

    plan.set_content(response)
    plan.add_history(f'recommendations: {response}')

    return jsonify({'response': response, 'plan': plan.to_dict()}), 200


@app.route('/create_plan', methods=['POST'])
def create_plan():
    data = request.get_json(silent=True) or {}

    if not data.get('title'):
        return jsonify({'error': 'title is required'}), 400

    plan = Plan(
        title=data['title'],
        objective=data.get('objective', ''),
        resume=data.get('resume', ''),
        pre_data=data.get('pre_data', ''),
        discipline=data.get('discipline', ''),
        content=data.get('content', ''),
        resources=data.get('resources', ''),
    )

    try:
        db.session.add(plan)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({'error': 'Failed to create plan', 'details': str(exc)}), 500

    return jsonify({'message': 'Plan created successfully', 'plan': plan.to_dict()}), 201


@app.route('/plans', methods=['GET'])
def get_plans():
    try:
        plans = Plan.query.all()
        result = [plan.to_dict() for plan in plans]
        return jsonify({'plans': result}), 200
    except SQLAlchemyError as exc:
        return jsonify({'error': 'Failed to list plans', 'details': str(exc)}), 500


@app.route('/plans/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    plan = db.session.get(Plan, plan_id)

    if not plan:
        return jsonify({'error': 'Plan not found'}), 404

    return jsonify({'plan': plan.to_dict()}), 200


@app.route('/plans/<int:plan_id>', methods=['PUT'])
def update_plan(plan_id):
    plan = db.session.get(Plan, plan_id)

    if not plan:
        return jsonify({'error': 'Plan not found'}), 404

    data = request.get_json(silent=True) or {}

    if 'title' in data and not data.get('title'):
        return jsonify({'error': 'title cannot be empty'}), 400

    editable_fields = [
        'title',
        'objective',
        'resume',
        'pre_data',
        'discipline',
        'content',
        'resources',
    ]

    for field in editable_fields:
        if field in data:
            setattr(plan, field, data.get(field) or '')

    try:
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({'error': 'Failed to update plan', 'details': str(exc)}), 500

    return jsonify({'message': 'Plan updated successfully', 'plan': plan.to_dict()}), 200


@app.route('/plans/<string:title>', methods=['DELETE'])
def delete_plan(title):
    plan = Plan.query.filter_by(title=title).first()

    if not plan:
        return jsonify({'error': 'Plan not found'}), 404

    try:
        db.session.delete(plan)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete plan', 'details': str(exc)}), 500

    return jsonify({'message': 'Plan deleted successfully'}), 200


if __name__ == '__main__':
    try:
        ensure_database_exists()
        with app.app_context():
            db.create_all()
        print('Database tables initialized.')
    except Exception as exc:
        print(f'Database initialization failed: {exc}')

    app.run(debug=True, host='0.0.0.0', port=5000)
