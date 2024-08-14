function fetchNav() {
    fetch('/static/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            document.dispatchEvent(new Event('navbarLoaded'));
        })
        .catch(error => console.error('Error loading navbar:', error));
}

fetchNav();
console.log('navFetch called');
