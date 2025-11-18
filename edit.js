let currentCoordinates = null;
let currentEventType = null;
let currentEventId = null;

const urlParams = new URLSearchParams(window.location.search);
currentEventId = urlParams.get('id');
currentEventType = urlParams.get('type');

document.addEventListener('DOMContentLoaded', () => {
  if (!currentEventId || !currentEventType) {
    alert('Invalid event ID or type');
    window.location.href = 'index.html';
    return;
  }

  loadEventData();
});

document.getElementById('backBtn').addEventListener('click', () => {
  if (document.referrer && document.referrer !== window.location.href) {
    window.history.back();
  } else {
    window.location.href = 'index.html';
  }
});

async function getAddressFromCoordinates(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
      headers: {
        'User-Agent': 'SquadSync Sports Management'
      }
    });
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch (error) {
    console.error('Error getting address:', error);
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

function useMyLocation() {
  const locationInput = document.getElementById('location');
  const statusElement = document.getElementById('locationStatus');
  
  if (!navigator.geolocation) {
    statusElement.textContent = 'Geolocation is not supported by your browser';
    statusElement.className = 'alert alert-danger mt-2';
    statusElement.style.display = 'block';
    return;
  }

  statusElement.textContent = 'Getting your location...';
  statusElement.className = 'alert alert-info mt-2';
  statusElement.style.display = 'block';

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      currentCoordinates = { lat, lon };
      
      statusElement.textContent = 'Location found! Fetching address...';
      
      const address = await getAddressFromCoordinates(lat, lon);
      locationInput.value = address;
      
      statusElement.textContent = `✓ Location set: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      statusElement.className = 'alert alert-success mt-2';
      
      setTimeout(() => {
        statusElement.style.display = 'none';
      }, 3000);
    },
    (error) => {
      let errorMessage = 'Unable to get your location. ';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Please allow location access in your browser.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Location request timed out.';
          break;
        default:
          errorMessage += 'An unknown error occurred.';
      }
      statusElement.textContent = errorMessage;
      statusElement.className = 'alert alert-warning mt-2';
      statusElement.style.display = 'block';
    }
  );
}

async function loadEventData() {
  const formContainer = document.getElementById('dynamicFormContent');
  
  try {
    let endpoint = '';
    if (currentEventType === 'tournament') {
      endpoint = `/api/tournaments/${currentEventId}`;
    } else if (currentEventType === 'league') {
      endpoint = `/api/leagues/${currentEventId}`;
    } else if (currentEventType === 'team') {
      endpoint = `/api/teams/${currentEventId}`;
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('Failed to load event data');
    }

    const data = await response.json();
    renderEditForm(data);
  } catch (error) {
    console.error('Error loading event:', error);
    alert('Failed to load event data');
    window.location.href = 'index.html';
  }
}

function renderEditForm(data) {
  const formContainer = document.getElementById('dynamicFormContent');
  
  if (currentEventType === 'tournament') {
    formContainer.innerHTML = `
      <div class="mb-3">
        <label for="tournamentName" class="form-label">Tournament Name</label>
        <input type="text" class="form-control" id="tournamentName" value="${data.tournamentName}" required>
      </div>

      <div class="mb-3">
        <label for="sportType" class="form-label">Sport Type</label>
        <select class="form-select" id="sportType" required>
          <option value="Baseball" ${data.sportType === 'Baseball' ? 'selected' : ''}>Baseball</option>
          <option value="Basketball" ${data.sportType === 'Basketball' ? 'selected' : ''}>Basketball</option>
          <option value="Hockey" ${data.sportType === 'Hockey' ? 'selected' : ''}>Hockey</option>
          <option value="Football" ${data.sportType === 'Football' ? 'selected' : ''}>Football</option>
          <option value="Soccer" ${data.sportType === 'Soccer' ? 'selected' : ''}>Soccer</option>
          <option value="Tennis" ${data.sportType === 'Tennis' ? 'selected' : ''}>Tennis</option>
        </select>
      </div>

      <div class="mb-3">
        <label for="tournamentType" class="form-label">Type of Tournament</label>
        <select class="form-select" id="tournamentType" required>
          <option value="Round Robin" ${data.tournamentType === 'Round Robin' ? 'selected' : ''}>Round Robin</option>
          <option value="Double Elimination" ${data.tournamentType === 'Double Elimination' ? 'selected' : ''}>Double Elimination</option>
          <option value="Single Elimination" ${data.tournamentType === 'Single Elimination' ? 'selected' : ''}>Single Elimination</option>
          <option value="Group Stage" ${data.tournamentType === 'Group Stage' ? 'selected' : ''}>Group Stage</option>
        </select>
      </div>

      <div class="mb-3">
        <label for="startDate" class="form-label">Event Start Date</label>
        <input type="date" class="form-control" id="startDate" value="${data.startDate}" required>
      </div>

      <div class="mb-3">
        <label for="endDate" class="form-label">Event End Date</label>
        <input type="date" class="form-control" id="endDate" value="${data.endDate}" required>
      </div>

      <div class="mb-3">
        <label for="startTime" class="form-label">Game Start Time</label>
        <input type="time" class="form-control" id="startTime" value="${data.startTime}" required>
      </div>

      <div class="mb-3">
        <label for="endTime" class="form-label">Game End Time</label>
        <input type="time" class="form-control" id="endTime" value="${data.endTime}" required>
      </div>

      <div class="mb-3">
        <label for="location" class="form-label">Event Location</label>
        <input type="text" class="form-control" id="location" value="${data.location}" required>
        <button type="button" class="btn btn-sm btn-primary mt-2" id="useMyLocation">
          📍 Use My Current Location
        </button>
        <div id="locationStatus" class="mt-2" style="display: none;"></div>
      </div>

      <div class="mb-3">
        <label for="description" class="form-label">Custom Description</label>
        <textarea class="form-control" id="description" rows="4" required>${data.description}</textarea>
      </div>
    `;
  } else if (currentEventType === 'league') {
    formContainer.innerHTML = `
      <div class="mb-3">
        <label for="leagueName" class="form-label">League Name</label>
        <input type="text" class="form-control" id="leagueName" value="${data.leagueName}" required>
      </div>

      <div class="mb-3">
        <label for="sportType" class="form-label">Sport Type</label>
        <select class="form-select" id="sportType" required>
          <option value="Baseball" ${data.sportType === 'Baseball' ? 'selected' : ''}>Baseball</option>
          <option value="Basketball" ${data.sportType === 'Basketball' ? 'selected' : ''}>Basketball</option>
          <option value="Hockey" ${data.sportType === 'Hockey' ? 'selected' : ''}>Hockey</option>
          <option value="Football" ${data.sportType === 'Football' ? 'selected' : ''}>Football</option>
          <option value="Soccer" ${data.sportType === 'Soccer' ? 'selected' : ''}>Soccer</option>
          <option value="Tennis" ${data.sportType === 'Tennis' ? 'selected' : ''}>Tennis</option>
        </select>
      </div>

      <div class="mb-3">
        <label for="startDate" class="form-label">Event Start Date</label>
        <input type="date" class="form-control" id="startDate" value="${data.startDate}" required>
      </div>

      <div class="mb-3">
        <label for="endDate" class="form-label">Event End Date</label>
        <input type="date" class="form-control" id="endDate" value="${data.endDate}" required>
      </div>

      <div class="mb-3">
        <label for="startTime" class="form-label">Game Start Time</label>
        <input type="time" class="form-control" id="startTime" value="${data.startTime}" required>
      </div>

      <div class="mb-3">
        <label for="endTime" class="form-label">Game End Time</label>
        <input type="time" class="form-control" id="endTime" value="${data.endTime}" required>
      </div>

      <div class="mb-3">
        <label for="location" class="form-label">Event Location</label>
        <input type="text" class="form-control" id="location" value="${data.location}" required>
        <button type="button" class="btn btn-sm btn-primary mt-2" id="useMyLocation">
          📍 Use My Current Location
        </button>
        <div id="locationStatus" class="mt-2" style="display: none;"></div>
      </div>

      <div class="mb-3">
        <label for="description" class="form-label">Custom Description</label>
        <textarea class="form-control" id="description" rows="4" required>${data.description}</textarea>
      </div>
    `;
  } else if (currentEventType === 'team') {
    formContainer.innerHTML = `
      <div class="mb-3">
        <label for="teamName" class="form-label">Team Name</label>
        <input type="text" class="form-control" id="teamName" value="${data.teamName}" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Player(s) on Team</label>
        <div id="playersContainer">
          ${data.players.map((player, index) => `
            <div class="input-group mb-2">
              <input type="text" class="form-control player-input" placeholder="Player ${index + 1} Name" value="${player}" required>
              ${data.players.length > 1 ? '<button type="button" class="btn btn-outline-danger btn-sm remove-player-btn">Remove</button>' : ''}
            </div>
          `).join('')}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="addPlayerBtn">Add Another Player</button>
      </div>
    `;

    setTimeout(() => {
      document.getElementById('addPlayerBtn').addEventListener('click', () => {
        const playersContainer = document.getElementById('playersContainer');
        const playerCount = playersContainer.querySelectorAll('.player-input').length + 1;
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

      document.querySelectorAll('.remove-player-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.target.closest('.input-group').remove();
        });
      });
    }, 100);
  }

  if (currentEventType === 'tournament' || currentEventType === 'league') {
    setTimeout(() => {
      const useLocationBtn = document.getElementById('useMyLocation');
      if (useLocationBtn) {
        useLocationBtn.addEventListener('click', (e) => {
          e.preventDefault();
          useMyLocation();
        });
      }
    }, 100);
  }
}

document.getElementById('editEventForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  let endpoint = '';
  let eventData = {};

  if (currentEventType === 'tournament') {
    eventData = {
      tournamentName: document.getElementById('tournamentName').value.trim(),
      sportType: document.getElementById('sportType').value,
      tournamentType: document.getElementById('tournamentType').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
      location: document.getElementById('location').value.trim(),
      coordinates: currentCoordinates,
      description: document.getElementById('description').value.trim()
    };
    endpoint = `/api/tournaments/${currentEventId}`;
  } else if (currentEventType === 'league') {
    eventData = {
      leagueName: document.getElementById('leagueName').value.trim(),
      sportType: document.getElementById('sportType').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
      location: document.getElementById('location').value.trim(),
      coordinates: currentCoordinates,
      description: document.getElementById('description').value.trim()
    };
    endpoint = `/api/leagues/${currentEventId}`;
  } else if (currentEventType === 'team') {
    const players = Array.from(document.querySelectorAll('.player-input'))
      .map(input => input.value.trim())
      .filter(name => name !== '');
    
    eventData = {
      teamName: document.getElementById('teamName').value.trim(),
      players: players
    };
    endpoint = `/api/teams/${currentEventId}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      alert(`${currentEventType.charAt(0).toUpperCase() + currentEventType.slice(1)} successfully updated!`);
      
      setTimeout(() => {
        if (currentEventType === 'tournament') {
          window.location.href = 'tournament.html';
        } else if (currentEventType === 'league') {
          window.location.href = 'league.html';
        } else if (currentEventType === 'team') {
          window.location.href = 'team.html';
        }
      }, 500);
    } else {
      alert(`Failed to update ${currentEventType}.`);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('An error occurred while updating the event.');
  }
});
