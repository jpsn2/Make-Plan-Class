from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class Plan(db.Model):
    __tablename__ = 'plans'
    __table_args__ = (
        db.UniqueConstraint('user_id', 'title', name='unique_user_plan_title'),
    )
    
    plan_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    objective = db.Column(db.String(255))
    resume = db.Column(db.Text)
    pre_data = db.Column(db.String(255))
    discipline = db.Column(db.String(255))
    content = db.Column(db.Text)
    resources = db.Column(db.String(255))

    def __init__(self, title: str, objective: str = "",
                 resume: str = "", pre_data: str = "", discipline: str = "",
                 content: str = "", resources: str = "", user_id: int = None):
        self.user_id = user_id
        self.title = title
        self.objective = objective
        self.resume = resume
        self.pre_data = pre_data
        self.discipline = discipline
        self.content = content
        self.resources = resources

    def set_title(self, title: str):
        self.title = title
        db.session.commit()

    def set_objective(self, objective: str):
        self.objective = objective
        db.session.commit()

    def set_resume(self, resume: str):
        self.resume = resume
        db.session.commit()

    def set_pre_data(self, pre_data: str):
        self.pre_data = pre_data
        db.session.commit()

    def set_discipline(self, discipline: str):
        self.discipline = discipline
        db.session.commit()

    def set_content(self, content: str):
        self.content = content
        db.session.commit()

    def set_resources(self, resources: str):
        self.resources = resources
        db.session.commit()
    
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
            'resources': self.resources
        }
