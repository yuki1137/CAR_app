"use client";
import DrumTimePicker from "../../../components/DrumTimePicker";

export default function Page() {
  const handleTime = (hour: number, minute: number) => {
    console.log(hour, minute);
  };
  return (
    <div>
      <h1>DrumTimePicker</h1>
      <DrumTimePicker handleTime={handleTime} />
    </div>
  );
}
