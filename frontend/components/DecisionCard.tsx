"use client"
import { Check, X, HelpCircle, Clock, Edit2, Trash2 } from 'lucide-react'
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

const outcomeIcons = {
    success: <Check className="text-black" size={20} strokeWidth={3} />,
    failure: <X className="text-black" size={20} strokeWidth={3} />,
    unknown: <HelpCircle className="text-gray-400" size={20} />,
}

const statusStyles = {
    pending: 'bg-white text-black border-dashed border-gray-400',
    reviewed: 'bg-black text-white border-black',
}

interface Props {
    decision: Decision
    onDelete: (id: string) => void
}

export default function DecisionCard({ decision, onDelete }: Props) {
    const router = useRouter()

    return (
        <div className="sketch-card p-6 relative group">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xs font-bold px-2 py-0.5 border-2 ${statusStyles[decision.status] || 'border-black'}`}>
                            {decision.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                            {new Date(decision.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-black mb-2 tracking-tight">{decision.title}</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/dashboard/decisions/${decision.id}`)}
                        className="p-1.5 hover:bg-gray-100 border border-transparent hover:border-black rounded-sm transition-all" title="Edit">
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(decision.id)}
                        className="p-1.5 hover:bg-gray-100 border border-transparent hover:border-black rounded-sm text-red-600" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <p className="text-gray-700 text-sm mb-5 font-medium leading-relaxed border-l-2 border-gray-200 pl-3">
                {decision.context || "No context provided."}
            </p>

            <div className="flex items-center justify-between pt-4 mt-2 border-t-2 border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Outcome</span>
                    <div className={`flex items-center gap-1 px-2 py-0.5 border ${decision.outcome === 'unknown' ? 'border-gray-300 text-gray-400' : 'border-black bg-gray-50'}`}>
                        {outcomeIcons[decision.outcome]}
                        <span className={`uppercase text-xs font-bold ${decision.outcome === 'unknown' ? 'text-gray-400' : 'text-black'}`}>
                            {decision.outcome}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Confidence</span>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-4 border border-black ${i < decision.confidence_level ? 'bg-black' : 'bg-transparent'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {decision.choice_made && (
                <div className="mt-5 bg-yellow-50 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-xs font-bold text-black uppercase mb-1">Decision</p>
                    <p className="text-sm font-medium text-black">{decision.choice_made}</p>
                </div>
            )}
        </div>
    )
}
