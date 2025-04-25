// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Function for login
document.getElementById('login-button').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!validateEmail(email)) {
        document.getElementById('response-message').textContent = "Invalid email.";
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = 'main.html';
        } else {
            document.getElementById('response-message').textContent = `Error: ${data.message}`;
        }
    } catch (error) {
        console.error('Login error:', error);
    }
});

// Function for signup
document.getElementById('signup-button').addEventListener('click', async () => {
    const nickname = document.getElementById('nickname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!validateEmail(email)) {
        document.getElementById('response-message').textContent = "Invalid email.";
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, email, password })
        });

        const data = await response.json();
        document.getElementById('response-message').textContent = data.message;
    } catch (error) {
        console.error('Signup error:', error);
    }
});
