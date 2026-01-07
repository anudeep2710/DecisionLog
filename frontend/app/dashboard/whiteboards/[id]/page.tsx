"use client"
import { useState, useEffect } from 'react'
import Whiteboard, { Shape } from '@/components/Whiteboard'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

export default function WhiteboardEditorPage() {
    const { id } = useParams()
    const router = useRouter()
    const [name, setName] = useState('')
    const [shapes, setShapes] = useState<Shape[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const backendUrl = "http://localhost:8000"

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        fetch(`${backendUrl}/whiteboards/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Not found")
                return res.json()
            })
            .then(data => {
                setName(data.name)
                setShapes(JSON.parse(data.data || "[]"))
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                router.push('/dashboard/whiteboards')
            })
    }, [id, router])

    const handleSave = async (data: Shape[]) => {
        setSaving(true)
        const token = localStorage.getItem('token')
        try {
            await fetch(`${backendUrl}/whiteboards/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: JSON.stringify(data)
                })
            })
            // Optional toast here
        } catch (error) {
            console.error("Save failed", error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading canvas...</div>

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
            <header className="h-14 border-b border-[var(--border-default)] flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/whiteboards')}
                        className="p-2 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-sm font-semibold text-[var(--text-primary)]">{name}</h1>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            {saving ? 'Saving...' : 'Saved to cloud'}
                        </p>
                    </div>
                </div>
                <div>
                    {/* Actions if needed */}
                </div>
            </header>
            <main className="flex-1 p-4 bg-[var(--bg-secondary)] overflow-hidden">
                <Whiteboard initialData={shapes} onSave={handleSave} />
            </main>
        </div>
    )
}
