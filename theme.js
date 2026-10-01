// Runs from the document head so the saved theme is applied before the page paints.
try {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
} catch (error) {
  // Keep the default light theme if storage is disabled.
}
