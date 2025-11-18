        let tournamentId = null;
        let tournament = null;
        let bracketData = {};
        let currentZoom = 1;

        const urlParams = new URLSearchParams(window.location.search);
        tournamentId = urlParams.get('id');

        document.getElementById('zoomIn').addEventListener('click', () => {
            if (currentZoom < 1.5) {
                currentZoom += 0.1;
                updateZoom();
            }
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            if (currentZoom > 0.5) {
                currentZoom -= 0.1;
                updateZoom();
            }
        });

        document.getElementById('zoomReset').addEventListener('click', () => {
            currentZoom = 1;
            updateZoom();
        });

        function updateZoom() {
            const container = document.getElementById('bracketContainer');
            container.style.transform = `scale(${currentZoom})`;
            document.getElementById('zoomLevel').textContent = `${Math.round(currentZoom * 100)}%`;
        }

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    document.getElementById('zoomIn').click();
                } else if (e.key === '-') {
                    e.preventDefault();
                    document.getElementById('zoomOut').click();
                } else if (e.key === '0') {
                    e.preventDefault();
                    document.getElementById('zoomReset').click();
                }
            }
        });

        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'tournament.html';
        });

        document.getElementById('resetBracket').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the entire bracket? This will clear all team names and scores.')) {
                bracketData = {};
                generateBracket();
            }
        });

        async function loadTournament() {
            if (!tournamentId) {
                alert('No tournament ID provided');
                window.location.href = 'tournament.html';
                return;
            }

            try {
                const response = await fetch(`/api/tournaments/${tournamentId}`);
                if (!response.ok) throw new Error('Failed to load tournament');
                
                tournament = await response.json();
                
                document.getElementById('tournamentName').textContent = tournament.tournamentName;
                document.getElementById('tournamentDetails').textContent = 
                    `${tournament.sportType} - ${tournament.tournamentType} - ${tournament.numTeams || 8} Teams`;
                
                bracketData = tournament.bracket || {};
                generateBracket();
            } catch (error) {
                console.error('Error loading tournament:', error);
                alert('Failed to load tournament');
                window.location.href = 'tournament.html';
            }
        }

        function generateBracket() {
            const numTeams = parseInt(tournament.numTeams) || 8;
            const container = document.getElementById('bracketContainer');
            container.innerHTML = '';

            if (!bracketData.rounds || bracketData.rounds.length === 0) {
                initializeBracket(numTeams);
            }

            const numRounds = Math.ceil(Math.log2(numTeams));
            
            for (let round = 0; round < numRounds; round++) {
                const roundDiv = document.createElement('div');
                roundDiv.className = 'round';
                roundDiv.style.minWidth = '400px';
                
                const roundTitle = document.createElement('div');
                roundTitle.className = 'round-title';
                roundTitle.textContent = getRoundName(round, numRounds);
                roundDiv.appendChild(roundTitle);
                
                const matchupsInRound = Math.pow(2, numRounds - round - 1);
                const spacing = Math.pow(2, round + 1) * 80;
                
                for (let matchup = 0; matchup < matchupsInRound; matchup++) {
                    const matchupContainer = document.createElement('div');
                    matchupContainer.className = 'matchup-container';
                    matchupContainer.style.marginTop = matchup === 0 ? `${spacing/2}px` : `${spacing}px`;
                    
                    const matchupDiv = createMatchup(round, matchup);
                    matchupContainer.appendChild(matchupDiv);
                    
                    roundDiv.appendChild(matchupContainer);
                }
                
                container.appendChild(roundDiv);
            }
        }

        function initializeBracket(numTeams) {
            const numRounds = Math.ceil(Math.log2(numTeams));
            bracketData.rounds = [];
            
            for (let round = 0; round < numRounds; round++) {
                const matchupsInRound = Math.pow(2, numRounds - round - 1);
                bracketData.rounds[round] = [];
                
                for (let matchup = 0; matchup < matchupsInRound; matchup++) {
                    bracketData.rounds[round][matchup] = {
                        team1: round === 0 ? `Team ${matchup * 2 + 1}` : 'TBD',
                        team2: round === 0 ? `Team ${matchup * 2 + 2}` : 'TBD',
                        score1: '',
                        score2: '',
                        winner: null
                    };
                }
            }
        }

        function getRoundName(round, totalRounds) {
            if (round === totalRounds - 1) return '🏆 FINALS';
            if (round === totalRounds - 2) return '⭐ SEMI-FINALS';
            if (round === totalRounds - 3) return '💫 QUARTER-FINALS';
            return `Round ${round + 1}`;
        }

        function createMatchup(round, matchupIndex) {
            const matchupDiv = document.createElement('div');
            matchupDiv.className = 'matchup';
            
            const matchupData = bracketData.rounds[round][matchupIndex];
            
            const vsBadge = document.createElement('div');
            vsBadge.className = 'vs-badge';
            vsBadge.textContent = 'VS';
            matchupDiv.appendChild(vsBadge);
            
            const team1Div = document.createElement('div');
            team1Div.className = 'team-slot';
            if (matchupData.winner === 'team1') {
                team1Div.classList.add('winner');
            }
            
            team1Div.innerHTML = `
                <div class="seed-number">1</div>
                <div class="team-info">
                    <input type="text" 
                           class="team-name-input" 
                           value="${matchupData.team1}" 
                           placeholder="Enter team name"
                           data-round="${round}" 
                           data-matchup="${matchupIndex}" 
                           data-team="team1">
                    <input type="number" 
                           class="score-input" 
                           value="${matchupData.score1 || ''}" 
                           placeholder="0"
                           min="0"
                           data-round="${round}" 
                           data-matchup="${matchupIndex}" 
                           data-score="score1">
                </div>
                ${matchupData.winner === 'team1' ? '<span class="winner-badge">WINNER</span>' : ''}
            `;
            
            const team2Div = document.createElement('div');
            team2Div.className = 'team-slot';
            if (matchupData.winner === 'team2') {
                team2Div.classList.add('winner');
            }
            
            team2Div.innerHTML = `
                <div class="seed-number">2</div>
                <div class="team-info">
                    <input type="text" 
                           class="team-name-input" 
                           value="${matchupData.team2}" 
                           placeholder="Enter team name"
                           data-round="${round}" 
                           data-matchup="${matchupIndex}" 
                           data-team="team2">
                    <input type="number" 
                           class="score-input" 
                           value="${matchupData.score2 || ''}" 
                           placeholder="0"
                           min="0"
                           data-round="${round}" 
                           data-matchup="${matchupIndex}" 
                           data-score="score2">
                </div>
                ${matchupData.winner === 'team2' ? '<span class="winner-badge">WINNER</span>' : ''}
            `;
            
            matchupDiv.appendChild(team1Div);
            matchupDiv.appendChild(team2Div);
            
            const team1Input = team1Div.querySelector('.team-name-input');
            const team2Input = team2Div.querySelector('.team-name-input');
            const score1Input = team1Div.querySelector('.score-input');
            const score2Input = team2Div.querySelector('.score-input');
            
            team1Input.addEventListener('input', (e) => {
                bracketData.rounds[round][matchupIndex].team1 = e.target.value;
            });
            
            team2Input.addEventListener('input', (e) => {
                bracketData.rounds[round][matchupIndex].team2 = e.target.value;
            });
            
            score1Input.addEventListener('input', (e) => {
                bracketData.rounds[round][matchupIndex].score1 = e.target.value;
                autoSelectWinner(round, matchupIndex);
            });
            
            score2Input.addEventListener('input', (e) => {
                bracketData.rounds[round][matchupIndex].score2 = e.target.value;
                autoSelectWinner(round, matchupIndex);
            });
            
            team1Div.addEventListener('click', (e) => {
                if (!e.target.classList.contains('team-name-input') && !e.target.classList.contains('score-input')) {
                    selectWinner(round, matchupIndex, 'team1');
                }
            });
            
            team2Div.addEventListener('click', (e) => {
                if (!e.target.classList.contains('team-name-input') && !e.target.classList.contains('score-input')) {
                    selectWinner(round, matchupIndex, 'team2');
                }
            });
            
            return matchupDiv;
        }

        function autoSelectWinner(round, matchupIndex) {
            const matchupData = bracketData.rounds[round][matchupIndex];
            const score1 = parseInt(matchupData.score1) || 0;
            const score2 = parseInt(matchupData.score2) || 0;
            
            if (matchupData.score1 !== '' && matchupData.score2 !== '') {
                if (score1 > score2) {
                    selectWinner(round, matchupIndex, 'team1');
                } else if (score2 > score1) {
                    selectWinner(round, matchupIndex, 'team2');
                }
            }
        }

        function selectWinner(round, matchupIndex, winner) {
            const matchupData = bracketData.rounds[round][matchupIndex];
            matchupData.winner = winner;
            
            const numRounds = bracketData.rounds.length;
            if (round < numRounds - 1) {
                const nextRound = round + 1;
                const nextMatchup = Math.floor(matchupIndex / 2);
                const nextTeamSlot = matchupIndex % 2 === 0 ? 'team1' : 'team2';
                
                const winnerName = winner === 'team1' ? matchupData.team1 : matchupData.team2;
                bracketData.rounds[nextRound][nextMatchup][nextTeamSlot] = winnerName;
            }
            
            generateBracket();
        }

        document.getElementById('saveBracket').addEventListener('click', async () => {
            try {
                const response = await fetch(`/api/tournaments/${tournamentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...tournament,
                        bracket: bracketData,
                        bracketGenerated: true
                    })
                });
                
                if (response.ok) {
                    alert('✅ Bracket saved successfully!');
                    window.location.href = 'tournament.html';
                } else {
                    alert('❌ Failed to save bracket');
                }
            } catch (error) {
                console.error('Error saving bracket:', error);
                alert('❌ Error saving bracket');
            }
        });

        loadTournament();
