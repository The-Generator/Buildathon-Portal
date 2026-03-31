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
    const text = await render(react, { plainText: true });

    const { data, error } = await resend.emails.send({
      from: `Babson Generator <${process.env.EMAIL_FROM}>`,
      replyTo: "alaraia1@babson.edu",
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[EMAIL] Resend API error:", JSON.stringify(error));
      return { success: false, error };
    }

    console.log("[EMAIL] Sent successfully, id:", data?.id);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL] Exception:", error);
    return { success: false, error };
  }
}
