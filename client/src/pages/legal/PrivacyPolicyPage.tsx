import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Section {
  title: string;
  body: string[];
}

export default function PrivacyPolicyPage() {
  const sections: Section[] = [
    {
      title: "1. Information We Collect",
      body: [
        "We collect information you provide directly to us when you create an account, such as your name, email address, and password. We also collect information you provide when you create and manage surveys.",
        "We automatically collect certain information about your device and how you interact with SurveyHub, including your IP address, browser type, and usage data, to improve our services and ensure security.",
        "Survey responses are collected on your behalf and stored by us solely to provide you with the survey tools and analytics you use.",
      ],
    },
    {
      title: "2. How We Use Your Information",
      body: [
        "We use the information we collect to provide, maintain, and improve SurveyHub, to personalise your experience, and to respond to your requests and questions.",
        "We may use your email address to send you service-related communications, such as account notifications or updates to our policies. You can control marketing communications at any time.",
        "We do not sell your personal information to third parties.",
      ],
    },
    {
      title: "3. Sharing of Information",
      body: [
        "We do not share your personal information with third parties except as described in this policy or with your consent.",
        "We may share information with trusted service providers who assist us in operating our platform, subject to appropriate confidentiality obligations.",
        "We may disclose information when required by law, or when we believe in good faith that such disclosure is necessary to protect our rights, your safety, or the safety of others.",
      ],
    },
    {
      title: "4. Data Retention and Security",
      body: [
        "We retain your personal information for as long as your account is active or as needed to provide our services. You may request deletion of your account and associated data at any time.",
        "We implement reasonable administrative, technical, and physical safeguards to protect your information from unauthorised access, alteration, or destruction.",
        "No method of transmission over the internet or method of electronic storage is completely secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      title: "5. Your Rights",
      body: [
        "You have the right to access, correct, or delete the personal information we hold about you. You may also object to or restrict certain processing of your information.",
        "To exercise any of these rights, please contact us using the details provided at the end of this policy. We will respond to your request within a reasonable timeframe.",
      ],
    },
    {
      title: "6. Contact Us",
      body: [
        "If you have any questions or concerns about this Privacy Policy or our handling of your personal information, please contact us at support@surveyhub.example.",
      ],
    },
  ];

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-2xl">Privacy Policy</CardTitle>
        <p className="text-sm text-muted-foreground">
          Last updated: September 5, 2026
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        <p className="leading-6 text-muted-foreground">
          Your privacy is important to us. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have.
        </p>

        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-2 text-base font-medium text-foreground">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.body.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm leading-6 text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
