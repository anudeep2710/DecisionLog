"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isValidSession, setIsValidSession] = useState(false)
    const [checking, setChecking] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if user came from a valid reset link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setIsValidSession(true)
            }
            setChecking(false)
        }
        checkSession()

        // Listen for auth state changes (when user clicks reset link)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError("Passwords don't match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({ password })

            if (error) throw error
            setSuccess(true)

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (checking) {
        return (
            <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
                <div className="animate-pulse text-[var(--text-secondary)]">Loading...</div>
            </div>
        )
    }

    if (!isValidSession) {
        return (
            <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="notion-card p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--accent-red)]/10 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} className="text-[var(--accent-red)]" />
                        </div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Invalid or expired link</h1>
                        <p className="text-[var(--text-secondary)] text-sm mb-6">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link
                            href="/forgot-password"
                            className="btn-primary inline-flex items-center gap-2 text-sm"
                        >
                            Request new link
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="notion-card p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--accent-green)]/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} className="text-[var(--accent-green)]" />
                        </div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Password updated!</h1>
                        <p className="text-[var(--text-secondary)] text-sm mb-6">
                            Your password has been successfully reset. Redirecting to login...
                        </p>
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
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Set new password</h1>
                    <p className="text-[var(--text-secondary)] text-sm mt-2">
                        Enter your new password below
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
                            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center text-sm"
                        >
                            {loading ? 'Updating...' : 'Update password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
