import { useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft } from 'lucide-react';

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information to provide, improve, and secure our services. The types of information we collect include:

Personal Information:
• Full name, email address, and phone number — when you register or contact us.
• Profile picture and optional bio — if you choose to provide them.
• National ID (CNIC) details — for worker verification purposes.
• Payment information — processed securely by our payment partners.

Usage Information:
• Device information (type, OS, browser) when you access our Platform.
• IP address, location data (with your permission), and browsing activity.
• Service interaction data — bookings, searches, messages, and reviews.
• Log data, crash reports, and performance metrics.

Communication Data:
• Messages exchanged between Customers and Workers through our chat system.
• Support tickets and correspondence with our team.
• Feedback, reviews, and ratings you submit.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the collected information for the following purposes:

Service Delivery:
• To create and manage your account.
• To process bookings and facilitate connections between Customers and Workers.
• To process payments securely.
• To verify Worker identities and credentials.
• To send booking confirmations, reminders, and service updates.

Improvement & Personalization:
• To analyze usage patterns and improve Platform features.
• To personalize your experience, recommendations, and search results.
• To train and improve our AI-powered features.
• To conduct research and analytics for Platform enhancement.

Communication:
• To respond to your inquiries and support requests.
• To send administrative messages, policy updates, and security alerts.
• To send promotional communications (with opt-out option).

Security & Compliance:
• To detect and prevent fraud, abuse, and policy violations.
• To comply with legal obligations and law enforcement requests.
• To enforce our Terms and Conditions.`,
  },
  {
    title: '3. How We Share Information',
    content: `We do not sell your personal information. We may share data in the following circumstances:

With Service Providers:
• Payment processors for handling transactions.
• Cloud hosting and infrastructure providers.
• Analytics and monitoring services.
• SMS and email delivery services.

On the Platform:
• Worker profiles (name, photo, ratings) are visible to Customers.
• Customer names and job details are visible to Workers upon booking.
• Reviews and ratings are publicly visible.

Legal & Safety:
• When required by law, court order, or government regulation.
• To protect the rights, property, or safety of Easy service, our users, or the public.
• In connection with a merger, acquisition, or sale of assets.

With Your Consent:
• We may share information for any other purpose with your explicit consent.`,
  },
  {
    title: '4. Cookies & Tracking Technologies',
    content: `We use cookies and similar technologies to enhance your experience:

What Are Cookies:
Cookies are small text files stored on your device when you visit websites. They help us remember your preferences, understand usage patterns, and improve the Platform.

Types of Cookies We Use:
• Essential Cookies: Required for core Platform functionality (authentication, security).
• Preference Cookies: Remember your settings and preferences.
• Analytics Cookies: Help us understand how users interact with the Platform.
• Marketing Cookies: Used to deliver relevant advertisements (with consent).

Your Choices:
• Most browsers allow you to control cookie settings.
• You can disable cookies in your browser settings, but some features may not work properly.
• We respect "Do Not Track" signals when configured in your browser.`,
  },
  {
    title: '5. Data Security',
    content: `We implement industry-standard security measures to protect your information:

Technical Safeguards:
• Encryption of data in transit (TLS/SSL) and at rest.
• Secure authentication with hashed passwords.
• Regular security audits and vulnerability testing.
• Firewalls and intrusion detection systems.

Organizational Safeguards:
• Access to personal data is limited to authorized personnel.
• Staff training on data protection and privacy practices.
• Incident response procedures for data breaches.

Data Retention:
• We retain personal information only as long as necessary for the purposes described or as required by law.
• Upon account deletion, we may retain certain data for legal compliance, dispute resolution, and fraud prevention.
• Anonymized or aggregated data may be retained indefinitely for analytical purposes.

While we strive to protect your data, no method of electronic storage or transmission is 100% secure. You also play a role — use strong passwords and keep your credentials confidential.`,
  },
  {
    title: '6. Your Rights',
    content: `Depending on your jurisdiction, you may have the following rights regarding your personal data:

Right to Access: Request a copy of the personal information we hold about you.
Right to Rectification: Correct inaccurate or incomplete information.
Right to Erasure: Request deletion of your personal data ("Right to be Forgotten").
Right to Restrict Processing: Limit how we use your data in certain circumstances.
Right to Data Portability: Receive your data in a structured, machine-readable format.
Right to Object: Object to processing based on legitimate interests or direct marketing.
Right to Withdraw Consent: Withdraw consent where processing is based on consent.

To exercise any of these rights, contact us at privacy@easyservice.pk. We will respond within 30 days and may require identity verification before processing your request.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `Our Platform is not directed at children under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child under 18 has provided us with personal information, we will take steps to delete it promptly.

If you are a parent or guardian and believe your child has provided us with personal data, please contact us immediately.`,
  },
  {
    title: '8. Third-Party Services',
    content: `Our Platform may contain links to third-party websites or integrate third-party services (e.g., payment gateways, map services). This Privacy Policy does not apply to those third parties.

We encourage you to review the privacy policies of any third-party services you interact with. We are not responsible for the privacy practices or content of external services.`,
  },
  {
    title: '9. International Data Transfers',
    content: `Your information may be transferred to and processed in countries other than your country of residence. We ensure that any such transfers comply with applicable data protection laws and that appropriate safeguards are in place.

For users in Pakistan, your data is primarily stored and processed within Pakistan. Some services may involve data processing in other jurisdictions.`,
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy periodically to reflect changes in our practices, technology, or legal requirements. When we do:

• We will post the revised policy on this page with an updated "Last Updated" date.
• For material changes, we will notify you via email or prominent in-app notice.
• Continued use of our Platform after changes constitutes acceptance of the updated policy.

We encourage you to review this policy regularly.`,
  },
  {
    title: '11. Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

📧 Email: privacy@easyservice.pk
📞 Phone: +92 300 1234567
📍 Address: 123 Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan

Data Protection Officer: Ahmed Khan (dpo@easyservice.pk)

We take your privacy seriously and will respond to all inquiries within 2 business days.`,
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in pb-6 md:pb-0">
      {/* Mobile header */}
      <div className="md:hidden sticky top-16 z-40 bg-[#F6F9F7] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-display font-bold text-ink-900">Privacy Policy</h1>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand">
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-emerald-50 mb-4 md:mb-6">
              <Shield size={14} className="text-gold-400" />
              Legal
            </div>
            <h1 className="font-display text-3xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-white">
              Privacy <span className="text-gradient-gold">Policy</span>
            </h1>
            <p className="mt-4 md:mt-6 text-emerald-50/80 text-sm md:text-lg">
              Last updated: January 1, 2025
            </p>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full text-[#F6F9F7]" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none">
          <path d="M0 60h1440V20c-120 20-260 30-400 25S800 10 700 10 400 20 300 15 100 0 0 20v40z" />
        </svg>
      </section>

      {/* Content */}
      <section className="py-10 md:py-16 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="space-y-4 md:space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="card-premium p-5 md:p-8">
              <h2 className="font-display text-lg md:text-xl font-extrabold text-ink-900 mb-3 md:mb-4">{section.title}</h2>
              {section.content.split('\n').filter(Boolean).map((line, j) => {
                if (line.startsWith('• ')) {
                  return (
                    <p key={j} className="text-xs md:text-sm text-gray-500 leading-relaxed pl-3 mb-1">
                      {line}
                    </p>
                  );
                }
                return (
                  <p key={j} className="text-xs md:text-sm text-gray-500 leading-relaxed mb-2 md:mb-3">
                    {line}
                  </p>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
