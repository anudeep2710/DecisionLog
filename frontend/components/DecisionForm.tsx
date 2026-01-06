"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

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
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                alert("You must be logged in")
                return
            }

            const url = isEditing
                ? `${backendUrl}/decisions/${formData.id}`
                : `${backendUrl}/decisions/`

            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
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
            console.error("Submission error", error)
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="sketch-card p-6 md:p-8 space-y-6 max-w-2xl mx-auto">
            <div className="border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <h2 className="text-2xl font-black text-black">{isEditing ? 'Edit Decision Log' : 'Log New Decision'}</h2>
                <p className="text-gray-500 font-medium">Capture the context and your thought process.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-black mb-1 uppercase tracking-wide">Decision Title</label>
                    <input
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="sketch-input"
                        placeholder="e.g. Choosing a Frontend Framework"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-black mb-1 uppercase tracking-wide">Context / Why?</label>
                    <textarea
                        name="context"
                        rows={4}
                        value={formData.context}
                        onChange={handleChange}
                        className="sketch-input"
                        placeholder="What problem are you solving? What are the constraints?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-black mb-1 uppercase tracking-wide">The Choice Made</label>
                    <input
                        name="choice_made"
                        value={formData.choice_made}
                        onChange={handleChange}
                        className="sketch-input"
                        placeholder="e.g. Selected Next.js over React SPA"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-black mb-1 uppercase tracking-wide">Confidence (1-5)</label>
                        <input
                            name="confidence_level"
                            type="number"
                            min="1"
                            max="5"
                            value={formData.confidence_level}
                            onChange={handleChange}
                            className="sketch-input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black mb-1 uppercase tracking-wide">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="sketch-input"
                        >
                            <option value="pending">Pending Review</option>
                            <option value="reviewed">Reviewed</option>
                        </select>
                    </div>
                </div>

                {isEditing && (
                    <div className="bg-gray-50 p-4 border-2 border-gray-200">
                        <label className="block text-sm font-bold text-black mb-1 uppercase tracking-wide">Outcome</label>
                        <select
                            name="outcome"
                            value={formData.outcome}
                            onChange={handleChange}
                            className="sketch-input"
                        >
                            <option value="unknown">Unknown (Too early)</option>
                            <option value="success">Success</option>
                            <option value="failure">Failure / Learning</option>
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-black mb-1 uppercase tracking-wide">Notes / Reflection</label>
                    <textarea
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        className="sketch-input"
                        placeholder="Any retrospective thoughts?"
                    />
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="sketch-btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`sketch-btn-primary ${loading ? 'opacity-50' : ''}`}
                >
                    {loading ? 'Saving...' : 'Save Decision Log'}
                </button>
            </div>
        </form>
    )
}
