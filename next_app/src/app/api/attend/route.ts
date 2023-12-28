import { attendanceTimeSchema } from "../../../schema";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import convertTimeToHHMMFormat from "../../../utils/convertTimeToHHMMFormat";

export async function POST(req: NextRequest) {
  const userId = await req.json();
  const body = { ...userId, attendanceTime: new Date().toISOString() };
  console.log(body);

  try {
    await attendanceTimeSchema.parseAsync(body);

    const attendanceRecord = await prisma.attendance.findFirst({
      where: { userId: body.id },
    });

    if (!attendanceRecord) {
      await prisma.attendance.create({
        //初めての出勤の場合は新規作成
        data: { ...body, user: { connect: { id: body.id } } },
      });
    } else {
      await prisma.attendance.update({
        //出勤したことがある場合は更新
        where: { id: attendanceRecord.id },
        data: { attendanceTime: body.attendanceTime },
      });
    }
    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("id");
  try {
    if (userId === null) {
      return NextResponse.json({ ok: false, error: "User ID is required" });
    }
    const attendanceTime = await prisma.attendance.findFirst({
      where: { userId: userId },
      select: { attendanceTime: true },
    });
    if (attendanceTime === null) {
      return NextResponse.json({ isAttend: false }); //一度も出勤していない場合はfalse
    }
    // 現在の日付をUTCで取得し、JSTに変換
    const currentDate = new Date();
    currentDate.setUTCHours(currentDate.getUTCHours() + 9);
    console.log(currentDate);
    currentDate.setHours(0, 0, 0, 0);

    // attendanceTimeをUTCで取得し、JSTに変換
    const attendanceDate = new Date(attendanceTime.attendanceTime);
    attendanceDate.setUTCHours(attendanceDate.getUTCHours() + 9);
    console.log(attendanceDate);
    attendanceDate.setHours(0, 0, 0, 0);

    // 日付が同じ場合はtrue、異なる場合はfalse
    const isAttend = attendanceDate.getTime() === currentDate.getTime();

    //　Returnする時間を日本時間に変換
    const attendanceReturnTime = new Date(attendanceTime.attendanceTime);
    attendanceReturnTime.setUTCHours(attendanceReturnTime.getUTCHours() + 9);

    return NextResponse.json({
      attendanceTime: convertTimeToHHMMFormat(attendanceReturnTime),
      isAttend,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error });
  }
}

// convertTimeToHHMMFormat(attendanceTime.attendanceTime)
