import {BookText} from "lucide-react";
import {ThemeToggle} from "./ThemeToggle.tsx";
import {applyTheme, getTheme, setTheme, type Theme} from "../../theme.ts";
import {useEffect, useState} from "react";
import type { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string, children?: ReactNode }) {
    const [theme, setThemeSel] = useTheme()
    return (
        <header className="sticky top-0 z-40 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
                <BookText className="h-6 w-6" aria-hidden />
                <h1 className="text-lg font-semibold tracking-tight">BookBuddy • {title}</h1>
                {children ? <div className="ml-2">{children}</div> : null}
                <div className="ml-auto">
                    <ThemeToggle value={theme} onChange={setThemeSel} />
                </div>
            </div>
        </header>
    )
}

/* -------- hooks -------- */
function useTheme(): [Theme, (t: Theme) => void] {
    const [theme, set] = useState<Theme>(getTheme())
    useEffect(() => applyTheme(theme), [theme])
    return [theme, (t) => { set(t); setTheme(t) }]
}
