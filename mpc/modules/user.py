from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False)
    plan_ids = db.Column(db.JSON, default=[])

    def __init__(self, username: str, plan_ids=None):
        self.username = username
        self.plan_ids = plan_ids or []

    def __str__(self):
        return f"User(id={self.user_id}, username='{self.username}')"