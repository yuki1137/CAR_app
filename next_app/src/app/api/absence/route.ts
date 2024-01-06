import prisma from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { absenceSchema } from "@/schema";
import { Absence } from "@prisma/client";

// バリデーション関数（各日付を個別に処理）
async function validateAndInsertAbsence(userId: string, reason: string, time: string) {
  // 同じ日付、同じユーザーの公欠データを検索
  const datePart = time.slice(0, 10); // 'YYYY-MM-DD' 部分を取得
  const minDate = new Date(datePart + "T00:00:00+09:00");
  const maxDate = new Date(datePart + "T23:59:59+09:00");

  const existingAbsence = await prisma.absence.findFirst({
    where: {
      userId: userId,
      absenceTime: { gte: minDate, lte: maxDate },
    },
  });

  if (existingAbsence) {
    // 同じ日付の公欠がある場合更新
    await prisma.absence.update({
      where: { id: existingAbsence.id },
      data: {
        userId: userId,
        reason: reason,
        absenceTime: time,
      },
    });
  }
  // 同じ日付の公欠がない場合新規作成
  else {
    await prisma.absence.create({
      data: {
        userId: userId,
        reason: reason,
        absenceTime: time,
      },
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await absenceSchema.parseAsync(body);
    for (const time of body.absenceTimes) {
      const response = await validateAndInsertAbsence(body.userId, body.reason, time);
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    // エラーオブジェクトが Error インスタンスかどうかを確認
    if (error instanceof Error) {
      console.error("エラー発生:", error.message); // エラーメッセージをログに出力
      return NextResponse.json({ ok: false, error: error.message });
    } else {
      console.error("予期せぬエラータイプ:", error);
      return NextResponse.json({ ok: false, error: "未知のエラーが発生しました" });
    }
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
