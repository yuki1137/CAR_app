import { userSchema } from "@/schema";
import prisma from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("req.body", body);
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


