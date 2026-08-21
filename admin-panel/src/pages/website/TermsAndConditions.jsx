import { useNavigate } from 'react-router-dom';
import { ScrollText, ChevronLeft } from 'lucide-react';

const sections = [
  {
    title: '1. Introduction',
    content: `Welcome to Easy service ("we," "our," or "us"). By accessing or using our website, mobile application, and services (collectively, the "Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use our Platform.

These Terms apply to all users of the Platform, including customers, workers, and visitors. We reserve the right to modify these Terms at any time, and continued use of the Platform constitutes acceptance of any changes.`,
  },
  {
    title: '2. User Accounts',
    content: `To access certain features of the Platform, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.

You agree to:
• Provide accurate, current, and complete information during registration.
• Keep your account details updated.
• Not share your account credentials with any third party.
• Not create multiple accounts for fraudulent purposes.
• Be at least 18 years of age to create an account.

We reserve the right to suspend or terminate any account that violates these Terms or engages in fraudulent, abusive, or illegal activity.`,
  },
  {
    title: '3. Bookings & Services',
    content: `Easy service connects customers ("Customers") with independent service providers ("Workers"). We do not employ Workers — they are independent contractors who offer their services through our Platform.

Service Listings: Workers list their services, rates, and availability. We verify worker credentials but do not guarantee service quality.
Booking Confirmation: A booking is confirmed once the Customer submits a request and the Worker accepts it.
Worker Obligations: Workers agree to arrive on time, perform services professionally, and adhere to the agreed scope of work.
Customer Obligations: Customers agree to provide accurate job descriptions, safe working conditions, and timely payment.
Disputes: Any disputes between Customer and Worker should be reported through our dispute resolution system within 48 hours of service completion.`,
  },
  {
    title: '4. Payments',
    content: `All payments are processed securely through our Platform.

• Pricing: Service prices are displayed upfront before booking confirmation.
• Payment Methods: We accept credit/debit cards, mobile wallets, and cash (where available).
• Platform Fees: A service fee may be added to each transaction to support platform operations.
• Worker Payments: Workers receive payment after service completion, minus applicable platform fees.
• Failed Transactions: In case of payment failures, the booking will not be confirmed until payment is successfully processed.
• Taxes: All prices may be subject to applicable taxes as per Pakistani law.

Customers agree to pay the full amount for services rendered. Chargebacks or payment reversals made without valid reason may result in account suspension.`,
  },
  {
    title: '5. Cancellation & Refunds',
    content: `Cancellation by Customer:
• Cancellations made more than 2 hours before the scheduled service time are free of charge.
• Cancellations made within 2 hours of the scheduled time may incur a cancellation fee.
• Repeated cancellations may affect your account standing.

Cancellation by Worker:
• If a Worker cancels, we will assist in finding a replacement or provide a full refund.
• Workers who repeatedly cancel may face penalties or account suspension.

Refunds:
• Refunds are processed within 5-7 business days to the original payment method.
• Refund eligibility is determined on a case-by-case basis following our dispute resolution process.
• Service fees are non-refundable unless the cancellation is due to Worker no-show or Platform error.`,
  },
  {
    title: '6. User Conduct & Prohibited Activities',
    content: `All users agree to use the Platform responsibly. The following activities are strictly prohibited:

• Harassment, abuse, or discrimination against any user.
• Posting false, misleading, or fraudulent information.
• Attempting to circumvent payment or booking systems.
• Using the Platform for any illegal purpose.
• Attempting to reverse-engineer, hack, or disrupt the Platform.
• Soliciting or accepting payments outside the Platform.
• Posting inappropriate, offensive, or harmful content.

Violation of these rules may result in immediate account termination and legal action where applicable.`,
  },
  {
    title: '7. Limitation of Liability',
    content: `To the fullest extent permitted by law, Easy service shall not be liable for:

• Any damages arising from services performed by Workers.
• Loss of data, profits, or business interruption.
• Quality or outcome of services provided by Workers.
• Actions or omissions of Workers or Customers.
• Technical issues beyond our reasonable control.

Our total liability for any claim arising from use of the Platform shall not exceed the amount paid by the Customer for the specific booking in question.

We provide the Platform on an "as is" and "as available" basis without warranties of any kind, express or implied.`,
  },
  {
    title: '8. Intellectual Property',
    content: `All content on the Platform — including text, graphics, logos, icons, images, software, and design — is the property of Easy service or its licensors and is protected by copyright, trademark, and intellectual property laws.

Users may not reproduce, distribute, modify, or create derivative works from any Platform content without express written permission. The "Easy service" name and logo are registered trademarks.`,
  },
  {
    title: '9. Privacy',
    content: `Your privacy is important to us. How we collect, use, and protect your personal information is described in our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the data practices described in our Privacy Policy.`,
  },
  {
    title: '10. Termination',
    content: `We reserve the right to suspend or terminate your account and access to the Platform at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.

Upon termination, your right to use the Platform ceases immediately. Provisions relating to ownership, disclaimers, indemnity, and limitations of liability shall survive termination.`,
  },
  {
    title: '11. Changes to Terms',
    content: `We may update these Terms from time to time to reflect changes in our practices, legal requirements, or Platform features. When we do, we will:

• Post the revised Terms on this page with an updated "Last Updated" date.
• Notify registered users via email or in-app notification for material changes.
• Changes take effect immediately upon posting. Your continued use of the Platform after changes constitutes acceptance of the revised Terms.

We encourage you to review these Terms periodically.`,
  },
  {
    title: '12. Contact Us',
    content: `If you have any questions, concerns, or feedback regarding these Terms, please contact us:

📧 Email: legal@easyservice.pk
📞 Phone: +92 300 1234567
📍 Address: 123 Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan

We aim to respond to all inquiries within 2 business days.`,
  },
];

export default function TermsAndConditions() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in pb-6 md:pb-0">
      {/* Mobile header */}
      <div className="md:hidden sticky top-16 z-40 bg-[#F6F9F7] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-display font-bold text-ink-900">Terms & Conditions</h1>
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
              <ScrollText size={14} className="text-gold-400" />
              Legal
            </div>
            <h1 className="font-display text-3xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-white">
              Terms & <span className="text-gradient-gold">Conditions</span>
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
