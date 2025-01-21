/* Archivo JavaScript */
const container = document.getElementById('container');
const form = document.getElementById('form');
const actionButton = document.getElementById('actionButton');
const toggleButton = document.getElementById('toggleButton');
const header = document.querySelector('.header');

let isLogin = true;

toggleButton.addEventListener('click', () => {
    isLogin = !isLogin;
    header.textContent = isLogin ? 'Login' : 'Register';
    actionButton.textContent = isLogin ? 'Log In' : 'Sign Up';
    toggleButton.textContent = isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?';

    form.innerHTML = isLogin
        ? `
            <input type="text" id="username" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button id="actionButton">Log In</button>
            <div class="toggle">
                <button id="toggleButton">¿No tienes una cuenta?</button>
            </div>
        `
        : `
            <input type="text" id="username" placeholder="Nombre de usuario" required>
            <input type="email" id="email" placeholder="Email" required>
            <input type="text" id="nif" placeholder="NIF" required>
            <input type="text" id="address" placeholder="Dirección" required>
            <input type="text" id="city" placeholder="Ciudad" required>
            <input type="text" id="postalCode" placeholder="Código Postal" required>
            <input type="password" id="password" placeholder="Password" required>
            <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
            <button id="actionButton">Sign Up</button>
            <div class="toggle">
                <button id="toggleButton">¿Ya tienes una cuenta?</button>
            </div>
        `;

    document.getElementById('toggleButton').addEventListener('click', () => toggleButton.click());
    document.getElementById('actionButton').addEventListener('click', handleSubmit);
});

async function handleSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword') ? document.getElementById('confirmPassword').value : null;
    const email = !isLogin ? document.getElementById('email').value : null;
    const nif = !isLogin ? document.getElementById('nif').value : null;
    const address = !isLogin ? document.getElementById('address').value : null;
    const city = !isLogin ? document.getElementById('city').value : null;
    const postalCode = !isLogin ? document.getElementById('postalCode').value : null;


    if (!isLogin && password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    const payload = isLogin
        ? { username, password }
        : { username, email, password, nif, address, city, postalCode };

    const endpoint = isLogin ? '/login' : '/register';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            alert(isLogin ? 'Login successful!' : 'Registration successful!');
        } else {
            alert(result.message || 'Something went wrong.');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

document.getElementById('actionButton').addEventListener('click', handleSubmit);
