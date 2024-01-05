import prisma from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { absenceSchema } from "@/schema";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await absenceSchema.parseAsync(body);

    // 同じ日付、同じユーザーの公欠データを検索
    const datePart = body.absenceTime.slice(0, 10); // 'YYYY-MM-DD' 部分を取得
    const minDate = new Date(datePart + "T00:00:00+09:00");
    const maxDate = new Date(datePart + "T23:59:59+09:00");

    const existingAbsence = await prisma.absence.findFirst({
      where: {
        userId: body.userId,
        absenceTime: { gte: minDate, lte: maxDate },
      },
    });

    if (existingAbsence) {
      // 同じ日付の公欠がある場合更新
      await prisma.absence.update({
        where: { id: existingAbsence.id },
        data: body,
      });
    }
    // 同じ日付の公欠がない場合新規作成
    else {
      await prisma.absence.create({
        data: body,
      });
    }
    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error });
  }
}
