import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const leagueSchema = new mongoose.Schema({
  leagueName: { type: String, required: true },
  sportType: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: { type: Object, required: false },
  description: { type: String, required: true },
  image: { type: String, required: false }, // ADD THIS LINE
  participants: [{ 
    username: String, 
    email: String,
    teamId: String,
    teamName: String,
    joinedAt: String 
  }]
}, { timestamps: true });

const tournamentSchema = new mongoose.Schema({
  tournamentName: { type: String, required: true },
  sportType: { type: String, required: true },
  tournamentType: { type: String, required: true },
  numTeams: { type: Number, required: false },
  bracketGenerated: { type: Boolean, default: false },
  bracket: { type: Object, default: {} },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: { type: Object, required: false },
  description: { type: String, required: true },
  image: { type: String, required: false }, // ADD THIS LINE
  participants: [{ 
    username: String, 
    email: String,
    teamId: String,
    teamName: String,
    joinedAt: String 
  }]
}, { timestamps: true });

const teamSchema = new mongoose.Schema({
  leagueId: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: false },
  teamName: { type: String, required: true },
  players: [{ type: String, required: true }],
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  favoriteTeam: { type: String, default: '' },
  favoriteSport: { type: String, default: '' },
}, { timestamps: true });

const League = mongoose.model('League', leagueSchema);
const Tournament = mongoose.model('Tournament', tournamentSchema);
const Team = mongoose.model('Team', teamSchema);
const User = mongoose.model('User', userSchema);

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

app.get('/api/users/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

app.put('/api/users/:username', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      req.body,
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

app.post('/api/leagues', async (req, res) => {
  try {
    const league = new League(req.body);
    await league.save();
    res.status(201).json({ message: 'League created successfully', league });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating league' });
  }
});

app.get('/api/leagues', async (req, res) => {
  try {
    const leagues = await League.find();
    res.json(leagues);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leagues' });
  }
});

app.get('/api/leagues/:id', async (req, res) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    res.json(league);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching league' });
  }
});

app.put('/api/leagues/:id', async (req, res) => {
  try {
    const league = await League.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    res.json({ message: 'League updated successfully', league });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating league' });
  }
});

app.delete('/api/leagues/:id', async (req, res) => {
  try {
    const league = await League.findByIdAndDelete(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    res.json({ message: 'League deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting league' });
  }
});

app.post('/api/tournaments', async (req, res) => {
  try {
    const tournament = new Tournament(req.body);
    await tournament.save();
    res.status(201).json({ message: 'Tournament created successfully', tournament });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating tournament' });
  }
});

app.get('/api/tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tournaments' });
  }
});

app.get('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tournament' });
  }
});

app.put('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json({ message: 'Tournament updated successfully', tournament });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating tournament' });
  }
});

app.delete('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json({ message: 'Tournament deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting tournament' });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const team = new Team(req.body);
    await team.save();
    res.status(201).json({ message: 'Team created successfully', team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating team' });
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find().populate('leagueId');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

app.get('/api/teams/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('leagueId');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching team' });
  }
});

app.put('/api/teams/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json({ message: 'Team updated successfully', team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating team' });
  }
});

app.patch('/api/teams/:id/league', async (req, res) => {
  try {
    console.log('Setting leagueId for team:', req.params.id);
    console.log('New leagueId:', req.body.leagueId);
    
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    team.leagueId = req.body.leagueId;
    await team.save();
    
    console.log('Team after save:', team);
    
    res.json({ message: 'Team league updated successfully', team });
  } catch (err) {
    console.error('Error updating team league:', err);
    res.status(500).json({ message: 'Error updating team league' });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting team' });
  }
});

app.get('/api/leagues/:leagueId/teams', async (req, res) => {
  try {
    const teams = await Team.find({ leagueId: req.params.leagueId });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teams for league' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
