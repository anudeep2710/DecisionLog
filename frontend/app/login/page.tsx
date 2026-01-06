"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, AlertCircle } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-[var(--text-primary)] rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-[var(--bg-primary)] font-bold text-xl">D</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                        Welcome back
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm">
                        Sign in to continue to DecisionLog
                    </p>
                </div>

                {/* Form Card */}
                <div className="notion-card p-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] z-10 pointer-events-none" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] z-10 pointer-events-none" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--accent-red)]/10 text-[var(--accent-red)] text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-primary py-2.5 text-sm ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[var(--text-secondary)] text-sm mt-6">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-[var(--text-primary)] font-medium hover:underline">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}
