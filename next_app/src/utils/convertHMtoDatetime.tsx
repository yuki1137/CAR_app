const convertHMtoDatetime = (hour:number, minute:number) =>{
    const time =
    //固定の年月日をつける,左に0をつけて2桁にする、日本時間にする
    `2000-01-01T${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:00+09:00`;
    return time;
}
export default convertHMtoDatetime;