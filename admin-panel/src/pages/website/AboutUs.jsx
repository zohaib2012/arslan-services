import { Link } from 'react-router-dom';
import { Wrench, Shield, BadgeCheck, Zap, Eye, Users, Heart, Star } from 'lucide-react';

const values = [
  { icon: <Shield size={24} />, title: 'Trusted', desc: 'Every professional undergoes background verification before joining our platform.' },
  { icon: <BadgeCheck size={24} />, title: 'Verified', desc: 'CNIC verification, skill assessments, and real reviews ensure quality.' },
  { icon: <Zap size={24} />, title: 'Fast', desc: 'Instant booking with real-time availability. Professional arrives at your scheduled time.' },
  { icon: <Eye size={24} />, title: 'Transparent', desc: 'Upfront pricing, no hidden charges, and detailed booking summaries.' },
];

export default function AboutUs() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand">
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-gold-400/10 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-emerald-50 mb-6">
              <Users size={14} className="text-gold-400" />
              Our Story
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-white">
              About <span className="text-gradient-gold">Easyservice</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-emerald-50/80 leading-relaxed max-w-2xl">
              We're on a mission to connect Pakistani households with trusted, verified home service
              professionals — making it easy, safe, and affordable for everyone.
            </p>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full text-[#F6F9F7]" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none">
          <path d="M0 60h1440V20c-120 20-260 30-400 25S800 10 700 10 400 20 300 15 100 0 0 20v40z" />
        </svg>
      </section>

      {/* Mission */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="card-premium p-8 md:p-12">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shrink-0 shadow-glow">
              <Heart size={28} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Our Mission</p>
              <h2 className="font-display text-2xl md:text-4xl font-extrabold text-ink-900 mt-1.5">
                Making Home Services Simple & Safe
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed max-w-3xl">
                In Pakistan, finding a reliable plumber, electrician, or cleaner can be a struggle.
                Easyservice bridges this gap by building a marketplace where quality, trust, and
                transparency come first. We verify every professional, insure every booking, and
                ensure fair pricing — so you can book with confidence every time.
              </p>
              <p className="mt-3 text-gray-500 leading-relaxed max-w-3xl">
                Founded with a simple belief — that everyone deserves access to skilled, trustworthy
                service providers — we've grown from a small team in Lahore to serving thousands of
                customers and workers across Pakistan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Our Values</p>
            <h2 className="font-display text-2xl md:text-4xl font-extrabold text-ink-900 mt-1.5">
              What We Stand For
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Four principles that guide everything we do.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <div key={i} className="card-premium p-7 text-center group">
                <div className="w-16 h-16 mx-auto rounded-2xl gradient-brand text-white flex items-center justify-center mb-5 shadow-glow group-hover:scale-110 transition-transform duration-300">
                  {v.icon}
                </div>
                <h3 className="font-display font-bold text-lg text-ink-900">{v.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Our Team</p>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold text-ink-900 mt-1.5">
            The People Behind Easyservice
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            A passionate team working to transform home services in Pakistan.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { name: 'Arslan Butt', role: 'Founder & CEO', color: 'from-brand-600 to-brand-800' },
            { name: 'Ahmed Khan', role: 'CTO', color: 'from-brand-500 to-brand-700' },
            { name: 'Sara Ali', role: 'Head of Operations', color: 'from-gold-400 to-gold-600' },
          ].map((member, i) => (
            <div key={i} className="card-premium p-7 text-center group">
              <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center mb-4 shadow-md`}>
                <span className="text-white font-display text-2xl font-bold">
                  {member.name.charAt(0)}
                </span>
              </div>
              <h3 className="font-display font-bold text-ink-900 text-lg">{member.name}</h3>
              <p className="text-sm text-brand-600 font-medium">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative overflow-hidden gradient-brand rounded-[2rem] p-10 md:p-16 text-white text-center">
          <div className="absolute inset-0 bg-dots opacity-25" />
          <div className="absolute -top-20 right-1/4 w-72 h-72 rounded-full bg-gold-400/15 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-6">
              <Star size={28} className="text-gold-400" />
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold">Join Thousands of Happy Customers</h2>
            <p className="mt-4 text-emerald-50/80 max-w-xl mx-auto text-lg">
              Experience the easiest way to hire trusted professionals for your home.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3.5 justify-center">
              <Link to="/workers/nearby" className="btn-gold px-8 py-4 rounded-2xl font-bold">
                Find a Worker
              </Link>
              <Link to="/auth/register" className="px-8 py-4 rounded-2xl glass font-semibold hover:bg-white/15 transition-colors">
                Become a Worker
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
