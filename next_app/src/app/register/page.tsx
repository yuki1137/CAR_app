"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { FaSignInAlt } from 'react-icons/fa';


export default function RegisterPage() {
  const [name, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const userId = '';
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ユーザー名とパスワードの入力に基づき、ボタンを有効化/無効化
  useEffect(() => {
    setIsDisabled(!(name && password)); // 両方のフィールドが入力されている場合にボタンを有効化
  }, [name, password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const userId = data.id; // ユーザーIDを取得
        router.push('../../'); // 登録後にリダイレクト
      } else {
        alert('登録に失敗しました');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="mb-4">
        <Header title="新規登録" icon={<FaSignInAlt size={30} />} userId={userId} />
      </div>
      <form onSubmit={handleRegister} className='flex flex-col items-center justify-center h-screen'>
        <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => setUserName(e.target.value)}
          className="mb-2 w-72 px-3 py-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2 w-72 px-3 py-2 border border-gray-300 rounded"
        />
        <Button type="submit" disabled={isDisabled || isLoading}>
          {isLoading ? "Loading..." : '登録'}
        </Button>
      </form>
    </div>
  );
}
