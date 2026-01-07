"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import TemplateSelector, { DecisionTemplate } from '@/components/TemplateSelector'
import { ArrowLeft, Check } from 'lucide-react'

interface Decision {
    id?: string
    title: string
    context: string
    choice_made: string
    confidence_level: number
    status: 'pending' | 'reviewed'
    outcome: 'success' | 'failure' | 'unknown'
    notes: string
}

interface Props {
    initialData?: Decision
    isEditing?: boolean
}

export default function DecisionForm({ initialData, isEditing = false }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Decision>(initialData || {
        title: '',
        context: '',
        choice_made: '',
        confidence_level: 3,
        status: 'pending',
        outcome: 'unknown',
        notes: ''
    })

    const backendUrl = "http://localhost:8000"

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                alert("Please log in")
                return
            }

            const url = isEditing ? `${backendUrl}/decisions/${formData.id}` : `${backendUrl}/decisions/`
            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push('/dashboard')
                router.refresh()
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail}`)
            }
        } catch (error) {
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Dashboard
            </button>

            <form onSubmit={handleSubmit} className="notion-card p-6 space-y-6">
                {/* Header */}
                <div className="pb-4 border-b border-[var(--border-default)]">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                {isEditing ? 'Edit Decision' : 'Log a Decision'}
                            </h2>
                            <p className="text-[var(--text-secondary)] text-sm mt-1">
                                Record your thought process for future reflection
                            </p>
                        </div>
                        {!isEditing && (
                            <TemplateSelector onSelectTemplate={(template: DecisionTemplate) => {
                                setFormData(prev => ({
                                    ...prev,
                                    context: template.prefill.context,
                                    confidence_level: template.prefill.confidence_level
                                }))
                            }} />
                        )}
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        Title <span className="text-[var(--accent-red)]">*</span>
                    </label>
                    <input
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-md text-sm"
                        placeholder="What decision did you make?"
                    />
                </div>

                {/* Context */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        Context
                    </label>
                    <textarea
                        name="context"
                        rows={3}
                        value={formData.context}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-md text-sm resize-none"
                        placeholder="What problem were you solving? What constraints did you have?"
                    />
                </div>

                {/* Choice Made */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        Choice Made
                    </label>
                    <input
                        name="choice_made"
                        value={formData.choice_made}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-md text-sm"
                        placeholder="What did you decide to do?"
                    />
                </div>

                {/* Confidence & Status Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                            Confidence (1-5)
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, confidence_level: level }))}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${formData.confidence_level >= level
                                        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md text-sm"
                        >
                            <option value="pending">Pending Review</option>
                            <option value="reviewed">Reviewed</option>
                        </select>
                    </div>
                </div>

                {/* Outcome (only in edit mode) */}
                {isEditing && (
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                            Outcome
                        </label>
                        <div className="flex gap-2">
                            {[
                                { value: 'unknown', label: 'Unknown', color: 'var(--bg-tertiary)' },
                                { value: 'success', label: 'Success', color: 'var(--accent-green)' },
                                { value: 'failure', label: 'Learning', color: 'var(--accent-red)' }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, outcome: opt.value as any }))}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${formData.outcome === opt.value
                                        ? `bg-[${opt.color}]/20 text-[${opt.color}]`
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                        }`}
                                    style={{
                                        backgroundColor: formData.outcome === opt.value ? `color-mix(in srgb, ${opt.color} 15%, transparent)` : undefined,
                                        color: formData.outcome === opt.value ? opt.color : undefined
                                    }}
                                >
                                    {formData.outcome === opt.value && <Check size={14} />}
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        Notes & Reflections
                    </label>
                    <textarea
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-md text-sm resize-none"
                        placeholder="Any additional thoughts or learnings?"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border-default)]">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn-secondary text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`btn-primary text-sm inline-flex items-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Check size={16} />
                                {isEditing ? 'Save Changes' : 'Save Decision'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
