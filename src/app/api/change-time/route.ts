import { changeTimeSchema } from "../../../schema";
import prisma from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("req.body", body);
  try {
    const data = changeTimeSchema.parse(body);
    await prisma.user.update({
      where: { id: data.id },
      data: data,
    });
    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error });
  }
}
