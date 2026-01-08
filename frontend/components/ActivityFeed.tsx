"use client"
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'

import { Activity, MessageSquare, ThumbsUp, UserPlus, FileText, Clock } from 'lucide-react'

interface ActivityItem {
    id: string
    type: 'decision_created' | 'comment_added' | 'vote_cast' | 'member_joined'
    actor_name: string
    decision_title?: string
    vote_type?: string
    created_at: string
}

interface Props {
    teamId: string
}

export default function ActivityFeed({ teamId }: Props) {
    const [activities, setActivities] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)

    const backendUrl = API_BASE_URL

    useEffect(() => {
        fetchActivity()
    }, [teamId])

    const fetchActivity = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return
            if (!token) return

            // Fetch team decisions and related activity
            const decisionsRes = await fetch(`${backendUrl}/teams/${teamId}/decisions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (decisionsRes.ok) {
                const decisions = await decisionsRes.json()

                // Convert to activity items
                const activityItems: ActivityItem[] = decisions.slice(0, 10).map((d: any) => ({
                    id: d.id,
                    type: 'decision_created' as const,
                    actor_name: 'Team member',
                    decision_title: d.title,
                    created_at: d.created_at
                }))

                // Sort by date
                activityItems.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )

                setActivities(activityItems)
            }
        } catch (error) {
            console.error("Failed to fetch activity", error)
        } finally {
            setLoading(false)
        }
    }

    const getActivityIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'decision_created': return <FileText size={14} className="text-[var(--accent-purple)]" />
            case 'comment_added': return <MessageSquare size={14} className="text-[var(--accent-blue)]" />
            case 'vote_cast': return <ThumbsUp size={14} className="text-[var(--accent-green)]" />
            case 'member_joined': return <UserPlus size={14} className="text-[var(--accent-orange)]" />
        }
    }

    const getActivityText = (activity: ActivityItem) => {
        switch (activity.type) {
            case 'decision_created':
                return <><strong>{activity.actor_name}</strong> created decision "{activity.decision_title}"</>
            case 'comment_added':
                return <><strong>{activity.actor_name}</strong> commented on "{activity.decision_title}"</>
            case 'vote_cast':
                return <><strong>{activity.actor_name}</strong> voted {activity.vote_type} on "{activity.decision_title}"</>
            case 'member_joined':
                return <><strong>{activity.actor_name}</strong> joined the team</>
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    if (loading) {
        return (
            <div className="notion-card p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/3"></div>
                    <div className="h-10 bg-[var(--bg-tertiary)] rounded"></div>
                    <div className="h-10 bg-[var(--bg-tertiary)] rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="notion-card p-4">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Activity size={16} />
                Recent Activity
            </h3>

            {activities.length > 0 ? (
                <div className="space-y-3">
                    {activities.map(activity => (
                        <div key={activity.id} className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                                    {getActivityText(activity)}
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)] mt-0.5 flex items-center gap-1">
                                    <Clock size={10} />
                                    {formatTime(activity.created_at)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-[var(--text-tertiary)] py-4">
                    No activity yet. Create a decision to get started!
                </p>
            )}
        </div>
    )
}

