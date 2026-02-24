import type { Metadata } from 'next';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { GitCommit, Calendar, Zap, CheckCircle2, Shield, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Changelog | Budget Buddy',
  description: 'Track the latest updates, improvements, and fixes to Budget Buddy.',
};

// Extracted from git history
const changelogData = [
  {
    date: "2026-02-24",
    title: "Major UI Refinement",
    badge: "Feature",
    badgeColor: "bg-blue-500/10 text-blue-500",
    icon: Zap,
    commits: [
      { hash: "3579a1a", message: "Update auth pages, financial insights, and landing components" },
      { hash: "0cea9cf", message: "Update auth pages, dashboard and budget components" },
      { hash: "a482fab", message: "Update auth pages, landing components, and global styles" },
    ]
  },
  {
    date: "2026-02-21",
    title: "Budget & Transactions Updates",
    badge: "Enhancement",
    badgeColor: "bg-purple-500/10 text-purple-500",
    icon: Wrench,
    commits: [
      { hash: "e3fbd32", message: "Update budget, transactions, and landing page components" },
      { hash: "be33053", message: "Update auth components and UI improvements" }
    ]
  },
  {
    date: "2026-02-20",
    title: "UI Brutalism & Security",
    badge: "Major Update",
    badgeColor: "bg-green-500/10 text-green-500",
    icon: Shield,
    commits: [
      { hash: "69d395e", message: "fix: update auth login and footer styles" },
      { hash: "0ce1342", message: "Update auth pages and configuration" },
      { hash: "a31849c", message: "chore: run npm audit fix to address security vulnerabilities" },
      { hash: "f5b9a84", message: "fix: escape apostrophes to pass ESLint validation" },
      { hash: "e7be8aa", message: "feat: apply editorial brutalism ui redesign and fix tests" },
      { hash: "ed51816", message: "chore: update all dependencies to latest versions" },
      { hash: "f8871ba", message: "Update LoginForm and add new components" }
    ]
  },
  {
    date: "2025-12-16",
    title: "Serverless Go Migration & Security",
    badge: "Architecture",
    badgeColor: "bg-amber-500/10 text-amber-500",
    icon: GitCommit,
    commits: [
      { hash: "e24b6b9", message: "Remove non-required .md files" },
      { hash: "cafa84e", message: "fix: Use default Next.js build instead of custom script" },
      { hash: "e560580", message: "fix: Exclude Go functions from Vercel build" },
      { hash: "ffc91d2", message: "fix: Change API handler return types to Promise<void>" },
      { hash: "8d6982c", message: "fix: Remove Go runtime from vercel.json - Vercel auto-detects Go files" },
      { hash: "4a93d46", message: "fix: Remove routes from vercel.json to fix deployment conflict" },
      { hash: "a159298", message: "docs: Add security fixes report and Git LFS troubleshooting guide" },
      { hash: "163492c", message: "fix: Resolve 8 security vulnerabilities" },
      { hash: "cd0c216", message: "fix: Remove package-lock.json from Git LFS tracking" },
      { hash: "447deb8", message: "fix: Regenerate package-lock.json (remove LFS reference)" },
      { hash: "56c7715", message: "chore: Resolve merge conflict in package-lock.json" },
      { hash: "34c991d", message: "feat: Replace Node.js with Go serverless functions" }
    ]
  },
  {
    date: "2025-12-13",
    title: "React Server Components Fixes",
    badge: "Security Fix",
    badgeColor: "bg-red-500/10 text-red-500",
    icon: Shield,
    commits: [
      { hash: "1626a87", message: "Merge pull request #6 from Xenonesis/vercel/react-server-components-cve-vu-gs6q2s" },
      { hash: "4cfdd1b", message: "Fix React Server Components CVE vulnerabilities" }
    ]
  },
  {
    date: "2025-12-06",
    title: "Testing Foundation",
    badge: "Testing",
    badgeColor: "bg-cyan-500/10 text-cyan-500",
    icon: CheckCircle2,
    commits: [
      { hash: "871a778", message: "feat: Add comprehensive test suite with 418 tests" },
      { hash: "8be43e9", message: "Add test files and summary" },
      { hash: "8faf787", message: "Update project configurations and add test files" },
      { hash: "f93bc7b", message: "Remove obsolete README and enhance codebase maintainability" }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background relative selection:bg-primary/20">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
      
      <Header />
      
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10">
        <div className="text-center max-w-2xl mx-auto mb-20 animate-fade-in">
          <div className="inline-flex items-center justify-center p-2 px-3 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <GitCommit className="w-4 h-4 mr-2" />
            Project History
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-foreground/50">
            Changelog
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Discover the latest features, improvements, and bug fixes in Budget Buddy.
          </p>
        </div>

        <div className="relative border-l border-border/50 ml-4 md:ml-8 pb-12">
          {changelogData.map((release, index) => {
            const Icon = release.icon;
            return (
              <div 
                key={release.date} 
                className="mb-16 relative pl-8 md:pl-16 group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Timeline node */}
                <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-background border-2 border-primary group-hover:bg-primary group-hover:scale-125 transition-all duration-300 z-10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary group-hover:bg-background transition-colors" />
                </div>
                
                {/* Glow effect behind timeline node */}
                <div className="absolute -left-6 top-[-10px] w-12 h-12 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

                <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 mb-6">
                  <div className="flex-shrink-0 md:w-48 pt-1">
                    <div className="flex items-center text-muted-foreground font-mono text-sm mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(release.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-3 mb-4">
                      <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {release.title}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${release.badgeColor} border border-current/20 flex items-center`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {release.badge}
                      </span>
                    </div>

                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-border transition-all">
                      <ul className="space-y-4">
                        {release.commits.map((commit, i) => (
                          <li key={i} className="flex gap-4">
                            <span className="font-mono text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded w-20 flex-shrink-0 text-center self-start">
                              {commit.hash}
                            </span>
                            <span className="text-foreground/80 leading-snug">
                              {commit.message}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
