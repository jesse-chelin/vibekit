import { Html, Head, Body, Container, Text, Button, Hr } from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", background: "#f9fafb" }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", background: "#fff", padding: 32, borderRadius: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: 600 }}>Welcome to Vibekit!</Text>
          <Text>Hi {name}, thanks for signing up. You can sign in anytime:</Text>
          <Button href={loginUrl} style={{ background: "#3b82f6", color: "#fff", padding: "10px 20px", borderRadius: 6, textDecoration: "none" }}>
            Sign In
          </Button>
          <Hr />
          <Text style={{ color: "#6b7280", fontSize: 12 }}>If you didn&apos;t sign up, you can ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  );
}
