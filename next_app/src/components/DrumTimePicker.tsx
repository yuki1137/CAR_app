import React, { useState, useEffect } from "react";
import clsx from "clsx";

type DrumTimePickerrProps = {
  handleTime: (hour: number, minute: number) => void;
  additionalClassName?: string;
};

const TimePicker = ({ handleTime, additionalClassName }: DrumTimePickerrProps) => {
  const className = "border border-gray-300 rounded-md p-2 mx-1 text-black appearance-none";
  const [hour, setHour] = useState("08");
  const [minute, setMinute] = useState("30");
  useEffect(() => {
    handleTime(Number(hour), Number(minute));
  }, [hour, minute, handleTime]);

  // 時間と分の選択肢を生成
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <div className="flex justify-center items-center">
      <select
        className={clsx(className, additionalClassName)}
        value={hour}
        onChange={(e) => setHour(e.target.value)}
      >
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-lg">:</span>
      <select
        className={clsx(className, additionalClassName)}
        value={minute}
        onChange={(e) => setMinute(e.target.value)}
      >
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimePicker;
