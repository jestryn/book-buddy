import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal, Plus, Check } from 'lucide-react'
import type { BookHit } from '../../../shared/types/book' // '@/types/book' or relative: ../types/book

export function ResultCard({
                               book,
                               saved,
                               onAdd,
                           }: {
    book: BookHit
    saved: boolean
    onAdd: () => void
}) {
    return (
        <article className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            <div className="flex gap-3 p-3">
                <div className="w-22 h-32 aspect-auto shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {book.thumbnail
                        ? <img src={book.thumbnail} alt="" className="h-full w-full object-cover" />
                        : <div className="h-full w-full grid place-items-center text-zinc-400 text-xs">No Cover</div>}
                </div>

                <div className="min-w-0 flex-1">
                    {/* header row: title + actions */}
                    <div className="flex items-start gap-2">
                        <h3 className="min-w-0 flex-1 font-semibold leading-tight truncate">
                            {book.title}
                        </h3>

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
                                    className="min-w-40 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-lg text-zinc-900 dark:text-zinc-100"
                                >
                                    <DropdownMenu.Item
                                        onSelect={(e) => { e.preventDefault(); if (!saved) onAdd() }}
                                        className={[
                                            'group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm',
                                            saved
                                                ? 'opacity-60 cursor-not-allowed'
                                                : 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        ].join(' ')}
                                        disabled={saved}
                                    >
                                        {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                        {saved ? 'Already in Library' : 'Add to Library'}
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    </div>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{book.authors}</p>
                    <div className="mt-2 text-xs text-zinc-500">Placeholder Stats</div>
                </div>
            </div>
        </article>
    )
}
