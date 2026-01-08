"use client"
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'

import { Users, Plus, Copy, Check, LogOut, Settings, ChevronRight } from 'lucide-react'

interface Team {
    id: string
    name: string
    description?: string
    invite_code: string
    role: string
    member_count?: number
}

interface Props {
    onTeamSelect: (teamId: string | null) => void
    selectedTeamId: string | null
}

export default function TeamSpaces({ onTeamSelect, selectedTeamId }: Props) {
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [showJoin, setShowJoin] = useState(false)
    const [newTeamName, setNewTeamName] = useState('')
    const [newTeamDesc, setNewTeamDesc] = useState('')
    const [inviteCode, setInviteCode] = useState('')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [error, setError] = useState('')

    const backendUrl = API_BASE_URL

    useEffect(() => {
        fetchTeams()
    }, [])

    const fetchTeams = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return
            if (!token) return

            const res = await fetch(`${backendUrl}/teams/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setTeams(await res.json())
            }
        } catch (error) {
            console.error("Failed to fetch teams", error)
        } finally {
            setLoading(false)
        }
    }

    const createTeam = async () => {
        if (!newTeamName.trim()) return
        setError('')
        try {
            const token = localStorage.getItem('token')
            if (!token) return
            if (!token) return

            const res = await fetch(`${backendUrl}/teams/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newTeamName, description: newTeamDesc })
            })
            if (res.ok) {
                const team = await res.json()
                setTeams([...teams, team])
                setShowCreate(false)
                setNewTeamName('')
                setNewTeamDesc('')
            } else {
                const err = await res.json()
                setError(err.detail)
            }
        } catch (error) {
            setError('Failed to create team')
        }
    }

    const joinTeam = async () => {
        if (!inviteCode.trim()) return
        setError('')
        try {
            const token = localStorage.getItem('token')
            if (!token) return
            if (!token) return

            const res = await fetch(`${backendUrl}/teams/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ invite_code: inviteCode })
            })
            if (res.ok) {
                const team = await res.json()
                setTeams([...teams, team])
                setShowJoin(false)
                setInviteCode('')
            } else {
                const err = await res.json()
                setError(err.detail)
            }
        } catch (error) {
            setError('Failed to join team')
        }
    }

    const copyInviteCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const leaveTeam = async (teamId: string) => {
        if (!confirm("Leave this team?")) return
        try {
            const token = localStorage.getItem('token')
            const savedUser = localStorage.getItem('user')
            if (!token || !savedUser) return

            const user = JSON.parse(savedUser)
            const res = await fetch(`${backendUrl}/teams/${teamId}/members/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setTeams(teams.filter(t => t.id !== teamId))
                if (selectedTeamId === teamId) onTeamSelect(null)
            }
        } catch (error) {
            console.error("Failed to leave team", error)
        }
    }

    return (
        <div className="notion-card p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users size={18} className="text-[var(--accent-purple)]" />
                    <h3 className="font-semibold text-[var(--text-primary)]">Team Spaces</h3>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => { setShowCreate(true); setShowJoin(false) }}
                        className="p-1.5 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                        title="Create team"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Personal space option */}
            <button
                onClick={() => onTeamSelect(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm mb-2 transition-colors ${selectedTeamId === null
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
            >
                <span>Personal</span>
                <ChevronRight size={14} />
            </button>

            {/* Teams list */}
            {loading ? (
                <div className="space-y-2">
                    {[1, 2].map(i => (
                        <div key={i} className="h-10 skeleton rounded-md"></div>
                    ))}
                </div>
            ) : (
                <div className="space-y-1">
                    {teams.map(team => (
                        <div
                            key={team.id}
                            className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${selectedTeamId === team.id
                                ? 'bg-[var(--accent-purple)]/15 text-[var(--accent-purple)]'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                }`}
                            onClick={() => onTeamSelect(team.id)}
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="truncate">{team.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
                                    {team.role}
                                </span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); copyInviteCode(team.invite_code, team.id) }}
                                    className="p-1 rounded hover:bg-[var(--bg-hover)]"
                                    title="Copy invite code"
                                >
                                    {copiedId === team.id ? <Check size={12} className="text-[var(--accent-green)]" /> : <Copy size={12} />}
                                </button>
                                {team.role !== 'owner' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); leaveTeam(team.id) }}
                                        className="p-1 rounded hover:bg-[var(--accent-red)]/10 hover:text-[var(--accent-red)]"
                                        title="Leave team"
                                    >
                                        <LogOut size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Join team link */}
            <button
                onClick={() => { setShowJoin(true); setShowCreate(false) }}
                className="w-full mt-3 px-3 py-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors"
            >
                Join with invite code →
            </button>

            {/* Create Team Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
                    <div className="notion-card p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Create Team</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Team Name</label>
                                <input
                                    value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md text-sm"
                                    placeholder="My Team"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Description (optional)</label>
                                <input
                                    value={newTeamDesc}
                                    onChange={e => setNewTeamDesc(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md text-sm"
                                    placeholder="A brief description"
                                />
                            </div>
                            {error && <p className="text-sm text-[var(--accent-red)]">{error}</p>}
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
                                <button onClick={createTeam} className="btn-primary text-sm">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Team Modal */}
            {showJoin && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowJoin(false)}>
                    <div className="notion-card p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Join Team</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Invite Code</label>
                                <input
                                    value={inviteCode}
                                    onChange={e => setInviteCode(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md text-sm font-mono"
                                    placeholder="abc123def456"
                                />
                            </div>
                            {error && <p className="text-sm text-[var(--accent-red)]">{error}</p>}
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setShowJoin(false)} className="btn-secondary text-sm">Cancel</button>
                                <button onClick={joinTeam} className="btn-primary text-sm">Join</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

