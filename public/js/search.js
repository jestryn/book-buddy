import './bs-color-mode.js';

const searchInput = document.getElementById('searchInput')
const searchButton = document.getElementById('searchButton')
const searchResults = document.getElementById('searchResults')

searchInput.focus()

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    const query = searchInput.value.trim()
    if (query) searchLibrary(query)
  }
})

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim()
  if (query) searchLibrary(query)
})

async function searchLibrary(query) {
  console.debug(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
  const data = await res.json()
  displaySearchResults(data.items || [])
}

function displaySearchResults(library) {
  searchResults.innerHTML = ''
  if (library.length === 0) {
    searchResults.innerHTML = '<p class="text-muted">No results found.</p>'
    return
  }

  library.forEach(book => {
    const col = document.createElement('div')
    col.className = 'col'

    const card = document.createElement('div')
    card.className = 'card h-100 border-0 shadow-sm p-3'

    // Dropdown menu in top-right corner
    card.classList.add('position-relative')

    const dropdown = document.createElement('div')
    dropdown.className = 'dropdown position-absolute end-0'

    // Create the clickable icon
    const toggleBtn = document.createElement('button')
    toggleBtn.className = 'btn dropdown-toggle-no-style'
    toggleBtn.setAttribute('data-bs-toggle', 'dropdown')
    toggleBtn.setAttribute('aria-expanded', 'false')

    // Add icon inside the toggle
    const icon = document.createElement('i')
    icon.className = 'bi bi-plus fs-3'
    toggleBtn.appendChild(icon)

    const dropdownMenu = document.createElement('ul')
    dropdownMenu.className = 'dropdown-menu dropdown-menu-end'

    const addItem = document.createElement('li')
    const addBtn = document.createElement('button')
    addBtn.className = 'dropdown-item'
    addBtn.textContent = 'Add to Library'

    const info = book.volumeInfo
    const id = book.id
    const title = info.title || 'No title'
    const authors = info.authors ? info.authors.join(', ') : 'Unknown'
    const thumbnail = info.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://placehold.co/128x193?text=No+Cover'
    addBtn.addEventListener('click', () => {
      saveToLibrary({ id, title, authors, thumbnail })
    })

    addItem.appendChild(addBtn)
    dropdownMenu.appendChild(addItem)
    dropdown.appendChild(toggleBtn)
    dropdown.appendChild(dropdownMenu)
    card.appendChild(dropdown)

    const row = document.createElement('div')
    row.className = 'row g-0'

    const imgCol = document.createElement('div')
    imgCol.className = 'col-3 col-md-4'

    const imgWrapper = document.createElement('div')
    imgWrapper.className = 'book-img-wrapper'

    const img = document.createElement('img')
    img.src = thumbnail
    img.alt = title
    img.className = 'img-fluid rounded-start rounded-end object-fit-cover h-100 w-100'

    imgWrapper.appendChild(img)
    imgCol.appendChild(imgWrapper)

    const bodyCol = document.createElement('div')
    bodyCol.className = 'col-9 col-md-8'

    const body = document.createElement('div')
    body.className = 'card-body py-2 px-3 d-flex flex-column justify-content-center'

    const titleEl = document.createElement('h6')
    titleEl.className = 'card-title fw-bold mb-1 pe-3'
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

async function saveToLibrary(book) {
  // book should have: { id, title, authors, thumbnail }
  try {
    const res = await fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('Failed to save:', err.error || res.statusText)
      alert('Could not add to library')
      return
    }
    const saved = await res.json()
    console.log('Saved to library:', saved)
    // TODO: optionally disable the menu item or show “Added”
  } catch (e) {
    console.error('Network error:', e)
    alert('Network error while saving')
  }
}

let savedGoogleIds = new Set()

async function preloadSavedIds() {
  try {
    const res = await fetch('/api/library/google_ids')
    const ids = await res.json()
    savedGoogleIds = new Set(ids)
  } catch (e) { console.warn('Could not load saved IDs', e) }
}

// call once at load
preloadSavedIds()

// when building each card:
const alreadySaved = savedGoogleIds.has(id)
// …
addBtn.classList.toggle('disabled', alreadySaved)
addBtn.textContent = alreadySaved ? 'Already in Library' : 'Add to Library'
addBtn.disabled = alreadySaved

addBtn.addEventListener('click', async () => {
  if (alreadySaved) return
  await saveToLibrary({ id, title, authors, thumbnail })
  savedGoogleIds.add(id)
  addBtn.textContent = 'Added'
  addBtn.disabled = true
  addBtn.classList.add('disabled')
})
