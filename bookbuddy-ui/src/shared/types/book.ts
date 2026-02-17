export type BookHit = {
    id: string
    title: string
    authors: string
    thumbnail?: string
}

export type LibraryStatus = 'unread' | 'reading' | 'completed'

export type LibraryBook = {
    id: string
    google_id: string
    title: string
    authors: string
    thumbnail?: string
    status: LibraryStatus
    notes?: string
    added_date?: string
}
