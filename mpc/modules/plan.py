class Plan():
    def __init__(self, plan_id: int, user_id: int, title: str, description: str):
        self.plan_id = plan_id
        self.user_id = user_id
        self.title = title
        self.description = description

    def __str__(self):
        return f"Plan(id={self.plan_id}, user_id={self.user_id}, title='{self.title}', description='{self.description}')"