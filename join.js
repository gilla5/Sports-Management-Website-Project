function getCurrentUser() {
    const userStr = localStorage.getItem('squadSyncCurrentUser');
    if (!userStr) {
        return { username: 'Guest', email: 'guest@squadsync.com' };
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
    if (!playerName || playerName.trim() === '') return;

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
            body: JSON.stringify({ teamName: team.teamName, players: updatedPlayers })
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

async function joinLeague(leagueId, leagueName, teamId, teamName) {
    const user = getCurrentUser();
    
    if (user.username === 'Guest') {
        alert('Please set up your profile before joining a league!');
        window.location.href = 'profile.html';
        return;
    }

    try {
        const res = await fetch(`/api/leagues/${leagueId}`);
        const league = await res.json();
        
        if (!league) { 
            alert('League not found.'); 
            return; 
        }

        const participants = league.participants || [];
        
        if (participants.some(p => p.teamId === teamId)) {
            alert('This team has already joined this league!');
            return;
        }

        const updatedParticipants = [...participants, {
            username: user.username,
            email: user.email,
            teamId: teamId,        
            teamName: teamName,    
            joinedAt: new Date().toISOString()
        }];

        const updateRes = await fetch(`/api/leagues/${leagueId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...league, participants: updatedParticipants })
        });

        if (!updateRes.ok) {
            alert('Failed to join league. Please try again.');
            return;
        }

        // Update the team's leagueId
        const updateTeamRes = await fetch(`/api/teams/${teamId}/league`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leagueId: leagueId })
        });
        
        if (updateTeamRes.ok) {
            alert(`Successfully joined ${leagueName} as ${teamName}!`);
            window.location.reload();
        } else {
            alert('Team joined league but failed to update team info.');
            window.location.reload();
        }
    } catch (err) {
        console.error('Error joining league:', err);
        alert('An error occurred while joining the league.');
    }
}

async function joinTournament(tournamentId, tournamentName, teamId, teamName) {
    const user = getCurrentUser();

    if (user.username === 'Guest') {
        alert('Please set up your profile before joining a tournament!');
        window.location.href = 'profile.html';
        return;
    }

    if (!teamName) {
        alert('You must select a team to join the tournament!');
        return;
    }

    try {
        const response = await fetch(`/api/tournaments/${tournamentId}`);
        const tournament = await response.json();
        const participants = tournament.participants || [];

        if (participants.some(p => p.username === user.username && p.teamId === teamId)) {
            alert('Your team has already joined this tournament!');
            return;
        }

        const updatedParticipants = [...participants, {
            username: user.username,
            email: user.email,
            teamId: teamId,
            teamName: teamName,
            joinedAt: new Date().toISOString()
        }];

        const updateResponse = await fetch(`/api/tournaments/${tournamentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...tournament, participants: updatedParticipants })
        });

        if (updateResponse.ok) {
            alert(`${teamName} successfully joined ${tournamentName}!`);
        } else {
            alert('Failed to join tournament. Please try again.');
        }
    } catch (err) {
        console.error('Error joining tournament:', err);
        alert('An error occurred while joining the tournament.');
    }
}

function updateJoinButtonState(btn, participants) {
    const user = getCurrentUser();
    if (!participants || !Array.isArray(participants)) return;

    if (participants.some(p => p.username === user.username)) {
        btn.classList.add("disabled");
        btn.textContent = "Joined";
        btn.disabled = true;
    }
}

function hasUserJoined(participants, username) {
    return participants?.some(p => p.username === username) || false;
}

export { joinTeam, joinLeague, joinTournament, getCurrentUser, hasUserJoined, updateJoinButtonState };