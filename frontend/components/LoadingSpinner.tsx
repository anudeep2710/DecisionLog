export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-500">Loading...</p>
        </div>
    )
}
