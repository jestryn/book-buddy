import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import type { LibraryBook, LibraryStatus } from '../../../shared/types/book'

const statusOptions: LibraryStatus[] = ['unread', 'reading', 'completed']

export function LibraryCard({
    book,
    onOpen,
    onSetStatus,
    onDelete,
}: {
    book: LibraryBook
    onOpen: () => void
    onSetStatus: (status: LibraryStatus) => Promise<void>
    onDelete: () => Promise<void>
}) {
    return (
        <article className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            <div className="flex gap-3 p-3">
                <button
                    type="button"
                    onClick={onOpen}
                    className="flex min-w-0 flex-1 gap-3 text-left rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition p-1 -m-1"
                >
                    <div className="w-22 h-32 aspect-auto shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {book.thumbnail
                            ? <img src={book.thumbnail} alt="" className="h-full w-full object-cover" />
                            : <div className="h-full w-full grid place-items-center text-zinc-400 text-xs">No Cover</div>}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold leading-tight line-clamp-2">{book.title}</h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 truncate">{book.authors}</p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                            {book.started_reading_date ? (
                                <span className="text-xs text-zinc-500">Started {book.started_reading_date}</span>
                            ) : null}
                            {book.finished_reading_date ? (
                                <span className="text-xs text-zinc-500">Finished {book.finished_reading_date}</span>
                            ) : null}
                            <span
                                className={[
                                    'rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
                                    book.status === 'completed' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                                    book.status === 'reading' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                                    book.status === 'unread' && 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200',
                                ].filter(Boolean).join(' ')}
                            >
                                {book.status}
                            </span>
                        </div>
                    </div>
                </button>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button
                            type="button"
                            className="shrink-0 inline-flex items-center justify-center rounded-md p-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                            aria-label="Open actions"
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            side="bottom"
                            align="end"
                            className="min-w-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-lg text-zinc-900 dark:text-zinc-100"
                        >
                            {statusOptions.map((status) => (
                                <DropdownMenu.Item
                                    key={status}
                                    onSelect={async (e) => {
                                        e.preventDefault()
                                        if (status !== book.status) await onSetStatus(status)
                                    }}
                                    className={[
                                        'group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm capitalize',
                                        status === book.status
                                            ? 'bg-zinc-100 dark:bg-zinc-800 cursor-default'
                                            : 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800',
                                    ].join(' ')}
                                >
                                    Mark as {status}
                                </DropdownMenu.Item>
                            ))}
                            <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                            <DropdownMenu.Item
                                onSelect={async (e) => {
                                    e.preventDefault()
                                    await onDelete()
                                }}
                                className="group flex w-full items-center rounded-lg px-3 py-2 text-sm cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                            >
                                Delete from Library
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </article>
    )
}
