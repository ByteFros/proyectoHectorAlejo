const setupLogoutButton = () => {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            window.location.href = '/accounts/logout/';  // Redirige a la URL de logout
        });
    }
};