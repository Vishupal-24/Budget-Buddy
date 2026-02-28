'use client';

import { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { ArrowUpRight, Heart, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { SOCIAL_LINKS, FOOTER_SECTIONS, TRUST_INDICATORS } from './config/landing-config';
import { scrollToTop } from './utils/scroll-utils';
import Link from 'next/link';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <footer className="relative bg-card/50 border-t border-border/60 overflow-hidden pt-20 pb-8">
      <div className="container mx-auto px-4 relative z-10">
        {/* Newsletter section */}
        <div className="mb-16 rounded-2xl bg-card border border-border/60 p-8 md:p-12 shadow-sm relative overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Stay Updated</span>
          </div>

          <h3 className="text-3xl md:text-4xl font-display font-bold mb-3 tracking-tight">Stay in the loop</h3>
          <p className="text-muted-foreground mb-8 max-w-xl text-base">
            Subscribe for product updates, financial insights, and early access to new features.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="email"
              placeholder="Enter your email"
              aria-label="Email address for newsletter"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle'); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/60 transition-all"
            />
            <button
              onClick={handleSubscribe}
              disabled={status === 'loading' || status === 'success'}
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70"
            >
              {status === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing...</>
              ) : status === 'success' ? (
                <><CheckCircle className="w-4 h-4" /> Subscribed</>
              ) : (
                <>Subscribe <ArrowUpRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
          {message && (
            <p className={`text-sm mt-2 ${status === 'error' ? 'text-destructive' : 'text-primary'}`}>
              {message}
            </p>
          )}
        </div>

        {/* Footer top section with logo and quick links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 border-t border-border pt-12">
          {/* Brand column */}
          <div className="lg:col-span-4 lg:pr-8">
            <div className="flex items-center gap-3 mb-6">
              <Logo size="sm" />
              <span className="font-display font-bold text-xl tracking-tight">
                Budget Buddy
              </span>
            </div>

            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              The financial management platform for people who want clarity and control over their money.
            </p>

            {/* Social links */}
            <div className="flex flex-wrap gap-3 mb-8">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={social.label}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {TRUST_INDICATORS.map((indicator, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                  {indicator.icon === 'pulse' ? (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  ) : (
                    <Heart className="w-3 h-3 text-rose-500" />
                  )}
                  <span>{indicator.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {FOOTER_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="space-y-4"
              >
                <h3 className="font-semibold text-sm text-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-3 text-sm">
                  {section.links.map((item) => (
                    <li key={item}>
                      <Link
                        href={item === 'Changelog' ? '/changelog' : `/${section.title.toLowerCase()}/${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap justify-center">
              © {new Date().getFullYear()} Budget Buddy. Made with
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              for your finances.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              {[
                { href: '/legal/privacy-policy', text: 'Privacy' },
                { href: '/legal/terms-of-service', text: 'Terms' },
                { href: '/legal/cookie-policy', text: 'Cookies' },
              ].map((link) => (
                <Link
                  key={link.text}
                  href={link.href}
                  className="hover:text-foreground transition-colors"
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="h-10 w-10 rounded-lg border border-border bg-background text-foreground flex items-center justify-center hover:bg-muted/50 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowUpRight className="w-4 h-4 -rotate-45" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
