---
name: new-api-route
description: Scaffold a new in-memory-backed API route (Next.js Route Handler) for taskflow, following this project's conventions - a lib store module, a collection route.ts (GET/POST), and a dynamic [id] route.ts (PATCH/DELETE) typed with RouteContext. Use whenever the user asks to add a new API resource/endpoint to this app (e.g. "add an API route for notes/projects/comments").
---

Scaffold a new REST-ish, in-memory-backed API resource for taskflow, matching the pattern already used by `lib/taskStore.ts` + `app/api/tasks/route.ts` + `app/api/tasks/[id]/route.ts`. Read those three files first if unsure — they are the reference implementation this skill codifies.

## 1. Clarify the resource

If not already given, ask (or infer from context) for:
- Resource name, singular and plural (e.g. `note` / `notes`).
- Fields beyond `id` (e.g. a note might have `body: string` instead of `title`/`completed`).
- Which mutations are actually needed — not every resource needs a toggle; some just need create/list/delete.

Don't add fields, endpoints, or validation beyond what's asked. Match the minimalism of the `tasks` resource: no auth, no persistence beyond the process lifetime, no pagination, unless explicitly requested.

## 2. Type

Add the resource's shape to `lib/types.ts` as a plain exported `interface`, alongside `Task`. Keep it flat — no nested objects unless the resource genuinely needs one.

## 3. Store module — `lib/<resource>Store.ts`

A module-level array plus plain exported functions, no class:

```ts
import type { <Resource> } from "@/lib/types";

const <resources>: <Resource>[] = [];

export function list<Resources>(): <Resource>[] {
  return <resources>;
}

export function add<Resource>(/* fields */): <Resource> {
  const item: <Resource> = { id: crypto.randomUUID(), /* ...fields, defaults */ };
  <resources>.push(item);
  return item;
}

// Only add the mutations this resource actually needs, mirroring toggleTask/deleteTask:
export function update<Resource>(id: string, /* ...changes */): <Resource> | undefined {
  const item = <resources>.find((x) => x.id === id);
  if (item) { /* apply changes */ }
  return item;
}

export function delete<Resource>(id: string): boolean {
  const index = <resources>.findIndex((x) => x.id === id);
  if (index === -1) return false;
  <resources>.splice(index, 1);
  return true;
}
```

IDs are always `crypto.randomUUID()`. State is a plain module-level array — it resets whenever the dev server restarts; that's expected, not a bug to fix.

## 4. Collection route — `app/api/<resources>/route.ts`

```ts
import { NextResponse } from "next/server";
import { list<Resources>, add<Resource> } from "@/lib/<resource>Store";

export async function GET() {
  return NextResponse.json(list<Resources>());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  // Validate/trim required fields the same way title is validated for tasks:
  const field = typeof body?.field === "string" ? body.field.trim() : "";
  if (!field) {
    return NextResponse.json({ error: "field is required" }, { status: 400 });
  }
  const item = add<Resource>(field);
  return NextResponse.json(item, { status: 201 });
}
```

## 5. Item route — `app/api/<resources>/[id]/route.ts`

Use the globally-available `RouteContext<'/api/<resources>/[id]'>` typed helper (Next.js 16 convention in this project — see `CLAUDE.md`) instead of manually typing `{ params }: { params: Promise<{ id: string }> }`:

```ts
import { NextResponse } from "next/server";
import { update<Resource>, delete<Resource> } from "@/lib/<resource>Store";

export async function PATCH(
  _request: Request,
  ctx: RouteContext<"/api/<resources>/[id]">
) {
  const { id } = await ctx.params;
  const item = update<Resource>(id /*, ...changes from body if needed */);
  if (!item) {
    return NextResponse.json({ error: "<Resource> not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/<resources>/[id]">
) {
  const { id } = await ctx.params;
  const deleted = delete<Resource>(id);
  if (!deleted) {
    return NextResponse.json({ error: "<Resource> not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
```

Only include the HTTP methods this resource actually needs — don't add PATCH if there's nothing to update, don't add DELETE if items are meant to be permanent.

## 6. Generate route types

`RouteContext` and other typed-route helpers are generated, not hand-written. After creating the `[id]/route.ts` file, run:

```bash
npx next typegen
```

Skipping this step causes a `Cannot find name 'RouteContext'` TypeScript error.

## 7. Verify

1. `npm run lint` and `npx tsc --noEmit` — both must pass clean.
2. Start the dev server and exercise the new endpoints with `curl`: list (empty), create, validate rejection (missing/blank required field → 400), update/delete (200/204), delete-again or act-on-unknown-id (→ 404).
3. If a page was also requested for this resource, follow the pattern in `app/tasks/page.tsx` (client component, `fetch` on mount, reuse or add a presentational item component under `components/`).
