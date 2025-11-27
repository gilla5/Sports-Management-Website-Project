const CURRENT_USER_KEY = 'squadSyncCurrentUser';

function initUser() {
    let user = localStorage.getItem(CURRENT_USER_KEY);
    if (!user) {
        const defaultUser = {
            username: 'Guest',
            email: 'guest@squadsync.com',
            favoriteTeam: '',
            favoriteSport: ''
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
        return defaultUser;
    }
    return JSON.parse(user);
}

function getCurrentUser() {
    return initUser();
}

function updateUserProfile(userData) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
}

function displayUserProfile() {
    const user = getCurrentUser();
    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileTeam').textContent = user.favoriteTeam || 'Not set';
    document.getElementById('profileSport').textContent = user.favoriteSport || 'Not set';
    
    const initial = user.username.charAt(0).toUpperCase();
    document.getElementById('profileIcon').textContent = initial;
    
    // Show/hide auth button and sign out button based on user status
    const authButton = document.getElementById('authButton');
    const signOutBtn = document.getElementById('signOutBtn');
    
    if (authButton) {
        if (user.username === 'Guest') {
            authButton.style.display = 'inline-block';
        } else {
            authButton.style.display = 'none';
        }
    }
    
    if (signOutBtn) {
        if (user.username === 'Guest') {
            signOutBtn.style.display = 'none';
        } else {
            signOutBtn.style.display = 'block';
        }
    }
}

function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        const defaultUser = {
            username: 'Guest',
            email: 'guest@squadsync.com',
            favoriteTeam: '',
            favoriteSport: ''
        };
        localStorage.setItem('squadSyncCurrentUser', JSON.stringify(defaultUser));
        window.location.reload();
    }
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('show');
}

document.addEventListener('click', function(event) {
    const profileContainer = document.querySelector('.profile-container');
    const dropdown = document.getElementById('profileDropdown');
    
    if (profileContainer && !profileContainer.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('profileIcon')) {
        displayUserProfile();
    }
});