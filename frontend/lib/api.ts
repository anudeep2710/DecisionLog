// API configuration for local development and deployed environments.
// Set NEXT_PUBLIC_API_URL to the backend's `/api` URL on Vercel.
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
export const API_BASE_URL = (
    configuredApiUrl || 'http://localhost:8000'
).replace(/\/+$/, '')

export const getApiUrl = (path: string) => {
    // Remove leading slash if present for consistency
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${API_BASE_URL}/${cleanPath}`
}
