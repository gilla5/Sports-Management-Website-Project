import { joinTournament, getCurrentUser, updateJoinButtonState } from './join.js';

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function formatTimeTo12Hour(time) {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

async function loadTournament() {
    const id = getQueryParam('id');
    if (!id) {
        alert('No tournament ID provided');
        return;
    }

    try {
        const res = await fetch(`/api/tournaments/${id}`);
        if (!res.ok) throw new Error('Failed to fetch tournament');
        
        const t = await res.json();

        // Tournament info
        document.getElementById('tournamentName').textContent = t.tournamentName || 'Unnamed Tournament';
        document.getElementById('sportType').textContent = t.sportType || 'N/A';
        document.getElementById('tournamentType').textContent = t.tournamentType || 'N/A';
        document.getElementById('startDate').textContent = new Date(t.startDate).toLocaleDateString();
        document.getElementById('endDate').textContent = new Date(t.endDate).toLocaleDateString();
        document.getElementById('gameTimes').textContent = `${formatTimeTo12Hour(t.startTime)} - ${formatTimeTo12Hour(t.endTime)}`;
        document.getElementById('location').textContent = t.location || 'N/A';
        document.getElementById('description').textContent = t.description || 'No description provided';
        document.getElementById('participantsCount').textContent = `${t.participants?.length || 0} / ${t.numTeams || '∞'}`;

        // Populate participants list
        const participantsList = document.getElementById('participantsList');
        participantsList.innerHTML = '';

        if (t.participants && t.participants.length > 0) {
            t.participants.forEach((p) => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = p.teamName || `${p.username} (No team)`;
                participantsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.className = 'list-group-item text-muted';
            li.textContent = 'No participants yet';
            participantsList.appendChild(li);
        }

        // Setup Join button
        const joinBtn = document.getElementById('joinBtn');
        const joinDropdown = document.getElementById('joinDropdown');
        
        if (!joinBtn || !joinDropdown) return;

        updateJoinButtonState(joinBtn, t.participants);

        joinBtn.onclick = async (e) => {
            e.preventDefault();
            
            const user = getCurrentUser();
            if (t.participants?.some(p => p.username === user.username)) {
                alert('You have already joined this tournament!');
                return;
            }
            
            joinDropdown.innerHTML = '';
            
            try {
                const teamsRes = await fetch('/api/teams');
                if (!teamsRes.ok) throw new Error('Failed to fetch teams');
                
                const teams = await teamsRes.json();

                if (!teams || teams.length === 0) {
                    const item = document.createElement('span');
                    item.className = 'dropdown-item text-muted';
                    item.textContent = 'No teams available';
                    joinDropdown.appendChild(item);
                } else {
                    teams.forEach(team => {
                        const item = document.createElement('a');
                        item.className = 'dropdown-item';
                        item.href = '#';
                        item.textContent = team.teamName;

                        item.onclick = async (e) => {
                            e.preventDefault();
                            
                            if (!team.teamName) {
                                alert('Error: Team name is not available');
                                return;
                            }
                            
                            await joinTournament(t._id, t.tournamentName, team._id, team.teamName);
                            joinDropdown.classList.remove('show');
                            await loadTournament();
                        };

                        joinDropdown.appendChild(item);
                    });
                }

                joinDropdown.classList.toggle('show');
            } catch (err) {
                console.error('Error loading teams:', err);
                alert('Failed to load teams. Please try again.');
            }
        };

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!joinBtn.contains(e.target) && !joinDropdown.contains(e.target)) {
                joinDropdown.classList.remove('show');
            }
        });

    } catch (err) {
        console.error('Error loading tournament:', err);
        alert('Failed to load tournament data. Please try again.');
    }
}

loadTournament();