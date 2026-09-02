"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/types";
import { TaskItem } from "@/components/TaskItem";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then(setTasks)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    const task = await res.json();
    setTasks((prev) => [...prev, task]);
    setTitle("");
  }

  async function handleToggle(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: "PATCH" });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-semibold">Tasks</h1>
        <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task"
            className="flex-1 rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600"
          />
          <button
            type="submit"
            className="rounded bg-foreground px-4 py-2 text-background transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
          >
            Add
          </button>
        </form>
        {isLoading ? (
          <p className="text-zinc-400 dark:text-zinc-600">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-zinc-400 dark:text-zinc-600">No tasks yet.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
