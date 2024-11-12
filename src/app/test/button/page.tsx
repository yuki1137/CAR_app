"use client";
import { useState } from "react";
import Button from "../../../components/Button";

export default function Page() {
  const [disabled, setDisabled] = useState(false);
  const handleClick = () => {
    console.log("clicked");
    setDisabled(true);
  };

  return (
    <div>
      <h1>Button Test</h1>
      <Button onClick={handleClick} isDisabled={disabled}>
        {disabled ? "登校済" : "登校"}
      </Button>
      <Button
        onClick={() => {
          console.log("clicked2");
        }}
        color="secondary"
        size="large"
      >
        デカい
      </Button>
    </div>
  );
}
