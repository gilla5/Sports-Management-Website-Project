document.getElementById("createLeagueBtn").addEventListener("click", () => {
    window.location.href = "/create.html";
});

let leagues = [];
let teams = [];

async function loadLeagues() {
    try {
        const response = await fetch('/api/leagues');
        leagues = await response.json();

        const leagueSelect = document.getElementById('leagueSelect');
        leagueSelect.innerHTML = '<option value="">Select a league</option>';

        if (leagues.length === 0) {
            leagueSelect.innerHTML = '<option value="">No leagues available</option>';
            return;
        }

        leagues.forEach(league => {
            const option = document.createElement('option');
            option.value = league._id;
            option.textContent = league.leagueName || league.title || 'Unnamed League';
            leagueSelect.appendChild(option);
        });
    } catch (err) {
        console.error('Error loading leagues:', err);
    }
}

async function loadTeamsForLeague(leagueId) {
    try {
        const response = await fetch(`/api/leagues/${leagueId}/teams`);
        teams = await response.json();

        const teamSelect = document.getElementById('teamSelect');
        teamSelect.innerHTML = '<option value="">Select a team</option>';
        teamSelect.disabled = false;

        if (teams.length === 0) {
            teamSelect.innerHTML = '<option value="">No teams in this league</option>';
            teamSelect.disabled = true;
            clearTeamInfo();
            return;
        }

        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team._id;
            option.textContent = team.teamName || 'Unnamed Team';
            teamSelect.appendChild(option);
        });

        clearTeamInfo();
    } catch (err) {
        console.error('Error loading teams:', err);
    }
}

function displayTeamInfo(teamId) {
    const team = teams.find(t => t._id === teamId);
    
    if (!team) {
        clearTeamInfo();
        return;
    }

    const league = leagues.find(l => l._id === team.leagueId);
    const leagueName = league ? (league.leagueName || league.title || 'Unknown League') : 'Unknown League';

    document.getElementById('teamHeader').textContent = `${team.teamName}: ${leagueName}`;

    const tableBody = document.getElementById('teamRosterBody');
    tableBody.innerHTML = '';

    if (!team.players || team.players.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No players on this team</td></tr>';
        return;
    }

    team.players.forEach((playerName, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${playerName}</td>
            <td>N/A</td>
            <td>N/A</td>
            <td>N/A</td>
        `;
        tableBody.appendChild(row);
    });
}

function clearTeamInfo() {
    document.getElementById('teamHeader').textContent = 'Select a team to view roster';
    document.getElementById('teamRosterBody').innerHTML = '<tr><td colspan="4" class="text-center text-muted">No team selected</td></tr>';
}

document.getElementById('leagueSelect').addEventListener('change', (e) => {
    const leagueId = e.target.value;
    const teamSelect = document.getElementById('teamSelect');
    
    if (leagueId) {
        loadTeamsForLeague(leagueId);
    } else {
        teamSelect.innerHTML = '<option value="">Select a league first</option>';
        teamSelect.disabled = true;
        clearTeamInfo();
    }
});

document.getElementById('teamSelect').addEventListener('change', (e) => {
    const teamId = e.target.value;
    
    if (teamId) {
        displayTeamInfo(teamId);
    } else {
        clearTeamInfo();
    }
});

loadLeagues();
