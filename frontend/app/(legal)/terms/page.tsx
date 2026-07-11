import React from 'react';

export const metadata = {
  title: 'Terms of Service — Koder',
  description: 'Koder terms of service — rules, rights, and responsibilities for using the platform.',
};

type Section = {
  title: string;
  body: (string | React.ReactElement)[];
  callout?: string;
  contact?: boolean;
};

const sections: Section[] = [
  {
    title: 'Eligibility',
    body: [
      'Koder is intended for students and instructors participating in a structured Go programming cohort. You must be at least 13 years old to use the platform. If you are under 18, you confirm that you have permission from a parent or guardian to use Koder.',
    ],
  },
  {
    title: 'Your Account',
    body: [
      'You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account.',
      <span key="accurate">Provide accurate information when registering.</span>,
      <span key="share">Not share your account with others or use another person&apos;s account.</span>,
      <span key="notify">Notify us immediately if you suspect unauthorized access to your account.</span>,
      <React.Fragment key="google"><br />If you use Google Sign-In, you are also bound by Google&apos;s Terms of Service for that authentication method.</React.Fragment>,
    ],
  },
  {
    title: 'Acceptable Use',
    body: [
      'You agree to use Koder only for its intended purpose: learning and practicing Go programming. You must not:',
      <span key="sandbox">Submit code designed to escape the sandbox, consume excessive resources, or attack the platform infrastructure.</span>,
      <span key="access">Attempt to access, modify, or delete another user&apos;s submissions or account data.</span>,
      <span key="scrape">Reverse-engineer, scrape, or automate requests in ways that degrade service for others.</span>,
      <span key="plagiarise">Submit another person&apos;s work as your own in violation of your cohort&apos;s academic integrity rules.</span>,
      <span key="lawful">Use the platform for any unlawful purpose or in violation of applicable law.</span>,
    ],
    callout: 'Code submissions run inside isolated containers with no network access, strict memory limits, and process restrictions. Attempting to circumvent these controls is a violation of these terms and may result in immediate account suspension.',
  },
  {
    title: 'Intellectual Property',
    body: [
      'The Koder platform, including its interface, grading logic, and exercise content, is owned by us or licensed from third parties. You may not copy, redistribute, or create derivative works from platform content without explicit written permission.',
      'Code you write and submit remains yours. By submitting code, you grant us a limited, non-exclusive license to execute, store, and display it solely for the purpose of grading and showing you your results. We do not claim ownership of your submissions.',
    ],
  },
  {
    title: 'Leaderboard and Public Profile',
    body: [
      'Your username, XP, solved problem count, and rank are visible to other authenticated users on the leaderboard and profile pages. This is a core feature of the platform. If you do not wish your progress to be visible, do not use Koder or contact us to discuss your options.',
    ],
  },
  {
    title: 'Service Availability',
    body: [
      'Koder is provided on a best-effort basis. We do not guarantee uninterrupted availability. The platform runs on free-tier infrastructure with resource constraints, and downtime may occur without notice. We are not liable for any loss arising from service interruptions.',
    ],
  },
  {
    title: 'Termination',
    body: [
      'We reserve the right to suspend or terminate your account at any time if you violate these terms, engage in abusive behavior, or if required by law. You may delete your account at any time by contacting us. Upon deletion, your personal data and submissions will be permanently removed within 30 days.',
    ],
  },
  {
    title: 'Disclaimer of Warranties',
    body: [
      'Koder is provided "as is" without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the platform will be error-free, secure, or continuously available.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, we are not liable for any indirect, incidental, special, or consequential damages arising from your use of Koder, including loss of data, loss of progress records, or service outages, even if we have been advised of the possibility of such damages.',
    ],
  },
  {
    title: 'Changes to These Terms',
    body: [
      'We may update these terms from time to time. Material changes will be announced on the platform, and the effective date above will be updated. Continued use after changes take effect constitutes your acceptance of the revised terms.',
    ],
  },
  {
    title: 'Governing Law',
    body: [
      'These terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict of law principles. Any disputes arising from these terms or your use of Koder will be resolved in the appropriate courts of jurisdiction in Nigeria.',
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
          <a href="mailto:legal@koder.dev" className="text-brand-muted-gold hover:underline">
            legal@koder.dev
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

export default function TermsPage() {
  return (
    <>
      <div className="mb-10 pb-8 border-b border-brand-charcoal-border">
        <p className="font-mono text-xs tracking-widest uppercase text-brand-muted-gold mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">Terms of Service</h1>
        <p className="text-brand-offwhite-muted text-sm">
          Effective date: July 1, 2026 &nbsp;·&nbsp; Last updated: July 1, 2026
        </p>
      </div>

      <p className="text-brand-offwhite/80 mb-10 leading-relaxed">
        These Terms of Service govern your use of Koder, an automated code-grading platform for
        Go programming curricula operated by Jerry Juche (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
        By creating an account or using the platform, you agree to these terms. If you do not agree,
        do not use Koder.
      </p>

      {sections.map((section) => (
        <SectionBlock key={section.title} section={section} />
      ))}
    </>
  );
}
