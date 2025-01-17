document.addEventListener('DOMContentLoaded', () => {
    if (LogincheckAuth()) return;
});

function handleLogin(event) {
    event.preventDefault();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');

    if (verifyPassword(password)) {
        setAuthToken(CORRECT_PASSWORD_HASH);
        window.location.href = '/terminal.html';
    } else {
        errorDiv.textContent = 'Incorrect password';
        document.getElementById('password').value = '';
    }
    return false;
}