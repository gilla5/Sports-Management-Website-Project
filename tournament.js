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
            loadTournaments(); // Reload the list
        } else {
            alert('Failed to delete tournament.');
        }
    } catch (err) {
        console.error('Error deleting tournament:', err);
        alert('An error occurred while deleting the tournament.');
    }
}

async function loadTournaments() {
    try {
        const response = await fetch('/api/tournaments');
        const tournaments = await response.json();

        const container = document.getElementById('tournamentsContainer');
        container.innerHTML = '';

        if (tournaments.length === 0) {
            container.innerHTML = '<p class="text-muted">No tournaments found.</p>';
            return;
        }

        tournaments.forEach(t => {
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
            
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${t.tournamentName || 'Unnamed Tournament'}</h5>
                        <p class="card-text"><strong>Sport:</strong> ${t.sportType || 'N/A'}</p>
                        <p class="card-text"><strong>Tournament Type:</strong> ${t.tournamentType || 'N/A'}</p>
                        <p class="card-text"><strong>Start Date:</strong> ${startDate}</p>
                        <p class="card-text"><strong>End Date:</strong> ${endDate}</p>
                        <p class="card-text"><strong>Game Times:</strong> ${formatTimeTo12Hour(t.startTime)} - ${formatTimeTo12Hour(t.endTime)}</p>
                        <p class="card-text"><strong>Location:</strong> ${t.location || 'N/A'}</p>
                        <p class="card-text"><strong>Description:</strong> ${t.description || 'No description provided'}</p>
                        <p class="card-text"><strong>Participants:</strong> ${participantCount} / ${maxParticipants}</p>
                        <div class="mt-3">
                            <button class="btn btn-sm btn-success join-btn" data-id="${t._id}" data-name="${t.tournamentName}">Join Tournament</button>
                            <a href="bracket.html?id=${t._id}" class="btn btn-sm btn-warning">Edit Bracket</a>
                            <a href="edit.html?type=tournament&id=${t._id}" class="btn btn-sm btn-primary">Edit</a>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${t._id}" data-name="${t.tournamentName}">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Add join button listeners
        document.querySelectorAll('.join-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                joinTournament(id, name);
            });
        });

        // Add delete button listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                deleteTournament(id, name);
            });
        });
    } catch (err) {
        console.error('Error loading tournaments:', err);
        document.getElementById('tournamentsContainer').innerHTML = '<p class="text-danger">Failed to load tournaments.</p>';
    }
}

loadTournaments();