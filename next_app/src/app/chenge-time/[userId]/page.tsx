"use client";
import Button from "../../../components/Button";
import Header from "../../../components/Header";
import axios from "axios";
import { User } from "@prisma/client";
import convertTimeToHHMMFormat from "../../../utils/convertTimeToHHMMFormat";
import convertHMtoDatetime from "../../../utils/convertHMtoDatetime";
import TimePicker from "../../../components/DrumTimePicker";
import { FaBusinessTime } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@tanstack/react-query";

type PostDataType = {
  promiseTime: string;
  id: string;
};

type User = {
  name: string;
  promisedTime: string;
};

export default function Page({ params }: { params: { userId: string } }) {
  const userId = params.userId;
  const [hour, setHour] = useState<number>();
  const [minute, setMinute] = useState<number>();
  const [myhour, setMyhour] = useState<number>();
  const [myminute, setMyminute] = useState<number>();

  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const { data, isLoading } = useQuery<User[]>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/user?id=${userId}`);
      console.log(data);
      return data.user;
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (data: PostDataType) => {
      const { data: res } = await axios.post(`/api/change-time`, data);
      console.log(res);
    },
  });

  useEffect(() => {
    console.log(data);
    if (!isLoading && data) {
      // promiseTime を解析して hour と minute に設定
      const promisedTimeFormatted = convertTimeToHHMMFormat(data.promisedTime);
      const [parsedHour, parsedMinute] = promisedTimeFormatted.split(":");
      const parsedHourInt = parseInt(parsedHour, 10);
      const parsedMinuteInt = parseInt(parsedMinute, 10);

      setMyhour(parsedHourInt); // 時間をセット
      setMyminute(parsedMinuteInt); // 分をセット
      setIsDisabled(parsedHourInt === hour && parsedMinuteInt === minute);
    }
  }, [data, hour, minute]);

  const handleTime = (hour: number, minute: number) => {
    console.log(hour, minute);
    setHour(hour);
    setMinute(minute);
  };

  const handleClicked = () => {
    if (hour !== undefined && minute !== undefined) {
      const time = convertHMtoDatetime(hour, minute);
      console.log(userId, time);
      mutate({ promiseTime: time, id: userId });
    } else {
      console.log("error");
    }
  };
  return (
    <>
      <Header title="目標の変更" icon={<FaBusinessTime size={30} />} />

      <div className="flex justify-center p-8">
        <>現在の目標時間：</>
        {data ? (
          <span>
            {myhour}:{myminute}
          </span>
        ) : (
          <span>Loading...</span>
        )}
      </div>
      <div className="flex justify-center">新しい目標を設定</div>

      <div className="flex justify-center pt-2 font-bold">
        <TimePicker handleTime={handleTime} />
      </div>
      <div className="flex justify-center pt-2 pb-2 font-bold">
        <Button
          onClick={() => {
            handleClicked();
          }}
          color="primary"
          isDisabled={isDisabled}
        >
          決定
        </Button>
      </div>
    </>
  );
}
