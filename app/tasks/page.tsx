"use client";

import { useEffect, useState } from "react";
import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import type { Task } from "@/lib/types";
import styles from "./page.module.css";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["500", "600"],
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dateStamp, setDateStamp] = useState("");

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then(setTasks)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // Today's date, stamped on the sheet; computed client-side after mount
    // so the server-rendered markup doesn't depend on the visitor's clock.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateStamp(
      new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    );
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

  async function handleClearCompleted() {
    await fetch("/api/tasks", { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => !t.completed));
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div
        className={`${plexMono.variable} ${sourceSerif.variable} ${styles.sheet}`}
      >
        <div className={styles.clip} aria-hidden="true" />
        <div className={styles.holes} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Tasks</h1>
            {tasks.length > 0 && (
              <p className={styles.progress}>
                {tasks.filter((t) => t.completed).length} of {tasks.length} done
              </p>
            )}
          </div>
          <div className={styles.headerMeta}>
            {tasks.some((t) => t.completed) && (
              <button
                type="button"
                onClick={handleClearCompleted}
                className={styles.clearCompleted}
              >
                Clear completed
              </button>
            )}
            {dateStamp && <span className={styles.dateStamp}>{dateStamp}</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.addRow}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a line item"
            className={styles.input}
          />
          <button type="submit" className={styles.addButton}>
            Add
          </button>
        </form>

        {isLoading ? (
          <p className={styles.empty}>Loading the list…</p>
        ) : tasks.length === 0 ? (
          <p className={styles.empty}>Nothing on the list yet.</p>
        ) : (
          <ul className={styles.list}>
            {tasks.map((task, i) => (
              <li key={task.id} className={styles.row}>
                <span className={styles.index}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                  className={styles.check}
                  aria-label={`Mark "${task.title}" as ${
                    task.completed ? "not completed" : "completed"
                  }`}
                />
                <span className={styles.text}>{task.title}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className={styles.delete}
                  aria-label={`Delete "${task.title}"`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
