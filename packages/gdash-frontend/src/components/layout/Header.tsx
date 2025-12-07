import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, Cloud, Star, LayoutDashboard, Menu, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'
import { toast } from 'sonner'

export function Header() {
    const { user, logout, deleteAccount } = useAuth()
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const isActive = (path: string) => location.pathname === path

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
    const closeMenu = () => setIsMenuOpen(false)

    const handleDeleteAccount = () => {
        toast.warning('Tem certeza que deseja excluir sua conta?', {
            description: 'Esta ação não pode ser desfeita.',
            action: {
                label: 'Excluir',
                onClick: async () => {
                    try {
                        await deleteAccount()
                        toast.success('Conta excluída com sucesso.')
                    } catch (error) {
                        toast.error('Erro ao excluir conta.')
                    }
                },
            },
            cancel: {
                label: 'Cancelar',
                onClick: () => { },
            },
        })
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-white dark:bg-gray-950 text-foreground">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80" onClick={closeMenu}>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                                <Cloud className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold text-foreground">
                                Weather<span className="font-light">Dash</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            <Link
                                to="/dashboard"
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                    isActive('/dashboard')
                                        ? "bg-accent text-accent-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                )}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link
                                to="/starwars"
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                    isActive('/starwars')
                                        ? "bg-accent text-accent-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                )}
                            >
                                <Star className="h-4 w-4" />
                                Star Wars
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-medium text-foreground">
                                {user?.name || 'Usuário'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {user?.email}
                            </span>
                        </div>
                        <div className="h-8 w-[1px] bg-border hidden md:block" />

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            <ModeToggle />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDeleteAccount}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Excluir Conta"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sair
                            </Button>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-white dark:bg-gray-950 absolute w-full left-0 top-16 shadow-lg animate-in slide-in-from-top-5">
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/dashboard"
                                onClick={closeMenu}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                                    isActive('/dashboard')
                                        ? "bg-accent text-accent-foreground"
                                        : "text-foreground hover:bg-accent/50"
                                )}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link
                                to="/starwars"
                                onClick={closeMenu}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                                    isActive('/starwars')
                                        ? "bg-accent text-accent-foreground"
                                        : "text-foreground hover:bg-accent/50"
                                )}
                            >
                                <Star className="h-4 w-4" />
                                Star Wars
                            </Link>
                        </div>

                        <div className="border-t border-border pt-4">
                            <div className="flex items-center justify-between px-4 mb-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-foreground">
                                        {user?.name || 'Usuário'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {user?.email}
                                    </span>
                                </div>
                                <ModeToggle />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                        handleDeleteAccount()
                                        closeMenu()
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir Conta
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        logout()
                                        closeMenu()
                                    }}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sair
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
