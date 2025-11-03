document.getElementById('addEventForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const eventType = document.querySelector('input[name="eventType"]:checked').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const location = document.getElementById('location').value.trim();

  const eventData = { title, date, time, location };

  const endpoint = eventType === 'League' ? '/api/leagues' : '/api/tournaments';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      alert(`${eventType} successfully created!`);
      document.getElementById('addEventForm').reset();
    } else {
      alert('Failed to create event.');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('An error occurred while submitting the form.');
  }
});
