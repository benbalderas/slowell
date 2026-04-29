import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface MagicLinkEmailProps {
  url: string;
  email: string;
}

export function MagicLinkEmail({ url, email }: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>your sign-in link for slowell</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section>
            <Text style={wordmark}>slowell</Text>
          </Section>

          <Section style={card}>
            <Text style={heading}>sign in</Text>
            <Text style={paragraph}>
              tap the button below to sign in to slowell. this link expires in 24 hours.
            </Text>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button href={url} style={button}>
                open slowell
              </Button>
            </Section>

            <Text style={muted}>
              or paste this link into your browser:
            </Text>
            <Link href={url} style={fallback}>
              {url}
            </Link>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            you&apos;re getting this because someone tried to sign in to slowell.club with{" "}
            <Link href={`mailto:${email}`} style={footerLink}>{email}</Link>. if it
            wasn&apos;t you, ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#eef1f1",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const container = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "48px 16px",
};

const wordmark = {
  fontSize: "17px",
  fontWeight: 500,
  color: "#000000",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "14px",
  padding: "32px 24px",
};

const heading = {
  fontSize: "22px",
  lineHeight: "1.2",
  fontWeight: 500,
  color: "#000000",
  margin: "0 0 12px 0",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.5",
  color: "#000000",
  margin: "0 0 16px 0",
};

const button = {
  backgroundColor: "#d3fb67",
  color: "#000000",
  fontSize: "15px",
  fontWeight: 500,
  textDecoration: "none",
  padding: "16px 32px",
  borderRadius: "20px",
  display: "inline-block",
};

const muted = {
  fontSize: "13px",
  color: "#798686",
  margin: "0 0 8px 0",
};

const fallback = {
  fontSize: "13px",
  color: "#798686",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#798686",
  opacity: 0.24,
  margin: "32px 0 16px 0",
};

const footer = {
  fontSize: "11px",
  color: "#798686",
  lineHeight: "1.4",
  textAlign: "center" as const,
};

const footerLink = {
  color: "#798686",
  textDecoration: "underline",
};
