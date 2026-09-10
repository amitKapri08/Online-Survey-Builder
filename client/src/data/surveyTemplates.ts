import type { CreateQuestionPayload } from "@/types/survey";

export interface SurveyTemplate {
  id: string;
  name: string;
  category:
    | "Customer Experience"
    | "Human Resources"
    | "Product & UX"
    | "Events & Community"
    | "Education & Training";
  description: string;
  longDescription: string;
  estimatedTime: string;
  questionCount: number;
  tags: string[];
  accentColor: {
    badge: string;
    iconBg: string;
    iconText: string;
  };
  survey: {
    title: string;
    description: string;
    isAnonymous: boolean;
    allowMultipleResponses: boolean;
    questions: CreateQuestionPayload[];
  };
}

export const TEMPLATE_CATEGORIES = [
  "All",
  "Customer Experience",
  "Human Resources",
  "Product & UX",
  "Events & Community",
  "Education & Training",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: "customer-satisfaction",
    name: "Customer Satisfaction (CSAT)",
    category: "Customer Experience",
    description:
      "Measure overall customer happiness, loyalty, and discover key areas for improvement.",
    longDescription:
      "A battle-tested CSAT survey ideal for e-commerce, SaaS, or service businesses wanting fast, actionable feedback from their customers right after an interaction or purchase.",
    estimatedTime: "2 mins",
    questionCount: 4,
    tags: ["CSAT", "Feedback", "Support", "Loyalty"],
    accentColor: {
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
      iconText: "text-emerald-700 dark:text-emerald-300",
    },
    survey: {
      title: "Customer Satisfaction Survey",
      description:
        "Thank you for helping us improve. Your feedback is confidential and takes less than two minutes.",
      isAnonymous: true,
      allowMultipleResponses: false,
      questions: [
        {
          questionText: "How satisfied are you with our product/service overall?",
          questionType: "RATING",
          isRequired: true,
          minValue: 1,
          maxValue: 5,
        },
        {
          questionText: "How likely are you to recommend us to a friend or colleague?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Very likely" },
            { optionText: "Likely" },
            { optionText: "Neutral" },
            { optionText: "Unlikely" },
            { optionText: "Very unlikely" },
          ],
        },
        {
          questionText: "Which aspects could we improve the most?",
          questionType: "MULTIPLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Product features & usability" },
            { optionText: "Customer support responsiveness" },
            { optionText: "Pricing & value" },
            { optionText: "Performance & speed" },
            { optionText: "Documentation & onboarding" },
          ],
        },
        {
          questionText: "Do you have any other comments or suggestions for our team?",
          questionType: "LONG_TEXT",
          isRequired: false,
        },
      ],
    },
  },
  {
    id: "employee-engagement",
    name: "Employee Engagement & Pulse",
    category: "Human Resources",
    description:
      "Gauge team morale, manager support, work-life balance, and feedback frequency.",
    longDescription:
      "Designed for modern teams and HR leaders to quickly take the pulse of employee sentiment, ensure psychological safety, and spot burnout risks before they escalate.",
    estimatedTime: "3 mins",
    questionCount: 4,
    tags: ["HR", "Culture", "Pulse", "Morale"],
    accentColor: {
      badge: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
      iconBg: "bg-sky-100 dark:bg-sky-950/60",
      iconText: "text-sky-700 dark:text-sky-300",
    },
    survey: {
      title: "Employee Engagement Pulse Survey",
      description:
        "We value your honest opinion. This survey is completely anonymous to encourage candid feedback.",
      isAnonymous: true,
      allowMultipleResponses: false,
      questions: [
        {
          questionText: "How engaged and motivated do you feel in your role right now?",
          questionType: "RATING",
          isRequired: true,
          minValue: 1,
          maxValue: 5,
        },
        {
          questionText: "Do you feel your manager supports your professional growth and well-being?",
          questionType: "YES_NO",
          isRequired: true,
        },
        {
          questionText: "How often do you receive actionable, constructive feedback on your work?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Every week" },
            { optionText: "Once or twice a month" },
            { optionText: "Quarterly" },
            { optionText: "Rarely or never" },
          ],
        },
        {
          questionText: "What is one thing the leadership team could do to make your daily work better?",
          questionType: "LONG_TEXT",
          isRequired: false,
        },
      ],
    },
  },
  {
    id: "event-registration",
    name: "Event Registration & RSVP",
    category: "Events & Community",
    description:
      "Collect attendee names, emails, breakout session choices, and dietary preferences.",
    longDescription:
      "A seamless registration template for conferences, webinars, hackathons, and corporate workshops. Handles attendee identification, schedule picks, and accommodations.",
    estimatedTime: "2 mins",
    questionCount: 4,
    tags: ["Event", "RSVP", "Community", "Conference"],
    accentColor: {
      badge: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300",
      iconBg: "bg-violet-100 dark:bg-violet-950/60",
      iconText: "text-violet-700 dark:text-violet-300",
    },
    survey: {
      title: "Event Registration & RSVP",
      description:
        "Please reserve your spot by filling out this quick form. We will email your confirmation pass.",
      isAnonymous: false,
      allowMultipleResponses: false,
      questions: [
        {
          questionText: "Your full name",
          questionType: "SHORT_TEXT",
          isRequired: true,
        },
        {
          questionText: "Work or personal email address",
          questionType: "SHORT_TEXT",
          isRequired: true,
        },
        {
          questionText: "Which breakout session track would you like to join?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Track A — Keynote & Architecture Trends" },
            { optionText: "Track B — Deep Dive Hands-on Workshops" },
            { optionText: "Track C — Networking & Product Demos" },
          ],
        },
        {
          questionText: "Do you have any dietary restrictions for catered meals?",
          questionType: "MULTIPLE_CHOICE",
          isRequired: false,
          options: [
            { optionText: "Vegetarian" },
            { optionText: "Vegan" },
            { optionText: "Gluten-free" },
            { optionText: "Halal / Kosher" },
            { optionText: "None" },
          ],
        },
      ],
    },
  },
  {
    id: "product-feedback",
    name: "Product & Feature Feedback",
    category: "Product & UX",
    description:
      "Collect user feedback on new features, product usability, pain points, and wishlist items.",
    longDescription:
      "Perfect for product managers and UX designers looking to prioritize roadmaps based on qualitative and quantitative user feedback.",
    estimatedTime: "3 mins",
    questionCount: 5,
    tags: ["Product", "UX", "Roadmap", "Features"],
    accentColor: {
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
      iconBg: "bg-amber-100 dark:bg-amber-950/60",
      iconText: "text-amber-700 dark:text-amber-300",
    },
    survey: {
      title: "Product & Feature Feedback",
      description:
        "Help us shape the future of our product. Tell us what works, what doesn't, and what you'd love to see next.",
      isAnonymous: true,
      allowMultipleResponses: false,
      questions: [
        {
          questionText: "How frequently do you use our product?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Daily" },
            { optionText: "Several times a week" },
            { optionText: "Once a week" },
            { optionText: "A few times a month" },
          ],
        },
        {
          questionText: "Rate the overall ease of use of our platform",
          questionType: "RATING",
          isRequired: true,
          minValue: 1,
          maxValue: 5,
        },
        {
          questionText: "Which feature do you find most valuable?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Intuitive Survey Builder" },
            { optionText: "Real-time Metrics & Analytics" },
            { optionText: "Template Library" },
            { optionText: "Export & Sharing Options" },
          ],
        },
        {
          questionText: "What feature or capability is currently missing for you?",
          questionType: "LONG_TEXT",
          isRequired: false,
        },
        {
          questionText: "Has our product helped improve your workflow?",
          questionType: "YES_NO",
          isRequired: true,
        },
      ],
    },
  },
  {
    id: "website-usability",
    name: "Website Usability & Bug Report",
    category: "Product & UX",
    description:
      "Identify confusing navigation, broken links, device-specific bugs, and visual hurdles.",
    longDescription:
      "Empowers QA and frontend engineering teams to catch UX friction, find where users drop off, and troubleshoot responsive bugs across desktop and mobile devices.",
    estimatedTime: "2 mins",
    questionCount: 4,
    tags: ["Web", "Usability", "Bugs", "QA"],
    accentColor: {
      badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
      iconBg: "bg-rose-100 dark:bg-rose-950/60",
      iconText: "text-rose-700 dark:text-rose-300",
    },
    survey: {
      title: "Website Usability Evaluation",
      description:
        "Help us make our website faster and easier to navigate. Report issues or tell us about your experience.",
      isAnonymous: true,
      allowMultipleResponses: true,
      questions: [
        {
          questionText: "Did you find what you were looking for today without trouble?",
          questionType: "YES_NO",
          isRequired: true,
        },
        {
          questionText: "Rate your overall experience navigating our site",
          questionType: "RATING",
          isRequired: true,
          minValue: 1,
          maxValue: 5,
        },
        {
          questionText: "Which device and browser did you use?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Desktop — Chrome / Edge" },
            { optionText: "Desktop — Firefox / Safari" },
            { optionText: "Mobile — iOS Safari" },
            { optionText: "Mobile — Android Chrome" },
            { optionText: "Tablet / iPad" },
          ],
        },
        {
          questionText: "Describe any bugs, broken elements, or confusion you experienced",
          questionType: "LONG_TEXT",
          isRequired: false,
        },
      ],
    },
  },
  {
    id: "course-evaluation",
    name: "Course & Workshop Evaluation",
    category: "Education & Training",
    description:
      "Collect student feedback on lesson clarity, instructor guidance, course pace, and materials.",
    longDescription:
      "Ideal for educators, bootcamps, and corporate trainers to measure educational outcomes and continuously refine curriculum quality.",
    estimatedTime: "3 mins",
    questionCount: 5,
    tags: ["Education", "Workshop", "Learning", "Training"],
    accentColor: {
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300",
      iconBg: "bg-indigo-100 dark:bg-indigo-950/60",
      iconText: "text-indigo-700 dark:text-indigo-300",
    },
    survey: {
      title: "Course & Workshop Evaluation",
      description:
        "Your feedback is essential to keeping our educational content practical and engaging.",
      isAnonymous: true,
      allowMultipleResponses: false,
      questions: [
        {
          questionText: "Rate the overall quality and relevance of the course material",
          questionType: "RATING",
          isRequired: true,
          minValue: 1,
          maxValue: 5,
        },
        {
          questionText: "The instructor explained complex topics clearly and was helpful",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Strongly agree" },
            { optionText: "Agree" },
            { optionText: "Neutral" },
            { optionText: "Disagree" },
            { optionText: "Strongly disagree" },
          ],
        },
        {
          questionText: "How did you find the pacing of the sessions?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Too fast — struggled to keep up" },
            { optionText: "Just right — well balanced" },
            { optionText: "Too slow — wanted more depth" },
          ],
        },
        {
          questionText: "Which lesson or project was most valuable to you?",
          questionType: "SHORT_TEXT",
          isRequired: false,
        },
        {
          questionText: "What could we do to improve future cohorts?",
          questionType: "LONG_TEXT",
          isRequired: false,
        },
      ],
    },
  },
  {
    id: "exit-interview",
    name: "Employee Exit Interview",
    category: "Human Resources",
    description:
      "Gather candid departure reasons, company culture insights, and retention recommendations.",
    longDescription:
      "A structured exit survey designed to capture honest, actionable feedback when an employee departs, assisting HR teams in boosting retention and team culture.",
    estimatedTime: "4 mins",
    questionCount: 5,
    tags: ["HR", "Exit", "Retention", "Culture"],
    accentColor: {
      badge: "bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300",
      iconBg: "bg-teal-100 dark:bg-teal-950/60",
      iconText: "text-teal-700 dark:text-teal-300",
    },
    survey: {
      title: "Employee Exit Interview",
      description:
        "Thank you for your time with us. Please share your candid perspective to help us make this a better workplace for future teammates.",
      isAnonymous: true,
      allowMultipleResponses: false,
      questions: [
        {
          questionText: "What was the primary factor in your decision to leave?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Better compensation / benefits" },
            { optionText: "Career growth / promotional opportunity" },
            { optionText: "Work-life balance / remote flexibility" },
            { optionText: "Company direction / leadership" },
            { optionText: "Career transition / education" },
            { optionText: "Other" },
          ],
        },
        {
          questionText: "Rate your overall experience working at the company",
          questionType: "RATING",
          isRequired: true,
          minValue: 1,
          maxValue: 5,
        },
        {
          questionText: "Did you feel recognized and valued for your contributions?",
          questionType: "YES_NO",
          isRequired: true,
        },
        {
          questionText: "Would you consider recommending our company as a great place to work?",
          questionType: "YES_NO",
          isRequired: true,
        },
        {
          questionText: "What is the single most important advice you would give to executive leadership?",
          questionType: "LONG_TEXT",
          isRequired: false,
        },
      ],
    },
  },
  {
    id: "market-research",
    name: "Market Research & Brand Discovery",
    category: "Customer Experience",
    description:
      "Discover how customers found you, what alternatives they tested, and their purchase drivers.",
    longDescription:
      "Gain competitive intelligence and attribution clarity by surveying prospective or new buyers on how they learned about your solution and what swayed their decision.",
    estimatedTime: "2 mins",
    questionCount: 4,
    tags: ["Marketing", "Research", "Attribution", "Discovery"],
    accentColor: {
      badge: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
      iconBg: "bg-fuchsia-100 dark:bg-fuchsia-950/60",
      iconText: "text-fuchsia-700 dark:text-fuchsia-300",
    },
    survey: {
      title: "Market Research & Brand Discovery Survey",
      description:
        "Help us learn more about how you found us and what matters most when choosing a solution.",
      isAnonymous: true,
      allowMultipleResponses: false,
      questions: [
        {
          questionText: "How did you first learn about our product?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Google / Organic search" },
            { optionText: "Social media (LinkedIn, Twitter/X, YouTube)" },
            { optionText: "Friend or colleague recommendation" },
            { optionText: "Blog post, newsletter, or article" },
            { optionText: "Event or conference" },
            { optionText: "Online ad" },
          ],
        },
        {
          questionText: "What was the most critical factor in your decision?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Speed & ease of use" },
            { optionText: "Rich analytics & audit logging" },
            { optionText: "Transparent pricing" },
            { optionText: "Modern dark mode & responsive UI" },
            { optionText: "Security & anonymous response features" },
          ],
        },
        {
          questionText: "Which alternative tools did you compare before choosing us?",
          questionType: "MULTIPLE_CHOICE",
          isRequired: false,
          options: [
            { optionText: "Google Forms" },
            { optionText: "Typeform" },
            { optionText: "SurveyMonkey" },
            { optionText: "Jotform" },
            { optionText: "None — you were our first choice" },
          ],
        },
        {
          questionText: "Any other details about your use case you'd like to share?",
          questionType: "LONG_TEXT",
          isRequired: false,
        },
      ],
    },
  },
];
