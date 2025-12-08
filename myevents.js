function getCurrentUser() {
    const userStr = localStorage.getItem('squadSyncCurrentUser');
    if (!userStr) {
        return { username: 'Guest', email: 'guest@squadsync.com', fullName: 'Guest' };
    }
    const user = JSON.parse(userStr);
    if (!user.fullName) user.fullName = user.username;
    return user;
}


function formatTimeTo12Hour(time) {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

async function loadMyEvents() {
    const user = getCurrentUser();
    
    console.log('Current user:', user); // Debug log
    
    if (user.username === 'Guest') {
        document.getElementById('guestWarning').style.display = 'block';
        document.getElementById('myTournamentsContainer').innerHTML = '';
        document.getElementById('myLeaguesContainer').innerHTML = '';
        document.getElementById('myTeamsContainer').innerHTML = '';
        return;
    }

    await loadMyTournaments(user);
    await loadMyLeagues(user);
    await loadMyTeams(user);
}

async function loadMyTournaments(user) {
    try {
        const response = await fetch('/api/tournaments');
        const tournaments = await response.json();
        
        console.log('All tournaments:', tournaments); // Debug log
        console.log('Looking for user:', user.username); // Debug log

        const myTournaments = tournaments.filter(t => {
            const hasParticipants = t.participants && Array.isArray(t.participants);
            if (!hasParticipants) return false;
            
            const isParticipant = t.participants.some(p => {
                console.log('Checking participant:', p.username, 'against', user.username); // Debug log
                return p.username === user.username;
            });
            
            return isParticipant;
        });

        console.log('My tournaments:', myTournaments); // Debug log

        const container = document.getElementById('myTournamentsContainer');
        document.getElementById('tournamentCount').textContent = myTournaments.length;

        if (myTournaments.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted"><p>You haven\'t joined any tournaments yet.</p></div>';
            return;
        }

        container.innerHTML = '';
        myTournaments.forEach(t => {
            const card = document.createElement('div');
            card.className = 'col-md-4';
            
            const startDate = new Date(t.startDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const endDate = new Date(t.endDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            const participantCount = t.participants ? t.participants.length : 0;
            const maxParticipants = t.numTeams || '∞';
            
            const joinedInfo = t.participants.find(p => p.username === user.username);
            const joinedDate = joinedInfo ? new Date(joinedInfo.joinedAt).toLocaleDateString('en-US') : 'Unknown';
            
            card.innerHTML = `
                <div class="card h-100 border-primary">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">${t.tournamentName}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text"><strong>Sport:</strong> ${t.sportType}</p>
                        <p class="card-text"><strong>Type:</strong> ${t.tournamentType}</p>
                        <p class="card-text"><strong>Start Date:</strong> ${startDate}</p>
                        <p class="card-text"><strong>End Date:</strong> ${endDate}</p>
                        <p class="card-text"><strong>Game Times:</strong> ${formatTimeTo12Hour(t.startTime)} - ${formatTimeTo12Hour(t.endTime)}</p>
                        <p class="card-text"><strong>Location:</strong> ${t.location}</p>
                        <p class="card-text"><strong>Participants:</strong> ${participantCount} / ${maxParticipants}</p>
                        <p class="card-text text-success"><strong>✓ Joined on:</strong> ${joinedDate}</p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Error loading tournaments:', err);
        document.getElementById('myTournamentsContainer').innerHTML = '<div class="col-12"><p class="text-danger">Failed to load tournaments.</p></div>';
    }
}

async function loadMyLeagues(user) {
    try {
        const response = await fetch('/api/leagues');
        const leagues = await response.json();

        const myLeagues = leagues.filter(l => {
            const hasParticipants = l.participants && Array.isArray(l.participants);
            if (!hasParticipants) return false;
            return l.participants.some(p => p.username === user.username);
        });

        const container = document.getElementById('myLeaguesContainer');
        document.getElementById('leagueCount').textContent = myLeagues.length;

        if (myLeagues.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted"><p>You haven\'t joined any leagues yet.</p></div>';
            return;
        }

        container.innerHTML = '';
        myLeagues.forEach(l => {
            const card = document.createElement('div');
            card.className = 'col-md-4';
            
            const startDate = new Date(l.startDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const endDate = new Date(l.endDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            const participantCount = l.participants ? l.participants.length : 0;
            
            const joinedInfo = l.participants.find(p => p.username === user.username);
            const joinedDate = joinedInfo ? new Date(joinedInfo.joinedAt).toLocaleDateString('en-US') : 'Unknown';
            
            card.innerHTML = `
                <div class="card h-100 border-success">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">${l.leagueName}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text"><strong>Sport:</strong> ${l.sportType}</p>
                        <p class="card-text"><strong>Start Date:</strong> ${startDate}</p>
                        <p class="card-text"><strong>End Date:</strong> ${endDate}</p>
                        <p class="card-text"><strong>Game Times:</strong> ${formatTimeTo12Hour(l.startTime)} - ${formatTimeTo12Hour(l.endTime)}</p>
                        <p class="card-text"><strong>Location:</strong> ${l.location}</p>
                        <p class="card-text"><strong>Participants:</strong> ${participantCount}</p>
                        <p class="card-text text-success"><strong>✓ Joined on:</strong> ${joinedDate}</p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Error loading leagues:', err);
        document.getElementById('myLeaguesContainer').innerHTML = '<div class="col-12"><p class="text-danger">Failed to load leagues.</p></div>';
    }
}

async function loadMyTeams(user) {
    try {
        const response = await fetch('/api/teams');
        const teams = await response.json();

        const container = document.getElementById('myTeamsContainer');
        document.getElementById('teamCount').textContent = teams.length;

        if (!teams.length) {
            container.innerHTML = '<div class="col-12 text-center text-muted"><p>No teams found.</p></div>';
            return;
        }

        container.innerHTML = '';
        teams.forEach(t => {
            container.innerHTML += `
                <div class="col-md-4">
                    <div class="card h-100 border-info">
                        <div class="card-header bg-info text-white">
                            <h5 class="card-title mb-0">${t.teamName}</h5>
                        </div>
                        <div class="card-body">
                            <p class="card-text"><strong>Players:</strong> ${t.players.length}</p>
                            <ul class="list-unstyled ms-3">
                                ${t.players.slice(0, 5).map(player => `<li>• ${player}</li>`).join('')}
                                ${t.players.length > 5 ? `<li>• ... and ${t.players.length - 5} more</li>` : ''}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error('Error loading teams:', err);
        document.getElementById('myTeamsContainer').innerHTML = '<div class="col-12"><p class="text-danger">Failed to load teams.</p></div>';
    }
}




// Load events when page loads
document.addEventListener('DOMContentLoaded', loadMyEvents);