import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: {
    regular: string;
    gradient: string;
  };
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  bottomImage?: {
    light: string;
    dark: string;
  };
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = 'Take absolute control',
      subtitle = {
        regular: 'budgeting for ',
        gradient: 'visionaries.',
      },
      description = 'Uncompromising financial clarity. No fluff. No soft edges. Just the raw truth about your money, presented in high-fidelity precision.',
      ctaText = 'Start building',
      ctaHref = '/auth/register',
      bottomImage = {
        light: '/dashboard.png',
        dark: '/dashboard.png',
      },
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn('relative min-h-[90vh] flex flex-col pt-28 lg:pt-36 overflow-hidden isolate', className)}
        ref={ref}
        {...props}
      >
        {/* Subtle ambient gradient */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--primary) / 0.06) 0%, transparent 60%)`,
          }}
        />

        <div className="container relative z-10 px-4 md:px-8 mx-auto flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 h-full">
            
            <div className="lg:col-span-7 flex flex-col justify-center items-start lg:pr-16 pb-12 lg:pb-0">
              <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 font-medium text-sm tracking-wide px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-foreground/80">{title}</span>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black leading-[0.95] tracking-tight text-foreground">
                <span className="block">{subtitle.regular}</span>
                <span className="block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{subtitle.gradient}</span>
              </h1>
              
              <p className="mt-6 text-lg md:text-xl max-w-xl text-muted-foreground leading-relaxed">
                {description}
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href={ctaHref}
                  className="group relative inline-flex items-center justify-center font-semibold bg-primary text-primary-foreground px-7 py-3.5 text-base rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {ctaText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                
                <Link 
                  href="/dashboard/enhanced-demo" 
                  className="group inline-flex items-center justify-center font-semibold bg-transparent text-foreground border border-border/80 px-7 py-3.5 text-base rounded-xl hover:bg-muted/50 hover:border-border transition-all duration-200 active:scale-[0.98]"
                >
                  Live Demo
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col mt-8 lg:mt-0">
              {/* Premium metric cards */}
              <div className="h-full flex flex-col gap-3 lg:pl-8">
                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center rounded-2xl bg-card border border-border/60 relative group cursor-pointer hover:border-border transition-all duration-300">
                  <span className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">System Status</span>
                  <div className="font-display text-4xl lg:text-5xl font-bold tracking-tighter">100%</div>
                  <div className="font-medium mt-1.5 text-muted-foreground text-sm">Operational Efficiency</div>
                </div>
                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center rounded-2xl bg-card border border-border/60 relative group cursor-pointer hover:border-border transition-all duration-300">
                  <span className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Global Scale</span>
                  <div className="font-display text-4xl lg:text-5xl font-bold tracking-tighter text-foreground">50K+</div>
                  <div className="font-medium mt-1.5 text-muted-foreground text-sm">Active Workspaces</div>
                </div>
                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center rounded-2xl bg-card border border-border/60 relative group cursor-pointer hover:border-border transition-all duration-300">
                  <span className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Security Level</span>
                  <div className="font-display text-4xl lg:text-5xl font-bold tracking-tighter text-foreground">AES-256</div>
                  <div className="font-medium mt-1.5 text-muted-foreground text-sm">Military Grade Auth</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative w-full bg-muted/20 p-4 md:p-8 mt-8 lg:mt-0 z-20">
          <div className="container mx-auto">
              <div className="relative max-w-5xl mx-auto rounded-2xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border/50">
                <div className="w-3 h-3 rounded-full bg-foreground/20" />
                <div className="w-3 h-3 rounded-full bg-foreground/15" />
                <div className="w-3 h-3 rounded-full bg-foreground/10" />
                <span className="ml-4 text-xs text-muted-foreground font-medium tracking-wide">Budget Buddy Dashboard</span>
              </div>
              <Image
                src={bottomImage.light}
                className="w-full h-auto dark:hidden"
                alt="Dashboard preview"
                width={1200}
                height={600}
                priority
              />
              <Image
                src={bottomImage.dark}
                className="w-full h-auto hidden dark:block"
                alt="Dashboard preview"
                width={1200}
                height={600}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
HeroSection.displayName = 'HeroSection';

export { HeroSection };
