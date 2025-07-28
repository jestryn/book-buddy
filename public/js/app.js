import './bs-color-mode.js';

document.addEventListener('DOMContentLoaded', () => {
  const bookForm = document.getElementById('bookForm')
  const bookList = document.getElementById('bookList')
  const filterStatus = document.getElementById('filterStatus')

  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(bookForm)
    const book = {
      title: formData.get('title'),
      author: formData.get('author'),
      status: formData.get('status')
    }

    await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    })

    bookForm.reset()
    await loadBooks()
  })

  filterStatus.addEventListener('change', () => loadBooks(filterStatus.value))

  async function loadBooks(statusFilter = 'all') {
    const res = await fetch('/api/books')
    const books = await res.json()
    bookList.innerHTML = ''

    const filteredBooks = statusFilter === 'all'
      ? books
      : books.filter(b => b.status === statusFilter)

    if (filteredBooks.length === 0) {
      bookList.innerHTML = '<p class="text-muted">No books to show.</p>'
      return
    }

    const row = document.createElement('div')
    row.className = 'row row-cols-1 row-cols-md-2 g-3'

    filteredBooks.forEach(book => {
      const col = document.createElement('div')
      col.className = 'col'

      const card = document.createElement('div')
      card.className = `card border-start border-4 shadow-sm ${statusColor(book.status)}`

      const body = document.createElement('div')
      body.className = 'card-body'

      const title = document.createElement('h5')
      title.className = 'card-title'
      title.textContent = book.title

      const author = document.createElement('p')
      author.className = 'card-text mb-1'
      author.innerHTML = `<strong>Author:</strong> ${book.author}`

      const badge = document.createElement('span')
      badge.className = `badge ${badgeColor(book.status)}`
      badge.textContent = capitalize(book.status)

      const deleteBtn = document.createElement('button')
      deleteBtn.className = 'btn btn-sm btn-outline-danger float-end'
      deleteBtn.textContent = 'Delete'
      deleteBtn.addEventListener('click', async () => {
        await deleteBook(book.id)
        await loadBooks(statusFilter)
      })

      body.appendChild(title)
      body.appendChild(author)
      body.appendChild(badge)
      body.appendChild(deleteBtn)
      card.appendChild(body)
      col.appendChild(card)
      row.appendChild(col)
    })

    bookList.appendChild(row)
  }

  async function deleteBook(id) {
    await fetch(`/api/books/${id}`, {
      method: 'DELETE'
    })
  }

  function statusColor(status) {
    switch (status) {
      case 'completed': return 'border-success'
      case 'reading': return 'border-warning'
      case 'unread': return 'border-secondary'
      default: return 'border-dark'
    }
  }

  function badgeColor(status) {
    switch (status) {
      case 'completed': return 'bg-success'
      case 'reading': return 'bg-warning text-dark'
      case 'unread': return 'bg-secondary'
      default: return 'bg-dark'
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  loadBooks()

  searchGoogleBooks('Clean Code')  // Just to test!

})


// test load

async function searchGoogleBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    console.debug('Google Books results:', data.items)
  } catch (err) {
    console.error('Error fetching from Google Books:', err)
  }
}
