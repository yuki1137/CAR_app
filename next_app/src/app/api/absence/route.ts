import prisma from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { absenceSchema, validateAbsence } from "@/schema";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await absenceSchema.parseAsync(body);

    const isValidAbsence = await validateAbsence(body.userId, body.absenceTime);
    if (!isValidAbsence) {
      return NextResponse.json({
        ok: false,
        error: "登録済みの公欠です",
      });
    }
    await prisma.absence.create({
      data: body,
    });
    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error });
  }
}


