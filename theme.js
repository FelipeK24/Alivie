// Runs from the document head so the saved theme is applied before the page paints.
try {
  const uid = localStorage.getItem('alivie_active_uid');
  const theme = uid
    ? localStorage.getItem(`alivie_theme_${uid}`)
    : localStorage.getItem('alivie_theme_guest');
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
} catch (error) {
  // Keep the default light theme if storage is disabled.
}
