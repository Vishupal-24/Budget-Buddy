/**
 * Testimonials data — honest team and early adopter quotes
 */

import { generateUserAvatar } from '@/components/ui/avatar-generator';

export interface FinancialTestimonial {
  id: number;
  quote: string;
  name: string;
  username: string;
  avatar: string;
}

export const FINANCIAL_TESTIMONIALS: FinancialTestimonial[] = [
  {
    id: 1,
    quote:
      "I built Budget Buddy because I couldn't find a budgeting tool that was simple, private, and truly intelligent. We're just getting started, and every feature is built with real users in mind.",
    name: 'Aditya Kumar Tiwari',
    username: '@itisaddy',
    avatar: generateUserAvatar('Aditya Kumar Tiwari', 1),
  },
  {
    id: 2,
    quote:
      'Designing the UX for Budget Buddy taught me that financial tools work best when they get out of the way. Our focus is making money management feel effortless, not overwhelming.',
    name: 'Prachi Upadhyay',
    username: '@prachi_ux',
    avatar: generateUserAvatar('Prachi Upadhyay', 2),
  },
  {
    id: 3,
    quote:
      'On the backend we prioritize speed and reliability. Every API call is optimized so your dashboard loads fast, and your data stays secure with row-level security.',
    name: 'Muneer Ali',
    username: '@muneer_dev',
    avatar: generateUserAvatar('Muneer Ali', 3),
  },
  {
    id: 4,
    quote:
      'Building a clean, responsive frontend means our users get a consistent experience whether they are on a phone, tablet, or desktop. That attention to detail makes all the difference.',
    name: 'Vishupal',
    username: '@vishupal_dev',
    avatar: generateUserAvatar('Vishupal', 4),
  },
  {
    id: 5,
    quote:
      "Budget Buddy is open source because we believe transparency matters — especially when it comes to financial tools. You can inspect every line of code that handles your data.",
    name: 'Budget Buddy Team',
    username: '@budgetbuddy',
    avatar: generateUserAvatar('Budget Buddy', 5),
  },
  {
    id: 6,
    quote:
      'AI-powered insights are only useful when they are based on your real spending data. We never fabricate numbers — every recommendation comes directly from your actual transactions.',
    name: 'Budget Buddy Team',
    username: '@budgetbuddy',
    avatar: generateUserAvatar('Budget Buddy AI', 6),
  },
];
