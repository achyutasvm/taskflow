"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/types";

const STORAGE_KEY = "taskflow-tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // One-time hydration from localStorage; can't run during render since
      // it's unavailable server-side, so an effect is required here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setTasks(JSON.parse(raw));
    } catch {
      // corrupted data — ignore, start fresh
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: trimmed, completed: false },
    ]);
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  return { tasks, addTask, toggleTask, deleteTask };
}
