import prisma from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("id");
  console.log("req.userId", userId);

  //リクエストにIDがない場合を考慮
  if (!userId) {
    return NextResponse.json({ ok: false, error: "User ID is required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, promisedTime: true }, //名前と目標時間のみ抽出
  });

  const absences = await prisma.absence.findMany({
    where: { userId: userId },
    select: { id: true, reason: true, absenceTime: true }, //公欠理由と公欠日のみ抽出
  });
  return NextResponse.json({ user, absences });
}
