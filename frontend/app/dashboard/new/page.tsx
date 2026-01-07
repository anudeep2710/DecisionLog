import { Suspense } from 'react'
import DecisionForm from '@/components/DecisionForm'

export default function NewDecisionPage() {
    return (
        <div className="min-h-[calc(100vh-48px)] py-8 px-4 sm:px-6">
            <Suspense fallback={<div className="text-center p-8">Loading form...</div>}>
                <DecisionForm />
            </Suspense>
        </div>
    )
}
