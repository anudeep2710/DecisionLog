"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'
import { Plus, LayoutTemplate, Trash2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Whiteboard {
    id: string
    name: string
    updated_at: string
    created_at: string
}

export default function WhiteboardsPage() {
    const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const backendUrl = API_BASE_URL

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        fetch(`${backendUrl}/whiteboards/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setWhiteboards(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [router])

    const createWhiteboard = async () => {
        const name = prompt("Name your flow:")
        if (!name) return

        const token = localStorage.getItem('token')
        const res = await fetch(`${backendUrl}/whiteboards/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        })

        if (res.ok) {
            const newWb = await res.json()
            router.push(`/dashboard/whiteboards/${newWb.id}`)
        }
    }

    const deleteWhiteboard = async (e: React.MouseEvent, id: string) => {
        e.preventDefault() // Prevent navigation
        if (!confirm("Are you sure?")) return

        const token = localStorage.getItem('token')
        const res = await fetch(`${backendUrl}/whiteboards/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })

        if (res.ok) {
            setWhiteboards(prev => prev.filter(w => w.id !== id))
        }
    }

    if (loading) return <div className="p-8 text-center">Loading flows...</div>

    return (
        <div className="min-h-[calc(100vh-48px)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Visual Decision Flows</h1>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">Map out your choices on an infinite canvas</p>
                    </div>
                    <button
                        onClick={createWhiteboard}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Flow
                    </button>
                </div>

                {whiteboards.length === 0 ? (
                    <div className="notion-card p-12 text-center flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                            <LayoutTemplate size={32} className="text-[var(--text-tertiary)]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-[var(--text-primary)]">No flows yet</h3>
                            <p className="text-[var(--text-secondary)] text-sm">Create your first decision diagram to visualize your path.</p>
                        </div>
                        <button onClick={createWhiteboard} className="btn-secondary">
                            Start Drawing
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {whiteboards.map(wb => (
                            <Link
                                key={wb.id}
                                href={`/dashboard/whiteboards/${wb.id}`}
                                className="notion-card p-0 group overflow-hidden block hover:shadow-md transition-all"
                            >
                                <div className="h-32 bg-[var(--pattern-dots)] relative border-b border-[var(--border-default)]">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                                        <span className="bg-white px-3 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
                                            Open <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-[var(--text-primary)]">{wb.name}</h3>
                                        <p className="text-xs text-[var(--text-tertiary)]">
                                            Updated {new Date(wb.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => deleteWhiteboard(e, wb.id)}
                                        className="p-1.5 rounded hover:bg-[var(--accent-red)]/10 text-[var(--text-tertiary)] hover:text-[var(--accent-red)] transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
