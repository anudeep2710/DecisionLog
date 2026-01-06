import Link from 'next/link'
import { Target, TrendingUp, Lightbulb } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Decision Tracking
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Learn from every<br />decision you make
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Document your choices, track outcomes, and build a personal
          knowledge base of what works.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="bg-black text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="text-gray-600 font-semibold px-8 py-3.5 rounded-xl hover:text-gray-900 transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-12">
          Why track decisions?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="text-blue-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Capture context</h3>
            <p className="text-gray-500 text-sm">
              Record the why behind each decision — constraints, options, and reasoning.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Track outcomes</h3>
            <p className="text-gray-500 text-sm">
              Mark decisions as successes or learnings. See your growth over time.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Build wisdom</h3>
            <p className="text-gray-500 text-sm">
              Reference past decisions to make better future choices.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-gray-50 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Start your decision log today
          </h2>
          <p className="text-gray-500 mb-6">
            It takes less than a minute to set up.
          </p>
          <Link
            href="/register"
            className="inline-block bg-black text-white font-semibold px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Create free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 border-t border-gray-100">
        <p className="text-center text-sm text-gray-400">
          © 2026 DecisionLog
        </p>
      </footer>
    </div>
  )
}
