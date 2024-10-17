
import { userSchema } from "@/schema";
import prisma from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // return NextResponse.json(body);
  try {
    const data = userSchema.parse(body);
    await prisma.user.create({
      data: data,
    });
    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error });
  }
}

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "No id provided" });
  }
  
  try {
    await prisma.absence.deleteMany({
      where: { userId: id },
    });

    await prisma.attendance.deleteMany({
      where: { userId: id },
    });

    await prisma.user.delete({
      where: { id: id },
    });

    // await prisma.データベース.deleteMany({
    //   where: { userId: id },
    // });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error });
  }
}
