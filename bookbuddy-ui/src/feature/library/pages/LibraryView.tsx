import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { LibraryCard } from '../components/LibraryCard'
import type { LibraryBook, LibraryStatus } from '../../../shared/types/book'

export default function LibraryView() {
    const [books, setBooks] = useState<LibraryBook[]>([])
    const [q, setQ] = useState('')
    const [status, setStatus] = useState<'all' | LibraryStatus>('all')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function loadLibrary() {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/library')
            if (!res.ok) throw new Error('Failed to load library')
            const data = await res.json()
            setBooks(Array.isArray(data) ? data : [])
        } catch {
            setError('Could not load your library.')
        } finally {
            setLoading(false)
        }
    }

    async function updateStatus(id: string, nextStatus: LibraryStatus) {
        const res = await fetch(`/api/library/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus }),
        })
        if (!res.ok) throw new Error('Update failed')
        await loadLibrary()
    }

    async function removeBook(id: string) {
        const res = await fetch(`/api/library/${id}`, { method: 'DELETE' })
        if (!res.ok && res.status !== 204) throw new Error('Delete failed')
        await loadLibrary()
    }

    useEffect(() => { void loadLibrary() }, [])

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase()
        return books.filter((book) => {
            const statusMatch = status === 'all' || book.status === status
            if (!statusMatch) return false
            if (!query) return true
            return book.title.toLowerCase().includes(query) || book.authors.toLowerCase().includes(query)
        })
    }, [books, q, status])

    return (
        <main className="mx-auto max-w-6xl px-4 py-6">
            <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Find books in your library…"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'all' | LibraryStatus)}
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                    <option value="all">All statuses</option>
                    <option value="unread">Unread</option>
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                </select>
                <span className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300">
                    {filtered.length} {filtered.length === 1 ? 'book' : 'books'}
                </span>
            </section>

            {loading && <p className="mt-6 text-sm text-zinc-500">Loading library…</p>}
            {error && <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {!loading && !error && filtered.length === 0 && (
                    <div className="col-span-full text-sm text-zinc-500">
                        No books match your current filters.
                    </div>
                )}
                {filtered.map((book) => (
                    <LibraryCard
                        key={book.id}
                        book={book}
                        onSetStatus={async (next) => { await updateStatus(book.id, next) }}
                        onDelete={async () => { await removeBook(book.id) }}
                    />
                ))}
            </section>
        </main>
    )
}
