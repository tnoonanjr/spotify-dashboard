document.addEventListener('DOMContentLoaded', function() 
{

function login() 
{
    window.location.href = "/login";
}

function logout() 
{
    window.location.href = "/logout";
}

var jsonDataElement = document.getElementById('jsonData');

var flash = jsonDataElement.getAttribute('data-flash');
var loggedIn = jsonDataElement.getAttribute('data-log');
var flashUser = (flash === "True");
var loggedInJs = (loggedIn != "False");

if (flashUser === true) displayFlashMessage();

function updateLoginLogoutButton() 
{
    var container = document.getElementById('logLi');

    container.innerHTML = '';

    if (loggedInJs === false) 
    {
        var loginBtn = document.createElement('button');
        loginBtn.id = "loginBtn";
        loginBtn.className = "logBtn";
        loginBtn.textContent = "Log in";
        loginBtn.onclick = login;

        container.appendChild(loginBtn);
    } 
    
    else 
    {
        var logoutBtn = document.createElement('button');
        logoutBtn.id = "logoutBtn";
        logoutBtn.className = "logBtn";
        logoutBtn.textContent = "Log out";
        logoutBtn.onclick = logout;

        container.appendChild(logoutBtn);
    }
}

function displayFlashMessage() 
{
    const flashContainer = document.getElementById('flash-container');
    flashContainer.innerHTML = "<em>You are not logged in. Please log in to access this page.</em>";  
}

document.addEventListener('navbarLoaded', updateLoginLogoutButton);
});