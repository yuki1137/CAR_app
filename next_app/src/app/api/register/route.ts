import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Prismaを使用している場合のインポート例
import bcrypt from 'bcrypt';

async function registerUser(name: string, password: string, inputDateString: string | null) {
  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash(password, 10);

  // promisedTimeを検証
  let promisedTime = null;
  if (inputDateString) {
    promisedTime = new Date(inputDateString);
    // promisedTimeが無効な場合はエラーをスロー
    if (isNaN(promisedTime.getTime())) {
      throw new Error("Invalid Date provided for promisedTime");
    }
  }

  // Prismaのcreateメソッドでユーザーを作成
  const user = await prisma.user.create({
    data: {
      name: name,
      password: hashedPassword,
      promisedTime: new Date(), // promisedTimeがnullでも良い場合はそのまま渡す
    },
  });

  return user;
}

export async function POST(request: Request) {
  try {
    // リクエストからデータを取得
    const { name, password, promisedTime } = await request.json();

    // nameまたはpasswordが不足している場合はエラーを返す
    if (!name || !password) {
      return NextResponse.json({ message: 'Name and password are required.' }, { status: 400 });
    }

    // promisedTimeがない場合はnullを設定
    const user = await registerUser(name, password, promisedTime || null);

    // 受信したデータの確認
    console.log('Received:', { name, password, promisedTime });

    // ユーザーが作成されたら成功レスポンスを返す
    return NextResponse.json({ user });

  } catch (error) {
    console.error("Error registering user:", error);

    // promisedTimeのエラー時
    if (error.message === "Invalid Date provided for promisedTime") {
      return NextResponse.json({ message: 'Invalid promisedTime date.' }, { status: 400 });
    }

    // その他のエラーハンドリング
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
