import { attendanceTimeSchema } from "../../../schema";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import convertTimeToHHMMFormat from "../../../utils/convertTimeToHHMMFormat";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = body.id;
  const attendanceTime = new Date().toISOString();

  // 日付部分のみを取得 ('YYYY-MM-DD')
  const datePart = attendanceTime.slice(0, 10);

  // 同じ日付の出勤記録が存在するかチェック
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      userId: userId,
      attendanceTime: {
        gte: new Date(datePart + "T00:00:00+09:00"),
        lte: new Date(datePart + "T23:59:59+09:00"),
      },
    },
  });

  // すでに存在する場合はリクエストを拒否
  if (existingAttendance) {
    return NextResponse.json({
      ok: false,
      error: "このユーザーは本日すでに出勤しています",
    });
  }

  // 出勤記録の新規作成
  const attendanceBody = { attendanceTime: attendanceTime };
  try {
    await attendanceTimeSchema.parseAsync(attendanceBody);

    await prisma.attendance.create({
      data: {
        attendanceTime: attendanceBody.attendanceTime,
        user: { connect: { id: userId } },
      },
    });
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
    //ユーザーが存在するか確認
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return NextResponse.json({ ok: false, error: "ユーザーが存在しません" });
    }

    let attendanceTime = await prisma.attendance.findFirst({
      where: { userId: userId },
      orderBy: { attendanceTime: "desc" },
      select: { attendanceTime: true },
    });
    if (attendanceTime === null) {
      return NextResponse.json({
        attendanceTime: new Date("1990-01-01T00:00:00.000Z"),
        isAttend: false,
      }); //一度も出勤していない場合はfalse
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

    // isAttendがfalseの場合、attendanceTimeを固定の日付に設定
    if (!isAttend) {
      attendanceTime = { attendanceTime: new Date("1990-01-01T00:00:00.000Z") };
    }

    return NextResponse.json({
      attendanceTime: attendanceTime.attendanceTime,
      isAttend,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error });
  }
}

//このtypescript,Next.js14の
