import { Resend } from "resend";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    const html = await render(react);

    await resend.emails.send({
      from: `Babson Generator <${process.env.EMAIL_FROM}>`,
      replyTo: "alaraia1@babson.edu",
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}
