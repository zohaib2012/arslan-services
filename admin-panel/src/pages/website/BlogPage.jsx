import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, ArrowRight } from 'lucide-react';
import Seo from '../../components/Seo';
import { blogPosts } from '../../data/blogPosts';
import { breadcrumbSchema } from '../../lib/seo';

export default function BlogPage() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in pb-16 md:pb-8">
      <Seo
        title="Home Services Blog & Guides"
        description="Expert tips, guides and advice on AC repair, plumbing, electrical safety, home cleaning, painting and more — from the Easyservice team."
        canonicalPath="/blog"
        jsonLd={[breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])]}
      />
      <div className="md:hidden sticky top-16 z-40 bg-[#F6F9F7] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-display font-bold text-ink-900">Blog & Guides</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        <div className="hidden md:block mb-8">
          <p className="text-xs md:text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Home Services Advice</p>
          <h1 className="font-display text-3xl font-extrabold text-ink-900 mt-1">Blog & Guides</h1>
          <p className="text-sm text-gray-500 mt-2">Expert tips and practical guides to keep your home in top shape.</p>
        </div>

        <div className="space-y-5">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all p-5 md:p-6 group"
            >
              <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold">{post.category}</span>
                <span className="inline-flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                <span className="inline-flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
              </div>
              <h2 className="font-display font-bold text-base md:text-lg text-gray-900 group-hover:text-brand-700 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{post.excerpt}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-brand-700">
                Read more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
