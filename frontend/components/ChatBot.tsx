"use client"
import { useState, useRef, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'
import { MessageCircle, X, Send, Bot, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface BotMessage {
    id: string
    role: 'user' | 'bot'
    content: string
    sources?: { title: string, id: string }[]
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<BotMessage[]>([
        { id: 'welcome', role: 'bot', content: "Hi! I'm your Decision Helper.\nAsk me about your decisions, like 'How many decisions have I made?' or 'Show me my successful decisions'." }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const backendUrl = API_BASE_URL
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (isOpen) scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg: BotMessage = { id: Date.now().toString(), role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'bot',
                    content: "Please log in to ask about your decisions."
                }])
                return
            }

            const res = await fetch(`${backendUrl}/bot/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query: userMsg.content })
            })

            if (res.ok) {
                const data = await res.json()
                const botMsg: BotMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'bot',
                    content: data.answer,
                    sources: data.sources
                }
                setMessages(prev => [...prev, botMsg])
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'bot',
                    content: "Sorry, I couldn't process that request."
                }])
            }
        } catch (error) {
            console.error("Bot error", error)
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'bot',
                content: "Network error. Please try again."
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto mb-4 w-80 md:w-96 h-[500px] bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--bg-primary)]">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[var(--text-primary)] rounded-lg text-[var(--bg-primary)]">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Decision Helper</h3>
                                <p className="text-xs text-[var(--text-tertiary)]">AI Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-[var(--bg-hover)] rounded-full transition-colors text-[var(--text-secondary)]"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-primary)]/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-tr-none'
                                    : 'bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-tl-none text-[var(--text-primary)]'
                                    }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                                    {/* Sources / Citations */}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-3 pt-2 border-t border-[var(--border-default)]/20">
                                            <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1.5">Related Decisions</p>
                                            <div className="space-y-1.5">
                                                {msg.sources.map(source => (
                                                    <Link
                                                        key={source.id}
                                                        href={`/dashboard/decisions/${source.id}`}
                                                        className={`flex items-center gap-1.5 text-xs p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${msg.role === 'user' ? 'text-white/90' : 'text-[var(--text-secondary)]'
                                                            }`}
                                                    >
                                                        <ExternalLink size={12} />
                                                        <span className="truncate">{source.title}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-[var(--bg-primary)] rounded-2xl px-4 py-3 border border-[var(--border-default)] rounded-tl-none">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-[var(--bg-primary)] border-t border-[var(--border-default)] flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your decisions..."
                            className="flex-1 bg-[var(--bg-secondary)] border-0 rounded-full px-4 text-sm focus:ring-1 focus:ring-[var(--border-default)] py-2.5"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-2.5 aspect-square rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] disabled:opacity-50 hover:scale-105 transition-transform items-center justify-center flex"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto h-14 w-14 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center ${isOpen ? 'rotate-90' : 'rotate-0'}`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    )
}
