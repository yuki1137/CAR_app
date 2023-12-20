import { z } from "zod";

export { userSchema };

const userSchema = z.object({
  name: z.string(),
  promisedTime: z.coerce.date(),
});
