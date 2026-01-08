"use client"
import { useState, useEffect, useMemo } from 'react'
import { API_BASE_URL } from '@/lib/api'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    BarChart2, TrendingUp, TrendingDown, PieChart,
    Calendar, ArrowLeft, CheckCircle, XCircle, HelpCircle
} from 'lucide-react'

interface Decision {
    id: string
    title: string
    confidence_level: number
    status: 'pending' | 'in_progress' | 'reviewed' | 'done'
    outcome: 'success' | 'failure' | 'unknown'
    created_at: string
}

export default function AnalyticsPage() {
    const [decisions, setDecisions] = useState<Decision[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    const backendUrl = API_BASE_URL

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
    }, [router])

    const fetchDecisions = async (token: string) => {
        try {
            const res = await fetch(`${backendUrl}/decisions/`, {
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

    // Analytics calculations
    const analytics = useMemo(() => {
        const total = decisions.length
        const success = decisions.filter(d => d.outcome === 'success').length
        const failure = decisions.filter(d => d.outcome === 'failure').length
        const unknown = decisions.filter(d => d.outcome === 'unknown').length

        // Status counts
        const pending = decisions.filter(d => d.status === 'pending').length
        const inProgress = decisions.filter(d => d.status === 'in_progress').length
        const reviewed = decisions.filter(d => d.status === 'reviewed').length
        const done = decisions.filter(d => d.status === 'done').length

        const avgConfidence = total > 0
            ? (decisions.reduce((sum, d) => sum + d.confidence_level, 0) / total).toFixed(1)
            : '0'

        // Monthly breakdown
        const monthlyData: { [key: string]: { success: number, failure: number, unknown: number } } = {}
        decisions.forEach(d => {
            const month = new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            if (!monthlyData[month]) {
                monthlyData[month] = { success: 0, failure: 0, unknown: 0 }
            }
            monthlyData[month][d.outcome]++
        })

        // Confidence distribution
        const confidenceDist = [0, 0, 0, 0, 0]
        decisions.forEach(d => {
            if (d.confidence_level >= 1 && d.confidence_level <= 5) {
                confidenceDist[d.confidence_level - 1]++
            }
        })

        // Success rate by confidence level
        const successByConfidence = [1, 2, 3, 4, 5].map(level => {
            const atLevel = decisions.filter(d => d.confidence_level === level)
            const successes = atLevel.filter(d => d.outcome === 'success').length
            return atLevel.length > 0 ? Math.round((successes / atLevel.length) * 100) : 0
        })

        return {
            total,
            success,
            failure,
            unknown,
            statusCounts: { pending, inProgress, reviewed, done },
            avgConfidence,
            successRate: total > 0 ? Math.round((success / total) * 100) : 0,
            completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
            monthlyData: Object.entries(monthlyData).slice(-6),
            confidenceDist,
            successByConfidence
        }
    }, [decisions])

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
                <div className="animate-pulse text-[var(--text-secondary)]">Loading analytics...</div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-48px)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="p-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
                        <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">Insights from your {analytics.total} decisions</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="notion-card p-4">
                        <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-xs font-medium uppercase mb-2">
                            <TrendingUp size={14} />
                            Success Rate
                        </div>
                        <p className="text-3xl font-bold text-[var(--accent-green)]">{analytics.successRate}%</p>
                    </div>
                    <div className="notion-card p-4">
                        <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-xs font-medium uppercase mb-2">
                            <BarChart2 size={14} />
                            Avg Confidence
                        </div>
                        <p className="text-3xl font-bold text-[var(--text-primary)]">{analytics.avgConfidence}/5</p>
                    </div>
                    <div className="notion-card p-4">
                        <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-xs font-medium uppercase mb-2">
                            <CheckCircle size={14} />
                            Completion Rate
                        </div>
                        <p className="text-3xl font-bold text-[var(--accent-purple)]">{analytics.completionRate}%</p>
                    </div>
                    <div className="notion-card p-4">
                        <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-xs font-medium uppercase mb-2">
                            <Calendar size={14} />
                            Total Decisions
                        </div>
                        <p className="text-3xl font-bold text-[var(--text-primary)]">{analytics.total}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Outcome Distribution */}
                    <div className="notion-card p-6">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Outcome Distribution</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <CheckCircle size={14} className="text-[var(--accent-green)]" />
                                        Success
                                    </span>
                                    <span className="font-medium text-[var(--text-primary)]">{analytics.success}</span>
                                </div>
                                <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--accent-green)] rounded-full transition-all"
                                        style={{ width: `${analytics.total > 0 ? (analytics.success / analytics.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <XCircle size={14} className="text-[var(--accent-red)]" />
                                        Failure
                                    </span>
                                    <span className="font-medium text-[var(--text-primary)]">{analytics.failure}</span>
                                </div>
                                <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--accent-red)] rounded-full transition-all"
                                        style={{ width: `${analytics.total > 0 ? (analytics.failure / analytics.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <HelpCircle size={14} className="text-[var(--text-tertiary)]" />
                                        Unknown
                                    </span>
                                    <span className="font-medium text-[var(--text-primary)]">{analytics.unknown}</span>
                                </div>
                                <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--text-tertiary)] rounded-full transition-all"
                                        style={{ width: `${analytics.total > 0 ? (analytics.unknown / analytics.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Workflow Status */}
                    <div className="notion-card p-6">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Workflow Status</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-2 h-20 items-end">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-full bg-[var(--bg-tertiary)] rounded-t-sm relative h-full">
                                        <div
                                            className="absolute bottom-0 w-full bg-[var(--text-tertiary)] rounded-t-sm"
                                            style={{ height: `${analytics.total > 0 ? (analytics.statusCounts.pending / analytics.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-[var(--text-secondary)]">To Do</span>
                                    <span className="text-xs font-bold">{analytics.statusCounts.pending}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-full bg-[var(--bg-tertiary)] rounded-t-sm relative h-full">
                                        <div
                                            className="absolute bottom-0 w-full bg-[var(--accent-blue)] rounded-t-sm"
                                            style={{ height: `${analytics.total > 0 ? (analytics.statusCounts.inProgress / analytics.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-[var(--text-secondary)]">In Progress</span>
                                    <span className="text-xs font-bold">{analytics.statusCounts.inProgress}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-full bg-[var(--bg-tertiary)] rounded-t-sm relative h-full">
                                        <div
                                            className="absolute bottom-0 w-full bg-[var(--accent-purple)] rounded-t-sm"
                                            style={{ height: `${analytics.total > 0 ? (analytics.statusCounts.reviewed / analytics.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-[var(--text-secondary)]">Review</span>
                                    <span className="text-xs font-bold">{analytics.statusCounts.reviewed}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-full bg-[var(--bg-tertiary)] rounded-t-sm relative h-full">
                                        <div
                                            className="absolute bottom-0 w-full bg-[var(--accent-green)] rounded-t-sm"
                                            style={{ height: `${analytics.total > 0 ? (analytics.statusCounts.done / analytics.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-[var(--text-secondary)]">Done</span>
                                    <span className="text-xs font-bold">{analytics.statusCounts.done}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Confidence vs Success */}
                    <div className="notion-card p-6">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Success Rate by Confidence</h3>
                        <div className="flex items-end justify-between h-40 gap-2">
                            {analytics.successByConfidence.map((rate, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-[var(--bg-tertiary)] rounded-t-md relative" style={{ height: '120px' }}>
                                        <div
                                            className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--accent-green)] to-[var(--accent-green)]/60 rounded-t-md transition-all"
                                            style={{ height: `${rate}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-[var(--text-secondary)]">{i + 1}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] mt-4 text-center">
                            Confidence Level (1-5) → Higher confidence correlates with better outcomes
                        </p>
                    </div>

                    {/* Monthly Trend */}
                    <div className="notion-card p-6">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Monthly Outcomes</h3>
                        {analytics.monthlyData.length > 0 ? (
                            <div className="flex items-end justify-between h-32 gap-4">
                                {analytics.monthlyData.map(([month, data]) => {
                                    const total = data.success + data.failure + data.unknown
                                    const maxHeight = 100
                                    return (
                                        <div key={month} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: `${maxHeight}px` }}>
                                                <div
                                                    className="w-full bg-[var(--accent-green)] rounded-sm"
                                                    style={{ height: `${(data.success / Math.max(total, 1)) * maxHeight}px` }}
                                                />
                                                <div
                                                    className="w-full bg-[var(--accent-red)] rounded-sm"
                                                    style={{ height: `${(data.failure / Math.max(total, 1)) * maxHeight}px` }}
                                                />
                                                <div
                                                    className="w-full bg-[var(--text-tertiary)] rounded-sm"
                                                    style={{ height: `${(data.unknown / Math.max(total, 1)) * maxHeight}px` }}
                                                />
                                            </div>
                                            <span className="text-xs text-[var(--text-tertiary)]">{month}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-[var(--text-tertiary)] py-8">No data yet. Start logging decisions!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
