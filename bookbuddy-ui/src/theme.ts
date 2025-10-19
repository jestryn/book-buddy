export type Theme = 'light' | 'dark' | 'auto'
const KEY = 'bb-theme'

export function getTheme(): Theme {
    return (localStorage.getItem(KEY) as Theme) || 'auto'
}

export function applyTheme(t: Theme) {
    const html = document.documentElement
    html.classList.remove('dark')
    if (t === 'dark') html.classList.add('dark')
    if (t === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) html.classList.add('dark')
    }
}

export function setTheme(t: Theme) {
    localStorage.setItem(KEY, t)
    applyTheme(t)
}

export function initTheme() {
    applyTheme(getTheme())
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getTheme() === 'auto') applyTheme('auto')
    })
}
