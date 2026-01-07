"use client"
import { useState, useEffect, useRef } from 'react'
import { Send, User as UserIcon } from 'lucide-react'

interface Message {
    id: string
    content: string
    created_at: string
    user: {
        id: string
        full_name: string
    }
}

interface Props {
    teamId: string
    currentUserId: string
}

export default function TeamChat({ teamId, currentUserId }: Props) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const backendUrl = "http://localhost:8000"
    const scrollRef = useRef<HTMLDivElement>(null)
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

    // Handle scroll events to determine if we should auto-scroll
    const handleScroll = () => {
        if (!scrollRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
        // If user is within 50px of bottom, auto-scroll is enabled
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50
        setShouldAutoScroll(isNearBottom)
    }

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const res = await fetch(`${backendUrl}/chat/${teamId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                // Only update if length changed or last message ID is different to prevent unnecessary renders/effects
                setMessages(prev => {
                    if (prev.length !== data.length || (data.length > 0 && prev.length > 0 && prev[prev.length - 1].id !== data[data.length - 1].id)) {
                        return data
                    }
                    return prev.length === 0 && data.length > 0 ? data : prev
                })
            }
        } catch (error) {
            console.error("Failed to fetch messages", error)
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch and polling
    useEffect(() => {
        fetchMessages()
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [teamId])

    // Scroll effect
    useEffect(() => {
        if (shouldAutoScroll) {
            scrollToBottom()
        }
    }, [messages, shouldAutoScroll])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const res = await fetch(`${backendUrl}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    team_id: teamId,
                    content: newMessage
                })
            })

            if (res.ok) {
                setNewMessage('')
                setShouldAutoScroll(true) // Force scroll on send
                fetchMessages()
            }
        } catch (error) {
            console.error("Failed to send message", error)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="flex flex-col h-[600px] border border-[var(--border-default)] rounded-xl bg-[var(--bg-secondary)] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border-default)] bg-[var(--bg-primary)] flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Team Chat</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">Real-time collaboration</p>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-[var(--accent-green)]/10 text-[var(--accent-green)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] animate-pulse"></span>
                    Live
                </div>
            </div>

            <div
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-secondary)/50]"
                ref={scrollRef}
                onScroll={handleScroll}
            >
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--text-tertiary)]"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-[var(--text-tertiary)] py-10 opacity-60">
                        <p>No messages yet.</p>
                        <p className="text-sm">Be the first to say hello! 👋</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.user.id === currentUserId
                        const showAvatar = !isMe && (index === 0 || messages[index - 1].user.id !== msg.user.id)

                        return (
                            <div key={msg.id} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className={`w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] flex items-center justify-center text-xs font-medium text-[var(--text-secondary)] shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                        {getInitials(msg.user.full_name || 'User')}
                                    </div>
                                )}

                                <div className={`max-w-[75%] space-y-1`}>
                                    {!isMe && showAvatar && (
                                        <p className="text-[10px] text-[var(--text-tertiary)] ml-1">
                                            {msg.user.full_name}
                                        </p>
                                    )}
                                    <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-tr-none'
                                            : 'bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-tl-none'
                                        }`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    </div>
                                    <p className={`text-[10px] ${isMe ? 'text-right' : 'text-left'} text-[var(--text-tertiary)] opacity-60 px-1`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 bg-[var(--bg-primary)] border-t border-[var(--border-default)] flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[var(--bg-secondary)] border-0 rounded-full px-4 text-sm focus:ring-1 focus:ring-[var(--border-default)]"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    )
}
