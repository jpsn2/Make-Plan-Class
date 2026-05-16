class Plan():
    def __init__(self, plan_id: int, 
                 user_id: int, title: str, objective: str, 
                 resume: str, pre_data: str, discipline: str, 
                 content: str, resources: str, tags: str):
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