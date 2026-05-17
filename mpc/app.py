from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

from modules.plan import Plan, db

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure app from environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

# Home route
@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Make-Plan-Class API'}), 200

@app.route('/create_plan', methods=['POST'])
def create_plan():
    data = request.get_json()
    
    plan = Plan(
        plan_id=data.get('plan_id'),
        user_id=data.get('user_id'),
        title=data.get('title'),
        objective=data.get('objective'),
        resume=data.get('resume'),
        pre_data=data.get('pre_data'),
        discipline=data.get('discipline'),
        content=data.get('content'),
        resources=data.get('resources'),
        tags=data.get('tags')
    )
    
    db.session.add(plan)
    db.session.commit()
    
    return jsonify({'message': 'Plan created successfully', 'plan': data}), 201

@app.route('/plans', methods=['GET'])
def get_plans():
    plans = Plan.query.all()
    result = [plan.to_dict() for plan in plans]
    return jsonify({'plans': result}), 200

if __name__ == '__main__':
    # Inicializar banco de dados e tabelas
    with app.app_context():
        db.create_all()
        print('✅ Database tables initialized!')
    
    app.run(debug=True, host='0.0.0.0', port=5000)