import { NextResponse } from "next/server";
import { getJudgeFromCookie } from "@/lib/judge-auth";

export async function GET() {
  const judge = await getJudgeFromCookie();
  if (!judge) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json(judge);
}
