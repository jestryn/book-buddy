import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import type { Theme } from '../../theme'

const options: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor },
]

function iconForTheme(theme: Theme) {
    return options.find((option) => option.value === theme)?.icon || Monitor
}

export function ThemeToggle({ value, onChange }: { value: Theme; onChange: (t: Theme) => void }) {
    const CurrentIcon = iconForTheme(value)

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    aria-label="Theme menu"
                >
                    <CurrentIcon className="h-4 w-4" />
                    <span className="hidden sm:inline capitalize">{value}</span>
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    side="bottom"
                    align="end"
                    className="min-w-36 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-lg text-zinc-900 dark:text-zinc-100"
                >
                    {options.map(({ value: next, label, icon: Icon }) => (
                        <DropdownMenu.Item
                            key={next}
                            onSelect={(e) => {
                                e.preventDefault()
                                onChange(next)
                            }}
                            className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <span className="inline-flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {label}
                            </span>
                            {value === next ? <Check className="h-4 w-4" /> : null}
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}
