import { NextResponse } from "next/server";
import { toggleTask, deleteTask } from "@/lib/taskStore";

export async function PATCH(
  _request: Request,
  ctx: RouteContext<"/api/tasks/[id]">
) {
  const { id } = await ctx.params;
  const task = toggleTask(id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/tasks/[id]">
) {
  const { id } = await ctx.params;
  const deleted = deleteTask(id);
  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
