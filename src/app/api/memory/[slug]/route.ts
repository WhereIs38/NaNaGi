import { NextRequest, NextResponse } from "next/server";
import { getMemory, deleteMemory } from "@/lib/store";
import { getAuthCookie, verifyToken } from "@/lib/auth";

async function getAuth(request: NextRequest) {
  const token = await getAuthCookie();
  if (!token) return null;
  const jwt = await verifyToken(token);
  return jwt.valid ? jwt : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await getAuth(request);
    if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "仅管理员可查看" }, { status: 403 });
    }
    const { slug } = await params;
    const entry = await getMemory(auth.personId, slug);
    if (!entry) return NextResponse.json({ error: "记忆未找到" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (err) {
    console.error("[Memory] GET slug error:", err);
    return NextResponse.json({ error: "读取记忆失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await getAuth(request);
    if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { slug } = await params;

    // admin: 删除 data/admin/memories/ 下的记忆
    if (auth.role === "admin") {
      const ok = await deleteMemory(auth.personId, slug);
      if (!ok) return NextResponse.json({ error: "记忆未找到" }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    // guest: 删除自己的 LevelDB 记忆 (保持原有逻辑)
    const fs = await import("fs/promises");
    const path = await import("path");
    const memDir = path.join(process.cwd(), "data", "leveldb", auth.personId, "memories");
    const memFile = path.join(memDir, `${slug}.json`);

    try {
      await fs.unlink(memFile);
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: "记忆未找到" }, { status: 404 });
    }
  } catch (err) {
    console.error("[Memory] DELETE error:", err);
    return NextResponse.json({ error: "删除记忆失败" }, { status: 500 });
  }
}
