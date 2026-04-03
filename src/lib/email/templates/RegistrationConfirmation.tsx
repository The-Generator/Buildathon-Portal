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
  Img,
} from "@react-email/components";
import { EVENT_CONFIG } from "@/lib/constants";

interface RegistrationConfirmationProps {
  participantName: string;
  teamOption: "solo" | "partial_team" | "spectator";
  groupSize: number;
  isRegisteredByOther: boolean;
  registeredByName?: string;
}

export default function RegistrationConfirmation({
  participantName,
  teamOption,
  groupSize,
  isRegisteredByOther,
  registeredByName,
}: RegistrationConfirmationProps) {
  const formattedDate = new Date(EVENT_CONFIG.startTime).toLocaleDateString(
    "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/New_York" }
  );

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>
        You&apos;re registered for {EVENT_CONFIG.shortName}! Join us on{" "}
        {formattedDate}.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "center" as const }}>
                    <Img
                      src="https://babsonbuildathon.com/sponsors/generator-ai-lab.png"
                      alt="Babson Generator"
                      width="180"
                      height="56"
                      style={{ margin: "0 auto" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center" as const, paddingTop: "16px" }}>
                    <Text style={headerEventName}>{EVENT_CONFIG.shortName}</Text>
                    <Text style={headerTheme}>{EVENT_CONFIG.theme}</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Success Banner */}
          <Section style={successBanner}>
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%", textAlign: "center" as const }}>
              <tbody>
                <tr>
                  <td>
                    <Img
                      src="https://em-content.zobj.net/source/apple/391/check-mark-button_2705.png"
                      alt="check"
                      width="48"
                      height="48"
                      style={{ margin: "0 auto" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingTop: "12px" }}>
                    <Heading as="h1" style={successHeading}>
                      Registration Confirmed
                    </Heading>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {participantName},</Text>

            {isRegisteredByOther && registeredByName ? (
              <Text style={paragraph}>
                {registeredByName} has registered you for{" "}
                {EVENT_CONFIG.name}. You&apos;re all set to participate on April 11th.
              </Text>
            ) : (
              <Text style={paragraph}>
                Thank you for registering for {EVENT_CONFIG.name}! We&apos;re
                excited to have you join us for a day of building, learning,
                and innovation.
              </Text>
            )}

            {/* Event Details */}
            <Section style={card}>
              <Text style={cardLabel}>EVENT DETAILS</Text>
              <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td style={iconCell}>
                      <Img
                        src="https://em-content.zobj.net/source/apple/391/calendar_1f4c5.png"
                        alt="date"
                        width="18"
                        height="18"
                      />
                    </td>
                    <td style={detailText}>{formattedDate}</td>
                  </tr>
                  <tr>
                    <td style={iconCell}>
                      <Img
                        src="https://em-content.zobj.net/source/apple/391/clock_1f552.png"
                        alt="time"
                        width="18"
                        height="18"
                      />
                    </td>
                    <td style={detailText}>8:00 AM &ndash; 8:30 PM ET</td>
                  </tr>
                  <tr>
                    <td style={iconCell}>
                      <Img
                        src="https://em-content.zobj.net/source/apple/391/round-pushpin_1f4cd.png"
                        alt="location"
                        width="18"
                        height="18"
                      />
                    </td>
                    <td style={detailText}>
                      {EVENT_CONFIG.location}
                      <br />
                      <span style={{ color: "#9ca3af" }}>{EVENT_CONFIG.address}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Registration Status */}
            <Section style={card}>
              <Text style={cardLabel}>REGISTRATION STATUS</Text>
              <Text style={registrationStatus}>
                {teamOption === "spectator"
                  ? "Spectator — You're set! No team assignment needed."
                  : teamOption === "solo"
                    ? "Solo Registration — You'll be matched with a team before the event."
                    : `Group of ${groupSize} — Your group will be matched with additional teammates before the event.`}
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Check-In Callout */}
            {teamOption !== "spectator" && (
              <Section style={checkinCallout}>
                <table cellPadding="0" cellSpacing="0" style={{ width: "100%", textAlign: "center" as const }}>
                  <tbody>
                    <tr>
                      <td>
                        <Img
                          src="https://em-content.zobj.net/source/apple/391/clipboard_1f4cb.png"
                          alt="checkin"
                          width="32"
                          height="32"
                          style={{ margin: "0 auto" }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingTop: "8px" }}>
                        <Text style={checkinCalloutTitle}>Check-In Email Coming April 10th</Text>
                        <Text style={checkinCalloutDesc}>
                          Check in online to get a green checkmark and skip the line at the door!
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>
            )}

            {/* What's Next */}
            <Heading as="h2" style={sectionTitle}>
              What&apos;s Next
            </Heading>

            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tbody>
                {(teamOption === "spectator"
                  ? [
                      { num: "1", title: "Save the date", desc: "Add April 11, 2026 to your calendar." },
                      { num: "2", title: "Explore the event", desc: "Check out demos, workshops, and presentations." },
                      { num: "3", title: "Show up and enjoy", desc: `Arrive at ${EVENT_CONFIG.location} and enjoy the event.` },
                    ]
                  : [
                      { num: "1", title: "Save the date", desc: "Add April 11, 2026 to your calendar." },
                      { num: "2", title: "Wait for your team", desc: "Once finalized, you'll get an email with your teammates' details." },
                      { num: "3", title: "Prepare your tools", desc: "Make sure your laptop is ready and your dev environment is set up." },
                      { num: "4", title: "Show up ready to build", desc: `Arrive at ${EVENT_CONFIG.location} by 8:00 AM for registration & breakfast.` },
                    ]
                ).map((step) => (
                  <tr key={step.num}>
                    <td style={stepNumCell}>
                      <table cellPadding="0" cellSpacing="0">
                        <tbody>
                          <tr>
                            <td style={stepNumBadge}>{step.num}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td style={stepContent}>
                      <Text style={stepTitle}>{step.title}</Text>
                      <Text style={stepDesc}>{step.desc}</Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* CTA */}
            <Section style={ctaSection}>
              <table cellPadding="0" cellSpacing="0" style={{ margin: "0 auto" }}>
                <tbody>
                  <tr>
                    <td style={ctaButton}>
                      <Link href="https://babsonbuildathon.com" style={ctaLink}>
                        Visit Event Website
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Hr style={hr} />

            <Text style={contactText}>
              Questions? Reach out to{" "}
              <Link href="mailto:alaraia1@babson.edu" style={link}>
                alaraia1@babson.edu
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%", textAlign: "center" as const }}>
              <tbody>
                <tr>
                  <td>
                    <Text style={footerBrand}>Babson Generator</Text>
                    <Text style={footerDetail}>{EVENT_CONFIG.name}</Text>
                    <Text style={footerDetail}>{EVENT_CONFIG.address}</Text>
                  </td>
                </tr>
              </tbody>
            </table>
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
  backgroundColor: "#f3f4f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: "20px 0",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const header: React.CSSProperties = {
  backgroundColor: "#0a0f0d",
  padding: "28px 32px 24px",
  textAlign: "center" as const,
};

const headerEventName: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0",
  lineHeight: "1.3",
};

const headerTheme: React.CSSProperties = {
  color: "#34d399",
  fontSize: "13px",
  fontWeight: "500",
  margin: "4px 0 0",
  letterSpacing: "0.5px",
};

const successBanner: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  borderBottom: "1px solid #d1fae5",
  padding: "24px 32px",
  textAlign: "center" as const,
};

const successHeading: React.CSSProperties = {
  color: "#065f46",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const content: React.CSSProperties = {
  padding: "28px 32px 32px",
};

const greeting: React.CSSProperties = {
  color: "#111827",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const paragraph: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const card: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "20px",
  margin: "0 0 16px",
};

const cardLabel: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1.5px",
  margin: "0 0 14px",
};

const iconCell: React.CSSProperties = {
  width: "30px",
  verticalAlign: "top",
  paddingBottom: "10px",
  paddingRight: "4px",
};

const detailText: React.CSSProperties = {
  color: "#111827",
  fontSize: "14px",
  lineHeight: "1.5",
  verticalAlign: "top",
  paddingBottom: "10px",
};

const registrationStatus: React.CSSProperties = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "500",
  lineHeight: "1.5",
  margin: "0",
};

const checkinCallout: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "10px",
  padding: "20px",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const checkinCalloutTitle: React.CSSProperties = {
  color: "#1e40af",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 4px",
};

const checkinCalloutDesc: React.CSSProperties = {
  color: "#3b82f6",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  borderWidth: "1px 0 0",
  margin: "24px 0",
};

const sectionTitle: React.CSSProperties = {
  color: "#111827",
  fontSize: "17px",
  fontWeight: "700",
  margin: "0 0 20px",
};

const stepNumCell: React.CSSProperties = {
  width: "40px",
  verticalAlign: "top",
  paddingBottom: "20px",
};

const stepNumBadge: React.CSSProperties = {
  backgroundColor: "#006241",
  color: "#ffffff",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  textAlign: "center" as const,
  fontSize: "13px",
  fontWeight: "700",
  lineHeight: "28px",
  display: "block",
};

const stepContent: React.CSSProperties = {
  verticalAlign: "top",
  paddingBottom: "20px",
  paddingLeft: "4px",
};

const stepTitle: React.CSSProperties = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 2px",
  lineHeight: "28px",
};

const stepDesc: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "8px 0 0",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#006241",
  borderRadius: "8px",
  textAlign: "center" as const,
};

const ctaLink: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  padding: "12px 32px",
};

const link: React.CSSProperties = {
  color: "#006241",
  textDecoration: "underline",
};

const contactText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "0",
};

const footer: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderTop: "1px solid #e5e7eb",
  padding: "20px 32px",
};

const footerBrand: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0 0 2px",
};

const footerDetail: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "0 0 2px",
};
