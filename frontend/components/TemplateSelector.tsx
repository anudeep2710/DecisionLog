"use client"
import { useState } from 'react'
import { FileText, ChevronDown, Check } from 'lucide-react'

export interface DecisionTemplate {
    id: string
    name: string
    icon: string
    description: string
    prefill: {
        title: string
        context: string
        choice_made: string
        confidence_level: number
    }
}

const templates: DecisionTemplate[] = [
    {
        id: 'career',
        name: 'Career Decision',
        icon: '💼',
        description: 'Job offers, career changes, promotions',
        prefill: {
            title: '',
            context: 'Current situation:\n\nOptions being considered:\n1. \n2. \n\nPros and cons:\n',
            choice_made: '',
            confidence_level: 3
        }
    },
    {
        id: 'purchase',
        name: 'Major Purchase',
        icon: '🛒',
        description: 'Big ticket items, investments',
        prefill: {
            title: '',
            context: 'Item/Investment:\n\nBudget: $\n\nResearch done:\n\nAlternatives considered:\n',
            choice_made: '',
            confidence_level: 3
        }
    },
    {
        id: 'tech',
        name: 'Tech Stack Choice',
        icon: '💻',
        description: 'Frameworks, tools, architecture',
        prefill: {
            title: '',
            context: 'Problem to solve:\n\nOptions evaluated:\n1. \n2. \n\nCriteria:\n- Performance:\n- Scalability:\n- Learning curve:\n',
            choice_made: '',
            confidence_level: 3
        }
    },
    {
        id: 'hire',
        name: 'Hiring Decision',
        icon: '👥',
        description: 'Team hiring, contractors',
        prefill: {
            title: '',
            context: 'Role:\n\nCandidates:\n1. \n2. \n\nKey requirements:\n',
            choice_made: '',
            confidence_level: 3
        }
    },
    {
        id: 'project',
        name: 'Project Direction',
        icon: '🎯',
        description: 'Features, priorities, pivots',
        prefill: {
            title: '',
            context: 'Current state:\n\nGoal:\n\nOptions:\n1. \n2. \n\nConstraints:\n',
            choice_made: '',
            confidence_level: 3
        }
    },
    {
        id: 'personal',
        name: 'Personal Life',
        icon: '🏠',
        description: 'Relationships, lifestyle, health',
        prefill: {
            title: '',
            context: 'Situation:\n\nWhat I want:\n\nWhat\'s holding me back:\n',
            choice_made: '',
            confidence_level: 3
        }
    }
]

interface Props {
    onSelectTemplate: (template: DecisionTemplate) => void
}

export default function TemplateSelector({ onSelectTemplate }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const handleSelect = (template: DecisionTemplate) => {
        setSelectedId(template.id)
        onSelectTemplate(template)
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="btn-secondary inline-flex items-center gap-2 text-sm"
            >
                <FileText size={16} />
                Use Template
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-72 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg shadow-lg z-20 overflow-hidden">
                        <div className="p-2 border-b border-[var(--border-default)]">
                            <p className="text-xs text-[var(--text-tertiary)] px-2">Choose a template to get started</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {templates.map(template => (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => handleSelect(template)}
                                    className={`w-full flex items-start gap-3 p-3 hover:bg-[var(--bg-hover)] transition-colors text-left ${selectedId === template.id ? 'bg-[var(--bg-tertiary)]' : ''
                                        }`}
                                >
                                    <span className="text-xl">{template.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-[var(--text-primary)]">
                                                {template.name}
                                            </span>
                                            {selectedId === template.id && (
                                                <Check size={14} className="text-[var(--accent-green)]" />
                                            )}
                                        </div>
                                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                                            {template.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
