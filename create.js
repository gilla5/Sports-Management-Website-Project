
let playerCount = 1;
let currentCoordinates = null;
let selectedImageFile = null;

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

function useMyLocation(locationInputId, statusElementId) {
  const locationInput = document.getElementById(locationInputId);
  const statusElement = document.getElementById(statusElementId);
  
  if (!locationInput) {
    console.error('Location input element not found');
    return;
  }
  
  if (!statusElement) {
    console.error('Status element not found');
    return;
  }
  
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
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5000000) {
      alert('Image file size must be less than 5MB');
      event.target.value = '';
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      event.target.value = '';
      return;
    }
    
    selectedImageFile = file;
    
    const preview = document.getElementById('imagePreview');
    if (preview) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }
}

function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const formTemplates = {
  Tournament: `
    <div class="mb-3">
      <label for="tournamentName" class="form-label">Tournament Name</label>
      <input type="text" class="form-control" id="tournamentName" required>
    </div>

    <div class="mb-3">
      <label for="tournamentImage" class="form-label">Tournament Image (Optional)</label>
      <input type="file" class="form-control" id="tournamentImage" accept="image/*">
      <small class="text-muted">Max file size: 5MB. Recommended size: 800x400px</small>
      <img id="imagePreview" style="max-width: 100%; max-height: 200px; margin-top: 10px; display: none;" />
    </div>

    <div class="mb-3">
      <label for="sportType" class="form-label">Sport Type</label>
      <select class="form-select" id="sportType" required>
        <option value="">Select a sport</option>
        <option value="Baseball">Baseball</option>
        <option value="Basketball">Basketball</option>
        <option value="Football">Football</option>
        <option value="Golf">Golf</option>
        <option value="Hockey">Hockey</option>
        <option value="Lacrosse">Lacrosse</option>
        <option value="Pickleball">Pickleball</option>
        <option value="Soccer">Soccer</option>
        <option value="Spikeball">Spikeball</option>
        <option value="Tennis">Tennis</option>
        <option value="Volleyball">Volleyball</option>
        <option value="Wrestling">Wrestling</option>
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
      <label for="numTeams" class="form-label">Number of Teams</label>
      <select class="form-select" id="numTeams">
        <option value="">Select number of teams</option>
        <option value="4">4 Teams</option>
        <option value="8">8 Teams</option>
        <option value="16">16 Teams</option>
        <option value="32">32 Teams</option>
      </select>
      <small class="text-muted">Optional: Select to generate bracket preview</small>
    </div>

    <div id="bracketPreview" style="display: none;" class="mb-3 p-3 border rounded bg-light">
      <h5>Bracket Preview</h5>
      <p class="text-muted">Bracket structure will be generated after tournament creation</p>
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
      <label for="location" class="form-label">Event Location</label>
      <input type="text" class="form-control" id="location" placeholder="Enter location or use your current location" required>
      <button type="button" class="btn btn-sm btn-primary mt-2" id="useMyLocation">
        📍 Use My Current Location
      </button>
      <div id="locationStatus" class="mt-2" style="display: none;"></div>
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
      <label for="leagueImage" class="form-label">League Image (Optional)</label>
      <input type="file" class="form-control" id="leagueImage" accept="image/*">
      <small class="text-muted">Max file size: 5MB. Recommended size: 800x400px</small>
      <img id="imagePreview" style="max-width: 100%; max-height: 200px; margin-top: 10px; display: none;" />
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
      <label for="location" class="form-label">Event Location</label>
      <input type="text" class="form-control" id="location" placeholder="Enter location or use your current location" required>
      <button type="button" class="btn btn-sm btn-primary mt-2" id="useMyLocation">
        📍 Use My Current Location
      </button>
      <div id="locationStatus" class="mt-2" style="display: none;"></div>
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

function setupLocationButton() {
  const useLocationBtn = document.getElementById('useMyLocation');
  
  if (useLocationBtn) {
    const newBtn = useLocationBtn.cloneNode(true);
    useLocationBtn.parentNode.replaceChild(newBtn, useLocationBtn);
    
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      useMyLocation('location', 'locationStatus');
    });
  }
}

function setupImageUpload() {
  const tournamentImageInput = document.getElementById('tournamentImage');
  const leagueImageInput = document.getElementById('leagueImage');
  
  if (tournamentImageInput) {
    tournamentImageInput.addEventListener('change', handleImageUpload);
  }
  
  if (leagueImageInput) {
    leagueImageInput.addEventListener('change', handleImageUpload);
  }
}

function setupBracketPreview() {
  const numTeamsSelect = document.getElementById('numTeams');
  
  if (numTeamsSelect) {
    numTeamsSelect.addEventListener('change', (e) => {
      const bracketPreview = document.getElementById('bracketPreview');
      if (bracketPreview) {
        if (e.target.value) {
          bracketPreview.style.display = 'block';
          bracketPreview.innerHTML = `
            <h5>Bracket Preview</h5>
            <p class="text-muted">Tournament will use ${e.target.value} teams in a bracket format</p>
            <p class="text-info">Full bracket will be available after teams are registered</p>
          `;
        } else {
          bracketPreview.style.display = 'none';
        }
      }
    });
  }
}

function renderForm(eventType) {
  const container = document.getElementById('dynamicFormContent');
  container.innerHTML = formTemplates[eventType];
  selectedImageFile = null;
  
  if (eventType === 'Team') {
    playerCount = 1;
    loadLeagues();
    
    const addPlayerBtn = document.getElementById('addPlayerBtn');
    if (addPlayerBtn) {
      addPlayerBtn.addEventListener('click', () => {
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
  } else if (eventType === 'Tournament' || eventType === 'League') {
    requestAnimationFrame(() => {
      setupLocationButton();
      setupImageUpload();
      
      if (eventType === 'Tournament') {
        setupBracketPreview();
      }
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
      numTeams: document.getElementById('numTeams').value || null,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
      location: document.getElementById('location').value.trim(),
      coordinates: currentCoordinates,
      description: document.getElementById('description').value.trim()
    };
    
    if (selectedImageFile) {
      eventData.image = await convertImageToBase64(selectedImageFile);
    }
    
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
      coordinates: currentCoordinates,
      description: document.getElementById('description').value.trim()
    };
    
    if (selectedImageFile) {
      eventData.image = await convertImageToBase64(selectedImageFile);
    }
    
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
      currentCoordinates = null;
      selectedImageFile = null;
    }
  } catch (err) {
    console.error('Error:', err);
    alert('An error occurred while submitting the form.');
  }
});