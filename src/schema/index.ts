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
  absenceTimes: z.array(z.string().refine((value) => iso8601ExtendedRegex.test(value))),
});
export { absenceSchema };

const changeTimeSchema = z.object({
  id: z.string(),
  promisedTime: z.string().refine((value) => iso8601ExtendedRegex.test(value)),
});
export { changeTimeSchema };

const attendanceTimeSchema = z.object({
  attendanceTime: z.string(),
});
export { attendanceTimeSchema };
