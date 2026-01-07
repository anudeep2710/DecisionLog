"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, Menu, X, Sun, Moon, LayoutDashboard } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function Navbar() {
    const [user, setUser] = useState<any>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const { theme, toggleTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
        // Check localStorage for user
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }

        // Listen for storage changes (login/logout from other tabs)
        const handleStorage = () => {
            const savedUser = localStorage.getItem('user')
            setUser(savedUser ? JSON.parse(savedUser) : null)
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        router.push('/login')
    }

    const NavLink = ({ href, children, icon: Icon }: { href: string, children: React.ReactNode, icon?: any }) => {
        const isActive = pathname === href
        return (
            <Link
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${isActive
                        ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
            >
                {Icon && <Icon size={16} />}
                {children}
            </Link>
        )
    }

    return (
        <nav className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-default)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-12">
                    {/* Left: Brand + Nav */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-6 h-6 bg-[var(--text-primary)] rounded flex items-center justify-center">
                                <span className="text-[var(--bg-primary)] font-bold text-xs">D</span>
                            </div>
                            <span className="text-sm font-semibold text-[var(--text-primary)] hidden sm:block">
                                DecisionLog
                            </span>
                        </Link>

                        {user && (
                            <div className="hidden md:flex items-center gap-1 ml-2">
                                <NavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                            </div>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle - only show when mounted to avoid hydration mismatch */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            </button>
                        )}

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-2">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-secondary)]">
                                        <div className="w-6 h-6 rounded-full bg-[var(--accent-blue)] flex items-center justify-center">
                                            <span className="text-white text-xs font-medium">
                                                {user.email?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="max-w-[120px] truncate hidden lg:block">
                                            {user.user_metadata?.full_name || user.email}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-red)]/10 hover:text-[var(--accent-red)] transition-colors"
                                    >
                                        <LogOut size={15} />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink href="/login">Sign in</NavLink>
                                    <Link
                                        href="/register"
                                        className="btn-primary text-sm"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[var(--bg-primary)] border-t border-[var(--border-default)]">
                    <div className="px-4 py-3 space-y-1">
                        {user ? (
                            <>
                                <div className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)]">
                                    <div className="w-6 h-6 rounded-full bg-[var(--accent-blue)] flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="truncate">
                                        {user.user_metadata?.full_name || user.email}
                                    </span>
                                </div>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <LayoutDashboard size={16} />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsOpen(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="block px-3 py-2 rounded-md text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    className="block px-3 py-2 rounded-md text-sm text-center btn-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
