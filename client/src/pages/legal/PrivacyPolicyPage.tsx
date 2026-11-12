import {
  ChevronRight,
  Database,
  Eye,
  FileText,
  Lock,
  Mail,
  Share2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

interface Section {
  title: string;
  icon: typeof ShieldCheck;
  body: string[];
}

export default function PrivacyPolicyPage() {
  const sections: Section[] = [
    {
      title: "1. Information We Collect",
      icon: Database,
      body: [
        "We collect information you provide directly to us when you create an account, such as your name, email address, and password. We also collect information you provide when you create and manage surveys.",
        "We automatically collect certain information about your device and how you interact with SurveyBuilder, including your IP address, browser type, and usage data, to improve our services and ensure security.",
        "Survey responses are collected on your behalf and stored by us solely to provide you with survey tools, reporting, and analytics.",
      ],
    },
    {
      title: "2. How We Use Your Information",
      icon: Eye,
      body: [
        "We use the information we collect to provide, maintain, and improve SurveyBuilder, to personalise your experience, and to respond to your requests and questions.",
        "We may use your email address to send you service-related communications, such as account notifications or critical security notices.",
        "We never sell your personal information or response data to third parties or advertising brokers.",
      ],
    },
    {
      title: "3. Sharing of Information",
      icon: Share2,
      body: [
        "We do not share your personal information with third parties except as described in this policy or with your explicit consent.",
        "We may share information with trusted infrastructure providers who assist us in operating our platform, subject to strict confidentiality obligations.",
        "We may disclose information when required by law, or when we believe in good faith that such disclosure is necessary to protect our legal rights, your safety, or the safety of others.",
      ],
    },
    {
      title: "4. Data Retention and Security",
      icon: Lock,
      body: [
        "We retain your personal information for as long as your account is active or as needed to provide our services. You may request deletion of your account and associated data at any time.",
        "We implement industry-standard administrative, cryptographic, and physical safeguards to protect your information from unauthorised access, alteration, or destruction.",
        "Sensitive communication and survey transmission is encrypted in transit using Transport Layer Security (TLS 1.3).",
      ],
    },
    {
      title: "5. Your Rights and Choices",
      icon: UserCheck,
      body: [
        "You have the right to access, export, correct, or delete the personal information we hold about you. You may also object to or restrict certain processing of your data.",
        "Respondents who submit responses to surveys can request deletion of their submitted data by reaching out to the survey creator or directly to our privacy team.",
      ],
    },
    {
      title: "6. Contact Our Privacy Team",
      icon: Mail,
      body: [
        "If you have any questions or concerns about this Privacy Policy or our handling of your personal information, please contact us at privacy@surveybuilder.example.",
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
        <span className="text-foreground">Privacy Policy</span>
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
              Legal Document
            </Badge>
            <span className="text-xs text-muted-foreground">
              Last revised: March 2026
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Your privacy is our priority. This document clearly outlines what information we collect, how we protect it, and your full data rights.
          </p>
        </div>

        <Badge
          variant="outline"
          className="self-start sm:self-center gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium px-3 py-1 text-xs"
        >
          <ShieldCheck className="size-3.5" />
          Encrypted & GDPR Ready
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
