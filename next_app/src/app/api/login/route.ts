// /api/login/route.ts

import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma'; // Prismaを使用している場合のインポート例
import bcrypt from 'bcrypt';


async function authenticateUser( name: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
        name: name, // ここでusernameを指定
    },
    });

    if (user) {
    console.log('User found:', user);
    }
    else {
    console.log('User not found');
    }

    if (user && await bcrypt.compare(password, user.password)) {
    return user; // 認証成功
    } else {
    console.log('Invalid credentials');
    return null; // 認証失敗
    } 
}



export async function POST(request: Request) {
    try {
      const { name, password } = await request.json();
      
      const user = await authenticateUser(name, password);

      // 受信したデータの確認
      console.log('Received:', { name, password });
  
      if (!name || !password) {
        return NextResponse.json({ message: 'Name and password are required.' }, { status: 400 });
      }
  
      if (user) {
        return NextResponse.json({ user });
      } else {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }
    } catch (error) {
      console.error("Error in POST request:", error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }
  