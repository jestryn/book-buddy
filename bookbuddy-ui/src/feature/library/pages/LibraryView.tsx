import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { LibraryCard } from '../components/LibraryCard'
import { LibraryBookModal } from '../components/LibraryBookModal'
import type { GoogleBookMetadata, LibraryBook, LibraryStatus } from '../../../shared/types/book'

function metadataFromBook(book: LibraryBook): GoogleBookMetadata {
    return {
        title: book.title,
        description: book.description,
        publisher: book.publisher,
        publishedDate: book.published_date,
        pageCount: book.page_count,
        isbn10: book.isbn10,
        isbn13: book.isbn13,
        languageCodes: book.language_codes || [],
        categories: book.categories || [],
        formats: book.formats || [],
        previewLink: book.preview_link,
    }
}

export default function LibraryView() {
    const [books, setBooks] = useState<LibraryBook[]>([])
    const [q, setQ] = useState('')
    const [status, setStatus] = useState<'all' | LibraryStatus>('all')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [savePending, setSavePending] = useState(false)

    const [draftNotes, setDraftNotes] = useState('')
    const [draftRating, setDraftRating] = useState('')
    const [draftProgress, setDraftProgress] = useState(0)

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

    async function updateBook(id: string, payload: Record<string, unknown>) {
        const res = await fetch(`/api/library/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Update failed')
        await loadLibrary()
    }

    async function updateStatus(id: string, nextStatus: LibraryStatus) {
        await updateBook(id, { status: nextStatus })
    }

    async function removeBook(id: string) {
        const res = await fetch(`/api/library/${id}`, { method: 'DELETE' })
        if (!res.ok && res.status !== 204) throw new Error('Delete failed')
        await loadLibrary()
    }

    function openBookDetails(book: LibraryBook) {
        setSelectedBook(book)
        setDraftNotes(book.notes || '')
        setDraftRating(book.rating !== null && book.rating !== undefined ? String(book.rating) : '')
        setDraftProgress(book.progress || 0)
        setModalOpen(true)
    }

    async function saveBookDetails() {
        if (!selectedBook) return
        setSavePending(true)
        try {
            await updateBook(selectedBook.id, {
                notes: draftNotes.trim(),
                rating: draftRating ? Number(draftRating) : null,
                progress: draftProgress,
            })
            setSelectedBook((prev) => prev ? {
                ...prev,
                notes: draftNotes.trim(),
                rating: draftRating ? Number(draftRating) : null,
                progress: draftProgress,
            } : prev)
            setModalOpen(false)
        } catch {
            setError('Could not save book details.')
        } finally {
            setSavePending(false)
        }
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
                        className="h-[50px] w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 pr-10 outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'all' | LibraryStatus)}
                    className="h-[50px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 outline-none focus:ring-2 focus:ring-indigo-500/50"
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
                        onOpen={() => openBookDetails(book)}
                        onSetStatus={async (next) => {
                            try {
                                await updateStatus(book.id, next)
                            } catch {
                                setError('Could not update book status.')
                            }
                        }}
                        onDelete={async () => {
                            try {
                                await removeBook(book.id)
                            } catch {
                                setError('Could not delete book.')
                            }
                        }}
                    />
                ))}
            </section>

            <LibraryBookModal
                open={modalOpen}
                book={selectedBook}
                metadata={selectedBook ? metadataFromBook(selectedBook) : null}
                notes={draftNotes}
                rating={draftRating}
                progress={draftProgress}
                saving={savePending}
                onClose={() => setModalOpen(false)}
                onNotesChange={setDraftNotes}
                onRatingChange={setDraftRating}
                onProgressChange={setDraftProgress}
                onSave={saveBookDetails}
            />
        </main>
    )
}
