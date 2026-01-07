"use client"
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function ResetPassword() {
    return (
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="notion-card p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent-yellow)]/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-[var(--accent-yellow)]" />
                    </div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Password Reset</h1>
                    <p className="text-[var(--text-secondary)] text-sm mb-6">
                        Password reset via email is currently not available with local authentication.
                        Please contact the administrator if you need to reset your password.
                    </p>
                    <Link
                        href="/login"
                        className="btn-primary inline-flex items-center gap-2 text-sm"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
