import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const name = file.name.toLowerCase();

  try {
    let text = "";

    if (name.endsWith(".txt") || name.endsWith(".md")) {
      text = buffer.toString("utf-8");
    } else if (name.endsWith(".docx")) {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      text = result.text;
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use .txt, .md, .docx, or .pdf." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: text.trim(),
      suggestedTitle: file.name.replace(/\.[^/.]+$/, ""),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Could not read that file: ${err.message || "unknown error"}` },
      { status: 500 }
    );
  }
}
