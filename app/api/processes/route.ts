import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("processes")
    .select("*")
    .order("category", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ processes: data });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const title = (body?.title as string | undefined)?.trim();
  const content = (body?.content as string | undefined)?.trim();
  const category = (body?.category as string | undefined)?.trim() || null;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("processes")
    .insert({ title, content, category, is_active: true })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ process: data });
}
