"use client"
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DecisionCard from '@/components/DecisionCard'
import TeamSpaces from '@/components/TeamSpaces'
import Link from 'next/link'
import {
    Plus, Search, Filter, ArrowUpDown, Download,
    BarChart2, CheckCircle, XCircle, Clock,
    Calendar, TrendingUp, FileDown, FileJson, Users
} from 'lucide-react'

interface Decision {
    id: string
    title: string
    context: string
    choice_made: string
    confidence_level: number
    status: 'pending' | 'reviewed'
    outcome: 'success' | 'failure' | 'unknown'
    created_at: string
    team_id?: string
}

type SortOption = 'newest' | 'oldest' | 'confidence' | 'outcome'
type FilterOutcome = 'all' | 'success' | 'failure' | 'unknown'
type FilterStatus = 'all' | 'pending' | 'reviewed'

export default function Dashboard() {
    const [decisions, setDecisions] = useState<Decision[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    // Search, Sort, Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<SortOption>('newest')
    const [filterOutcome, setFilterOutcome] = useState<FilterOutcome>('all')
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
    const [showFilters, setShowFilters] = useState(false)
    const [showExport, setShowExport] = useState(false)
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

    const backendUrl = "http://localhost:8000"

    useEffect(() => {
        const checkUser = () => {
            const token = localStorage.getItem('token')
            const savedUser = localStorage.getItem('user')

            if (!token || !savedUser) {
                router.push('/login')
                return
            }
            setUser(JSON.parse(savedUser))
            fetchDecisions(token)
        }
        checkUser()

        // Keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'n' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault()
                router.push('/dashboard/new')
            }
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault()
                document.getElementById('search-input')?.focus()
            }
            if (e.key === 'Escape') {
                setShowFilters(false)
                setShowExport(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [router])

    const fetchDecisions = async (token: string, teamId?: string | null) => {
        try {
            const url = teamId
                ? `${backendUrl}/decisions/?team_id=${teamId}`
                : `${backendUrl}/decisions/`
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setDecisions(await res.json())
            }
        } catch (error) {
            console.error("Failed to fetch decisions", error)
        } finally {
            setLoading(false)
        }
    }

    // Refetch when team changes
    const handleTeamSelect = (teamId: string | null) => {
        setSelectedTeamId(teamId)
        setLoading(true)
        const token = localStorage.getItem('token')
        if (token) {
            fetchDecisions(token, teamId)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this decision?")) return
        try {
            const token = localStorage.getItem('token')
            if (!token) return
            const res = await fetch(`${backendUrl}/decisions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setDecisions(decisions.filter(d => d.id !== id))
            }
        } catch (error) {
            console.error("Delete failed", error)
        }
    }

    // Filtered and sorted decisions
    const filteredDecisions = useMemo(() => {
        let result = [...decisions]

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(d =>
                d.title.toLowerCase().includes(query) ||
                d.context?.toLowerCase().includes(query) ||
                d.choice_made?.toLowerCase().includes(query)
            )
        }

        // Filter by outcome
        if (filterOutcome !== 'all') {
            result = result.filter(d => d.outcome === filterOutcome)
        }

        // Filter by status
        if (filterStatus !== 'all') {
            result = result.filter(d => d.status === filterStatus)
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                case 'confidence':
                    return b.confidence_level - a.confidence_level
                case 'outcome':
                    const order = { success: 0, failure: 1, unknown: 2 }
                    return order[a.outcome] - order[b.outcome]
                default:
                    return 0
            }
        })

        return result
    }, [decisions, searchQuery, sortBy, filterOutcome, filterStatus])

    // Statistics
    const total = decisions.length
    const success = decisions.filter(d => d.outcome === 'success').length
    const failure = decisions.filter(d => d.outcome === 'failure').length
    const pending = decisions.filter(d => d.status === 'pending').length

    // Activity this month
    const thisMonth = decisions.filter(d => {
        const created = new Date(d.created_at)
        const now = new Date()
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length
    const reviewedThisMonth = decisions.filter(d => {
        const created = new Date(d.created_at)
        const now = new Date()
        return d.status === 'reviewed' && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length

    // Export functions
    const exportAsCSV = () => {
        const headers = ['Title', 'Context', 'Choice Made', 'Confidence', 'Status', 'Outcome', 'Created At']
        const rows = decisions.map(d => [
            d.title,
            d.context || '',
            d.choice_made || '',
            d.confidence_level,
            d.status,
            d.outcome,
            d.created_at
        ])
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
        downloadFile(csv, 'decisions.csv', 'text/csv')
    }

    const exportAsJSON = () => {
        const json = JSON.stringify(decisions, null, 2)
        downloadFile(json, 'decisions.json', 'application/json')
    }

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        setShowExport(false)
    }

    if (loading) return (
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 skeleton rounded-lg"></div>
                <div className="w-24 h-3 skeleton"></div>
            </div>
        </div>
    )

    return (
        <div className="min-h-[calc(100vh-48px)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">
                            Welcome back, {user?.user_metadata?.full_name || 'there'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/analytics"
                            className="btn-secondary inline-flex items-center gap-2 text-sm"
                        >
                            <BarChart2 size={16} />
                            Analytics
                        </Link>
                        <Link
                            href="/dashboard/new"
                            className="btn-primary inline-flex items-center gap-2 text-sm"
                        >
                            <Plus size={16} />
                            New Decision
                            <kbd className="hidden sm:inline-flex ml-1 px-1.5 py-0.5 text-[10px] rounded bg-white/20">N</kbd>
                        </Link>
                    </div>
                </div>

                {/* Team Spaces */}
                <TeamSpaces onTeamSelect={handleTeamSelect} selectedTeamId={selectedTeamId} />

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="notion-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Total</p>
                                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{total}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
                                <BarChart2 size={20} className="text-[var(--text-secondary)]" />
                            </div>
                        </div>
                    </div>
                    <div className="notion-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Success</p>
                                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                    {total > 0 ? Math.round((success / total) * 100) : 0}%
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-[var(--accent-green)]/10 flex items-center justify-center">
                                <CheckCircle size={20} className="text-[var(--accent-green)]" />
                            </div>
                        </div>
                    </div>
                    <div className="notion-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Learnings</p>
                                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{failure}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-[var(--accent-red)]/10 flex items-center justify-center">
                                <XCircle size={20} className="text-[var(--accent-red)]" />
                            </div>
                        </div>
                    </div>
                    <div className="notion-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Pending</p>
                                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{pending}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-[var(--accent-yellow)]/10 flex items-center justify-center">
                                <Clock size={20} className="text-[var(--accent-yellow)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Log */}
                <div className="notion-card p-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--accent-purple)]/10 flex items-center justify-center">
                            <TrendingUp size={20} className="text-[var(--accent-purple)]" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                                You logged {thisMonth} decision{thisMonth !== 1 ? 's' : ''} this month
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)]">
                                {reviewedThisMonth} reviewed • Keep up the great reflection!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search & Filters Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                        <input
                            id="search-input"
                            type="text"
                            placeholder="Search decisions... (press / to focus)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-md text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn-secondary inline-flex items-center gap-2 text-sm ${showFilters ? 'bg-[var(--bg-hover)]' : ''}`}
                        >
                            <Filter size={16} />
                            Filter
                        </button>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-3 py-2 rounded-md text-sm bg-[var(--bg-primary)] border border-[var(--border-default)]"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="confidence">Confidence</option>
                            <option value="outcome">Outcome</option>
                        </select>
                        <div className="relative">
                            <button
                                onClick={() => setShowExport(!showExport)}
                                className="btn-secondary inline-flex items-center gap-2 text-sm"
                            >
                                <Download size={16} />
                                Export
                            </button>
                            {showExport && (
                                <div className="absolute right-0 top-full mt-1 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                                    <button
                                        onClick={exportAsCSV}
                                        className="w-full px-3 py-2 text-sm text-left text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
                                    >
                                        <FileDown size={14} />
                                        Export as CSV
                                    </button>
                                    <button
                                        onClick={exportAsJSON}
                                        className="w-full px-3 py-2 text-sm text-left text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
                                    >
                                        <FileJson size={14} />
                                        Export as JSON
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter Pills */}
                {showFilters && (
                    <div className="flex flex-wrap gap-2 mb-6 p-4 notion-card">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <span>Outcome:</span>
                            {['all', 'success', 'failure', 'unknown'].map((o) => (
                                <button
                                    key={o}
                                    onClick={() => setFilterOutcome(o as FilterOutcome)}
                                    className={`px-3 py-1 rounded-md text-sm capitalize transition-colors ${filterOutcome === o
                                        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                        }`}
                                >
                                    {o}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] ml-4">
                            <span>Status:</span>
                            {['all', 'pending', 'reviewed'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s as FilterStatus)}
                                    className={`px-3 py-1 rounded-md text-sm capitalize transition-colors ${filterStatus === s
                                        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        Decisions
                        {filteredDecisions.length !== decisions.length && (
                            <span className="ml-2 text-sm font-normal text-[var(--text-tertiary)]">
                                ({filteredDecisions.length} of {decisions.length})
                            </span>
                        )}
                    </h2>
                </div>

                {/* Decisions Grid */}
                {filteredDecisions.length === 0 ? (
                    <div className="notion-card p-12 text-center">
                        {decisions.length === 0 ? (
                            <>
                                <p className="text-[var(--text-secondary)] mb-4">No decisions logged yet</p>
                                <Link
                                    href="/dashboard/new"
                                    className="inline-flex items-center gap-2 text-[var(--text-primary)] font-medium hover:underline"
                                >
                                    <Plus size={16} />
                                    Create your first decision
                                </Link>
                            </>
                        ) : (
                            <p className="text-[var(--text-secondary)]">No decisions match your filters</p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredDecisions.map(decision => (
                            <DecisionCard key={decision.id} decision={decision} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
