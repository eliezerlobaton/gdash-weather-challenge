import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/spinner'
import { Header } from '@/components/layout/Header'

export function MainLayout() {
    const { isAuthenticated, loading } = useAuth()
    const hasToken = isAuthenticated || !!localStorage.getItem('token')

    console.log('MainLayout check:', { isAuthenticated, hasToken, loading })

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Spinner className="size-8" />
            </div>
        )
    }

    if (!hasToken) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    )
}
