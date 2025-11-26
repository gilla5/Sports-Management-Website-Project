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

async function deleteLeague(id, leagueName) {
    if (!confirm(`Are you sure you want to delete "${leagueName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/leagues/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('League deleted successfully!');
            loadLeagues();
        } else {
            alert('Failed to delete league.');
        }
    } catch (err) {
        console.error('Error deleting league:', err);
        alert('An error occurred while deleting the league.');
    }
}

async function loadLeagues() {
    try {
        const response = await fetch('/api/leagues');
        const leagues = await response.json();

        const container = document.getElementById('leaguesContainer');
        container.innerHTML = '';

        if (leagues.length === 0) {
            container.innerHTML = '<p class="text-muted">No leagues found.</p>';
            return;
        }

        leagues.forEach(l => {
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
            
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                    <!-- TOP-RIGHT BUTTONS -->
<div class="d-flex justify-content-end gap-2 mb-2">
    <button class="btn btn-sm btn-success join-btn" data-id="${l._id}" data-name="${l.leagueName}">Join</button>
    <a href="edit.html?type=league&id=${l._id}" class="btn btn-sm btn-primary">Edit</a>
</div>
                        <h5 class="card-title">${l.leagueName}</h5>
                        <p class="card-text"><strong>Sport:</strong> ${l.sportType}</p>
                        <p class="card-text"><strong>Start Date:</strong> ${startDate}</p>
                        <p class="card-text"><strong>End Date:</strong> ${endDate}</p>
                        <p class="card-text"><strong>Game Times:</strong> ${formatTimeTo12Hour(l.startTime)} - ${formatTimeTo12Hour(l.endTime)}</p>
                        <p class="card-text"><strong>Location:</strong> ${l.location}</p>
                        <p class="card-text"><strong>Description:</strong> ${l.description}</p>
                        <p class="card-text"><strong>Participants:</strong> ${participantCount}</p>

<!-- DELETE BUTTON AT BOTTOM RIGHT -->
<div class="mt-auto d-flex justify-content-end">
    <button class="btn btn-sm btn-danger delete-btn" data-id="${l._id}" data-name="${l.leagueName}">
        Delete
    </button>
</div>

                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        document.querySelectorAll('.join-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                joinLeague(id, name);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                deleteLeague(id, name);
            });
        });
    } catch (err) {
        console.error('Error loading leagues:', err);
        document.getElementById('leaguesContainer').innerHTML = '<p class="text-danger">Failed to load leagues.</p>';
    }
}

loadLeagues();
