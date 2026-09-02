import type { Note } from "@/lib/types";

const notes: Note[] = [];

export function listNotes(): Note[] {
  return notes;
}

export function addNote(body: string): Note {
  const note: Note = { id: crypto.randomUUID(), body };
  notes.push(note);
  return note;
}

export function updateNote(id: string, body: string): Note | undefined {
  const note = notes.find((n) => n.id === id);
  if (note) note.body = body;
  return note;
}

export function deleteNote(id: string): boolean {
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return false;
  notes.splice(index, 1);
  return true;
}
