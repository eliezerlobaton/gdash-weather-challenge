import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <div className="flex items-center gap-2 border rounded-md p-1">
            <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-sm transition-all ${theme === 'light' ? 'bg-secondary text-secondary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="Light Mode"
            >
                <Sun className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-sm transition-all ${theme === 'dark' ? 'bg-secondary text-secondary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="Dark Mode"
            >
                <Moon className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`p-2 rounded-sm transition-all ${theme === 'system' ? 'bg-secondary text-secondary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="System Mode"
            >
                <span className="text-xs font-bold">Sys</span>
            </button>
        </div>
    )
}
