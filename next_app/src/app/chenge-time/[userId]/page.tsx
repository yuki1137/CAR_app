"use client";
import Button from "../../../components/Button";
import Header from "../../../components/Header";
import TimePicker from "../../../components/DrumTimePicker";
import { FaBusinessTime } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Page() {
  const [hour, setHour] = useState<number>(8);
  const [minute, setMinute] = useState<number>(30);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  useEffect(() => {
    setIsDisabled(true);
    setHour(8);
    setMinute(30);

    return () => {
      setIsDisabled(false);
    };
  }, []);

  const handleTime = (hour: number, minute: number) => {
    console.log(hour, minute);

    setIsDisabled(false);
    // setHour(hour);
    // setMinute(minute);
  };

  const handleClicked = () => {};
  return (
    <>
      <Header title="目標の変更" icon={<FaBusinessTime size={30} />} />

      <div className="flex justify-center p-8">
        現在の目標時間：{hour}:{minute}
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
