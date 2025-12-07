document.getElementById("createLeagueBtn").addEventListener("click", () => {
    window.location.href = "/create.html";
});

let leagues = [];
let teams = [];

async function deleteTeam(id, teamName) {
    if (!confirm(`Are you sure you want to delete "${teamName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/teams/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Team deleted successfully!');
            const leagueSelect = document.getElementById('leagueSelect');
            if (leagueSelect.value) {
                loadTeamsForLeague(leagueSelect.value);
            }
            clearTeamInfo();
        } else {
            alert('Failed to delete team.');
        }
    } catch (err) {
        console.error('Error deleting team:', err);
        alert('An error occurred while deleting the team.');
    }
}

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

    document.getElementById('teamHeader').innerHTML = `
        ${team.teamName}: ${leagueName}
        <div class="mt-2 d-flex justify-content-between align-items-center">
            <div>
                <button class="btn btn-sm btn-success" onclick="joinTeam('${team._id}', '${team.teamName}')">Join Team</button>
                <a href="edit.html?type=team&id=${team._id}" class="btn btn-sm btn-primary">Edit Team</a>
            </div>
            <div>
                <button class="btn btn-sm btn-danger" onclick="deleteTeam('${team._id}', '${team.teamName}')">Delete Team</button>
            </div>
        </div>
    `;

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