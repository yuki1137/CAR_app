"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header"; // ヘッダーをインポート
import { FaHistory } from "react-icons/fa";

interface AttendanceRecord {
  attendanceId: string;
  status: "attendance" | "late" | "absence" | "officialleave";
  latestPromisedTime: string;
  attendanceTime: string | null;
  createdAt: string;
  attendance: {
    // attendance テーブルの情報
    id: string;
    userId: string;
    attendanceTime: string | null;
  };
}

interface AttendanceResponse {
  attendanceRecords: AttendanceRecord[];
}

const formatTime = (dateString: string | Date) => {
  const date = new Date(dateString);
  const hours = String((date.getUTCHours() + 9) % 24).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};
const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  date.setHours(date.getUTCHours() + 9);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月は0始まりなので+1
  const day = String(date.getDate()).padStart(2, "0"); // 2桁に整形
  return `${year}-${month}-${day}`;
};
// ステータスを日本語に変換
const JaStatus = (status: "attendance" | "late" | "absence" | "officialleave") => {
  switch (status) {
    case "attendance":
      return "出席";
    case "late":
      return "遅刻";
    case "absence":
      return "欠席";
    case "officialleave":
      return "公欠";
  }
};

// paramsを引数に受け取る
const AttendancePage = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId; // userIdをparamsから取得
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("ユーザーIDが不明です。");
      setLoading(false);
      return;
    }

    const fetchAttendanceRecords = async () => {
      try {
        const res = await fetch(`/api/history?userid=${userId}`);
        if (!res.ok) {
          throw new Error("データの取得に失敗しました。");
        }
        const data: AttendanceResponse = await res.json();
        // ステータスが存在する日のみフィルタリング
        const filteredRecords = data.attendanceRecords.filter(
          (record) => record.attendance.attendanceTime !== null,
        );
        setAttendanceRecords(filteredRecords);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [userId]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Header title="登校の履歴" icon={<FaHistory size={30} />} userId={userId} />
      <h1>出席記録</h1>
      <ul>
        {attendanceRecords.map((record) => (
          <li key={record.attendanceId}>
            <strong>日付:</strong>{" "}
            {record.attendance.attendanceTime
              ? formatDate(record.attendance.attendanceTime)
              : "データなし"}{" "}
            <br />
            <strong>ステータス:</strong> {JaStatus(record.status)} <br />
            <strong>登校目標時刻:</strong>{" "}
            {record.latestPromisedTime ? formatTime(record.latestPromisedTime) : "未設定"} <br />
            <strong>出席時間:</strong>{" "}
            {record.attendance.attendanceTime
              ? formatTime(record.attendance.attendanceTime)
              : "欠席"}{" "}
            <br />
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttendancePage;
