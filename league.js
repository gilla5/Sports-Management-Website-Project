import { getCurrentUser, joinLeague, updateJoinButtonState } from './join.js';

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
    if (!confirm(`Delete "${leagueName}"? This cannot be undone.`)) return;

    try {
        const res = await fetch(`/api/leagues/${id}`, { method: "DELETE" });
        if (res.ok) {
            alert("Deleted successfully");
            loadLeagues();
        } else alert("Failed to delete league.");
    } catch (err) {
        console.error("Error deleting league:", err);
        alert("Server error deleting league.");
    }
}

async function loadLeagues() {
    try {
        const response = await fetch('/api/leagues');
        const leagues = await response.json();
        const container = document.getElementById('leaguesContainer');
        container.innerHTML = '';

        if (!leagues.length) {
            container.innerHTML = '<p class="text-muted">No leagues found.</p>';
            return;
        }

        const localUser = getCurrentUser();

        leagues.forEach(l => {
            const card = document.createElement('div');
            card.className = 'col-md-4';

            const startDate = new Date(l.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const endDate = new Date(l.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const participantCount = l.participants?.length ?? 0;

            const hasJoined = localUser.username !== 'Guest' 
                ? l.participants?.some(p => p.username === localUser.username) 
                : false;

            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-end gap-2 mb-2">
                            <div class="dropdown">
                                <button class="btn btn-sm btn-success join-btn" data-id="${l._id}" data-name="${l.leagueName}" ${hasJoined ? 'disabled' : ''}>
                                    ${hasJoined ? 'Joined' : 'Join'}
                                </button>
                                <ul class="dropdown-menu join-dropdown" id="join-dropdown-${l._id}"></ul>
                            </div>
                            <a href="edit.html?type=league&id=${l._id}" class="btn btn-sm btn-primary">Edit</a>
                        </div>

                        <h5 class="card-title">${l.leagueName}</h5>
                        <p><strong>Sport:</strong> ${l.sportType}</p>
                        <p><strong>Start Date:</strong> ${startDate}</p>
                        <p><strong>End Date:</strong> ${endDate}</p>
                        <p><strong>Game Times:</strong> ${formatTimeTo12Hour(l.startTime)} - ${formatTimeTo12Hour(l.endTime)}</p>
                        <p><strong>Location:</strong> ${l.location}</p>
                        <p><strong>Description:</strong> ${l.description}</p>
                        <p><strong>Participants:</strong> ${participantCount}</p>

                        <div class="mt-auto d-flex justify-content-end">
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${l._id}" data-name="${l.leagueName}">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(card);

            const joinBtn = card.querySelector('.join-btn');
            updateJoinButtonState(joinBtn, l.participants);
        });

        // Add join dropdown functionality
        document.querySelectorAll('.join-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const leagueId = e.target.dataset.id;
                const leagueName = e.target.dataset.name;
                const dropdown = document.getElementById(`join-dropdown-${leagueId}`);
                dropdown.innerHTML = '';

                try {
                    const res = await fetch('/api/teams');
                    const allTeams = await res.json();

                    if (!allTeams.length) {
                        const li = document.createElement('li');
                        li.innerHTML = `<span class="dropdown-item text-muted">No teams available</span>`;
                        dropdown.appendChild(li);
                    } else {
                        allTeams.forEach(team => {
                            const li = document.createElement('li');
                            li.innerHTML = `<a class="dropdown-item" href="#">${team.teamName}</a>`;
                            li.addEventListener('click', () => {
                                joinLeague(leagueId, leagueName, team._id, team.teamName);
                                dropdown.classList.remove('show');
                            });
                            dropdown.appendChild(li);
                        });
                    }

                    dropdown.classList.toggle('show');
                } catch (err) {
                    console.error('Error loading teams:', err);
                    alert('Failed to load teams.');
                }
            });
        });

        // Delete button functionality
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                deleteLeague(btn.dataset.id, btn.dataset.name);
            });
        });

    } catch (err) {
        console.error("Error loading leagues:", err);
        document.getElementById('leaguesContainer').innerHTML =
            '<p class="text-danger">Failed to load leagues.</p>';
    }
}

loadLeagues();
