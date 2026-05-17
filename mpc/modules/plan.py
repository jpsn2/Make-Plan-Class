from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Plan(db.Model):
    __tablename__ = 'plans'
    
    plan_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    objective = db.Column(db.String(255))
    resume = db.Column(db.Text)
    pre_data = db.Column(db.String(255))
    discipline = db.Column(db.String(255))
    content = db.Column(db.Text)
    resources = db.Column(db.String(255))
    tags = db.Column(db.String(255))

    def __init__(self, user_id: int, title: str, objective: str = None,
                 resume: str = None, pre_data: str = None, discipline: str = None,
                 content: str = None, resources: str = None, tags: str = None, plan_id: int = None):
        self.plan_id = plan_id
        self.user_id = user_id
        self.title = title
        self.objective = objective
        self.resume = resume
        self.pre_data = pre_data
        self.discipline = discipline
        self.content = content
        self.resources = resources
        self.tags = tags

    def __str__(self):
        return f"Plan(id={self.plan_id}, user_id={self.user_id}, title='{self.title}', objective='{self.objective}')"

    def to_dict(self):
        return {
            'plan_id': self.plan_id,
            'user_id': self.user_id,
            'title': self.title,
            'objective': self.objective,
            'resume': self.resume,
            'pre_data': self.pre_data,
            'discipline': self.discipline,
            'content': self.content,
            'resources': self.resources,
            'tags': self.tags,
        }