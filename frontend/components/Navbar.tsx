"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { LogOut, Menu, X, BookOpen } from 'lucide-react'

export default function Navbar() {
    const [user, setUser] = useState<any>(null)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <nav className="bg-white/80 backdrop-blur-sm border-b-2 border-black sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <div className="bg-black text-white p-1.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                            <BookOpen size={20} />
                        </div>
                        <Link href="/" className="text-xl font-bold text-black tracking-tight">
                            DecisionLog
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {user ? (
                                <>
                                    <Link href="/dashboard" className="text-gray-600 hover:text-black hover:underline decoration-2 underline-offset-4 px-3 py-2 text-sm font-bold transition-all">Dashboard</Link>
                                    <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 px-3 py-2 text-sm font-bold flex items-center gap-2 transition-colors">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-black font-medium hover:underline decoration-2 underline-offset-4 px-3 py-2">Login</Link>
                                    <Link href="/register" className="sketch-btn-primary text-sm">Get Started</Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-black p-2 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="md:hidden bg-white border-b-2 border-black">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {user ? (
                            <>
                                <Link href="/dashboard" className="text-black block px-3 py-2 font-bold hover:bg-gray-50">Dashboard</Link>
                                <button onClick={handleLogout} className="text-red-600 block w-full text-left px-3 py-2 font-bold hover:bg-gray-50">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-black block px-3 py-2 font-bold hover:bg-gray-50">Login</Link>
                                <Link href="/register" className="text-black block px-3 py-2 font-bold hover:bg-gray-50">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
