let playerCount = 1;

document.getElementById('backBtn').addEventListener('click', () => {
  if (document.referrer && document.referrer !== window.location.href) {
    window.history.back();
  } else {
    window.location.href = 'index.html';
  }
});

const formTemplates = {
  Tournament: `
    <div class="mb-3">
      <label for="tournamentName" class="form-label">Tournament Name</label>
      <input type="text" class="form-control" id="tournamentName" required>
    </div>

    <div class="mb-3">
      <label for="sportType" class="form-label">Sport Type</label>
      <select class="form-select" id="sportType" required>
        <option value="">Select a sport</option>
        <option value="Baseball">Baseball</option>
        <option value="Basketball">Basketball</option>
        <option value="Hockey">Hockey</option>
        <option value="Football">Football</option>
        <option value="Soccer">Soccer</option>
        <option value="Tennis">Tennis</option>
      </select>
    </div>

    <div class="mb-3">
      <label for="tournamentType" class="form-label">Type of Tournament</label>
      <select class="form-select" id="tournamentType" required>
        <option value="">Select tournament type</option>
        <option value="Round Robin">Round Robin</option>
        <option value="Double Elimination">Double Elimination</option>
        <option value="Single Elimination">Single Elimination</option>
        <option value="Group Stage">Group Stage</option>
      </select>
    </div>

    <div class="mb-3">
      <label for="startDate" class="form-label">Event Start Date</label>
      <input type="date" class="form-control" id="startDate" required>
    </div>

    <div class="mb-3">
      <label for="endDate" class="form-label">Event End Date</label>
      <input type="date" class="form-control" id="endDate" required>
    </div>

    <div class="mb-3">
      <label for="startTime" class="form-label">Game Start Time</label>
      <input type="time" class="form-control" id="startTime" required>
    </div>

    <div class="mb-3">
      <label for="endTime" class="form-label">Game End Time</label>
      <input type="time" class="form-control" id="endTime" required>
    </div>

    <div class="mb-3">
      <label for="location" class="form-label">Event Locations</label>
      <input type="text" class="form-control" id="location" required>
    </div>

    <div class="mb-3">
      <label for="description" class="form-label">Custom Description</label>
      <textarea class="form-control" id="description" rows="4" required></textarea>
    </div>
  `,

  League: `
    <div class="mb-3">
      <label for="leagueName" class="form-label">League Name</label>
      <input type="text" class="form-control" id="leagueName" required>
    </div>

    <div class="mb-3">
      <label for="sportType" class="form-label">Sport Type</label>
      <select class="form-select" id="sportType" required>
        <option value="">Select a sport</option>
        <option value="Baseball">Baseball</option>
        <option value="Basketball">Basketball</option>
        <option value="Hockey">Hockey</option>
        <option value="Football">Football</option>
        <option value="Soccer">Soccer</option>
        <option value="Tennis">Tennis</option>
      </select>
    </div>

    <div class="mb-3">
      <label for="startDate" class="form-label">Event Start Date</label>
      <input type="date" class="form-control" id="startDate" required>
    </div>

    <div class="mb-3">
      <label for="endDate" class="form-label">Event End Date</label>
      <input type="date" class="form-control" id="endDate" required>
    </div>

    <div class="mb-3">
      <label for="startTime" class="form-label">Game Start Time</label>
      <input type="time" class="form-control" id="startTime" required>
    </div>

    <div class="mb-3">
      <label for="endTime" class="form-label">Game End Time</label>
      <input type="time" class="form-control" id="endTime" required>
    </div>

    <div class="mb-3">
      <label for="location" class="form-label">Event Locations</label>
      <input type="text" class="form-control" id="location" required>
    </div>

    <div class="mb-3">
      <label for="description" class="form-label">Custom Description</label>
      <textarea class="form-control" id="description" rows="4" required></textarea>
    </div>
  `,

  Team: `
    <div class="mb-3">
      <label for="leagueSelect" class="form-label">League For Team</label>
      <select class="form-select" id="leagueSelect" required>
        <option value="">Loading leagues...</option>
      </select>
    </div>

    <div class="mb-3">
      <label for="teamName" class="form-label">Team Name</label>
      <input type="text" class="form-control" id="teamName" required>
    </div>

    <div class="mb-3">
      <label class="form-label">Player(s) on Team</label>
      <div id="playersContainer">
        <div class="input-group mb-2">
          <input type="text" class="form-control player-input" placeholder="Player 1 Name" required>
        </div>
      </div>
      <button type="button" class="btn btn-secondary btn-sm" id="addPlayerBtn">Add Another Player</button>
    </div>
  `
};

async function loadLeagues() {
  try {
    const response = await fetch('/api/leagues');
    if (response.ok) {
      const leagues = await response.json();
      const leagueSelect = document.getElementById('leagueSelect');
      
      if (leagues.length === 0) {
        leagueSelect.innerHTML = '<option value="">No leagues available</option>';
      } else {
        leagueSelect.innerHTML = '<option value="">Select a league</option>';
        leagues.forEach(league => {
          const option = document.createElement('option');
          option.value = league._id;
          option.textContent = league.title || league.leagueName || 'Unnamed League';
          leagueSelect.appendChild(option);
        });
      }
    } else {
      console.error('Failed to load leagues');
    }
  } catch (err) {
    console.error('Error loading leagues:', err);
  }
}

function renderForm(eventType) {
  const container = document.getElementById('dynamicFormContent');
  container.innerHTML = formTemplates[eventType];
  
  if (eventType === 'Team') {
    playerCount = 1;
    loadLeagues();
    
    document.getElementById('addPlayerBtn').addEventListener('click', () => {
      playerCount++;
      const playersContainer = document.getElementById('playersContainer');
      const newPlayerField = document.createElement('div');
      newPlayerField.className = 'input-group mb-2';
      newPlayerField.innerHTML = `
        <input type="text" class="form-control player-input" placeholder="Player ${playerCount} Name" required>
        <button type="button" class="btn btn-outline-danger btn-sm remove-player-btn">Remove</button>
      `;
      playersContainer.appendChild(newPlayerField);

      newPlayerField.querySelector('.remove-player-btn').addEventListener('click', () => {
        newPlayerField.remove();
      });
    });
  }
}

document.querySelectorAll('input[name="eventType"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    renderForm(e.target.value);
  });
});

document.getElementById('addEventForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const eventType = document.querySelector('input[name="eventType"]:checked').value;
  let eventData = {};
  let endpoint = '';

  if (eventType === 'Tournament') {
    eventData = {
      tournamentName: document.getElementById('tournamentName').value.trim(),
      sportType: document.getElementById('sportType').value,
      tournamentType: document.getElementById('tournamentType').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
      location: document.getElementById('location').value.trim(),
      description: document.getElementById('description').value.trim()
    };
    endpoint = '/api/tournaments';
  } else if (eventType === 'League') {
    eventData = {
      leagueName: document.getElementById('leagueName').value.trim(),
      sportType: document.getElementById('sportType').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
      location: document.getElementById('location').value.trim(),
      description: document.getElementById('description').value.trim()
    };
    endpoint = '/api/leagues';
  } else if (eventType === 'Team') {
    const players = Array.from(document.querySelectorAll('.player-input'))
      .map(input => input.value.trim())
      .filter(name => name !== '');
    
    eventData = {
      leagueId: document.getElementById('leagueSelect').value,
      teamName: document.getElementById('teamName').value.trim(),
      players: players
    };
    endpoint = '/api/teams';
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      alert(`${eventType} successfully created!`);
      document.getElementById('addEventForm').reset();
      document.getElementById('dynamicFormContent').innerHTML = '';
      
      setTimeout(() => {
        if (document.referrer && document.referrer !== window.location.href) {
          window.history.back();
        } else {
          window.location.href = 'index.html';
        }
      }, 500);
    } else {
      alert(`Failed to create ${eventType.toLowerCase()}.`);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('An error occurred while submitting the form.');
  }
});
