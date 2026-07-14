import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body?.title === "string") updates.title = body.title.trim();
  if (typeof body?.content === "string") updates.content = body.content.trim();
  if (typeof body?.category === "string") updates.category = body.category.trim() || null;
  if (typeof body?.is_active === "boolean") updates.is_active = body.is_active;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("processes")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ process: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("processes").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
