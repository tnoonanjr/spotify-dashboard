document.addEventListener('DOMContentLoaded', function() {
  console.log('home.js linked');

  function login() {
      console.log('login function called');
      window.location.href = "/login";
  }

  function logout() {
      console.log('logout function called');
      window.location.href = "/logout";
  }

  var jsonDataElement = document.getElementById('jsonData');
  if (!jsonDataElement) {
      console.error('jsonData element not found');
      return;
  }

  var flash = jsonDataElement.getAttribute('data-flash');
  var loggedIn = jsonDataElement.getAttribute('data-log');
  var flashUser = (flash === "True");
  var loggedInJs = (loggedIn != "False");

  if (flashUser === true) {
      displayFlashMessage();
  }

  function updateLoginLogoutButton() {
      var container = document.getElementById('logLi');
      if (!container) {
          console.error('Container element not found');
          return;
      }

      container.innerHTML = '';

      if (loggedInJs === false) {
          console.log('user not logged in');

          var loginBtn = document.createElement('button');
          loginBtn.id = "loginBtn";
          loginBtn.className = "logBtn";
          loginBtn.textContent = "Log in";
          loginBtn.onclick = login;

          container.appendChild(loginBtn);
      } else {
          var logoutBtn = document.createElement('button');
          logoutBtn.id = "logoutBtn";
          logoutBtn.className = "logBtn";
          logoutBtn.textContent = "Log out";
          logoutBtn.onclick = logout;

          container.appendChild(logoutBtn);
      }
  }

  function displayFlashMessage() {
      console.log('displayFlashMessage function called');
      const flashContainer = document.getElementById('flash-container');
      if (flashContainer) {
          flashContainer.innerHTML = "<em>You are not logged in. Please log in to access this page.</em>";
      } else {
          console.error('flash-container not found');
      }
  }

  document.addEventListener('navbarLoaded', updateLoginLogoutButton);
});