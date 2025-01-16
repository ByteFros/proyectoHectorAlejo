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
            <input type="text" id="username" placeholder="username" required>
            <input type="password" id="password" placeholder="password" required>
            <button id="actionButton">Log In</button>
            <div class="toggle">
                <button id="toggleButton">¿No tienes una cuenta?</button>
            </div>
        `
        : `
            <input type="text" id="username" placeholder="username" required>
            <input type="email" id="email" placeholder="email" required>
            <input type="password" id="password" placeholder="password" required>
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

    if (!isLogin && password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    const payload = isLogin
        ? { username, password }
        : { username, email, password };

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
