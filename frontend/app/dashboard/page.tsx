"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar' // Already global, but could be specific layout
import DecisionCard from '@/components/DecisionCard'
import Link from 'next/link'
import { Plus, BarChart2, CheckCircle, XCircle } from 'lucide-react'

// Define the Decision type locally or import if I made a types file (I haven't yet, so local for now)
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

    const backendUrl = "http://localhost:8000" // Should be env var in real app

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
    }, [])

    const fetchDecisions = async (token: string) => {
        try {
            const res = await fetch(`${backendUrl}/decisions/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setDecisions(data)
            }
        } catch (error) {
            console.error("Failed to fetch decisions", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this decision?")) return;

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch(`${backendUrl}/decisions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (res.ok) {
                setDecisions(decisions.filter(d => d.id !== id))
            } else {
                alert("Failed to delete")
            }
        } catch (error) {
            console.error("Delete failed", error)
        }
    }

    // Stats calculation
    const total = decisions.length
    const success = decisions.filter(d => d.outcome === 'success').length
    const failure = decisions.filter(d => d.outcome === 'failure').length
    const pending = decisions.filter(d => d.status === 'pending').length

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
    )

    return (
        <div className="min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-black tracking-tight">Dashboard</h1>
                        <p className="text-gray-600 font-medium">Welcome back, {user?.user_metadata?.full_name || 'Decision Maker'}</p>
                    </div>
                    <Link href="/dashboard/new" className="sketch-btn-primary flex items-center gap-2 justify-center">
                        <Plus size={20} strokeWidth={3} /> Log New Decision
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="sketch-card p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Logged</p>
                            <p className="text-3xl font-black text-black mt-1">{total}</p>
                        </div>
                        <div className="bg-black text-white p-2 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                            <BarChart2 size={24} />
                        </div>
                    </div>

                    <div className="sketch-card p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Success Rate</p>
                            <p className="text-3xl font-black text-black mt-1">
                                {total > 0 ? Math.round((success / total) * 100) : 0}%
                            </p>
                        </div>
                        <div className="bg-green-100 text-green-700 border border-green-700 p-2 rounded-sm shadow-[2px_2px_0px_0px_rgba(21,128,61,1)]">
                            <CheckCircle size={24} />
                        </div>
                    </div>

                    <div className="sketch-card p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Learnings</p>
                            <p className="text-3xl font-black text-black mt-1">{failure}</p>
                        </div>
                        <div className="bg-red-100 text-red-700 border border-red-700 p-2 rounded-sm shadow-[2px_2px_0px_0px_rgba(185,28,28,1)]">
                            <XCircle size={24} />
                        </div>
                    </div>

                    <div className="sketch-card p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Review</p>
                            <p className="text-3xl font-black text-black mt-1">{pending}</p>
                        </div>
                        <div className="bg-yellow-50 text-yellow-700 border border-yellow-700 p-2 rounded-sm shadow-[2px_2px_0px_0px_rgba(161,98,7,1)]">
                            <Clock size={24} /> // Note: Clock import needed
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-black border-b-4 border-black inline-block pb-1">Recent Decisions</h2>
                </div>

                {decisions.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No decisions tracked yet</h3>
                        <p className="text-gray-400 mb-6">Start building your decision history today.</p>
                        <Link href="/dashboard/new" className="sketch-btn-secondary inline-flex items-center gap-2">
                            <Plus size={18} /> Create First Log
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {decisions.map(decision => (
                            <DecisionCard key={decision.id} decision={decision} onDelete={handleDelete} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}
// Import Clock locally since I missed it in top imports for that specific block use
import { Clock } from 'lucide-react'
