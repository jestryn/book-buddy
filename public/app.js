document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookForm')
  const filter = document.getElementById('filterStatus')
  const list = document.getElementById('bookList')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(form)
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

    form.reset()
    await loadBooks()
  })

  filter.addEventListener('change', () => loadBooks(filter.value))

  async function loadBooks(statusFilter = 'all') {
    const res = await fetch('/api/books')
    const books = await res.json()
    list.innerHTML = ''

    const filtered = statusFilter === 'all'
      ? books
      : books.filter(b => b.status === statusFilter)

    if (filtered.length === 0) {
      list.innerHTML = '<p class="text-muted">No books to show.</p>'
      return
    }

    const row = document.createElement('div')
    row.className = 'row row-cols-1 row-cols-md-2 g-3'

    filtered.forEach(book => {
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

      body.append(title, author, badge)
      card.appendChild(body)
      col.appendChild(card)
      row.appendChild(col)
    })

    list.appendChild(row)
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
})
