todos = []

def add_todo(task: str):
    todos.append({"task": task, "done": False})

def complete_todo(index: int):
    todos[index]["done"] = True

def list_todos():
    for i, t in enumerate(todos):
        status = "✓" if t["done"] else "○"
        print(f"{i}. [{status}] {t['task']}")
