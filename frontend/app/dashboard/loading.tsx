import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white" style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
        }}>
            <div className="sketch-card p-8 flex flex-col items-center gap-4">
                <LoadingSpinner />
                <p className="font-bold text-black uppercase tracking-widest text-sm animate-pulse">Loading Dashboard...</p>
            </div>
        </div>
    )
}
