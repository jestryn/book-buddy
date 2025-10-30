import {Moon, Sun, Monitor} from 'lucide-react'
import type {Theme} from '../../theme' // if you don’t have path aliases for '@/theme', change to relative: ../../theme

export function ThemeToggle({value, onChange}: { value: Theme; onChange: (t: Theme) => void }) {
    const btn = "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
    const active = "border-zinc-300 dark:border-zinc-700"
    return (
        <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-800 p-1">
            <button type="button" className={`${btn} ${value === 'light' ? active : ''}`}
                    onClick={() => onChange('light')}>
                <Sun className="h-4 w-4"/> <span className="hidden sm:inline">Light</span>
            </button>
            <button type="button" className={`${btn} ${value === 'dark' ? active : ''}`}
                    onClick={() => onChange('dark')}>
                <Moon className="h-4 w-4"/> <span className="hidden sm:inline">Dark</span>
            </button>
            <button type="button" className={`${btn} ${value === 'auto' ? active : ''}`}
                    onClick={() => onChange('auto')}>
                <Monitor className="h-4 w-4"/> <span className="hidden sm:inline">Auto</span>
            </button>
        </div>
    )
}
