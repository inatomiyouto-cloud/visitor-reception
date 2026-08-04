import { NextResponse } from "next/server";

import {
  findVisitor,
  isValidStatus,
  patchVisitorStatus,
  removeVisitor,
} from "@/lib/db/visitors";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!isValidStatus(body.status)) {
      return NextResponse.json({ error: "ステータスが不正です" }, { status: 400 });
    }

    const visitor = await patchVisitorStatus(id, body.status);
    if (!visitor) {
      return NextResponse.json({ error: "来客が見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ visitor });
  } catch (error) {
    console.error("[API] PATCH /api/visitors/[id] failed:", error);
    return NextResponse.json(
      { error: "ステータスの更新に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!(await findVisitor(id))) {
      return NextResponse.json({ error: "来客が見つかりません" }, { status: 404 });
    }

    await removeVisitor(id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[API] DELETE /api/visitors/[id] failed:", error);
    return NextResponse.json(
      { error: "来客データの削除に失敗しました" },
      { status: 500 },
    );
  }
}
