"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import DecisionCard from '@/components/DecisionCard'
import Link from 'next/link'
import { Plus, BarChart2, CheckCircle, XCircle, Clock } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Decision {
    id: string
    title: string
    context: string
    choice_made: string
    confidence_level: number
    status: 'pending' | 'reviewed'
    outcome: 'success' | 'failure' | 'unknown'
    created_at: string
}

export default function Dashboard() {
    const [decisions, setDecisions] = useState<Decision[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    const backendUrl = "http://localhost:8000"

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }
            setUser(session.user)
            fetchDecisions(session.access_token)
        }
        checkUser()
    }, [router])

    const fetchDecisions = async (token: string) => {
        try {
            const res = await fetch(`${backendUrl}/decisions/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setDecisions(await res.json())
            }
        } catch (error) {
            console.error("Failed to fetch decisions", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this decision?")) return
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return
            const res = await fetch(`${backendUrl}/decisions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
            if (res.ok) {
                setDecisions(decisions.filter(d => d.id !== id))
            }
        } catch (error) {
            console.error("Delete failed", error)
        }
    }

    const total = decisions.length
    const success = decisions.filter(d => d.outcome === 'success').length
    const failure = decisions.filter(d => d.outcome === 'failure').length
    const pending = decisions.filter(d => d.status === 'pending').length

    if (loading) return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
            <LoadingSpinner />
        </div>
    )

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50/50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500 mt-1">
                            Welcome, {user?.user_metadata?.full_name || 'there'}
                        </p>
                    </div>
                    <Link
                        href="/dashboard/new"
                        className="inline-flex items-center gap-2 bg-black text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={18} />
                        New Decision
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
                            </div>
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <BarChart2 size={20} className="text-gray-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Success</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {total > 0 ? Math.round((success / total) * 100) : 0}%
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Learnings</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{failure}</p>
                            </div>
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                <XCircle size={20} className="text-red-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{pending}</p>
                            </div>
                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                                <Clock size={20} className="text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decisions */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Decisions</h2>
                </div>

                {decisions.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                        <p className="text-gray-500 mb-4">No decisions logged yet</p>
                        <Link
                            href="/dashboard/new"
                            className="inline-flex items-center gap-2 text-black font-semibold hover:underline"
                        >
                            <Plus size={16} />
                            Create your first decision
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {decisions.map(decision => (
                            <DecisionCard key={decision.id} decision={decision} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
