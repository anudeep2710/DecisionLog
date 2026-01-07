"use client"
import { Check, X, HelpCircle, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Decision {
    id: string
    title: string
    context: string
    choice_made: string
    confidence_level: number
    status: 'pending' | 'reviewed' | 'in_progress' | 'done' | string
    outcome: 'success' | 'failure' | 'unknown'
    created_at: string
}

interface Props {
    decision: Decision
    onDelete: (id: string) => void
}

export default function DecisionCard({ decision, onDelete }: Props) {
    const router = useRouter()
    const [showActions, setShowActions] = useState(false)

    const outcomeConfig = {
        success: {
            bg: 'bg-[var(--accent-green)]/10',
            text: 'text-[var(--accent-green)]',
            icon: <Check size={12} />,
            label: 'Success'
        },
        failure: {
            bg: 'bg-[var(--accent-red)]/10',
            text: 'text-[var(--accent-red)]',
            icon: <X size={12} />,
            label: 'Learning'
        },
        unknown: {
            bg: 'bg-[var(--bg-tertiary)]',
            text: 'text-[var(--text-tertiary)]',
            icon: <HelpCircle size={12} />,
            label: 'Unknown'
        }
    }

    const outcome = outcomeConfig[decision.outcome]

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    return (
        <div
            className="notion-card p-4 group cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => router.push(`/dashboard/decisions/${decision.id}`)}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${decision.status === 'pending'
                        ? 'bg-[var(--accent-yellow)]/15 text-[var(--accent-yellow)]'
                        : 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                        }`}>
                        {decision.status}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                        {formatDate(decision.created_at)}
                    </span>
                </div>

                {/* Actions */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowActions(!showActions) }}
                        className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreHorizontal size={16} />
                    </button>
                    {showActions && (
                        <div
                            className="absolute right-0 top-full mt-1 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => router.push(`/dashboard/decisions/${decision.id}`)}
                                className="w-full px-3 py-1.5 text-sm text-left text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
                            >
                                <Edit2 size={14} />
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(decision.id)}
                                className="w-full px-3 py-1.5 text-sm text-left text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 flex items-center gap-2"
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Title */}
            <h3 className="font-medium text-[var(--text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--accent-blue)] transition-colors">
                {decision.title}
            </h3>

            {/* Context */}
            <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                {decision.context || "No context provided."}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${outcome.bg} ${outcome.text}`}>
                    {outcome.icon}
                    {outcome.label}
                </span>

                {/* Confidence indicator */}
                <div className="flex items-center gap-1" title={`Confidence: ${decision.confidence_level}/5`}>
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-4 rounded-sm transition-colors ${i < decision.confidence_level
                                ? 'bg-[var(--text-primary)]'
                                : 'bg-[var(--border-default)]'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
