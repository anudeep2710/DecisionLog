"use client"
import { useState } from 'react'
import { HelpCircle, X, ChevronLeft, ChevronRight, FileText, Tag, BarChart2, Users, ThumbsUp, MessageSquare, Lightbulb } from 'lucide-react'

interface Step {
    title: string
    description: string
    icon: any
    color: string
    tips: string[]
}

const steps: Step[] = [
    {
        title: 'Log Your Decisions',
        description: 'Start by clicking "New Decision" to record your first decision. Include the context, your choice, and how confident you feel.',
        icon: FileText,
        color: 'blue',
        tips: ['Click "New Decision" button', 'Fill in title and context', 'Set your confidence level (1-5)', 'Save to start tracking']
    },
    {
        title: 'Use Templates',
        description: 'Speed up decision logging with pre-filled templates for common scenarios like career, purchases, or tech choices.',
        icon: Lightbulb,
        color: 'purple',
        tips: ['Click "Use Template" in the form', 'Choose from 6 categories', 'Template pre-fills the context', 'Customize as needed']
    },
    {
        title: 'Organize with Tags',
        description: 'Add color-coded tags to categorize and filter your decisions. Create custom tags for your workflow.',
        icon: Tag,
        color: 'green',
        tips: ['Click "+ New tag" in tag selector', 'Assign multiple tags per decision', 'Filter dashboard by tag', 'Tags are color-coded automatically']
    },
    {
        title: 'View Analytics',
        description: 'Track your decision patterns over time. See success rates, confidence trends, and monthly breakdowns.',
        icon: BarChart2,
        color: 'orange',
        tips: ['Click "Analytics" button', 'View success rate metrics', 'See confidence vs outcome charts', 'Track monthly decision trends']
    },
    {
        title: 'Collaborate in Teams',
        description: 'Create team spaces to make decisions together. Invite members, vote on decisions, and see team activity.',
        icon: Users,
        color: 'blue',
        tips: ['Click "Create Team" in sidebar', 'Share invite code with members', 'Filter decisions by team', 'See team activity feed']
    },
    {
        title: 'Vote & Comment',
        description: 'For team decisions, vote to approve/reject. Add follow-up comments to track your evolving thoughts.',
        icon: ThumbsUp,
        color: 'green',
        tips: ['Vote: Approve, Reject, or Abstain', 'See who voted and how', 'Add comments for follow-ups', 'Edit or delete your notes']
    }
]

const colorClasses: Record<string, { bg: string, text: string }> = {
    blue: { bg: 'bg-[var(--accent-blue)]/10', text: 'text-[var(--accent-blue)]' },
    green: { bg: 'bg-[var(--accent-green)]/10', text: 'text-[var(--accent-green)]' },
    purple: { bg: 'bg-[var(--accent-purple)]/10', text: 'text-[var(--accent-purple)]' },
    orange: { bg: 'bg-[var(--accent-orange)]/10', text: 'text-[var(--accent-orange)]' },
}

export default function HelpTour() {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    const step = steps[currentStep]
    const Icon = step.icon
    const colors = colorClasses[step.color]

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            setIsOpen(false)
            setCurrentStep(0)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    return (
        <>
            {/* Help Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
                title="Help & Tour"
            >
                <HelpCircle size={24} />
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-lg bg-[var(--bg-primary)] rounded-xl shadow-2xl border border-[var(--border-default)] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
                            <div className="flex items-center gap-2">
                                <HelpCircle size={18} className="text-[var(--text-tertiary)]" />
                                <span className="text-sm font-medium text-[var(--text-primary)]">
                                    Quick Tour
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-[var(--text-tertiary)]">
                                    {currentStep + 1} of {steps.length}
                                </span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                                <Icon size={32} className={colors.text} />
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                                {step.title}
                            </h3>
                            <p className="text-[var(--text-secondary)] mb-4">
                                {step.description}
                            </p>

                            {/* Tips */}
                            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-2">
                                    How to do it
                                </p>
                                <ul className="space-y-2">
                                    {step.tips.map((tip, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                            <span className={`w-5 h-5 rounded-full ${colors.bg} ${colors.text} text-xs font-bold flex items-center justify-center`}>
                                                {i + 1}
                                            </span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Progress & Navigation */}
                        <div className="p-4 border-t border-[var(--border-default)]">
                            {/* Progress dots */}
                            <div className="flex justify-center gap-1.5 mb-4">
                                {steps.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentStep(i)}
                                        className={`w-2 h-2 rounded-full transition-all ${i === currentStep
                                                ? 'bg-[var(--text-primary)] w-6'
                                                : 'bg-[var(--text-tertiary)]/30 hover:bg-[var(--text-tertiary)]'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${currentStep === 0
                                            ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
                                            : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                        }`}
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-all"
                                >
                                    {currentStep === steps.length - 1 ? 'Get started' : 'Next'}
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
