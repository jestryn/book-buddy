import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { ResultCard } from '../components/ResultCard'   // @/components/ResultCard or relative import
import type { BookHit } from '../../../shared/types/book'           // @/types/book or relative import

export default function OnlineSearchView() {
    const [q, setQ] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [results, setResults] = useState<BookHit[]>([])
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        ;(async () => {
            try {
                const res = await fetch('/api/library/google_ids')
                if (res.ok) {
                    const ids: string[] = await res.json()
                    setSavedIds(new Set(ids))
                }
            } catch { /* non-blocking */ }
        })()
    }, [])

    async function searchBooks(query: string) {
        if (!query) return
        setLoading(true); setError(null)
        try {
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
            const res = await fetch(url)
            const data = await res.json()
            const items = Array.isArray(data.items) ? data.items : []
            setResults(items.map((it: any) => {
                const info = it.volumeInfo || {}
                const img = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail
                return {
                    id: it.id,
                    title: info.title || 'Untitled',
                    authors: Array.isArray(info.authors) ? info.authors.join(', ') : (info.authors || 'Unknown'),
                    thumbnail: img?.replace('http://', 'https://'),
                } as BookHit
            }))
        } catch {
            setError('Something went wrong fetching results.')
        } finally {
            setLoading(false)
        }
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        searchBooks(q.trim())
    }

    async function saveToLibrary(book: BookHit) {
        const payload = {
            id: book.id,
            title: book.title,
            authors: book.authors,
            thumbnail: book.thumbnail,
        }
        try {
            const res = await fetch('/api/library', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                let msg = 'Could not add to library'
                try { const j = await res.json(); if (j?.error) msg = j.error } catch {}
                throw new Error(msg)
            }
            await res.json()
            setSavedIds(prev => new Set(prev).add(book.id))
            return true
        } catch (e) {
            console.error('Save failed:', e)
            alert('Could not add to library')
            return false
        }
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-6">
            <form onSubmit={onSubmit} className="flex items-stretch gap-2">
                <div className="relative flex-1">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search Google Books…"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                </div>
                <button type="submit" className="rounded-xl px-4 py-3 font-medium bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-600/90">
                    Search
                </button>
            </form>

            {loading && <p className="mt-6 text-sm text-zinc-500">Searching…</p>}
            {error && <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {!loading && !error && results.length === 0 && (
                    <div className="col-span-full text-sm text-zinc-500">
                        Try a query like “The Pragmatic Programmer”.
                    </div>
                )}
                {results.map(hit => (
                    <ResultCard
                        key={hit.id}
                        book={hit}
                        saved={savedIds.has(hit.id)}
                        onAdd={async () => { if (!savedIds.has(hit.id)) await saveToLibrary(hit) }}
                    />
                ))}
            </section>
        </main>
    )
}
