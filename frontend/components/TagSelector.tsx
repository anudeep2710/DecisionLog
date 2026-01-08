"use client"
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'

import { Tag, X, Plus } from 'lucide-react'

interface TagType {
    id: string
    name: string
}

interface Props {
    decisionId?: string
    selectedTags: TagType[]
    onTagsChange: (tags: TagType[]) => void
}

export default function TagSelector({ decisionId, selectedTags, onTagsChange }: Props) {
    const [allTags, setAllTags] = useState<TagType[]>([])
    const [newTagName, setNewTagName] = useState('')
    const [showInput, setShowInput] = useState(false)
    const [loading, setLoading] = useState(false)

    const backendUrl = API_BASE_URL

    useEffect(() => {
        fetchTags()
    }, [])

    const fetchTags = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return
            if (!token) return

            const res = await fetch(`${backendUrl}/tags/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setAllTags(await res.json())
            }
        } catch (error) {
            console.error("Failed to fetch tags", error)
        }
    }

    const createTag = async () => {
        if (!newTagName.trim()) return
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            if (!token) return
            if (!token) return

            const res = await fetch(`${backendUrl}/tags/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newTagName.trim() })
            })
            if (res.ok) {
                const newTag = await res.json()
                setAllTags([...allTags, newTag])
                onTagsChange([...selectedTags, newTag])
                setNewTagName('')
                setShowInput(false)
            }
        } catch (error) {
            console.error("Failed to create tag", error)
        } finally {
            setLoading(false)
        }
    }

    const toggleTag = (tag: TagType) => {
        const isSelected = selectedTags.some(t => t.id === tag.id)
        if (isSelected) {
            onTagsChange(selectedTags.filter(t => t.id !== tag.id))
        } else {
            onTagsChange([...selectedTags, tag])
        }
    }

    const removeTag = (tag: TagType) => {
        onTagsChange(selectedTags.filter(t => t.id !== tag.id))
    }

    // Tag colors based on name hash
    const getTagColor = (name: string) => {
        const colors = [
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
            'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        ]
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        return colors[hash % colors.length]
    }

    return (
        <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                <div className="flex items-center gap-1.5">
                    <Tag size={14} />
                    Tags
                </div>
            </label>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedTags.map(tag => (
                        <span
                            key={tag.id}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getTagColor(tag.name)}`}
                        >
                            {tag.name}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:opacity-70"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Available Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {allTags
                    .filter(tag => !selectedTags.some(t => t.id === tag.id))
                    .map(tag => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="px-2 py-1 rounded-md text-xs font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                        >
                            + {tag.name}
                        </button>
                    ))}

                {/* Add new tag button/input */}
                {showInput ? (
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), createTag())}
                            placeholder="Tag name"
                            className="w-24 px-2 py-1 rounded-md text-xs"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={createTag}
                            disabled={loading}
                            className="p-1 rounded-md bg-[var(--text-primary)] text-[var(--bg-primary)]"
                        >
                            <Plus size={12} />
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowInput(false); setNewTagName('') }}
                            className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowInput(true)}
                        className="px-2 py-1 rounded-md text-xs font-medium border border-dashed border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                        + New tag
                    </button>
                )}
            </div>
        </div>
    )
}

