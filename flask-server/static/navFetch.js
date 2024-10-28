function fetchNav() 
{
    fetch('/static/navbar.html')
        .then(response => response.text())
        .then(data => 
        {
            document.getElementById('navbar-container').innerHTML = data;
            document.dispatchEvent(new Event('navbarLoaded'));
        })
}

fetchNav();
