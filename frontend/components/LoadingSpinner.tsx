export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]"
                        style={{
                            animation: 'bounce 1s ease-in-out infinite',
                            animationDelay: `${i * 0.15}s`
                        }}
                    />
                ))}
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">Loading...</p>

            <style jsx>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-8px); }
                }
            `}</style>
        </div>
    )
}
