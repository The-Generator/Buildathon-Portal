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

interface TeamAssignmentProps {
  participantName: string;
  teamName: string;
  roomNumber?: number | null;
  teammates: Array<{
    name: string;
    school: string;
    role: string;
    email?: string;
    phone?: string;
  }>;
  teamSkills: string[];
}

export default function TeamAssignment({
  participantName,
  teamName,
  roomNumber,
  teammates,
  teamSkills,
}: TeamAssignmentProps) {
  const formattedDate = new Date(EVENT_CONFIG.startTime).toLocaleDateString(
    "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>
        Your team for {EVENT_CONFIG.shortName} is set! Meet your teammates.
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

          {/* Team Banner */}
          <Section style={teamBanner}>
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%", textAlign: "center" as const }}>
              <tbody>
                <tr>
                  <td>
                    <Img
                      src="https://em-content.zobj.net/source/apple/391/handshake_1f91d.png"
                      alt="team"
                      width="48"
                      height="48"
                      style={{ margin: "0 auto" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingTop: "12px" }}>
                    <Heading as="h1" style={teamBannerHeading}>
                      Your Team is Set!
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
              Great news — your team for {EVENT_CONFIG.name} has been
              finalized. Here&apos;s who you&apos;ll be building with on April 11th.
            </Text>

            {/* Team Name Card */}
            <Section style={teamNameCard}>
              <Text style={teamNameLabel}>YOUR TEAM</Text>
              <Heading as="h2" style={teamNameHeading}>{teamName}</Heading>
              {roomNumber && (
                <Text style={roomNumberText}>Room {roomNumber}</Text>
              )}
            </Section>

            {/* Teammates */}
            <Text style={sectionTitle}>Your Teammates</Text>
            {teammates.map((teammate, index) => (
              <Section key={index} style={memberCard}>
                <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
                  <tbody>
                    <tr>
                      <td style={avatarCell}>
                        <table cellPadding="0" cellSpacing="0">
                          <tbody>
                            <tr>
                              <td style={avatar}>
                                {teammate.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td style={memberInfo}>
                        <Text style={memberName}>{teammate.name}</Text>
                        <Text style={memberSchool}>{teammate.school} &middot; {teammate.role}</Text>
                        {teammate.email && (
                          <Text style={memberContact}>
                            <Link href={`mailto:${teammate.email}`} style={memberContactLink}>{teammate.email}</Link>
                          </Text>
                        )}
                        {teammate.phone && (
                          <Text style={memberContact}>{teammate.phone}</Text>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>
            ))}

            {/* Team Skills */}
            {teamSkills.length > 0 && (
              <>
                <Text style={{ ...sectionTitle, marginTop: "24px" }}>Team Skills</Text>
                <Section style={skillsWrap}>
                  {teamSkills.map((skill, index) => (
                    <span key={index} style={skillBadge}>
                      {skill}
                    </span>
                  ))}
                </Section>
              </>
            )}

            {/* Directory callout */}
            <Section style={directoryCard}>
              <Text style={directoryText}>
                Want to learn more about your teammates? Check out their profiles
                on the participant directory.
              </Text>
              <table cellPadding="0" cellSpacing="0" style={{ margin: "0 auto" }}>
                <tbody>
                  <tr>
                    <td style={directoryButton}>
                      <Link href="https://babsonbuildathon.com/participants" style={directoryLink}>
                        View Participant Directory
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Hr style={hr} />

            {/* Event Reminder */}
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
                  {roomNumber && (
                    <tr>
                      <td style={iconCell}>
                        <Img
                          src="https://em-content.zobj.net/source/apple/391/door_1f6aa.png"
                          alt="room"
                          width="18"
                          height="18"
                        />
                      </td>
                      <td style={detailText}>Room {roomNumber}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>

            <Hr style={hr} />

            {/* Check-In Callout */}
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

            {/* Get Ready */}
            <Heading as="h2" style={{ ...sectionTitle, marginBottom: "20px" }}>
              Get Ready
            </Heading>

            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tbody>
                {[
                  { num: "1", title: "Introduce yourself", desc: "Reach out to your teammates before the event. Discuss ideas and strengths." },
                  { num: "2", title: "Brainstorm early", desc: `The theme is "${EVENT_CONFIG.theme}". Start thinking about problems worth solving.` },
                  { num: "3", title: "Set up your environment", desc: "Make sure your laptop, accounts, and dev tools are ready to go." },
                  { num: "4", title: "Arrive together", desc: `Coordinate with your team to arrive at ${EVENT_CONFIG.location} by 8:00 AM for registration & breakfast.` },
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
                      <Text style={stepTitleText}>{step.title}</Text>
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

const teamBanner: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  borderBottom: "1px solid #d1fae5",
  padding: "24px 32px",
  textAlign: "center" as const,
};

const teamBannerHeading: React.CSSProperties = {
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

const teamNameCard: React.CSSProperties = {
  backgroundColor: "#006241",
  borderRadius: "10px",
  padding: "20px 24px",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const teamNameLabel: React.CSSProperties = {
  color: "rgba(255,255,255,0.6)",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1.5px",
  margin: "0 0 4px",
};

const teamNameHeading: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0",
};

const roomNumberText: React.CSSProperties = {
  color: "rgba(255,255,255,0.75)",
  fontSize: "14px",
  fontWeight: "500",
  margin: "6px 0 0",
};

const sectionTitle: React.CSSProperties = {
  color: "#111827",
  fontSize: "15px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const memberCard: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "14px 16px",
  margin: "0 0 8px",
};

const avatarCell: React.CSSProperties = {
  width: "44px",
  verticalAlign: "middle",
  paddingRight: "14px",
};

const avatar: React.CSSProperties = {
  backgroundColor: "#006241",
  color: "#ffffff",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  textAlign: "center" as const,
  lineHeight: "40px",
  fontSize: "14px",
  fontWeight: "700",
  display: "block",
};

const memberInfo: React.CSSProperties = {
  verticalAlign: "middle",
};

const memberName: React.CSSProperties = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  lineHeight: "1.3",
};

const memberSchool: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "0",
  lineHeight: "1.4",
};

const memberContact: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "2px 0 0",
  lineHeight: "1.4",
};

const memberContactLink: React.CSSProperties = {
  color: "#006241",
  textDecoration: "none",
};

const skillsWrap: React.CSSProperties = {
  lineHeight: "2.4",
};

const skillBadge: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  color: "#065f46",
  border: "1px solid #d1fae5",
  padding: "4px 12px",
  borderRadius: "100px",
  fontSize: "12px",
  fontWeight: "500",
  marginRight: "6px",
  display: "inline-block",
  marginBottom: "4px",
};

const directoryCard: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "10px",
  padding: "20px",
  margin: "24px 0 0",
  textAlign: "center" as const,
};

const directoryText: React.CSSProperties = {
  color: "#166534",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 14px",
};

const directoryButton: React.CSSProperties = {
  backgroundColor: "#006241",
  borderRadius: "6px",
  textAlign: "center" as const,
};

const directoryLink: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  padding: "8px 20px",
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

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  borderWidth: "1px 0 0",
  margin: "24px 0",
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

const stepTitleText: React.CSSProperties = {
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
