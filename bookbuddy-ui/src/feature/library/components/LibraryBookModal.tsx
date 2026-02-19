import { X } from 'lucide-react'
import type { GoogleBookMetadata, LibraryBook } from '../../../shared/types/book'

function field(value?: string | number | null) {
    if (value === undefined || value === null || value === '') return 'Not available'
    return String(value)
}

function listField(values: string[]) {
    if (!values.length) return 'Not available'
    return values.join(', ')
}

export function LibraryBookModal({
    open,
    book,
    metadata,
    notes,
    rating,
    progress,
    saving,
    onClose,
    onNotesChange,
    onRatingChange,
    onProgressChange,
    onSave,
}: {
    open: boolean
    book: LibraryBook | null
    metadata: GoogleBookMetadata | null
    notes: string
    rating: string
    progress: number
    saving: boolean
    onClose: () => void
    onNotesChange: (value: string) => void
    onRatingChange: (value: string) => void
    onProgressChange: (value: number) => void
    onSave: () => Promise<void>
}) {
    if (!open || !book) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                className="absolute inset-0 bg-black/45"
                onClick={onClose}
                aria-label="Close details modal"
            />

            <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl">
                <div className="flex items-start gap-3 border-b border-zinc-200 dark:border-zinc-800 p-4">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold truncate">{book.title}</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{book.authors}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-auto rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[75vh] overflow-y-auto p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-zinc-500">ISBN 10:</span> {field(metadata?.isbn10)}</div>
                        <div><span className="text-zinc-500">ISBN 13:</span> {field(metadata?.isbn13)}</div>
                        <div><span className="text-zinc-500">Languages:</span> {listField(metadata?.languageCodes || [])}</div>
                        <div><span className="text-zinc-500">Formats:</span> {listField(metadata?.formats || [])}</div>
                        <div><span className="text-zinc-500">Categories:</span> {listField(metadata?.categories || [])}</div>
                        <div><span className="text-zinc-500">Publisher:</span> {field(metadata?.publisher)}</div>
                        <div><span className="text-zinc-500">Published:</span> {field(metadata?.publishedDate)}</div>
                        <div><span className="text-zinc-500">Pages:</span> {field(metadata?.pageCount)}</div>
                    </div>

                    <div className="text-sm">
                        <p className="text-zinc-500 mb-1">Description</p>
                        <p className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 leading-relaxed">
                            {field(metadata?.description)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="text-sm text-zinc-500">
                            Rating
                            <select
                                value={rating}
                                onChange={(e) => onRatingChange(e.target.value)}
                                className="mt-1 h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                <option value="">None</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </label>
                        <label className="text-sm text-zinc-500">
                            Progress (%)
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={progress}
                                onChange={(e) => {
                                    const n = Number(e.target.value)
                                    const bounded = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0
                                    onProgressChange(bounded)
                                }}
                                className="mt-1 h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </label>
                        <div className="text-sm text-zinc-500">
                            Added
                            <p className="mt-1 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 flex items-center">
                                {book.added_date || 'Unknown'}
                            </p>
                        </div>
                    </div>

                    <label className="text-sm text-zinc-500 block">
                        Notes
                        <textarea
                            value={notes}
                            onChange={(e) => onNotesChange(e.target.value)}
                            rows={5}
                            placeholder="Your notes for this book..."
                            className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none resize-y focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </label>
                </div>

                <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 p-4">
                    {metadata?.previewLink ? (
                        <a
                            href={metadata.previewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mr-auto rounded-lg px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Open Preview
                        </a>
                    ) : null}
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={() => { void onSave() }}
                        disabled={saving}
                        className="rounded-lg px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-70"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}
