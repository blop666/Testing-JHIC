import { z } from "zod";

export const chatStatusSchema = z.enum(["answered", "unknown", "refused", "email"]);

export const chatSourceSchema = z.object({
  title: z.string(),
  url: z.string().refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), { message: "Invalid URL" }),
});

export const chatResponseSchema = z.object({
  answer: z.string(),
  status: chatStatusSchema,
  sources: z.array(chatSourceSchema),
  confidence: z.number().min(0).max(1),
  emailHandoff: z
    .object({
      userEmail: z.string().email().optional(),
      userName: z.string().optional(),
      subject: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
});
