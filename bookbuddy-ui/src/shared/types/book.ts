export type BookHit = {
    id: string
    title: string
    authors: string
    thumbnail?: string
    description?: string
    publisher?: string
    published_date?: string
    page_count?: number
    isbn10?: string
    isbn13?: string
    language_codes: string[]
    categories: string[]
    formats: string[]
    preview_link?: string
}

export type LibraryStatus = 'unread' | 'reading' | 'completed'

export type LibraryBook = {
    id: string
    google_id: string
    title: string
    authors: string
    thumbnail?: string
    status: LibraryStatus
    notes: string
    rating: number | null
    progress: number
    added_date?: string
    description?: string
    publisher?: string
    published_date?: string
    page_count?: number
    isbn10?: string
    isbn13?: string
    language_codes: string[]
    categories: string[]
    formats: string[]
    preview_link?: string
}

export type GoogleBookMetadata = {
    title?: string
    subtitle?: string
    description?: string
    publisher?: string
    publishedDate?: string
    pageCount?: number
    isbn10?: string
    isbn13?: string
    languageCodes: string[]
    categories: string[]
    formats: string[]
    averageRating?: number
    ratingsCount?: number
    previewLink?: string
}
