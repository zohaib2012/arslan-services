import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, ArrowLeft } from 'lucide-react';
import Seo from '../../components/Seo';
import { getPost } from '../../data/blogPosts';
import { breadcrumbSchema } from '../../lib/seo';

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = getPost(slug);

  if (!post) {
    return (
      <div className="animate-fade-in min-h-[50vh] flex flex-col items-center justify-center px-4">
        <h1 className="font-display font-bold text-xl text-gray-800 mb-2">Article not found</h1>
        <Link to="/blog" className="text-brand-700 font-semibold text-sm">← Back to blog</Link>
      </div>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'Easyservice' },
    publisher: { '@type': 'Organization', name: 'Easyservice', logo: { '@type': 'ImageObject', url: 'https://easyservice.tech/icons/logo.png' } },
    image: `https://easyservice.tech${post.image}`,
    description: post.excerpt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://easyservice.tech/blog/${post.slug}` },
  };

  return (
    <div className="animate-fade-in pb-16 md:pb-8">
      <Seo
        title={post.title}
        description={post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
        type="article"
        jsonLd={[
          articleSchema,
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <div className="md:hidden sticky top-16 z-40 bg-[#F6F9F7] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-display font-bold text-ink-900 truncate">{post.category}</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        <Link to="/blog" className="hidden md:inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-700 mb-6 font-semibold">
          <ArrowLeft size={15} /> Back to Blog
        </Link>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold">{post.category}</span>
          <span className="inline-flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
          <span className="inline-flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900 leading-tight mb-6">{post.title}</h1>

        <div className="prose prose-sm md:prose-base max-w-none">
          {post.content.map((para, i) => (
            <p key={i} className="text-gray-600 leading-relaxed mb-4">{para}</p>
          ))}
        </div>

        <div className="mt-8 p-5 md:p-6 rounded-2xl gradient-brand text-white">
          <p className="font-display font-bold text-base md:text-lg mb-2">Need help with this service?</p>
          <p className="text-sm text-emerald-50/85 mb-4">Book a verified professional near you on Easyservice — fast, reliable and affordable.</p>
          <Link to="/search" className="inline-flex items-center gap-2 btn-gold px-5 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all">
            Book a Professional
          </Link>
        </div>
      </div>
    </div>
  );
}
