import { z } from "zod";
import { SCHOOLS, YEARS } from "./constants";

export const walkinSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    school: z.enum([...SCHOOLS]),
    school_other: z.string().optional(),
    year: z.enum([...YEARS]),
  })
  .refine(
    (data) => {
      if (data.school === "Other") {
        return !!data.school_other && data.school_other.trim().length > 0;
      }
      return true;
    },
    {
      message: "Please specify your school",
      path: ["school_other"],
    }
  );

export type WalkinFormData = z.infer<typeof walkinSchema>;
