"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { FaSignInAlt } from 'react-icons/fa';
import DrumTimePicker from "../../components/DrumTimePicker";
import convertHMtoDatetime from "../../utils/convertHMtoDatetime";

export default function RegisterPage() {
  const [name, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [promisedTime, setPromisedTime] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const userId = '';

  // パスワードのバリデーション関数
  const validatePassword = (password: string) => {
    const minLength = 8;
    const maxLength = 20;
    const forbiddenCharacters = /[!@#\$%\^&\*\(\)]/;

    if (password.length < minLength || password.length > maxLength) {
      return 'パスワードは8〜20文字で設定してください。';
    }
    if (forbiddenCharacters.test(password)) {
      return 'パスワードに!@#$%^&*()などの禁止文字は使用できません。';
    }
    return null; // 問題がない場合
  };

  const handleTime = (hour: number, minute: number) => {
    const time = convertHMtoDatetime(hour, minute);
    setPromisedTime(time);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const passwordError = validatePassword(password);
    if (passwordError) {
      alert(passwordError); // パスワードエラーをポップアップ表示
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password, promisedTime }),
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
      <form onSubmit={handleRegister} className="flex flex-col items-center justify-center h-screen">
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
        <p className="text-sm text-gray-500 mb-2">
          ※ パスワードは8〜20文字で、特殊文字は使用できません。
        </p>
        <div className="flex justify-center items-center gap-5 mb-4">
          <h2 className="text-lg">目標時間</h2>
          <DrumTimePicker handleTime={handleTime} />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : '登録'}
        </Button>
      </form>
    </div>
  );
}
