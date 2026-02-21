import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Link,
  Button,
} from "@react-email/components";
import { EVENT_CONFIG } from "@/lib/constants";

interface RegistrationConfirmationProps {
  participantName: string;
  teamName: string;
  teamSize: number;
  isComplete: boolean;
  isRegisteredByOther: boolean;
  registeredByName?: string;
}

export default function RegistrationConfirmation({
  participantName,
  teamName,
  teamSize,
  isComplete,
  isRegisteredByOther,
  registeredByName,
}: RegistrationConfirmationProps) {
  const formattedDate = new Date(EVENT_CONFIG.startTime).toLocaleDateString(
    "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <Html>
      <Head />
      <Preview>
        You&apos;re registered for {EVENT_CONFIG.shortName}! Join us on{" "}
        {formattedDate}.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerHeading}>
              {EVENT_CONFIG.shortName}
            </Heading>
            <Text style={headerTheme}>{EVENT_CONFIG.theme}</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading as="h1" style={h1}>
              You&apos;re registered!
            </Heading>

            <Text style={paragraph}>
              Hi {participantName},
            </Text>

            {isRegisteredByOther && registeredByName ? (
              <Text style={paragraph}>
                Great news! {registeredByName} has registered you for{" "}
                {EVENT_CONFIG.name}. You&apos;re all set to participate.
              </Text>
            ) : (
              <Text style={paragraph}>
                Thank you for registering for {EVENT_CONFIG.name}. We&apos;re
                excited to have you join us for a day of building, learning,
                and innovation.
              </Text>
            )}

            {/* Event Details Card */}
            <Section style={detailsCard}>
              <Heading as="h2" style={h2}>
                Event Details
              </Heading>
              <table
                cellPadding="0"
                cellSpacing="0"
                style={{ width: "100%" }}
              >
                <tbody>
                  <tr>
                    <td style={detailLabel}>Date</td>
                    <td style={detailValue}>{formattedDate}</td>
                  </tr>
                  <tr>
                    <td style={detailLabel}>Time</td>
                    <td style={detailValue}>9:00 AM - 9:00 PM ET</td>
                  </tr>
                  <tr>
                    <td style={detailLabel}>Location</td>
                    <td style={detailValue}>
                      {EVENT_CONFIG.location}
                      <br />
                      {EVENT_CONFIG.address}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Team Status */}
            <Section style={detailsCard}>
              <Heading as="h2" style={h2}>
                Team Status
              </Heading>
              <table
                cellPadding="0"
                cellSpacing="0"
                style={{ width: "100%" }}
              >
                <tbody>
                  <tr>
                    <td style={detailLabel}>Team</td>
                    <td style={detailValue}>{teamName}</td>
                  </tr>
                  <tr>
                    <td style={detailLabel}>Members</td>
                    <td style={detailValue}>
                      {teamSize} / {EVENT_CONFIG.teamSize}
                    </td>
                  </tr>
                  <tr>
                    <td style={detailLabel}>Status</td>
                    <td style={detailValue}>
                      {isComplete ? (
                        <span style={statusComplete}>
                          Team Complete
                        </span>
                      ) : (
                        <span style={statusPending}>
                          Awaiting Matching
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              {!isComplete && (
                <Text style={mutedText}>
                  Your team isn&apos;t full yet. We&apos;ll match you with
                  additional teammates before the event and notify you once
                  your team is finalized.
                </Text>
              )}
            </Section>

            <Hr style={hr} />

            {/* What's Next */}
            <Heading as="h2" style={h2}>
              What&apos;s Next
            </Heading>
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={stepNumber}>1</td>
                  <td style={stepText}>
                    <strong>Save the date</strong> — Add April 11, 2026 to
                    your calendar. We&apos;ve attached an ICS file to this
                    email for easy import.
                  </td>
                </tr>
                <tr>
                  <td style={stepNumber}>2</td>
                  <td style={stepText}>
                    <strong>Connect with your team</strong> — Once your team
                    is finalized, you&apos;ll receive an email with your
                    teammates&apos; details.
                  </td>
                </tr>
                <tr>
                  <td style={stepNumber}>3</td>
                  <td style={stepText}>
                    <strong>Prepare your tools</strong> — Make sure your
                    laptop is ready and your dev environment is set up.
                  </td>
                </tr>
                <tr>
                  <td style={stepNumber}>4</td>
                  <td style={stepText}>
                    <strong>Show up ready to build</strong> — Arrive at
                    Knight Auditorium by 9:00 AM on event day.
                  </td>
                </tr>
              </tbody>
            </table>

            <Section style={ctaSection}>
              <Button style={ctaButton} href="https://babsongenerator.com">
                Visit Event Website
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={mutedText}>
              Questions? Reply to this email or reach out to us at{" "}
              <Link href="mailto:generator@babson.edu" style={link}>
                generator@babson.edu
              </Link>
              .
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Babson Generator &middot; {EVENT_CONFIG.name}
            </Text>
            <Text style={footerText}>
              {EVENT_CONFIG.address}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const main: React.CSSProperties = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
};

const header: React.CSSProperties = {
  backgroundColor: "#006241",
  padding: "32px 40px",
  textAlign: "center" as const,
};

const headerHeading: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 4px",
};

const headerTheme: React.CSSProperties = {
  color: "#b8dbc9",
  fontSize: "14px",
  margin: "0",
};

const content: React.CSSProperties = {
  padding: "32px 40px",
};

const h1: React.CSSProperties = {
  color: "#006241",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 24px",
  lineHeight: "1.3",
};

const h2: React.CSSProperties = {
  color: "#333333",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: "#444444",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const detailsCard: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "20px 24px",
  margin: "0 0 24px",
};

const detailLabel: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  paddingBottom: "12px",
  paddingRight: "16px",
  verticalAlign: "top",
  width: "90px",
};

const detailValue: React.CSSProperties = {
  color: "#111827",
  fontSize: "15px",
  paddingBottom: "12px",
  verticalAlign: "top",
};

const statusComplete: React.CSSProperties = {
  backgroundColor: "#dcfce7",
  color: "#166534",
  padding: "2px 10px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "600",
};

const statusPending: React.CSSProperties = {
  backgroundColor: "#fef9c3",
  color: "#854d0e",
  padding: "2px 10px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "600",
};

const mutedText: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "12px 0 0",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const stepNumber: React.CSSProperties = {
  backgroundColor: "#006241",
  color: "#ffffff",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  textAlign: "center" as const,
  fontSize: "14px",
  fontWeight: "700",
  lineHeight: "28px",
  verticalAlign: "top",
  paddingRight: "0",
};

const stepText: React.CSSProperties = {
  color: "#444444",
  fontSize: "14px",
  lineHeight: "1.5",
  paddingLeft: "12px",
  paddingBottom: "16px",
  verticalAlign: "top",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "28px 0 8px",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#006241",
  color: "#ffffff",
  padding: "12px 28px",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
};

const link: React.CSSProperties = {
  color: "#006241",
  textDecoration: "underline",
};

const footer: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  padding: "20px 40px",
  textAlign: "center" as const,
  borderTop: "1px solid #e5e7eb",
};

const footerText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "0 0 4px",
};
