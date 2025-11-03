document.getElementById("createTournamentBtn").addEventListener("click", () => {
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
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${t.title}</h5>
                        <p class="card-text"><strong>Date:</strong> ${t.date}</p>
                        <p class="card-text"><strong>Time:</strong> ${t.time}</p>
                        <p class="card-text"><strong>Location:</strong> ${t.location}</p>
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
