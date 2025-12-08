document.getElementById("createLeagueBtn").addEventListener("click", () => {
    window.location.href = "/create.html";
});

function formatTimeTo12Hour(time) {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

async function deleteTournament(id, tournamentName) {
    if (!confirm(`Are you sure you want to delete "${tournamentName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/tournaments/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Tournament deleted successfully!');
            loadTournaments();
        } else {
            alert('Failed to delete tournament.');
        }
    } catch (err) {
        console.error('Error deleting tournament:', err);
        alert('An error occurred while deleting the tournament.');
    }
}

// Updated joinTournament function to include teamId & teamName
async function joinTournament(tournamentId, tournamentName, teamId, teamName) {
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
            teamId: teamId || null,
            teamName: teamName || null,
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
            alert(`Successfully joined ${tournamentName} as ${teamName || 'No Team Selected'}!`);
            loadTournaments();
        } else {
            alert('Failed to join tournament. Please try again.');
        }
    } catch (err) {
        console.error('Error joining tournament:', err);
        alert('An error occurred while joining the tournament.');
    }
}

let allTournaments = [];
let filteredTournaments = [];

async function loadTournaments() {
    try {
        const response = await fetch('/api/tournaments');
        allTournaments = await response.json();
        filteredTournaments = [...allTournaments];
        displayTournaments();
    } catch (err) {
        console.error('Error loading tournaments:', err);
        document.getElementById('tournamentsContainer').innerHTML = '<p class="text-danger">Failed to load tournaments.</p>';
    }
}

function displayTournaments() {
    const container = document.getElementById('tournamentsContainer');
    container.innerHTML = '';

    if (filteredTournaments.length === 0) {
        container.innerHTML = '<p class="text-muted">No tournaments found.</p>';
        return;
    }

    filteredTournaments.forEach(t => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        
        const startDate = new Date(t.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const endDate = new Date(t.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const participantCount = t.participants ? t.participants.length : 0;
        const maxParticipants = t.numTeams || '∞';

        const imageHTML = t.image ? 
            `<img src="${t.image}" class="tournament-image" alt="${t.tournamentName}" 
            onerror="this.style.display='none'">` : '';
        
        card.innerHTML = `
            <div class="card h-100">
                ${imageHTML}                
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">
                        <a href="tournament_detail.html?id=${t._id}">${t.tournamentName || 'Unnamed Tournament'}</a>
                    </h5>
                    <p class="card-text"><strong>Sport:</strong> ${t.sportType || 'N/A'}</p>
                    <p class="card-text"><strong>Tournament Type:</strong> ${t.tournamentType || 'N/A'}</p>
                    <p class="card-text"><strong>Start Date:</strong> ${startDate}</p>
                    <p class="card-text"><strong>End Date:</strong> ${endDate}</p>
                    <p class="card-text"><strong>Game Times:</strong> ${formatTimeTo12Hour(t.startTime)} - ${formatTimeTo12Hour(t.endTime)}</p>
                    <p class="card-text"><strong>Location:</strong> ${t.location || 'N/A'}</p>
                    <p class="card-text"><strong>Description:</strong> ${t.description || 'No description provided'}</p>
                    <p class="card-text"><strong>Participants:</strong> ${participantCount} / ${maxParticipants}</p>
                    
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <div class="d-flex gap-2">
                            <div class="dropdown">
                                <button class="btn btn-sm btn-success join-btn" data-id="${t._id}" data-name="${t.tournamentName}">
                                    Join
                                </button>
                                <ul class="dropdown-menu join-dropdown" id="join-dropdown-${t._id}"></ul>
                            </div>
                            <a href="bracket.html?id=${t._id}" class="btn btn-sm btn-warning">Edit Bracket</a>
                            <a href="edit.html?type=tournament&id=${t._id}" class="btn btn-sm btn-primary">Edit</a>
                        </div>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${t._id}" data-name="${t.tournamentName}">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
        const joinBtn = card.querySelector('.join-btn');
        updateJoinButtonState(joinBtn, t.participants);
    });

    // Add event listeners for Join buttons with dropdown
    document.querySelectorAll('.join-btn').forEach(async btn => {
        btn.addEventListener('click', async (e) => {
            const tournamentId = e.target.getAttribute('data-id');
            const tournamentName = e.target.getAttribute('data-name');
            const dropdown = document.getElementById(`join-dropdown-${tournamentId}`);

            // Clear previous items
            dropdown.innerHTML = '';

            try {
                const teamsRes = await fetch('/api/teams');
                const teams = await teamsRes.json();

                teams.forEach(team => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a class="dropdown-item" href="#">${team.teamName}</a>`;
                    li.addEventListener('click', () => {
                        joinTournament(tournamentId, tournamentName, team._id, team.teamName);
                        dropdown.classList.remove('show');
                    });
                    dropdown.appendChild(li);
                });

                dropdown.classList.toggle('show');
            } catch (err) {
                console.error('Error loading teams:', err);
                alert('Failed to load teams.');
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const name = e.target.getAttribute('data-name');
            deleteTournament(id, name);
        });
    });
}

function updateJoinButtonState(btn, participants) {
    const user = getCurrentUser();
    if (!participants || !Array.isArray(participants)) return;

    if (participants.some(p => p.username === user.username)) {
        btn.textContent = "Joined";
        btn.classList.add("disabled");
        btn.disabled = true;
    }
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    applyFilters(searchTerm);
});

// Filter functionality
document.getElementById('applyFiltersBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    applyFilters(searchTerm);
    bootstrap.Modal.getInstance(document.getElementById('filterModal')).hide();
});

document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    document.getElementById('filterSport').value = '';
    document.getElementById('filterTournamentType').value = '';
    document.getElementById('filterMinTeams').value = '4';
    document.getElementById('filterMaxTeams').value = '32';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterStartTime').value = '';
    document.getElementById('filterEndTime').value = '';
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    applyFilters(searchTerm);
    bootstrap.Modal.getInstance(document.getElementById('filterModal')).hide();
});

function applyFilters(searchTerm = '') {
    const sport = document.getElementById('filterSport').value;
    const tournamentType = document.getElementById('filterTournamentType').value;
    const minTeams = parseInt(document.getElementById('filterMinTeams').value) || 4;
    const maxTeams = parseInt(document.getElementById('filterMaxTeams').value) || 32;
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;
    const startTime = document.getElementById('filterStartTime').value;
    const endTime = document.getElementById('filterEndTime').value;

    filteredTournaments = allTournaments.filter(tournament => {
        // Search by name - only filter if searchTerm is not empty
        if (searchTerm && searchTerm.trim() !== '' && !tournament.tournamentName.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Filter by sport
        if (sport && tournament.sportType !== sport) {
            return false;
        }

        // Filter by tournament type
        if (tournamentType && tournament.tournamentType !== tournamentType) {
            return false;
        }

        // Filter by number of teams
        const numTeams = tournament.numTeams || 0;
        if (numTeams < minTeams || numTeams > maxTeams) {
            return false;
        }

        // Filter by date range
        if (startDate && new Date(tournament.startDate) < new Date(startDate)) {
            return false;
        }
        if (endDate && new Date(tournament.endDate) > new Date(endDate)) {
            return false;
        }

        // Filter by time range
        if (startTime && tournament.startTime < startTime) {
            return false;
        }
        if (endTime && tournament.endTime > endTime) {
            return false;
        }

        return true;
    });

    displayTournaments();
}

// Update team count display
document.getElementById('filterMinTeams').addEventListener('input', (e) => {
    document.getElementById('minTeamsDisplay').textContent = e.target.value;
});

document.getElementById('filterMaxTeams').addEventListener('input', (e) => {
    document.getElementById('maxTeamsDisplay').textContent = e.target.value;
});

loadTournaments();
