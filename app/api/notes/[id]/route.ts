import { NextResponse } from "next/server";
import { updateNote, deleteNote } from "@/lib/noteStore";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/notes/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const noteBody = typeof body?.body === "string" ? body.body.trim() : "";
  if (!noteBody) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  const note = updateNote(id, noteBody);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return NextResponse.json(note);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/notes/[id]">,
) {
  const { id } = await ctx.params;
  const deleted = deleteNote(id);
  if (!deleted) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
