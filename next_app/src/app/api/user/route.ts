import { userSchema } from "../../../schema";
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
    where: {
      id: userId,
    },
  });
  return NextResponse.json(user);
}


