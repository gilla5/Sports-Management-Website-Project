function getCurrentUser() {
    const userStr = localStorage.getItem('squadSyncCurrentUser');
    if (!userStr) {
        return {
            username: 'Guest',
            email: 'guest@squadsync.com'
        };
    }
    return JSON.parse(userStr);
}

// Confetti animation function
function createConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Create confetti elements
        for (let i = 0; i < particleCount; i++) {
            createConfettiPiece();
        }
    }, 250);
}

function createConfettiPiece() {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.opacity = '1';
    confetti.style.zIndex = '10000';
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    
    document.body.appendChild(confetti);
    
    const duration = Math.random() * 3 + 2;
    const rotation = Math.random() * 360;
    const xMovement = (Math.random() - 0.5) * 200;
    
    confetti.animate([
        {
            transform: `translate(0, 0) rotate(0deg)`,
            opacity: 1
        },
        {
            transform: `translate(${xMovement}px, ${window.innerHeight + 10}px) rotate(${rotation}deg)`,
            opacity: 0
        }
    ], {
        duration: duration * 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    setTimeout(() => {
        confetti.remove();
    }, duration * 1000);
}

// Success modal with confetti
function showSuccessModal(message) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        text-align: center;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    modal.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
        <h2 style="color: #229954; margin-bottom: 10px; font-family: 'Roboto', sans-serif;">Success!</h2>
        <p style="font-size: 18px; color: #333; font-family: 'Roboto', sans-serif;">${message}</p>
        <button onclick="this.closest('.backdrop-element').remove(); window.location.href='myDashboard.html';" 
                style="margin-top: 20px; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                       color: white; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; 
                       font-weight: 600; font-family: 'Roboto', sans-serif;">
            Go to Dashboard
        </button>
    `;
    
    backdrop.className = 'backdrop-element';
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    // Trigger confetti
    createConfetti();
    
    // Auto redirect after 4 seconds
    setTimeout(() => {
        backdrop.remove();
        window.location.href = 'myDashboard.html';
    }, 4000);
}

async function joinTeam(teamId, teamName) {
    const user = getCurrentUser();
    
    if (user.username === 'Guest') {
        alert('Please set up your profile before joining a team!');
        window.location.href = 'profile.html';
        return;
    }

    const playerName = prompt(`Enter your name to join "${teamName}":`);
    
    if (!playerName || playerName.trim() === '') {
        return;
    }

    try {
        const response = await fetch(`/api/teams/${teamId}`);
        const team = await response.json();

        if (team.players.includes(playerName.trim())) {
            alert('A player with this name is already on the team!');
            return;
        }

        const updatedPlayers = [...team.players, playerName.trim()];
        
        const updateResponse = await fetch(`/api/teams/${teamId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teamName: team.teamName,
                players: updatedPlayers
            })
        });

        if (updateResponse.ok) {
            showSuccessModal(`You've successfully joined ${teamName}! 🎊`);
        } else {
            alert('Failed to join team. Please try again.');
        }
    } catch (err) {
        console.error('Error joining team:', err);
        alert('An error occurred while joining the team.');
    }
}

async function joinLeague(leagueId, leagueName) {
    const user = getCurrentUser();
    
    if (user.username === 'Guest') {
        alert('Please set up your profile before joining a league!');
        window.location.href = 'profile.html';
        return;
    }

    try {
        const response = await fetch(`/api/leagues/${leagueId}`);
        const league = await response.json();

        const participants = league.participants || [];

        if (participants.some(p => p.username === user.username)) {
            alert('You have already joined this league!');
            return;
        }

        const updatedParticipants = [...participants, {
            username: user.username,
            email: user.email,
            joinedAt: new Date().toISOString()
        }];
        
        const updateResponse = await fetch(`/api/leagues/${leagueId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...league,
                participants: updatedParticipants
            })
        });

        if (updateResponse.ok) {
            showSuccessModal(`You've successfully joined ${leagueName}! 🏆`);
        } else {
            alert('Failed to join league. Please try again.');
        }
    } catch (err) {
        console.error('Error joining league:', err);
        alert('An error occurred while joining the league.');
    }
}

async function joinTournament(tournamentId, tournamentName) {
    const user = getCurrentUser();
    
    if (user.username === 'Guest') {
        alert('Please set up your profile before joining a tournament!');
        window.location.href = 'profile.html';
        return;
    }

    try {
        const response = await fetch(`/api/tournaments/${tournamentId}`);
        const tournament = await response.json();

        const participants = tournament.participants || [];

        if (participants.some(p => p.username === user.username)) {
            alert('You have already joined this tournament!');
            return;
        }

        if (tournament.numTeams && participants.length >= tournament.numTeams) {
            alert('This tournament is full!');
            return;
        }

        const updatedParticipants = [...participants, {
            username: user.username,
            email: user.email,
            joinedAt: new Date().toISOString()
        }];
        
        const updateResponse = await fetch(`/api/tournaments/${tournamentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...tournament,
                participants: updatedParticipants
            })
        });

        if (updateResponse.ok) {
            showSuccessModal(`You've successfully joined ${tournamentName}! 🎯`);
        } else {
            alert('Failed to join tournament. Please try again.');
        }
    } catch (err) {
        console.error('Error joining tournament:', err);
        alert('An error occurred while joining the tournament.');
    }
}

function hasUserJoined(participants, username) {
    if (!participants || participants.length === 0) return false;
    return participants.some(p => p.username === username);
}
