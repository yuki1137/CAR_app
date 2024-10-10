// import { userSchema } from "@/schema";
// import prisma from "../../../lib/prisma";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   console.log("req.body", body);
//   // return NextResponse.json(body);
//   try {
//     const data = userSchema.parse(body);
//     await prisma.user.create({
//       data: data,
//     });
//     return NextResponse.json({
//       ok: true,
//     });
//   } catch (error) {
//     return NextResponse.json({ ok: false, error });
//   }
// }

// export async function GET() {
//   const users = await prisma.user.findMany();
//   return NextResponse.json(users);
// }


import { NextResponse } from 'next/server';
import  prisma  from '../../../lib/prisma';

// GETメソッド: ユーザー一覧を取得
export async function GET() {
  try {
    const users = await prisma.user.findMany(); // 全ユーザーを取得
    return NextResponse.json(users); // データをJSON形式で返す
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}

// POSTメソッド: 新しいユーザーを作成
export async function POST(request: Request) {
  const { name, password } = await request.json(); // リクエストのボディからデータを取得

  // バリデーション
  if (!name || !password) {
    return NextResponse.json({ error: 'Name and password are required' }, { status: 400 });
  }

  try {
    // ユーザーを作成
    const newUser = await prisma.user.create({
      data: {
        name : name,
        password : password,
        promisedTime: new Date(), // 約束の時間は現在時刻で初期化
      },
    });
    return NextResponse.json(newUser, { status: 201 }); // 作成したユーザーを返す
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}
