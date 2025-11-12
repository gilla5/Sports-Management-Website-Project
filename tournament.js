document.getElementById("createLeagueBtn").addEventListener("click", () => {
    window.location.href = "/create.html";
});

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
            
            const formatTime = (time) => {
                if (!time) return 'N/A';
                const [hours, minutes] = time.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                return `${displayHour}:${minutes} ${ampm}`;
            };
            
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${t.tournamentName || 'Unnamed Tournament'}</h5>
                        <p class="card-text"><strong>Sport:</strong> ${t.sportType || 'N/A'}</p>
                        <p class="card-text"><strong>Tournament Type:</strong> ${t.tournamentType || 'N/A'}</p>
                        <p class="card-text"><strong>Start Date:</strong> ${startDate}</p>
                        <p class="card-text"><strong>End Date:</strong> ${endDate}</p>
                        <p class="card-text"><strong>Game Times:</strong> ${formatTime(t.startTime)} - ${formatTime(t.endTime)}</p>
                        <p class="card-text"><strong>Location:</strong> ${t.location || 'N/A'}</p>
                        <p class="card-text"><strong>Description:</strong> ${t.description || 'No description provided'}</p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Error loading tournaments:', err);
        document.getElementById('tournamentsContainer').innerHTML = '<p class="text-danger">Failed to load tournaments.</p>';
    }
}

loadTournaments();
