const container = document.getElementById('container');
const form = document.getElementById('form');
const toggleButton = document.getElementById('toggleButton');
const header = document.querySelector('.header');

let isLogin = true;

toggleButton.addEventListener('click', () => {
    isLogin = !isLogin;
    header.textContent = isLogin ? 'Login' : 'Register';

    form.innerHTML = isLogin
        ? `<form id="loginForm" method="POST" action="/login/">
                <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRFToken()}">
                <input type="text" id="username" name="username" placeholder="Username" required>
                <input type="password" id="password" name="password" placeholder="Password" required>
                <button id="actionButton" type="submit">Log In</button>
           </form>
           <div class="toggle">
               <button id="toggleButton" type="button">¿No tienes una cuenta?</button>
           </div>`
        : `<form id="registerForm" method="POST" action="/register/">
                <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRFToken()}">
                <input type="text" id="username" name="username" placeholder="Nombre de usuario" required>
                <input type="email" id="email" name="email" placeholder="Email" required>
                <input type="text" id="nif" name="nif" placeholder="NIF" required>
                <input type="text" id="address" name="address" placeholder="Dirección" required>
                <input type="text" id="city" name="city" placeholder="Ciudad" required>
                <input type="text" id="postalCode" name="postalCode" placeholder="Código Postal" required>
                <input type="password" id="password" name="password" placeholder="Password" required>
                <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required>
                <button id="actionButton" type="submit">Sign Up</button>
           </form>
           <div class="toggle">
               <button id="toggleButton" type="button">¿Ya tienes una cuenta?</button>
           </div>`;

    document.getElementById('toggleButton').addEventListener('click', () => toggleButton.click());
});

function getCSRFToken() {
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    return csrfInput ? csrfInput.value : '';
}