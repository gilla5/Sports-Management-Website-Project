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
            alert(`Successfully joined ${teamName}!`);
            
            window.location.href = 'myevents.html';
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
            alert(`Successfully joined ${leagueName}!`);
            window.location.href = 'myevents.html';
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
            alert(`Successfully joined ${tournamentName}!`);
            window.location.href = 'myevents.html';
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
