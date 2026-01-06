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
                alert("Please log in")
                return
            }

            const url = isEditing ? `${backendUrl}/decisions/${formData.id}` : `${backendUrl}/decisions/`
            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
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
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">
                    {isEditing ? 'Edit Decision' : 'Log a Decision'}
                </h2>
                <p className="text-gray-500 mt-1">Record your thought process</p>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400"
                        placeholder="What decision did you make?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Context</label>
                    <textarea
                        name="context"
                        rows={3}
                        value={formData.context}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 resize-none"
                        placeholder="What problem were you solving?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choice Made</label>
                    <input
                        name="choice_made"
                        value={formData.choice_made}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400"
                        placeholder="What did you decide?"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confidence (1-5)</label>
                        <input
                            name="confidence_level"
                            type="number"
                            min="1"
                            max="5"
                            value={formData.confidence_level}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none bg-white"
                        >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                        </select>
                    </div>
                </div>

                {isEditing && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Outcome</label>
                        <select
                            name="outcome"
                            value={formData.outcome}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none bg-white"
                        >
                            <option value="unknown">Unknown</option>
                            <option value="success">Success</option>
                            <option value="failure">Failure</option>
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                        name="notes"
                        rows={2}
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 resize-none"
                        placeholder="Any reflections?"
                    />
                </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-5 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition-colors ${loading ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    )
}
