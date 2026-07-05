try {
  if (localStorage.getItem('stepjee-theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
} catch(e) {}
