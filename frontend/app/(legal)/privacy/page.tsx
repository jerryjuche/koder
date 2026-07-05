import React from 'react';

export const metadata = {
  title: 'Privacy Policy — Koder',
  description: 'Koder privacy policy — what data we collect, how we use it, and your rights.',
};

type Section = {
  title: string;
  body: (string | React.ReactElement)[];
  callout?: string;
  contact?: boolean;
};

const sections: Section[] = [
  {
    title: 'Information We Collect',
    body: [
      'We collect only the data necessary to operate the platform:',
      <span key="account"><strong>Account data</strong> — your name, username, email, and a bcrypt-hashed password when you register directly.</span>,
      <span key="google"><strong>Google Sign-In data</strong> — if you choose Google OAuth, we receive your name, email, and a unique account identifier from Google. We never receive your Google password.</span>,
      <span key="submissions"><strong>Submission data</strong> — the Go code you submit for grading, execution results (pass/fail, runtime), and attempt history.</span>,
      <span key="progress"><strong>Progress data</strong> — problems solved, XP earned, and activity used for your profile and leaderboard standing.</span>,
      <span key="usage"><strong>Usage data</strong> — standard server logs (timestamps, IP addresses) retained temporarily for security and debugging.</span>,
    ],
  },
  {
    title: 'How We Use Your Information',
    body: [
      <span key="auth">Authenticate you and maintain your session.</span>,
      <span key="grade">Grade your code submissions and record progress.</span>,
      <span key="display">Display leaderboard rankings and your profile to other users.</span>,
      <span key="abuse">Detect and prevent abuse, including rate-limit enforcement.</span>,
      <span key="ops">Diagnose issues and maintain platform stability.</span>,
      <React.Fragment key="noads"><br />We do not use your data for advertising, and we do not sell or share it with third parties for marketing.</React.Fragment>,
    ],
  },
  {
    title: 'Google Sign-In',
    body: [
      'Koder uses Google OAuth 2.0 as an optional sign-in method. Google authenticates you on their infrastructure and shares only the data you authorize — typically your name, email address, and a unique account identifier. We do not access your Google Drive, Gmail, or any other Google service.',
    ],
    callout: 'You can revoke Koder\'s access to your Google account at any time via myaccount.google.com/permissions. Revoking access does not delete your Koder account or submission history.',
  },
  {
    title: 'Code Submissions',
    body: [
      'Code you submit is executed inside an isolated, ephemeral container with no network access. The container is destroyed immediately after execution. Your submission and results are stored in our database and visible to you through your profile. Platform administrators (instructors) may also access submission logs for academic oversight.',
    ],
  },
  {
    title: 'Data Storage & Security',
    body: [
      'Your data is stored in a Supabase-hosted PostgreSQL database with row-level security — only you can read your own submissions and progress via the API. Passwords are hashed using bcrypt (cost factor 12). All traffic is encrypted in transit via HTTPS.',
    ],
  },
  {
    title: 'Data Retention',
    body: [
      'We retain your account data and submission history for as long as your account is active. If you request account deletion, your personal data and submission records are permanently removed within 30 days.',
    ],
  },
  {
    title: 'Your Rights',
    body: [
      <span key="copy">Request a copy of the personal data we hold about you.</span>,
      <span key="correct">Request correction of inaccurate account information.</span>,
      <span key="delete">Request permanent deletion of your account and associated data.</span>,
      <React.Fragment key="contact"><br />To exercise any of these rights, contact <a href="mailto:privacy@koder.dev" className="text-brand-muted-gold hover:underline">privacy@koder.dev</a>. We will respond within 14 days.</React.Fragment>,
    ],
  },
  {
    title: "Children's Privacy",
    body: [
      'Koder is intended for use by students in a supervised academic cohort. We do not knowingly collect personal data from individuals under 13. If you believe a minor has provided personal data without appropriate consent, contact us and we will delete it promptly.',
    ],
  },
  {
    title: 'Changes to This Policy',
    body: [
      'If we make material changes, we will update the effective date below and, where appropriate, notify users via the platform. Continued use after changes take effect constitutes acceptance of the revised policy.',
    ],
  },
  {
    title: 'Contact',
    body: [],
    contact: true,
  },
];

function SectionBlock({ section }: { section: Section }) {
  return (
    <section className="mb-10">
      <h2 className="flex items-center gap-3 text-sm font-semibold text-white mb-3">
        <span className="inline-block w-0.5 h-4 bg-brand-muted-gold rounded-full shrink-0" />
        {section.title}
      </h2>

      {section.contact ? (
        <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-lg p-5 text-sm space-y-1">
          <p className="font-semibold text-white">Jerry Juche</p>
          <p className="text-brand-offwhite/70">Koder Platform</p>
          <a href="mailto:privacy@koder.dev" className="text-brand-muted-gold hover:underline">
            privacy@koder.dev
          </a>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {section.body.map((item, i) => (
            <li key={i} className="text-brand-offwhite/80 text-sm leading-relaxed flex items-baseline gap-2.5">
              <span className="text-brand-muted-gold/60 shrink-0 select-none">&mdash;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {section.callout && (
        <div className="mt-4 bg-brand-muted-gold/10 border border-brand-muted-gold/25 rounded-md px-4 py-3">
          <p className="text-amber-200/90 text-xs leading-relaxed">{section.callout}</p>
        </div>
      )}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <div className="mb-10 pb-8 border-b border-brand-charcoal-border">
        <p className="font-mono text-xs tracking-widest uppercase text-brand-muted-gold mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">Privacy Policy</h1>
        <p className="text-brand-offwhite-muted text-sm">
          Effective date: July 1, 2026 &nbsp;·&nbsp; Last updated: July 1, 2026
        </p>
      </div>

      <p className="text-brand-offwhite/80 mb-10 leading-relaxed">
        Koder is an automated code-grading platform for Go programming curricula. This policy explains
        what information we collect, how we use it, and the choices you have. We keep things minimal
        by design &mdash; only data necessary to run the platform is collected.
      </p>

      {sections.map((section) => (
        <SectionBlock key={section.title} section={section} />
      ))}
    </>
  );
}
