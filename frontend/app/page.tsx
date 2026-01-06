import Link from 'next/link'
import { Target, TrendingUp, Lightbulb, ArrowRight, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-48px)]">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pt-16 sm:pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] text-sm font-medium mb-6">
          <Sparkles size={14} />
          Decision Tracking Made Simple
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-6 leading-[1.1] tracking-tight">
          Learn from every<br />
          <span className="text-[var(--text-tertiary)]">decision you make</span>
        </h1>

        <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
          Document your choices, track outcomes, and build a personal
          knowledge base of what works. Turn your experience into wisdom.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="btn-primary inline-flex items-center justify-center gap-2 text-base px-6 py-3"
          >
            Get started free
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="btn-secondary inline-flex items-center justify-center gap-2 text-base px-6 py-3"
          >
            Sign in →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-center text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-12">
          Why track decisions?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="notion-card p-6 text-center group hover:border-[var(--accent-blue)]/30 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-[var(--accent-blue)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="text-[var(--accent-blue)]" size={24} />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Capture context</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Record the why behind each decision — constraints, options, and reasoning.
            </p>
          </div>

          <div className="notion-card p-6 text-center group hover:border-[var(--accent-green)]/30 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-[var(--accent-green)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="text-[var(--accent-green)]" size={24} />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Track outcomes</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Mark decisions as successes or learnings. See your growth over time.
            </p>
          </div>

          <div className="notion-card p-6 text-center group hover:border-[var(--accent-purple)]/30 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-[var(--accent-purple)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Lightbulb className="text-[var(--accent-purple)]" size={24} />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Build wisdom</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Reference past decisions to make better future choices.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="notion-card p-10 text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Start your decision log today
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            It takes less than a minute to set up. Free forever.
          </p>
          <Link
            href="/register"
            className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3"
          >
            Create free account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-[var(--border-default)]">
        <p className="text-center text-sm text-[var(--text-tertiary)]">
          © 2026 DecisionLog. Made with care.
        </p>
      </footer>
    </div>
  )
}
