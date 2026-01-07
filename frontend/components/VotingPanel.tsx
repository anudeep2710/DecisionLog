"use client"
import { useState, useEffect } from 'react'

import { ThumbsUp, ThumbsDown, MinusCircle, Users } from 'lucide-react'

interface VoteSummary {
    approve_count: number
    reject_count: number
    abstain_count: number
    user_vote: string | null
    voters: { user_id: string; name: string; vote: string }[]
}

interface Props {
    decisionId: string
    isTeamDecision?: boolean
}

export default function VotingPanel({ decisionId, isTeamDecision = false }: Props) {
    const [votes, setVotes] = useState<VoteSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [showVoters, setShowVoters] = useState(false)

    const backendUrl = "http://localhost:8000"

    useEffect(() => {
        if (isTeamDecision) {
            fetchVotes()
        } else {
            setLoading(false)
        }
    }, [decisionId, isTeamDecision])

    const fetchVotes = async () => {
        try {
            const token = localStorage.getItem('token')
if (!token) return
            if (!token) return

            const res = await fetch(`${backendUrl}/votes/decision/${decisionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setVotes(await res.json())
            }
        } catch (error) {
            console.error("Failed to fetch votes", error)
        } finally {
            setLoading(false)
        }
    }

    const castVote = async (voteType: 'approve' | 'reject' | 'abstain') => {
        try {
            const token = localStorage.getItem('token')
if (!token) return
            if (!token) return

            // If clicking same vote, remove it
            if (votes?.user_vote === voteType) {
                await fetch(`${backendUrl}/votes/decision/${decisionId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            } else {
                await fetch(`${backendUrl}/votes/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        decision_id: decisionId,
                        vote: voteType
                    })
                })
            }
            fetchVotes()
        } catch (error) {
            console.error("Failed to cast vote", error)
        }
    }

    if (!isTeamDecision) return null
    if (loading) return <div className="animate-pulse h-8 bg-[var(--bg-tertiary)] rounded"></div>

    const totalVotes = (votes?.approve_count || 0) + (votes?.reject_count || 0) + (votes?.abstain_count || 0)

    return (
        <div className="notion-card p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                    <Users size={14} />
                    Team Vote
                </h4>
                {totalVotes > 0 && (
                    <button
                        onClick={() => setShowVoters(!showVoters)}
                        className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    >
                        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                    </button>
                )}
            </div>

            {/* Vote Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => castVote('approve')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${votes?.user_vote === 'approve'
                            ? 'bg-[var(--accent-green)] text-white'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--accent-green)]/20 hover:text-[var(--accent-green)]'
                        }`}
                >
                    <ThumbsUp size={14} />
                    <span>{votes?.approve_count || 0}</span>
                </button>
                <button
                    onClick={() => castVote('reject')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${votes?.user_vote === 'reject'
                            ? 'bg-[var(--accent-red)] text-white'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--accent-red)]/20 hover:text-[var(--accent-red)]'
                        }`}
                >
                    <ThumbsDown size={14} />
                    <span>{votes?.reject_count || 0}</span>
                </button>
                <button
                    onClick={() => castVote('abstain')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${votes?.user_vote === 'abstain'
                            ? 'bg-[var(--text-tertiary)] text-white'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--text-tertiary)]/20'
                        }`}
                >
                    <MinusCircle size={14} />
                    <span>{votes?.abstain_count || 0}</span>
                </button>
            </div>

            {/* Voter List */}
            {showVoters && votes && votes.voters.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--border-default)]">
                    <div className="space-y-1.5">
                        {votes.voters.map((voter, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-[var(--text-secondary)]">{voter.name}</span>
                                <span className={`font-medium ${voter.vote === 'approve' ? 'text-[var(--accent-green)]' :
                                        voter.vote === 'reject' ? 'text-[var(--accent-red)]' :
                                            'text-[var(--text-tertiary)]'
                                    }`}>
                                    {voter.vote}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

