import Link from 'next/link'
import {
    FileText, Tag, BarChart2, Users, ThumbsUp, MessageSquare,
    Activity, FileSearch, Lightbulb, Layout, Moon, Search,
    ArrowRight, CheckCircle, Sparkles
} from 'lucide-react'

const features = [
    {
        icon: FileText,
        title: 'Decision Logging',
        description: 'Capture your decisions with full context - what you chose, why you chose it, and your confidence level.',
        color: 'blue',
        details: [
            'Record title, context, and choice made',
            'Set confidence level (1-5 scale)',
            'Track decision status (pending/reviewed)',
            'Mark outcomes as success, failure, or unknown'
        ]
    },
    {
        icon: Layout,
        title: 'Decision Templates',
        description: 'Pre-filled templates help you get started quickly with common decision types.',
        color: 'purple',
        details: [
            '💼 Career decisions',
            '🛒 Major purchases',
            '💻 Tech stack choices',
            '👥 Hiring decisions',
            '🎯 Project direction',
            '🏠 Personal life'
        ]
    },
    {
        icon: Tag,
        title: 'Tags & Organization',
        description: 'Organize decisions with color-coded tags for easy filtering and searching.',
        color: 'green',
        details: [
            'Create custom tags',
            'Filter decisions by tag',
            'Color-coded for quick recognition',
            'Add multiple tags per decision'
        ]
    },
    {
        icon: BarChart2,
        title: 'Analytics Dashboard',
        description: 'Visualize your decision-making patterns with charts and insights.',
        color: 'orange',
        details: [
            'Success rate tracking',
            'Average confidence metrics',
            'Monthly decision trends',
            'Confidence vs outcome correlation'
        ]
    },
    {
        icon: Users,
        title: 'Team Spaces',
        description: 'Collaborate on decisions with your team using shared spaces.',
        color: 'blue',
        details: [
            'Create team workspaces',
            'Invite members via code',
            'Role-based access (owner, admin, member)',
            'Filter decisions by team'
        ]
    },
    {
        icon: ThumbsUp,
        title: 'Decision Voting',
        description: 'Let team members vote on decisions with approve, reject, or abstain options.',
        color: 'green',
        details: [
            'Three vote types: approve, reject, abstain',
            'See vote counts in real-time',
            'View who voted and how',
            'Change or remove votes anytime'
        ]
    },
    {
        icon: MessageSquare,
        title: 'Comments & Notes',
        description: 'Add follow-up notes and reflections to any decision over time.',
        color: 'purple',
        details: [
            'Add comments to decisions',
            'Edit or delete your notes',
            'Timestamps for each comment',
            'Track your evolving thoughts'
        ]
    },
    {
        icon: Activity,
        title: 'Activity Feed',
        description: 'See recent team activity including new decisions, votes, and comments.',
        color: 'orange',
        details: [
            'Real-time activity stream',
            'Relative timestamps',
            'Activity icons by type',
            'Quick context at a glance'
        ]
    },
    {
        icon: Search,
        title: 'Search & Filter',
        description: 'Quickly find any decision with powerful search and filtering options.',
        color: 'blue',
        details: [
            'Full-text search',
            'Filter by status and outcome',
            'Sort by date, title, or confidence',
            'Export to CSV'
        ]
    },
    {
        icon: Moon,
        title: 'Dark Mode',
        description: 'Toggle between light and dark themes. Respects your system preference.',
        color: 'purple',
        details: [
            'Light and dark themes',
            'Respects system preference',
            'Persisted across sessions',
            'Beautiful Notion-style design'
        ]
    }
]

const colorClasses: Record<string, { bg: string, text: string, border: string }> = {
    blue: { bg: 'bg-[var(--accent-blue)]/10', text: 'text-[var(--accent-blue)]', border: 'hover:border-[var(--accent-blue)]/30' },
    green: { bg: 'bg-[var(--accent-green)]/10', text: 'text-[var(--accent-green)]', border: 'hover:border-[var(--accent-green)]/30' },
    purple: { bg: 'bg-[var(--accent-purple)]/10', text: 'text-[var(--accent-purple)]', border: 'hover:border-[var(--accent-purple)]/30' },
    orange: { bg: 'bg-[var(--accent-orange)]/10', text: 'text-[var(--accent-orange)]', border: 'hover:border-[var(--accent-orange)]/30' },
}

export default function FeaturesPage() {
    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Hero */}
            <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] text-sm font-medium mb-6">
                    <Sparkles size={14} />
                    Everything you need
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4">
                    Powerful features for<br />
                    <span className="text-[var(--text-tertiary)]">smarter decisions</span>
                </h1>
                <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                    From personal decision tracking to team collaboration — everything you need to make better choices.
                </p>
            </section>

            {/* Features Grid */}
            <section className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature, i) => {
                        const Icon = feature.icon
                        const colors = colorClasses[feature.color]
                        return (
                            <div
                                key={i}
                                className={`notion-card p-6 group transition-all ${colors.border}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                        <Icon className={colors.text} size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                                            {feature.title}
                                        </h3>
                                        <p className="text-[var(--text-secondary)] text-sm mb-4">
                                            {feature.description}
                                        </p>
                                        <ul className="space-y-1.5">
                                            {feature.details.map((detail, j) => (
                                                <li key={j} className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                                                    <CheckCircle size={12} className={colors.text} />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-3xl mx-auto px-4 py-16">
                <div className="notion-card p-10 text-center">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                        Ready to start?
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-6">
                        Create your free account and start logging decisions today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/register"
                            className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3"
                        >
                            Get started free
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="/login"
                            className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3"
                        >
                            Sign in →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
