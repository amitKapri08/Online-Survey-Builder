import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Mail,
  MessageSquare,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

interface Section {
  title: string;
  icon: typeof Scale;
  body: string[];
}

export default function TermsOfUsePage() {
  const sections: Section[] = [
    {
      title: "1. Acceptance of Terms",
      icon: CheckCircle2,
      body: [
        "By accessing or using SurveyBuilder, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our platform or services.",
      ],
    },
    {
      title: "2. Use of the Service",
      icon: Globe,
      body: [
        "You agree to use SurveyBuilder only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that your use of the service complies with local and international regulations.",
        "You must not attempt to gain unauthorised access to any part of the service, user accounts, servers, or networks connected to SurveyBuilder.",
        "You are responsible for maintaining the confidentiality of your account credentials and for all actions that occur under your account.",
      ],
    },
    {
      title: "3. User Content and Survey Ownership",
      icon: MessageSquare,
      body: [
        "You retain complete intellectual ownership of the surveys, questions, and brand assets you create using SurveyBuilder. By using the service, you grant us a limited licence to host, store, and process your content solely to deliver survey distribution and analytics.",
        "You are solely responsible for the content you publish and for ensuring that it does not infringe the privacy or copyright of any third party.",
        "You agree not to collect responses in a manner that is deceptive, phishing-related, or that violates the fundamental privacy rights of respondents.",
      ],
    },
    {
      title: "4. Acceptable Use Policy",
      icon: ShieldAlert,
      body: [
        "You agree not to use SurveyBuilder to distribute malware, transmit unsolicited bulk spam, conduct credential harvesting, or engage in any activity that impairs system reliability.",
        "We reserve the right to suspend or deactivate accounts that violate these Terms or that we reasonably believe are being used for malicious, abusive, or unlawful activities.",
      ],
    },
    {
      title: "5. Intellectual Property Rights",
      icon: Award,
      body: [
        "The SurveyBuilder platform, including its software, UI design, vector assets, and source code, is owned by us or our licensors and is protected by intellectual property laws. You may not copy, reverse engineer, or redistribute the platform without written permission.",
      ],
    },
    {
      title: "6. Disclaimers and Limitation of Liability",
      icon: AlertTriangle,
      body: [
        "The service is provided on an 'as is' and 'as available' basis without warranties of any kind, whether express or implied. We do not warrant that the service will be entirely uninterrupted, error-free, or immune from external downtime.",
        "To the maximum extent permitted by applicable law, we shall not be held liable for any indirect, incidental, special, or consequential damages resulting from your use of the service.",
      ],
    },
    {
      title: "7. Modifications to Terms",
      icon: Clock,
      body: [
        "We may update these Terms of Use from time to time. When we do, we will update the revision date at the top of this document. Continued use of SurveyBuilder following notice of changes constitutes your agreement to the updated terms.",
      ],
    },
    {
      title: "8. Contact and Support",
      icon: Mail,
      body: [
        "If you have questions or inquiries regarding these Terms of Use, please reach out to our legal support team at legal@surveybuilder.example.",
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
      >
        <Link to={ROUTES.HOME} className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/60" />
        <span className="text-foreground">Terms of Use</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="gap-1 border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-medium px-2.5 py-0.5"
            >
              <FileText className="size-3" />
              User Agreement
            </Badge>
            <span className="text-xs text-muted-foreground">
              Last revised: March 2026
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Terms of Use
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            These Terms govern your access to SurveyBuilder. By creating an account or distributing surveys, you agree to these transparent terms.
          </p>
        </div>

        <Badge
          variant="outline"
          className="self-start sm:self-center gap-1.5 border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium px-3 py-1 text-xs"
        >
          <Scale className="size-3.5" />
          Binding Agreement
        </Badge>
      </div>

      {/* Sections Grid / Stream */}
      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.title}
              className="rounded-2xl border border-border/80 bg-card shadow-xs transition-shadow hover:shadow-sm"
            >
              <CardContent className="p-6 sm:p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                    <Icon className="size-4.5" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-3 pl-12 text-sm leading-relaxed text-muted-foreground">
                  {section.body.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
