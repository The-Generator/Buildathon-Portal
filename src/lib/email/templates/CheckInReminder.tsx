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

interface CheckInReminderProps {
  participantName: string;
  checkinUrl: string;
}

export default function CheckInReminder({
  participantName,
  checkinUrl,
}: CheckInReminderProps) {
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
        Check in online for {EVENT_CONFIG.shortName} and skip the line at the door!
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

          {/* Check-In Banner */}
          <Section style={checkinBanner}>
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%", textAlign: "center" as const }}>
              <tbody>
                <tr>
                  <td>
                    <Img
                      src="https://em-content.zobj.net/source/apple/391/clipboard_1f4cb.png"
                      alt="checkin"
                      width="48"
                      height="48"
                      style={{ margin: "0 auto" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingTop: "12px" }}>
                    <Heading as="h1" style={checkinHeading}>
                      Time to Check In!
                    </Heading>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {participantName},</Text>
            <Text style={paragraph}>
              The Build-a-thon is tomorrow! Check in online now to skip the
              line at the door.
            </Text>

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

            {/* How It Works */}
            <Heading as="h2" style={sectionTitle}>
              How It Works
            </Heading>

            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tbody>
                {[
                  { num: "1", title: "Click the button below", desc: "Opens the check-in page" },
                  { num: "2", title: "Enter your email", desc: "We'll look up your registration" },
                  { num: "3", title: "Show your green checkmark", desc: "Present it at the door to skip the line" },
                ].map((step) => (
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
                      <Link href={checkinUrl} style={ctaLink}>
                        Check In Now
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

const checkinBanner: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  borderBottom: "1px solid #bfdbfe",
  padding: "24px 32px",
  textAlign: "center" as const,
};

const checkinHeading: React.CSSProperties = {
  color: "#1e40af",
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

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  borderWidth: "1px 0 0",
  margin: "24px 0",
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
