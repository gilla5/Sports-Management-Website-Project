document.getElementById("createLeagueBtn").addEventListener("click", () => {
    window.location.href = "/create.html";
});

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
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${l.title}</h5>
                        <p class="card-text"><strong>Date:</strong> ${l.date}</p>
                        <p class="card-text"><strong>Time:</strong> ${l.time}</p>
                        <p class="card-text"><strong>Location:</strong> ${l.location}</p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Error loading leagues:', err);
        document.getElementById('leaguesContainer').innerHTML = '<p class="text-danger">Failed to load leagues.</p>';
    }
}

loadLeagues();
