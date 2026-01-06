"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import DecisionForm from '@/components/DecisionForm'
import { useParams, useRouter } from 'next/navigation'

export default function EditDecisionPage() {
    const { id } = useParams()
    const router = useRouter()
    const [decision, setDecision] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDecision = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('decisions')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error("Error fetching decision", error)
                alert("Decision not found")
                router.push('/dashboard')
            } else {
                setDecision(data)
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
        <div className="min-h-[calc(100vh-48px)] py-8 px-4 sm:px-6">
            {decision && <DecisionForm initialData={decision} isEditing={true} />}
        </div>
    )
}
