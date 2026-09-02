import type { Task } from "@/lib/types";

const tasks: Task[] = [];

export function listTasks(): Task[] {
  return tasks;
}

export function addTask(title: string): Task {
  const task: Task = { id: crypto.randomUUID(), title, completed: false };
  tasks.push(task);
  return task;
}

export function toggleTask(id: string): Task | undefined {
  const task = tasks.find((t) => t.id === id);
  if (task) task.completed = !task.completed;
  return task;
}

export function deleteTask(id: string): boolean {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}
