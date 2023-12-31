import prisma from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validateAbsence, absenceSchema } from "@/schema";

// バリデーション関数（各日付を個別に処理）
async function validateAndInsertAbsence(userId: string, reason: string, time: string) {
  const isValid = await validateAbsence(userId, time);
  if (isValid) {
    await prisma.absence.create({
      data: {
        userId: userId,
        reason: reason,
        absenceTime: time,
      },
    });
    return { time, status: "Registered" };
  } else {
    return { time, status: "Failed" };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await absenceSchema.parseAsync(body);
    const responses = [];

    // 各absenceTimeを個別に処理
    for (const time of body.absenceTimes) {
      const response = await validateAndInsertAbsence(body.userId, body.reason, time);
      responses.push(response);
    }

    return NextResponse.json({
      ok: true,
      responses,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error });
  }
}

export async function DELETE(req: NextRequest) {
  // 'id' パラメータの値を取得する
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "No id provided" });
  }

  try {
    await prisma.absence.delete({
      where: { id: id },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error });
  }
}
