"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Absence, Attendance } from "@prisma/client";
import React from "react";
import Header from "../../../components/Header";
import { FaHome } from "react-icons/fa";
import convertTimeToHHMMFormat from "@/utils/convertTimeToHHMMFormat";
import Button from "@/components/Button";
import CustomLinearProgress from "@/components/CustomLinearProgress";

type UserInfo = {
  user: User;
  absences: Absence[];
};

type AttendInfo = {
  attendanceTime: Date | string;
  isAttend: boolean;
};

const stringToDate = (time: Date | string) => {
  if (typeof time === "string") {
    return new Date(time);
  } else {
    return time;
  }
};

const convertTodayDate = (time: Date) => {
  const today = new Date();
  time.setFullYear(today.getFullYear());
  time.setMonth(today.getMonth());
  time.setDate(today.getDate());
  return time;
};

const getMinutes = (time: Date) => {
  return time.getHours() * 60 + time.getMinutes();
};

const minutesToHHMMFormat = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour}時間${minute}分`;
};

const getLateMinutes = (promisedTime: Date | string) => {
  const currentTime = new Date();
  const revisedPromisedTime = convertTodayDate(stringToDate(promisedTime));
  // console.log("revised", currentTime, revisedPromisedTime);
  return getMinutes(currentTime) - getMinutes(revisedPromisedTime);
};

const getMessageState = (isAttend: boolean, isLate: boolean, isAbsence: boolean) => {
  if (!isAttend && isLate && isAbsence) {
    return 1; // 「本日は公欠が登録されています」
  } else if (!isAttend && isLate && !isAbsence) {
    return 2; // 「X分遅刻しています」（赤字）
  } else if (!isAttend && !isLate && isAbsence) {
    return 1; // 「本日は公欠が登録されています」
  } else if (!isAttend && !isLate && !isAbsence) {
    return 0; // 「XX:YY までに登校してください」
  } else if (isAttend && isLate && isAbsence) {
    return 3; // 「登校時刻：XX: YY」
  } else if (isAttend && isLate && !isAbsence) {
    return 4; // 「登校時刻：XX: YY」（赤字）
  } else {
    return 3; // 「登校時刻：XX: YY」
  }
};

const AttendMessage = ({
  userInfo,
  attendInfo,
}: {
  userInfo: UserInfo;
  attendInfo: AttendInfo;
}) => {
  const isAttend = attendInfo.isAttend;
  const promisedTime = convertTimeToHHMMFormat(userInfo.user.promisedTime);
  const attendanceTime = convertTimeToHHMMFormat(attendInfo.attendanceTime);
  const lateMinutes = getLateMinutes(userInfo.user.promisedTime);
  const isLate = lateMinutes > 0;
  const isAbsence = getTodayAbsence(userInfo.absences).length > 0;
  const messageState = getMessageState(isAttend, isLate, isAbsence);
  // console.log(messageState, isAttend, isLate, isAbsence);
  const message = [
    `${promisedTime} までに登校してください`,
    `本日は公欠が登録されています`,
    `${minutesToHHMMFormat(lateMinutes)}遅刻しています`,
    `登校時刻：${attendanceTime}`,
    `登校時刻：${attendanceTime}（遅刻）`,
  ];
  const messageColor = ["text-red-500", "text-red-500", "text-red-500", "", "text-red-500"];
  return (
    <div>
      <div className={`text-center ${messageColor[messageState]}`}>{message[messageState]}</div>
    </div>
  );
};

const getTodayAbsence = (absences: Absence[]) => {
  const today = new Date();
  const todayAbsence = absences.filter((absence) => {
    const absenceDate = new Date(absence.absenceTime);
    return (
      absenceDate.getFullYear() === today.getFullYear() &&
      absenceDate.getMonth() === today.getMonth() &&
      absenceDate.getDate() === today.getDate()
    );
  });
  return todayAbsence;
};

const Page = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { data: userInfo, isLoading: isLoadingUser } = useQuery<UserInfo>({
    queryKey: ["userInfo", userId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/user?id=${userId}`);
      // console.log("userInfo", data);
      return data;
    },
  });

  const { data: attendInfo, isLoading: isLoadingAttend } = useQuery<AttendInfo>({
    queryKey: ["attendInfo", userId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/attend?id=${userId}`);
      // console.log("attendInfo", data);
      return data;
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (data: { id: string }) => {
      const { data: res } = await axios.post("/api/attend", data);
      console.log(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendInfo", userId] });
      queryClient.invalidateQueries({ queryKey: ["userInfo", userId] });
    },
  });

  const handleClick = () => {
    mutate({ id: userId });
  };

  // useEffect(() => {
  //   console.log(userInfo);
  // }, [userInfo]);

  // useEffect(() => {
  //   console.log(attendInfo);
  // }, [attendInfo]);

  useEffect(() => {
    if (!isLoadingUser && !isLoadingAttend) {
      setIsLoading(false);
    }
  }, [isLoadingUser, isLoadingAttend]);

  const AttendMessageMemo = React.memo(AttendMessage);

  if (!userId) {
    return (
      <div>
        <Header title="登校を登録" icon={<FaHome size={30} />} userId={userId} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Header title="登校を登録" icon={<FaHome size={30} />} userId={userId} />
        <CustomLinearProgress />
      </div>
    );
  }

  if (!userInfo) {
    return <div>error: could not fetch userInfo</div>;
  }

  if (!attendInfo) {
    return <div>error: could not fetch attendInfo</div>;
  }

  return (
    <div>
      <Header title="登校を登録" icon={<FaHome size={30} />} userId={userId} />
      <div className="pt-10 text-center">ようこそ {userInfo.user.name} さん</div>
      <div className="py-2 text-center">
        登校目標時刻は {convertTimeToHHMMFormat(userInfo.user.promisedTime)} です
      </div>
      <div className="py-5 text-center justify-center">
        <AttendMessageMemo userInfo={userInfo} attendInfo={attendInfo} />
        <Button
          isDisabled={attendInfo.isAttend}
          onClick={handleClick}
          size="large"
          color="secondary"
        >
          登校
        </Button>
      </div>
    </div>
  );
};

export default Page;
