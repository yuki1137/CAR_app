import React from "react";
import clsx from "clsx";
import { LinearProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// taiwindcssのprimaryを引数として持ってくる方法を色々模索したんだけど結局無理だったのでベタ書き
const theme = createTheme({
  palette: {
    primary: {
      main: "#1B7F79",
    },
    secondary: {
      main: "#FF4858",
    },
  },
});

const CustomLinearProgress = () => {
  // ロード中を表すプログレスバーを作成
  return (
    <>
      <ThemeProvider theme={theme}>
        <LinearProgress className={clsx("w-full")} />
      </ThemeProvider>
    </>
  );
};

export default CustomLinearProgress;
