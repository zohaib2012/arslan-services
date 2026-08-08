import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    { icon: <Phone size={20} />, label: 'Phone', value: '+92 300 1234567', href: 'tel:+923001234567' },
    { icon: <Mail size={20} />, label: 'Email', value: 'support@easyservice.pk', href: 'mailto:support@easyservice.pk' },
    { icon: <MapPin size={20} />, label: 'Address', value: 'Lahore, Punjab, Pakistan' },
    { icon: <Clock size={20} />, label: 'Working Hours', value: 'Mon - Sat, 9 AM - 7 PM' },
  ];

  const social = [
    { icon: <Globe size={18} />, label: 'Facebook' },
    { icon: <Globe size={18} />, label: 'Twitter' },
    { icon: <Globe size={18} />, label: 'Instagram' },
    { icon: <Globe size={18} />, label: 'LinkedIn' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand">
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-emerald-50 mb-6">
              <Mail size={14} className="text-gold-400" />
              Get in Touch
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-white">
              Contact <span className="text-gradient-gold">Us</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-emerald-50/80 leading-relaxed max-w-2xl">
              Have questions, feedback, or need help? We'd love to hear from you.
              Reach out and our team will respond promptly.
            </p>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full text-[#F6F9F7]" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none">
          <path d="M0 60h1440V20c-120 20-260 30-400 25S800 10 700 10 400 20 300 15 100 0 0 20v40z" />
        </svg>
      </section>

      {/* Contact Form + Sidebar */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 card-premium p-8">
            <h2 className="font-display text-2xl font-extrabold text-ink-900 mb-2">Send us a Message</h2>
            <p className="text-gray-500 text-sm mb-8">Fill out the form below and we'll respond within 24 hours.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1.5">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1.5">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1.5">Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1.5">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us more about your query..."
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-8 py-3.5 gradient-brand text-white font-bold rounded-xl shadow-md shadow-brand-500/25 hover:shadow-lg transition-all disabled:opacity-60"
              >
                <Send size={18} /> {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {contactInfo.map((item, i) => (
              <div key={i} className="card-premium p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl gradient-brand text-white flex items-center justify-center shrink-0 shadow-glow">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-gray-500 hover:text-brand-700 transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">{item.value}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="card-premium p-5">
              <p className="text-sm font-semibold text-ink-900 mb-3">Follow Us</p>
              <div className="flex items-center gap-2.5">
                {social.map((s, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label={s.label}
                    className="w-11 h-11 rounded-xl bg-gray-50 hover:gradient-brand hover:text-white text-gray-500 flex items-center justify-center transition-all hover:shadow-glow"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="card-premium p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl gradient-brand text-white flex items-center justify-center mb-5 shadow-glow">
            <MapPin size={32} />
          </div>
          <h3 className="font-display font-bold text-xl text-ink-900">Visit Our Office</h3>
          <p className="text-gray-500 mt-2">
            123 Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan
          </p>
          <p className="text-sm text-brand-600 font-medium mt-1">
            We're open Monday to Saturday, 9:00 AM — 7:00 PM
          </p>
          <div className="mt-6 h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
            <span className="text-gray-400 text-sm">Map Integration</span>
          </div>
        </div>
      </section>
    </div>
  );
}
