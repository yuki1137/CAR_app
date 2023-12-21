import { z } from "zod";

//2000-01-01T10:30:00+09:00のような型（ISO8601拡張形式）を識別する正規表現
const iso8601ExtendedRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\+09:00$/;
//4桁-2桁-2桁 T 2桁:2桁:2桁+09:00の形式

const userSchema = z.object({
  name: z.string(),
  //refineでZodスキーマにカスタムの検証ロジックを追加する
  promisedTime: z.string().refine((value) => iso8601ExtendedRegex.test(value)),
  //valueにはpromisedTimeの値が入る。.test(value)で正規表現にマッチするか判定
  //text(value)がtrueならバリデーションをパス
});

export { userSchema };
