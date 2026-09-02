"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { TaskItem } from "@/components/TaskItem";

export function TaskList() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addTask(title);
    setTitle("");
  }

  return (
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
      {tasks.length === 0 ? (
        <p className="text-zinc-400 dark:text-zinc-600">No tasks yet.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
