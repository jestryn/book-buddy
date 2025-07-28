(() => {
  'use strict'

  const getStoredTheme = () => localStorage.getItem('theme')
  const setStoredTheme = theme => localStorage.setItem('theme', theme)

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) return storedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const setTheme = (theme) => {
    if (theme === 'auto') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-bs-theme', systemPrefersDark ? 'dark' : 'light')
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  }

  const showActiveTheme = (theme, focus = false) => {
    const themeSwitcher = document.querySelector('#bd-theme')
    const themeSwitcherText = document.querySelector('#bd-theme-text')
    const activeIcon = document.querySelector('.theme-icon-active')
    const btnToActivate = document.querySelector(`[data-bs-theme-value="${theme}"]`)
    const checkIcons = document.querySelectorAll('.dropdown-item .bi-check2')

    document.querySelectorAll('[data-bs-theme-value]').forEach(el => {
      el.classList.remove('active')
      el.setAttribute('aria-pressed', 'false')
    })

    btnToActivate.classList.add('active')
    btnToActivate.setAttribute('aria-pressed', 'true')

    checkIcons.forEach(icon => icon.classList.add('d-none'))
    btnToActivate.querySelector('.bi-check2').classList.remove('d-none')

    if (activeIcon && btnToActivate.querySelector('i')) {
      activeIcon.className = `bi ${btnToActivate.querySelector('i').classList[1]} theme-icon-active`
    }

    if (themeSwitcherText) {
      themeSwitcher.setAttribute('aria-label', `${themeSwitcherText.textContent} (${theme})`)
    }

    if (focus) themeSwitcher.focus()
  }

  // Only update the theme on system change if the stored theme is "auto"
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'auto') {
      setTheme('auto')
      showActiveTheme('auto')
    }
  })

  // Init on load
  window.addEventListener('DOMContentLoaded', () => {
    const theme = getPreferredTheme()
    setTheme(theme)
    showActiveTheme(theme)

    document.querySelectorAll('[data-bs-theme-value]')
      .forEach(toggle => {
        toggle.addEventListener('click', () => {
          const selectedTheme = toggle.getAttribute('data-bs-theme-value')
          setStoredTheme(selectedTheme)
          setTheme(selectedTheme)
          showActiveTheme(selectedTheme, true)
        })
      })
  })
})()
