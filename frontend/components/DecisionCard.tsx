"use client"
import { Check, X, HelpCircle, Edit2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

interface Props {
    decision: Decision
    onDelete: (id: string) => void
}

export default function DecisionCard({ decision, onDelete }: Props) {
    const router = useRouter()

    const outcomeConfig = {
        success: { bg: 'bg-green-50', text: 'text-green-700', icon: <Check size={12} /> },
        failure: { bg: 'bg-red-50', text: 'text-red-700', icon: <X size={12} /> },
        unknown: { bg: 'bg-gray-100', text: 'text-gray-500', icon: <HelpCircle size={12} /> }
    }

    const outcome = outcomeConfig[decision.outcome]

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow h-full flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${decision.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-900 text-white'
                        }`}>
                        {decision.status}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(decision.created_at).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => router.push(`/dashboard/decisions/${decision.id}`)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(decision.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{decision.title}</h3>

            {/* Context */}
            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                {decision.context || "No context provided."}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${outcome.bg} ${outcome.text}`}>
                    {outcome.icon}
                    {decision.outcome}
                </span>
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-3 rounded-sm ${i < decision.confidence_level ? 'bg-gray-900' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
