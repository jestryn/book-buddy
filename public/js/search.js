import './bs-color-mode.js';

const searchInput = document.getElementById('searchInput')
const searchButton = document.getElementById('searchButton')
const searchResults = document.getElementById('searchResults')

searchInput.focus()

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    const query = searchInput.value.trim()
    if (query) searchBooks(query)
  }
})

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim()
  if (query) searchBooks(query)
})

async function searchBooks(query) {
  console.debug(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
  const data = await res.json()
  displaySearchResults(data.items || [])
}

function displaySearchResults(books) {
  searchResults.innerHTML = ''
  if (books.length === 0) {
    searchResults.innerHTML = '<p class="text-muted">No results found.</p>'
    return
  }

  books.forEach(book => {
    const info = book.volumeInfo
    const id = book.id
    const title = info.title || 'No title'
    const authors = info.authors ? info.authors.join(', ') : 'Unknown'
    const thumbnail = info.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/128x193?text=No+Cover'

    const col = document.createElement('div')
    col.className = 'col'

    const card = document.createElement('div')
    card.className = 'card h-100 border-0 shadow-sm'

    const row = document.createElement('div')
    row.className = 'row g-0'

    const imgCol = document.createElement('div')
    imgCol.className = 'col-4'

    const img = document.createElement('img')
    img.src = thumbnail
    img.className = 'img-fluid rounded-start h-100 object-fit-cover'
    img.alt = title

    imgCol.appendChild(img)

    const bodyCol = document.createElement('div')
    bodyCol.className = 'col-8'

    const body = document.createElement('div')
    body.className = 'card-body py-2 px-3 d-flex flex-column justify-content-center'

    const titleEl = document.createElement('h6')
    titleEl.className = 'card-title fw-bold mb-1'
    titleEl.textContent = title

    const authorEl = document.createElement('p')
    authorEl.className = 'card-text small text-muted mb-1'
    authorEl.textContent = authors

    const statsEl = document.createElement('div')
    statsEl.className = 'text-muted small'
    statsEl.innerHTML = '<i class="bi bi-bar-chart"></i> Placeholder Stats'

    body.appendChild(titleEl)
    body.appendChild(authorEl)
    body.appendChild(statsEl)

    bodyCol.appendChild(body)

    row.appendChild(imgCol)
    row.appendChild(bodyCol)

    card.appendChild(row)
    col.appendChild(card)
    searchResults.appendChild(col)
  })
}



function saveToLibrary(book) {
  // Placeholder – we’ll implement this part later!
  console.log('Saving to library:', book)
}
