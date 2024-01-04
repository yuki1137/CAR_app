"use client";
import Button from "../../../components/Button";
import Header from "../../../components/Header";
import axios from "axios";
import { User, Absence } from "@prisma/client";
import convertTimeToHHMMFormat from "../../../utils/convertTimeToHHMMFormat";
import convertHMtoDatetime from "../../../utils/convertHMtoDatetime";
import TimePicker from "../../../components/DrumTimePicker";
import { FaBusinessTime } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CustomLinearProgress from "@/components/CustomLinearProgress";

type PostDataType = {
  promisedTime: string;
  id: string;
};

type UserInfo = {
  user: User;
  absences: Absence[];
};

export default function Page({ params }: { params: { userId: string } }) {
  const userId = params.userId;
  const queryClient = useQueryClient();
  const [newMinute, setNewMinute] = useState<number>(30);
  const [newHour, setNewHour] = useState<number>(8);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const { data: userInfo, isLoading: isLoading } = useQuery<UserInfo>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/user?id=${userId}`);
      return data;
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (data: PostDataType) => {
      const { data: res } = await axios.post(`/api/change-time`, data);
      console.log(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });

  // このコードだとdisabledになることはないはず
  useEffect(() => {
    if (newHour && newMinute) {
      setIsDisabled(false);
    }
  }, [newHour, newMinute]);

  const handleTime = (hour: number, minute: number) => {
    setNewHour(hour);
    setNewMinute(minute);
  };

  const handleClicked = () => {
    mutate({ promisedTime: convertHMtoDatetime(newHour, newMinute), id: userId });
  };

  return (
    <>
      <Header title="目標の変更" icon={<FaBusinessTime size={30} />} userId={userId} />
      {isLoading || !userInfo ? (
        <CustomLinearProgress />
      ) : (
        <>
          <div className="flex justify-center p-8">
            <>現在の目標時間：{convertTimeToHHMMFormat(userInfo.user.promisedTime)}</>
          </div>
          <div className="flex justify-center">新しい目標を設定</div>
          <div className="flex justify-center pt-2">
            <TimePicker handleTime={handleTime} />
          </div>
          <div className="flex justify-center pt-2 pb-2 font-bold">
            <Button onClick={handleClicked} color="primary" isDisabled={isDisabled}>
              決定
            </Button>
          </div>
        </>
      )}
    </>
  );
}
