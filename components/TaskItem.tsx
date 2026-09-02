import type { Task } from "@/lib/types";

export function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="flex items-center gap-3 border-b border-zinc-200 py-3 last:border-b-0 dark:border-zinc-800">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="h-4 w-4 shrink-0 accent-foreground"
        aria-label={`Mark "${task.title}" as ${task.completed ? "not completed" : "completed"}`}
      />
      <span
        className={
          task.completed
            ? "flex-1 text-zinc-400 line-through dark:text-zinc-600"
            : "flex-1"
        }
      >
        {task.title}
      </span>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="text-sm text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400"
        aria-label={`Delete "${task.title}"`}
      >
        Delete
      </button>
    </li>
  );
}
