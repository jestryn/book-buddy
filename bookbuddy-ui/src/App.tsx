import OnlineSearchView from './feature/search/pages/OnlineSearchView'
import LibraryView from './feature/library/pages/LibraryView'
import { PageHeader } from './shared/components/PageHeader'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'

export default function App() {
    const location = useLocation()
    const pageTitle = location.pathname.startsWith('/search') ? 'Online Search' : 'Library'

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <PageHeader title={pageTitle}>
                <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
                    <NavLink
                        to="/library"
                        className={({ isActive }) => [
                            'rounded-md px-3 py-1.5 text-sm transition',
                            isActive
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        ].join(' ')}
                    >
                        Library
                    </NavLink>
                    <NavLink
                        to="/search"
                        className={({ isActive }) => [
                            'rounded-md px-3 py-1.5 text-sm transition',
                            isActive
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        ].join(' ')}
                    >
                        Search
                    </NavLink>
                </div>
            </PageHeader>

            <Routes>
                <Route path="/" element={<Navigate to="/library" replace />} />
                <Route path="/library" element={<LibraryView />} />
                <Route path="/search" element={<OnlineSearchView />} />
                <Route path="*" element={<Navigate to="/library" replace />} />
            </Routes>
        </div>
    )
}
