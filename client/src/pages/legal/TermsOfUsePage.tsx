import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Section {
  title: string;
  body: string[];
}

export default function TermsOfUsePage() {
  const sections: Section[] = [
    {
      title: "1. Acceptance of Terms",
      body: [
        "By accessing or using SurveyHub, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.",
      ],
    },
    {
      title: "2. Use of the Service",
      body: [
        "You agree to use SurveyHub only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that your use of the service does not violate any applicable laws or regulations.",
        "You must not attempt to gain unauthorised access to any part of the service, other accounts, or systems connected to SurveyHub.",
        "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      ],
    },
    {
      title: "3. User Content",
      body: [
        "You retain ownership of the surveys and content you create using SurveyHub. By using the service, you grant us a limited licence to host, store, and process your content solely to provide the service to you.",
        "You are solely responsible for the content you publish and for ensuring that it does not infringe the rights of any third party or violate applicable law.",
        "You agree not to collect responses from surveys in a manner that is deceptive, unlawful, or that violates the privacy rights of respondents.",
      ],
    },
    {
      title: "4. Acceptable Use",
      body: [
        "You agree not to use SurveyHub to upload harmful or malicious content, to transmit spam, or to engage in any activity that could disrupt, damage, or impair the service or its users.",
        "We reserve the right to suspend or terminate accounts that violate these Terms or that we reasonably believe are being used for unlawful or harmful purposes.",
      ],
    },
    {
      title: "5. Intellectual Property",
      body: [
        "The SurveyHub platform, including its software, design, logos, and content, is owned by us or our licensors and is protected by intellectual property laws. You may not copy, modify, or distribute any part of the platform without our prior written consent.",
      ],
    },
    {
      title: "6. Disclaimers and Limitation of Liability",
      body: [
        "The service is provided on an \"as is\" and \"as available\" basis without warranties of any kind, whether express or implied. We do not warrant that the service will be uninterrupted, secure, or error-free.",
        "To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.",
      ],
    },
    {
      title: "7. Changes to These Terms",
      body: [
        "We may update these Terms of Use from time to time. When we do, we will revise the \"Last updated\" date at the top of this page. Your continued use of the service after changes are posted constitutes your acceptance of the revised terms.",
      ],
    },
    {
      title: "8. Contact Us",
      body: [
        "If you have any questions about these Terms of Use, please contact us at support@surveyhub.example.",
      ],
    },
  ];

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-2xl">Terms of Use</CardTitle>
        <p className="text-sm text-muted-foreground">
          Last updated: September 5, 2026
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        <p className="leading-6 text-muted-foreground">
          These Terms of Use govern your access to and use of SurveyHub. Please
          read them carefully before using our services.
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
