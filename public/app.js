document.getElementById('bookForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const title = document.getElementById('title').value
  const author = document.getElementById('author').value
  const status = document.getElementById('status').value

  await fetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, status })
  })

  loadBooks()
})

async function loadBooks() {
  const res = await fetch('/api/books')
  const books = await res.json()
  const list = document.getElementById('bookList')
  list.innerHTML = ''
  books.forEach((book) => {
    const div = document.createElement('div')
    div.textContent = `${book.title} by ${book.author} [${book.status}]`
    list.appendChild(div)
  })
}

loadBooks()
