import React from "react";
import clsx from "clsx";

const CustomLinearProgress = () => {
  // ロード中を表すプログレスバーを作成
  return <div className={clsx("w-full h-1 animate-pulse bg-primary")}></div>;
};

export default CustomLinearProgress;
