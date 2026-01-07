"use client"
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')

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
                    <div className="p-4 rounded-md bg-[var(--accent-yellow)]/10 text-[var(--text-primary)] text-sm mb-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={18} className="text-[var(--accent-yellow)] mt-0.5 flex-shrink-0" />
                            <div>
                                <strong>Note:</strong> Password reset via email is currently not available.
                                Please contact the administrator if you need to reset your password.
                            </div>
                        </div>
                    </div>

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
                                className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled
                            />
                        </div>
                    </div>

                    <button
                        disabled
                        className="btn-primary w-full justify-center text-sm mt-4 opacity-50 cursor-not-allowed"
                    >
                        Send reset link
                    </button>

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
