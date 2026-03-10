import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { render } from "@react-email/render";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    const html = await render(react);

    await transporter.sendMail({
      from: `"Babson Generator (no-reply)" <${process.env.EMAIL_FROM}>`,
      replyTo: "alaraia1@babson.edu",
      to,
      subject,
      html,
      headers: {
        // Unique ref prevents Gmail from threading separate notification emails
        "X-Entity-Ref-ID": randomUUID(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}
