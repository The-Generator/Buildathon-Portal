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

interface TeamAssignmentProps {
  participantName: string;
  teamName: string;
  teammates: Array<{
    name: string;
    school: string;
    role: string;
  }>;
  teamSkills: string[];
}

export default function TeamAssignment({
  participantName,
  teamName,
  teammates,
  teamSkills,
}: TeamAssignmentProps) {
  const formattedDate = new Date(EVENT_CONFIG.startTime).toLocaleDateString(
    "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <Html>
      <Head />
      <Preview>
        Your team for {EVENT_CONFIG.shortName} is set! Meet your teammates.
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
              Your team is set!
            </Heading>

            <Text style={paragraph}>
              Hi {participantName},
            </Text>

            <Text style={paragraph}>
              Great news — your team for {EVENT_CONFIG.name} has been
              finalized. Here&apos;s who you&apos;ll be building with on
              April 11th.
            </Text>

            {/* Team Name */}
            <Section style={teamBanner}>
              <Text style={teamLabel}>YOUR TEAM</Text>
              <Heading as="h2" style={teamNameHeading}>
                {teamName}
              </Heading>
            </Section>

            {/* Team Members */}
            <Section style={membersSection}>
              <Heading as="h2" style={h2}>
                Team Members
              </Heading>
              {teammates.map((teammate, index) => (
                <Section key={index} style={memberCard}>
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ width: "100%" }}
                  >
                    <tbody>
                      <tr>
                        <td style={avatarCell}>
                          <div style={avatar}>
                            {teammate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        </td>
                        <td style={memberInfo}>
                          <Text style={memberName}>{teammate.name}</Text>
                          <Text style={memberDetail}>
                            {teammate.school}
                          </Text>
                          <Text style={memberRole}>{teammate.role}</Text>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Section>
              ))}
            </Section>

            {/* Team Skills */}
            {teamSkills.length > 0 && (
              <Section style={skillsSection}>
                <Heading as="h2" style={h2}>
                  Team Skill Summary
                </Heading>
                <Text style={paragraph}>
                  Your team brings a diverse set of skills to the table:
                </Text>
                <Section style={skillsGrid}>
                  {teamSkills.map((skill, index) => (
                    <span key={index} style={skillBadge}>
                      {skill}
                    </span>
                  ))}
                </Section>
              </Section>
            )}

            <Hr style={hr} />

            {/* Event Reminder */}
            <Section style={detailsCard}>
              <Heading as="h2" style={h2}>
                Event Reminder
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

            <Hr style={hr} />

            {/* Get Ready */}
            <Heading as="h2" style={h2}>
              Get Ready
            </Heading>
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={stepNumber}>1</td>
                  <td style={stepText}>
                    <strong>Introduce yourself</strong> — Reach out to your
                    teammates before the event. Discuss ideas, strengths, and
                    what you want to build.
                  </td>
                </tr>
                <tr>
                  <td style={stepNumber}>2</td>
                  <td style={stepText}>
                    <strong>Brainstorm early</strong> — The theme is &ldquo;
                    {EVENT_CONFIG.theme}&rdquo;. Start thinking about
                    problems worth solving.
                  </td>
                </tr>
                <tr>
                  <td style={stepNumber}>3</td>
                  <td style={stepText}>
                    <strong>Set up your environment</strong> — Make sure your
                    laptop, accounts, and dev tools are ready to go.
                  </td>
                </tr>
                <tr>
                  <td style={stepNumber}>4</td>
                  <td style={stepText}>
                    <strong>Arrive together</strong> — Coordinate with your
                    team to arrive at Knight Auditorium by 9:00 AM.
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

const teamBanner: React.CSSProperties = {
  backgroundColor: "#006241",
  borderRadius: "8px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const teamLabel: React.CSSProperties = {
  color: "#b8dbc9",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1.5px",
  margin: "0 0 4px",
};

const teamNameHeading: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const membersSection: React.CSSProperties = {
  margin: "0 0 24px",
};

const memberCard: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px",
  margin: "0 0 8px",
};

const avatarCell: React.CSSProperties = {
  width: "44px",
  verticalAlign: "top",
  paddingRight: "12px",
};

const avatar: React.CSSProperties = {
  backgroundColor: "#006241",
  color: "#ffffff",
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  textAlign: "center" as const,
  lineHeight: "44px",
  fontSize: "15px",
  fontWeight: "700",
};

const memberInfo: React.CSSProperties = {
  verticalAlign: "top",
};

const memberName: React.CSSProperties = {
  color: "#111827",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0 0 2px",
};

const memberDetail: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0 0 2px",
};

const memberRole: React.CSSProperties = {
  color: "#006241",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0",
};

const skillsSection: React.CSSProperties = {
  margin: "0 0 8px",
};

const skillsGrid: React.CSSProperties = {
  lineHeight: "2.2",
};

const skillBadge: React.CSSProperties = {
  backgroundColor: "#dcfce7",
  color: "#166534",
  padding: "4px 12px",
  borderRadius: "14px",
  fontSize: "13px",
  fontWeight: "500",
  marginRight: "6px",
  display: "inline-block",
  marginBottom: "4px",
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

const mutedText: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "12px 0 0",
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
