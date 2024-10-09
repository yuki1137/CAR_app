import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET メソッド用のエクスポート
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userid");

  if (!userId) {
    return new Response(JSON.stringify({ error: "ユーザーIDが必要です。" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // AttendanceRecordを取得
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { userId: userId },
      include: { attendance: true }, // Attendance情報も取得したい場合
    });

    return new Response(JSON.stringify({ attendanceRecords }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "出席記録の取得に失敗しました。" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect(); // Prismaクライアントを切断
  }
}
