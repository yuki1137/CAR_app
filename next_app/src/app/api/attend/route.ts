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

  // ユーザーの promisedTime を取得
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { promisedTime: true }, // promisedTime を選択
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "ユーザーが存在しません" });
  }

  const promisedTime = new Date(user.promisedTime).getTime(); // ユーザーの promisedTime をミリ秒に変換

  // 出勤記録の新規作成
  const attendanceBody = { attendanceTime: attendanceTime };
  try {
    await attendanceTimeSchema.parseAsync(attendanceBody);

    const attendance = await prisma.attendance.create({
      data: {
        attendanceTime: attendanceBody.attendanceTime,
        user: { connect: { id: userId } },
      },
    });

    // AttendanceRecordの作成 (latestPromisedTimeを保存)
    const attendanceRecord = await prisma.attendanceRecord.create({
      data: {
        userId: userId,
        attendanceId: attendance.id,
        latestPromisedTime: user.promisedTime, // latestPromisedTime を記録
        status: "absence", // 初期値として "absence" を設定
        createdAt: new Date(),
      },
    });

    // // 出席時間を深夜0時からの経過ミリ秒に変換
    // const attendanceDate = new Date(attendance.attendanceTime);
    // const attendanceMidnight = new Date(
    //   attendanceDate.getFullYear(),
    //   attendanceDate.getMonth(),
    //   attendanceDate.getDate(),
    // );
    // const attendanceTimeInMillis = attendanceDate.getTime() - attendanceMidnight.getTime();

    const attendanceTimeInMillis = (attendanceTime: Date | string) => {
      // Dateオブジェクトに変換
      const attendanceDate = new Date(attendanceTime);

      // 時間と分を取得
      const attendancehours = ((attendanceDate.getUTCHours() + 9) % 24) * 60;
      const attendanceminutes = attendanceDate.getMinutes();

      // HH:MMをミリ秒に変換
      const attendancemilliseconds = attendancehours + attendanceminutes; // HH:MMを秒に変換
      return attendancemilliseconds;
    };

    const latestPromisedTimeInMillis = (latestPromisedTime: Date | string) => {
      // Dateオブジェクトに変換
      const promisedDate = new Date(latestPromisedTime);

      // 時間と分を取得
      const Promisedhours = ((promisedDate.getUTCHours() + 9) % 24) * 60;
      const Promisedminutes = promisedDate.getMinutes();

      // HH:MMをミリ秒に変換
      const Promisedmilliseconds = Promisedhours + Promisedminutes;
      return Promisedmilliseconds;
    };

    // ステータスを判定 (latestPromisedTime を基に判定)
    let status: "attendance" | "late" | "absence" | "officialleave" = "attendance";
    if (
      attendanceTimeInMillis(attendance.attendanceTime) >
      latestPromisedTimeInMillis(attendanceRecord.latestPromisedTime)
    ) {
      status = "late"; // 出席時間が約束の時間より遅い場合
    } else if (attendanceTimeInMillis <= latestPromisedTimeInMillis) {
      status = "attendance"; // 出席時間が約束の時間と同じか早い場合
    }

    // AttendanceRecordのステータスを更新
    await prisma.attendanceRecord.update({
      where: { id: attendanceRecord.id },
      data: { status: status }, // 判定したステータスを設定
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
