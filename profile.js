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