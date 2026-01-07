"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { MessageSquare, Send, Edit2, Trash2, X, Check } from 'lucide-react'

interface Comment {
    id: string
    content: string
    created_at: string
    updated_at: string
}

interface Props {
    decisionId: string
}

export default function Comments({ decisionId }: Props) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')

    const backendUrl = "http://localhost:8000"

    useEffect(() => {
        fetchComments()
    }, [decisionId])

    const fetchComments = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch(`${backendUrl}/comments/decision/${decisionId}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
            if (res.ok) {
                setComments(await res.json())
            }
        } catch (error) {
            console.error("Failed to fetch comments", error)
        } finally {
            setLoading(false)
        }
    }

    const addComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return
        setSubmitting(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch(`${backendUrl}/comments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    decision_id: decisionId,
                    content: newComment.trim()
                })
            })
            if (res.ok) {
                const comment = await res.json()
                setComments([...comments, comment])
                setNewComment('')
            }
        } catch (error) {
            console.error("Failed to add comment", error)
        } finally {
            setSubmitting(false)
        }
    }

    const updateComment = async (id: string) => {
        if (!editContent.trim()) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch(`${backendUrl}/comments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ content: editContent.trim() })
            })
            if (res.ok) {
                const updated = await res.json()
                setComments(comments.map(c => c.id === id ? updated : c))
                setEditingId(null)
                setEditContent('')
            }
        } catch (error) {
            console.error("Failed to update comment", error)
        }
    }

    const deleteComment = async (id: string) => {
        if (!confirm("Delete this comment?")) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch(`${backendUrl}/comments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
            if (res.ok) {
                setComments(comments.filter(c => c.id !== id))
            }
        } catch (error) {
            console.error("Failed to delete comment", error)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        })
    }

    return (
        <div className="notion-card p-4 mt-6">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <MessageSquare size={16} />
                Follow-up Notes
                <span className="text-xs font-normal text-[var(--text-tertiary)]">
                    ({comments.length})
                </span>
            </h3>

            {/* Comments List */}
            {loading ? (
                <div className="py-4 text-center text-[var(--text-tertiary)] text-sm">Loading...</div>
            ) : comments.length > 0 ? (
                <div className="space-y-3 mb-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="group relative p-3 rounded-md bg-[var(--bg-tertiary)]">
                            {editingId === comment.id ? (
                                <div className="flex gap-2">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="flex-1 text-sm p-2 rounded-md resize-none"
                                        rows={2}
                                        autoFocus
                                    />
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => updateComment(comment.id)}
                                            className="p-1.5 rounded-md bg-[var(--accent-green)] text-white"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            onClick={() => { setEditingId(null); setEditContent('') }}
                                            className="p-1.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-2">
                                        {formatDate(comment.created_at)}
                                        {comment.updated_at !== comment.created_at && ' (edited)'}
                                    </p>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button
                                            onClick={() => { setEditingId(comment.id); setEditContent(comment.content) }}
                                            className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            onClick={() => deleteComment(comment.id)}
                                            className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--accent-red)]"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="py-3 text-center text-sm text-[var(--text-tertiary)]">
                    No notes yet. Add your first follow-up!
                </p>
            )}

            {/* Add Comment Form */}
            <form onSubmit={addComment} className="flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a follow-up note..."
                    className="flex-1 text-sm px-3 py-2 rounded-md"
                />
                <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="btn-primary p-2"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    )
}
