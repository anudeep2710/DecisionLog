"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error
            setSuccess(true)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="notion-card p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--accent-green)]/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} className="text-[var(--accent-green)]" />
                        </div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Check your email</h1>
                        <p className="text-[var(--text-secondary)] text-sm mb-6">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <Link
                            href="/login"
                            className="btn-primary inline-flex items-center gap-2 text-sm"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reset your password</h1>
                    <p className="text-[var(--text-secondary)] text-sm mt-2">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                {/* Form Card */}
                <div className="notion-card p-6">
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-[var(--accent-red)]/10 text-[var(--accent-red)] text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center text-sm"
                        >
                            {loading ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                            ← Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
