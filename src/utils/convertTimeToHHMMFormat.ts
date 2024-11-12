// 渡された文字列または Date オブジェクトを時刻のフォーマット（時:分）に変換
const convertTimeToHHMMFormat = (str: string | Date) => {
  const date = new Date(str);
  const padHours = (hours: number) => {
    // 数字の前にゼロを追加して文字列の末尾から2文字を取得
    return ("0" + hours).slice(-2);
  };
  const padMinutes = (minutes: number) => {
    return ("0" + minutes).slice(-2);
  };
  const hours = padHours(date.getHours());
  const minutes = padMinutes(date.getMinutes());
  // console.log(hours, minutes);
  return `${hours}:${minutes}`;
};

export default convertTimeToHHMMFormat;
