import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie, isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { password } = body;

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "请输入密码" }, { status: 400 });
  }

  const hash = process.env.NANAGI_PASSWORD_HASH;
  if (!hash) {
    return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
  }

  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    return NextResponse.json({ error: "密码错误，请重试" }, { status: 401 });
  }

  const token = await createToken();
  await setAuthCookie(token);

  return NextResponse.json({ success: true });
}

export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}
