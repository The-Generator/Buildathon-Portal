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
import { EVENT_CONFIG, WHATSAPP_URL } from "@/lib/constants";

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
        Check in online, view the campus map, and get ready for {EVENT_CONFIG.shortName}!
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

          {/* Banner */}
          <Section style={checkinBanner}>
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%", textAlign: "center" as const }}>
              <tbody>
                <tr>
                  <td>
                    <Img
                      src="https://em-content.zobj.net/source/apple/391/rocket_1f680.png"
                      alt="rocket"
                      width="48"
                      height="48"
                      style={{ margin: "0 auto" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingTop: "12px" }}>
                    <Heading as="h1" style={checkinHeading}>
                      Everything You Need for the Build-a-thon
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
              The Build-a-thon is almost here! Here&apos;s everything you need —
              check in early, review the map, and grab your resources.
            </Text>

            {/* ─── EARLY CHECK-IN ─── */}
            <Heading as="h2" style={sectionTitle}>
              Early Check-In
            </Heading>
            <Text style={paragraph}>
              Check in online now to get a green checkmark. Screenshot it and
              show it at the door to skip the registration line!
            </Text>

            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tbody>
                {[
                  { num: "1", title: "Click the button below", desc: "Opens the check-in page" },
                  { num: "2", title: "Enter your email or phone", desc: "We'll look up your registration" },
                  { num: "3", title: "Save your green checkmark", desc: "Screenshot it or save the PDF — show it at the door to skip the line" },
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

            {/* ─── THE THREE TRACKS ─── */}
            <Heading as="h2" style={sectionTitle}>
              The Three Tracks
            </Heading>
            <Text style={paragraph}>
              The Buildathon is <strong>TOMORROW</strong> and we want to make
              sure you&apos;re locked in. There are three tracks — read up so
              you know where your project fits:
            </Text>

            <Section style={trackCard}>
              <Text style={trackTitle}>🏋️ AI-Enhanced Athletic Performance</Text>
              <Text style={trackSubtitle}>Optimizing Human Performance</Text>
              <Text style={trackDesc}>
                Design AI-powered tools that help athletes train smarter,
                prevent injury, and perform at their best. Whether it&apos;s for
                pros, everyday fitness enthusiasts, or people just starting
                their wellness journey.
              </Text>
            </Section>

            <Section style={trackCard}>
              <Text style={trackTitle}>♿ AI-Powered Accessibility Solutions</Text>
              <Text style={trackSubtitle}>Technology for Every Body</Text>
              <Text style={trackDesc}>
                Build AI-driven tools that meaningfully improve daily life for
                people with disabilities. Think solutions that prioritize
                dignity, independence, and real-world impact.
              </Text>
            </Section>

            <Section style={trackCard}>
              <Text style={trackTitle}>🚀 Entrepreneurial AI for Unseen Markets</Text>
              <Text style={trackSubtitle}>Innovating in Untapped Spaces</Text>
              <Text style={trackDesc}>
                Use AI to identify and build solutions for overlooked or
                underserved opportunities in the wellness economy. Find the
                markets, communities, and problems that traditional products
                ignore.
              </Text>
            </Section>

            <Text style={paragraph}>
              <strong>Pick the track that best fits what you&apos;re building
              and go all in on it.</strong>
            </Text>

            <Hr style={hr} />

            {/* ─── EVENT DETAILS + LOGISTICS ─── */}
            <Heading as="h2" style={sectionTitle}>
              Event Details &amp; Logistics
            </Heading>

            <Section style={card}>
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
                      Babson College, 231 Forest Street, Babson Park, MA 02457
                    </td>
                  </tr>
                  <tr>
                    <td style={iconCell}>
                      <Img
                        src="https://em-content.zobj.net/source/apple/391/classical-building_1f3db-fe0f.png"
                        alt="venue"
                        width="18"
                        height="18"
                      />
                    </td>
                    <td style={detailText}>
                      Knight Auditorium &amp; surrounding classrooms (Malloy and Olin Hall)
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Parking */}
            <Section style={card}>
              <Text style={cardLabel}>PARKING &amp; ARRIVAL</Text>
              <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td style={iconCell}>
                      <Img
                        src="https://em-content.zobj.net/source/apple/391/automobile_1f697.png"
                        alt="car"
                        width="18"
                        height="18"
                      />
                    </td>
                    <td style={detailText}>
                      Enter campus via the <strong>Westgate Entrance</strong> (open 6:30 AM &ndash; 8 PM)
                    </td>
                  </tr>
                  <tr>
                    <td style={iconCell}>
                      <Img
                        src="https://em-content.zobj.net/source/apple/391/parking_1f17f-fe0f.png"
                        alt="parking"
                        width="18"
                        height="18"
                      />
                    </td>
                    <td style={detailText}>
                      Guests may park in <strong>Trim Lot</strong> (a parking pass will be
                      provided after check-in, about a 5-minute walk across campus)
                    </td>
                  </tr>
                  <tr>
                    <td style={iconCell}>
                      <Img
                        src="https://em-content.zobj.net/source/apple/391/door_1f6aa.png"
                        alt="drop-off"
                        width="18"
                        height="18"
                      />
                    </td>
                    <td style={detailText}>
                      Drop-off is available at <strong>Knight Lot (#43)</strong> near the
                      auditorium entrance. Limited parking may also be available in Knight Lot.
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Campus Map */}
            <Section style={mapCard}>
              <table cellPadding="0" cellSpacing="0" style={{ width: "100%", textAlign: "center" as const }}>
                <tbody>
                  <tr>
                    <td>
                      <Img
                        src="https://em-content.zobj.net/source/apple/391/world-map_1f5fa-fe0f.png"
                        alt="map"
                        width="32"
                        height="32"
                        style={{ margin: "0 auto" }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: "8px" }}>
                      <Text style={mapCardTitle}>Campus Map</Text>
                      <Text style={mapCardDesc}>
                        Find parking, event spaces, and key buildings on the Babson campus.
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: "12px" }}>
                      <table cellPadding="0" cellSpacing="0" style={{ margin: "0 auto" }}>
                        <tbody>
                          <tr>
                            <td style={mapButton}>
                              <Link href="https://babsonbuildathon.com/buildathon-map.pdf" style={mapButtonLink}>
                                View Campus Map
                              </Link>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Hr style={hr} />

            {/* ─── RESOURCES ─── */}
            <Heading as="h2" style={sectionTitle}>
              Resources
            </Heading>

            {/* WhatsApp Day-of Announcements */}
            <Section style={whatsappCard}>
              <table cellPadding="0" cellSpacing="0" style={{ width: "100%", textAlign: "center" as const }}>
                <tbody>
                  <tr>
                    <td>
                      <Img
                        src="https://em-content.zobj.net/source/apple/391/speech-balloon_1f4ac.png"
                        alt="chat"
                        width="32"
                        height="32"
                        style={{ margin: "0 auto" }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: "8px" }}>
                      <Text style={whatsappCardTitle}>Join the WhatsApp Announcements</Text>
                      <Text style={whatsappCardDesc}>
                        All day-of communications and announcements will be posted in
                        our WhatsApp group. Join now so you don&apos;t miss anything.
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: "12px" }}>
                      <table cellPadding="0" cellSpacing="0" style={{ margin: "0 auto" }}>
                        <tbody>
                          <tr>
                            <td style={whatsappButton}>
                              <Link href={WHATSAPP_URL} style={whatsappButtonLink}>
                                Join the WhatsApp Group
                              </Link>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* GitHub Student Developer Pack */}
            <Section style={githubCard}>
              <table cellPadding="0" cellSpacing="0" style={{ width: "100%", textAlign: "center" as const }}>
                <tbody>
                  <tr>
                    <td>
                      <Img
                        src="https://em-content.zobj.net/source/apple/391/laptop_1f4bb.png"
                        alt="laptop"
                        width="32"
                        height="32"
                        style={{ margin: "0 auto" }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: "8px" }}>
                      <Text style={githubCardTitle}>GitHub Student Developer Pack</Text>
                      <Text style={githubCardDesc}>
                        Gain fast-tracked access to the GitHub Student Developer Pack, a
                        benefits resource worth over $100k that includes free product use
                        from MongoDB, Name.com, 1Password and DigitalOcean, plus free use
                        of Copilot Student. Fill out this form to opt in and get access
                        before the weekend.
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: "12px" }}>
                      <table cellPadding="0" cellSpacing="0" style={{ margin: "0 auto" }}>
                        <tbody>
                          <tr>
                            <td style={githubButton}>
                              <Link href="https://gh.io/babson-builds" style={githubButtonLink}>
                                Get the Student Developer Pack
                              </Link>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* W9/W8BEN Prize Notice */}
            <Section style={prizeNotice}>
              <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "32px", verticalAlign: "top", paddingRight: "12px" }}>
                      <Img
                        src="https://em-content.zobj.net/source/apple/391/trophy_1f3c6.png"
                        alt="trophy"
                        width="28"
                        height="28"
                      />
                    </td>
                    <td>
                      <Text style={prizeNoticeTitle}>Important for Competitors</Text>
                      <Text style={prizeNoticeDesc}>
                        For all serious competitors: please have a digital copy of your{" "}
                        <strong>W-9</strong> (or <strong>W-8BEN</strong> for international
                        students) ready in order to redeem prizes.
                      </Text>
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

const mapCard: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "10px",
  padding: "20px",
  margin: "16px 0 0",
  textAlign: "center" as const,
};

const trackCard: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderLeft: "4px solid #006241",
  borderRadius: "8px",
  padding: "16px 18px",
  margin: "12px 0",
};

const trackTitle: React.CSSProperties = {
  color: "#111827",
  fontSize: "15px",
  fontWeight: "700",
  margin: "0 0 4px",
};

const trackSubtitle: React.CSSProperties = {
  color: "#006241",
  fontSize: "13px",
  fontWeight: "600",
  fontStyle: "italic",
  margin: "0 0 8px",
};

const trackDesc: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0",
};

const mapCardTitle: React.CSSProperties = {
  color: "#1e40af",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 4px",
};

const mapCardDesc: React.CSSProperties = {
  color: "#3b82f6",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
};

const mapButton: React.CSSProperties = {
  backgroundColor: "#1e40af",
  borderRadius: "6px",
  textAlign: "center" as const,
};

const mapButtonLink: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  padding: "8px 20px",
};

const githubCard: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "10px",
  padding: "20px",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const githubCardTitle: React.CSSProperties = {
  color: "#166534",
  fontSize: "15px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const githubCardDesc: React.CSSProperties = {
  color: "#166534",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0",
};

const githubButton: React.CSSProperties = {
  backgroundColor: "#24292f",
  borderRadius: "6px",
  textAlign: "center" as const,
};

const githubButtonLink: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  padding: "8px 20px",
};

const whatsappCard: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  border: "1px solid #a7f3d0",
  borderRadius: "10px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const whatsappCardTitle: React.CSSProperties = {
  color: "#065f46",
  fontSize: "15px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const whatsappCardDesc: React.CSSProperties = {
  color: "#065f46",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0",
};

const whatsappButton: React.CSSProperties = {
  backgroundColor: "#25D366",
  borderRadius: "6px",
  textAlign: "center" as const,
};

const whatsappButtonLink: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  padding: "8px 20px",
};

const prizeNotice: React.CSSProperties = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: "10px",
  padding: "16px 20px",
  margin: "0 0 0",
};

const prizeNoticeTitle: React.CSSProperties = {
  color: "#92400e",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 4px",
};

const prizeNoticeDesc: React.CSSProperties = {
  color: "#92400e",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
};
