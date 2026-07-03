import { NextResponse } from "next/server";

import {
  insertVisitor,
  isValidPurpose,
  listVisitors,
} from "@/lib/db/visitors";
import { sendLineVisitorNotification } from "@/lib/line";

export async function GET() {
  const visitors = await listVisitors();
  return NextResponse.json({ visitors });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isValidPurpose(body.purpose)) {
      return NextResponse.json({ error: "用件が不正です" }, { status: 400 });
    }

    if (
      typeof body.visitor_name !== "string" ||
      body.visitor_name.trim().length === 0
    ) {
      return NextResponse.json({ error: "名前は必須です" }, { status: 400 });
    }

    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    const returnVisitScheduledAt =
      typeof body.return_visit_scheduled_at === "string"
        ? body.return_visit_scheduled_at
        : body.return_visit_scheduled_at === null
          ? null
          : null;

    const visitor = await insertVisitor({
      purpose: body.purpose,
      visitor_name: body.visitor_name.trim(),
      message,
      return_visit_scheduled_at: returnVisitScheduledAt,
    });

    const lineResult = await sendLineVisitorNotification(visitor);

    return NextResponse.json(
      {
        visitor,
        line: lineResult,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[API] POST /api/visitors failed:", error);
    return NextResponse.json(
      { error: "来客データの保存に失敗しました" },
      { status: 500 },
    );
  }
}
