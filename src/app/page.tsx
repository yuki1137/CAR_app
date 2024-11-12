"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import CustomLinearProgress from '@/components/CustomLinearProgress';
import Header from '@/components/Header';
import { FaBusinessTime, FaHome, FaSign, FaSignInAlt } from 'react-icons/fa';

export default function LoginPage() {
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const userId = '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });
  
      const data = await res.json();
  
      if (res.ok && data.user) {
        router.push(`/attend/${data.user.id}`);
      } else {
        console.error('ログイン失敗', data.message);
        alert('ログイン失敗');
      }
    } catch (error) {
      // errorの型チェックを行う
      if (error instanceof Error) {
        console.error('エラーが発生しました:', error.message);
        alert(`エラーが発生しました: ${error.message}`);
      } else {
        console.error('不明なエラーが発生しました');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="mb-4">
        <Header title="ログイン" icon={<FaSignInAlt size={30} />} userId={userId} />
      </div>
      <form onSubmit={handleLogin} className='flex flex-col items-center justify-center h-screen'>
        <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => setUsername(e.target.value)}
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
          {isLoading ? "Loading..." : 'ログイン'}
        </Button>
      </form>
      {isLoading && <CustomLinearProgress />}
      <div className="flex py-10 flex justify-center">
        まだ登録していない？ 登録は
        <a href="/register" className="text-blue-400 underline mr-9">こちら</a>
      </div>
    </div>
  );
}