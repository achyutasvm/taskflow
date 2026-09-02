import { NextResponse } from "next/server";
import { listNotes, addNote } from "@/lib/noteStore";

export async function GET() {
  return NextResponse.json(listNotes());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const noteBody = typeof body?.body === "string" ? body.body.trim() : "";
  if (!noteBody) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  const note = addNote(noteBody);
  return NextResponse.json(note, { status: 201 });
}
