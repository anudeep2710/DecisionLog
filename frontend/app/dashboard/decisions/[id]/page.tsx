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
            // We can fetch from backend or directly from Supabase if we want
            // Let's use backend to be consistent with architecture
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            // Since we don't have a GET /decisions/{id} endpoint yet in the router (oops, I did not add it explicitely as a single get, only list), 
            // I should add it or use Supabase client directly here as a fallback or fix backend.
            // Let's use supabase client for read for simplicity and speed, as we have RLS.
            // Actually, let's just add the ONE endpoint to backend to be clean? 
            // Nah, using Supabase client for reading a single item is perfectly fine in this architecture.

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
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
    )

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {decision && <DecisionForm initialData={decision} isEditing={true} />}
            </div>
        </div>
    )
}
