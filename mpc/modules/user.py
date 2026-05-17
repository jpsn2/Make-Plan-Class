from modules.plan import db

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False)

    def __init__(self, username: str, plan_ids=None):
        self.username = username
    
    def __str__(self):
        return f"User(id={self.user_id}, username='{self.username}')"
