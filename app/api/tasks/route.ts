import { NextResponse } from "next/server";
import { listTasks, addTask, clearCompletedTasks } from "@/lib/taskStore";

export async function GET() {
  return NextResponse.json(listTasks());
}

export async function DELETE() {
  const removed = clearCompletedTasks();
  return NextResponse.json({ removed });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const task = addTask(title);
  return NextResponse.json(task, { status: 201 });
}
