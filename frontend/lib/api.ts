// API configuration for both local development and production
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const getApiUrl = (path: string) => {
    // Remove leading slash if present for consistency
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${API_BASE_URL}/${cleanPath}`
}
