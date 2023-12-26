import { z } from "zod";
import prisma from "../lib/prisma";

//4桁-2桁-2桁 T 2桁:2桁:2桁+09:00の形式か検証
const iso8601ExtendedRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\+09:00$/;

const userSchema = z.object({
  name: z.string(),
  promisedTime: z.string().refine((value) => iso8601ExtendedRegex.test(value)),
});
export { userSchema };

async function validateUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user !== null; //存在するユーザーIDならtrue
}

const absenceSchema = z.object({
  userId: z.string().refine(
    async (userId) => {
      return validateUserId(userId);
    },
    {
      message: "存在しないユーザーIDです",
    },
  ),
  reason: z.string(),
  absenceTime: z.string().refine((value) => iso8601ExtendedRegex.test(value)),
});
export { absenceSchema };

//同じ人が同じ日に公欠登録しないか検証
async function validateAbsence(userId: string, absenceTime: string) {
   //年月日が同じ、時間が違うものもはじく
  const datePart = absenceTime.slice(0, 10); // 'YYYY-MM-DD' 部分を取得
  const minDate = new Date(datePart + "T00:00:00+09:00");
  const maxDate = new Date(datePart + "T23:59:59+09:00");

  const absence = await prisma.absence.findFirst({
    where: { userId: userId, absenceTime: { gte: minDate, lte: maxDate } },
  });
  return absence === null; //存在しないabsenceならtrue
}
export { validateAbsence };

const changeTimeSchema = z.object({
  id: z.string(),
  promisedTime: z.string().refine((value) => iso8601ExtendedRegex.test(value)),
});
export { changeTimeSchema };