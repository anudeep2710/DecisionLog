"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Plus, Clock, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'

// Define the Decision interface matching the dashboard
interface Decision {
    id: string
    title: string
    context: string
    choice_made: string
    confidence_level: number
    status: string // 'pending', 'in_progress', 'reviewed', 'done', etc.
    outcome: 'success' | 'failure' | 'unknown'
    created_at: string
}

interface Props {
    decisions: Decision[]
    onStatusChange: (id: string, newStatus: string) => void
}

const COLUMNS = [
    { id: 'pending', title: 'To Do', color: 'var(--text-secondary)' },
    { id: 'in_progress', title: 'In Progress', color: 'var(--accent-blue)' },
    { id: 'reviewed', title: 'In Review', color: 'var(--accent-purple)' },
    { id: 'done', title: 'Done', color: 'var(--accent-green)' }
]

export default function KanbanBoard({ decisions, onStatusChange }: Props) {
    const router = useRouter()
    const [draggedId, setDraggedId] = useState<string | null>(null)
    const [localDecisions, setLocalDecisions] = useState<Decision[]>(decisions)

    useEffect(() => {
        setLocalDecisions(decisions)
    }, [decisions])

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id)
        e.dataTransfer.effectAllowed = "move"
        // Transparent drag image hack or custom styling calls usually go here
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault() // Necessary to allow dropping
    }

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault()
        if (!draggedId) return

        // Optimistic update
        const updated = localDecisions.map(d =>
            d.id === draggedId ? { ...d, status } : d
        )
        setLocalDecisions(updated)
        onStatusChange(draggedId, status)
        setDraggedId(null)
    }

    // Group decisions by column
    const getDecisionsByStatus = (status: string) => {
        return localDecisions.filter(d => {
            // Map legacy or unlisted statuses to 'pending'
            if (!COLUMNS.find(c => c.id === d.status) && status === 'pending') return true
            return d.status === status
        })
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
            {COLUMNS.map(column => (
                <div
                    key={column.id}
                    className="flex-shrink-0 w-80 flex flex-col bg-[var(--bg-secondary)]/30 rounded-xl border border-[var(--border-default)]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    {/* Column Header */}
                    <div className="p-3 border-b border-[var(--border-default)] flex items-center justify-between sticky top-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm rounded-t-xl z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
                            <h3 className="font-semibold text-sm text-[var(--text-primary)]">{column.title}</h3>
                            <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded-full">
                                {getDecisionsByStatus(column.id).length}
                            </span>
                        </div>
                        <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 p-2 overflow-y-auto space-y-2 custom-scrollbar">
                        {getDecisionsByStatus(column.id).map(decision => (
                            <div
                                key={decision.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, decision.id)}
                                onClick={() => router.push(`/dashboard/decisions/${decision.id}`)}
                                className={`
                                    group notion-card p-3 cursor-move hover:shadow-md transition-all active:cursor-grabbing
                                    ${draggedId === decision.id ? 'opacity-50 ring-2 ring-[var(--accent-blue)]' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">
                                        {decision.title}
                                    </h4>
                                    <button className="opacity-0 group-hover:opacity-100 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                                        <MoreHorizontal size={14} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {decision.choice_made && (
                                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 bg-[var(--bg-tertiary)]/50 p-1.5 rounded border border-[var(--border-default)]/50">
                                            {decision.choice_made}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-1.5">
                                            {decision.outcome === 'success' && <CheckCircle size={14} className="text-[var(--accent-green)]" />}
                                            {decision.outcome === 'failure' && <AlertCircle size={14} className="text-[var(--accent-red)]" />}
                                            {decision.outcome === 'unknown' && <HelpCircle size={14} className="text-[var(--text-tertiary)]" />}
                                            <span className="text-[10px] text-[var(--text-tertiary)]">
                                                {new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1 h-2 rounded-full ${i < decision.confidence_level
                                                            ? 'bg-[var(--accent-blue)]'
                                                            : 'bg-[var(--border-default)]'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {getDecisionsByStatus(column.id).length === 0 && (
                            <div className="h-24 border-2 border-dashed border-[var(--border-default)] rounded-lg flex items-center justify-center text-[var(--text-tertiary)] text-xs">
                                Drop here
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
