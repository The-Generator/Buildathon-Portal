import { Resend } from "resend";
import { render } from "@react-email/render";

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(key);
}

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    const resend = getResendClient();
    const html = await render(react);

    const { error } = await resend.emails.send({
      from: `Babson Generator <${process.env.EMAIL_FROM}>`,
      replyTo: "alaraia1@babson.edu",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend API error:", JSON.stringify(error));
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}
