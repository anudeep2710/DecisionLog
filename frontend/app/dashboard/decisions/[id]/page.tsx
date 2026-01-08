"use client"
import { useEffect, useState } from 'react'
import DecisionForm from '@/components/DecisionForm'
import { useParams, useRouter } from 'next/navigation'

import { API_BASE_URL } from '@/lib/api'
const API_URL = API_BASE_URL

export default function EditDecisionPage() {
    const { id } = useParams()
    const router = useRouter()
    const [decision, setDecision] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDecision = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            try {
                // Fetch all decisions and find the one with matching ID
                const res = await fetch(`${API_URL}/decisions/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (res.ok) {
                    const decisions = await res.json()
                    const found = decisions.find((d: any) => d.id === id)
                    if (found) {
                        setDecision(found)
                    } else {
                        alert("Decision not found")
                        router.push('/dashboard')
                    }
                }
            } catch (error) {
                console.error("Error fetching decision", error)
                alert("Failed to load decision")
                router.push('/dashboard')
            }
            setLoading(false)
        }

        if (id) fetchDecision()
    }, [id, router])

    if (loading) return (
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]"
                            style={{
                                animation: 'bounce 1s ease-in-out infinite',
                                animationDelay: `${i * 0.15}s`
                            }}
                        />
                    ))}
                </div>
                <p className="text-sm text-[var(--text-tertiary)]">Loading decision...</p>

                <style jsx>{`
                    @keyframes bounce {
                        0%, 80%, 100% { transform: translateY(0); }
                        40% { transform: translateY(-8px); }
                    }
                `}</style>
            </div>
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Edit Decision</h1>
            {decision && <DecisionForm initialData={decision} isEditing={true} />}
        </div>
    )
}
