import OnlineSearchView from './feature/search/pages/OnlineSearchView'
import LibraryView from './feature/library/pages/LibraryView'
import { PageHeader } from './shared/components/PageHeader'
import { useState } from 'react'

export default function App() {
    const [page, setPage] = useState<'library' | 'search'>('library')

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <PageHeader title={page === 'library' ? 'Library' : 'Online Search'}>
                <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
                    <button
                        type="button"
                        onClick={() => setPage('library')}
                        className={[
                            'rounded-md px-3 py-1.5 text-sm transition',
                            page === 'library'
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        ].join(' ')}
                    >
                        Library
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage('search')}
                        className={[
                            'rounded-md px-3 py-1.5 text-sm transition',
                            page === 'search'
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        ].join(' ')}
                    >
                        Search
                    </button>
                </div>
            </PageHeader>

            {page === 'library' ? <LibraryView /> : <OnlineSearchView />}
        </div>
    )
}
