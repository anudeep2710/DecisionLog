"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
            alert('Registration successful! Please sign in.')
            router.push('/login')
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="sketch-card max-w-md w-full p-8 relative">
                <div className="absolute -top-3 -right-3 bg-black text-white px-2 py-1 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                    Join Us
                </div>
                <div>
                    <h2 className="mt-2 text-3xl font-black text-black tracking-tight">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 font-medium">
                        Already have one?{' '}
                        <Link href="/login" className="text-black underline decoration-2 underline-offset-2 hover:bg-black hover:text-white transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="full-name" className="block text-sm font-bold text-black mb-1">Full Name</label>
                            <input
                                id="full-name"
                                name="fullName"
                                type="text"
                                required
                                className="sketch-input"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-bold text-black mb-1">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="sketch-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-black mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="sketch-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 border-2 border-red-500 p-2 text-sm font-bold">
                            Error: {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full sketch-btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating...' : 'Create Account ->'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
