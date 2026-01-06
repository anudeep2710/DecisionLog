"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
        } else {
            router.push('/login')
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
                        Create your account
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm">
                        Start tracking your decisions today
                    </p>
                </div>

                {/* Form Card */}
                <div className="notion-card p-6">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] z-10 pointer-events-none" />
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

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
                                    autoComplete="new-password"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)] mt-1.5">
                                Must be at least 6 characters
                            </p>
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
                            className={`w-full btn-primary py-2.5 text-sm inline-flex items-center justify-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating account...' : (
                                <>
                                    Create account
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[var(--text-secondary)] text-sm mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[var(--text-primary)] font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
