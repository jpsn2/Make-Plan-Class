class User():
    def __init__(self, user_id: int, username: str, plan_ids: list[int]):
        self.user_id = user_id
        self.username = username
        self.plan_ids = plan_ids

    def __str__(self):
        return f"User(id={self.user_id}, username='{self.username}')"