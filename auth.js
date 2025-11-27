function switchTab(tab) {
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Clear alerts
    document.getElementById('alertContainer').innerHTML = '';
    
    if (tab === 'signin') {
        signinForm.classList.add('active');
        signupForm.classList.remove('active');
        tabButtons[0].classList.add('active');
        tabButtons[1].classList.remove('active');
    } else {
        signupForm.classList.add('active');
        signinForm.classList.remove('active');
        tabButtons[1].classList.add('active');
        tabButtons[0].classList.remove('active');
    }
}

function showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            ${message}
        </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

// Sign In Handler
document.getElementById('signinForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;
    
    if (!email || !password) {
        showAlert('Please fill in all fields');
        return;
    }
    
    // Get stored users from localStorage
    const usersJSON = localStorage.getItem('squadSyncUsers');
    const users = usersJSON ? JSON.parse(usersJSON) : [];
    
    // Find user with matching email
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showAlert('No account found with this email');
        return;
    }
    
    if (user.password !== password) {
        showAlert('Incorrect password');
        return;
    }
    
    // Set as current user (don't store password in current user)
    const currentUser = {
        username: user.username,
        email: user.email,
        favoriteTeam: user.favoriteTeam || '',
        favoriteSport: user.favoriteSport || ''
    };
    
    localStorage.setItem('squadSyncCurrentUser', JSON.stringify(currentUser));
    
    showAlert('Sign in successful! Redirecting...', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});

// Sign Up Handler
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields');
        return;
    }
    
    if (username.length < 3) {
        showAlert('Username must be at least 3 characters long');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match');
        return;
    }
    
    // Get existing users
    const usersJSON = localStorage.getItem('squadSyncUsers');
    const users = usersJSON ? JSON.parse(usersJSON) : [];
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showAlert('An account with this email already exists');
        return;
    }
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        showAlert('This username is already taken');
        return;
    }
    
    // Create new user
    const newUser = {
        username: username,
        email: email,
        password: password,
        favoriteTeam: '',
        favoriteSport: '',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('squadSyncUsers', JSON.stringify(users));
    
    // Set as current user (don't store password in current user)
    const currentUser = {
        username: newUser.username,
        email: newUser.email,
        favoriteTeam: '',
        favoriteSport: ''
    };
    
    localStorage.setItem('squadSyncCurrentUser', JSON.stringify(currentUser));
    
    showAlert('Account created successfully! Redirecting...', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('squadSyncCurrentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user.username !== 'Guest') {
            // User is already logged in, redirect to home
            window.location.href = 'index.html';
        }
    }
});