document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing game...");

    // Game Configuration
    const config = {
        roles: [
            { name: "RAJA", points: 1000, color: "#FFD700" },
            { name: "RANI", points: 800, color: "#C0C0C0" },
            { name: "GENERAL", points: 600, color: "#CD7F32" },
            { name: "SOLDIER", points: 400, color: "#FFFFFF" }
        ],
        playerImages: [
            "img/lion.png",
            "img/monkey.png",
            "img/puppy.png",
            "img/panda.png"
        ],
        aiNames: ["AI Raj", "AI Rani", "AI Chor"],

        punishments: [
            "Do 2 funny faces",
            "Dance for 30 seconds",
            "Slap yourself (gently!)",
            "Sing in a funny voice",
            "Bark like a dog for 10 seconds",
            "Touch your forehead to an elder's feet",
            "saluate to winner like mujra",
            "Imitate a monkey",
            "Speak in a baby voice for 1 minute",
            "smell little ones socks",
            "sing through your nose",
            "Tell a bad joke",
            "Do your best celebrity impression",
            "Let others draw on your hand",
            "say, main pagal hoon! 5 times",
            "Do like Frog"
        ],
    
        sounds: {
            buttonClickSound: "clickSound",  // New sound for button taps
            reveal: "revealSound",     // Used for chest reveals
            mix: "mixSound",           // Used for mixing animation
            background: "bgMusic",     // Background music
            reveal: "winnerSound"      // New sound for winner popup
        }
    };
    

    // Game State
    const state = {
        currentScreen: null,
        numPlayers: 4,
        playerNames: [],
        rounds: 5,
        currentRound: 1,
        scores: [0, 0, 0, 0],
        currentCheats: [],
        soundEnabled: true,
        musicEnabled: true,
        audio: {
            mixSound: null,
            revealSound: null,
            bgMusic: null,
            clickSound : null,
            winnerSound:null

        },
        revealedCheats: []
    };

    // DOM Elements
    const elements = {
        screens: {
            start: null,
            selectMode: null,
            playerNames: null,
            game: null,
            results: null
        },
        controls: {
            musicToggle: null,
            soundToggle: null,
            nextRound: null,
            startButton: null,
            startGameBtn: null,
            restartGameBtn: null,
            mainMenuBtn: null
        },
        profiles: [],
        chests: [],
        gameMessage: null
    };

    // Initialize Game
    function init() {
        console.log("Initializing game...");
        
        if (!initializeElements()) {
            console.error("Failed to initialize elements");
            showErrorPage();
            return;
        }
        
        if (!initializeAudio()) {
            console.warn("Audio initialization had issues");
        }
        
        setupEventListeners();
        
        // Set initial screen
        if (!changeScreen("start")) {
            console.error("Failed to set initial screen");
        }
        
        console.log("Game initialized successfully");
    }

    function showErrorPage() {
        document.body.innerHTML = `
            <div style="padding: 20px; color: red; font-size: 24px;">
                Game failed to load. Please check console for errors.
            </div>
        `;
    }

    function initializeElements() {
        try {
            // Initialize screens
            elements.screens.start = document.getElementById("start");
            elements.screens.selectMode = document.getElementById("selectmode");
            elements.screens.playerNames = document.getElementById("playerNames");
            elements.screens.game = document.getElementById("gamescreen");
            elements.screens.results = document.getElementById("resultsscreen");

            // Verify all screens exist
            for (const [name, screen] of Object.entries(elements.screens)) {
                if (!screen) {
                    console.error(`Screen element not found: ${name}`);
                    return false;
                }
            }

            // Initialize controls
            elements.controls.startButton = document.getElementById("startButton");
            elements.controls.musicToggle = document.getElementById("musicToggle");
            elements.controls.soundToggle = document.getElementById("soundToggle");
            elements.controls.nextRound = document.getElementById("nextRoundBtn");
            elements.controls.startGameBtn = document.getElementById("startGameBtn");
            elements.controls.restartGameBtn = document.getElementById("restartGameBtn");
            elements.controls.mainMenuBtn = document.getElementById("mainMenuBtn");

            // Initialize player profiles
            for (let i = 1; i <= 4; i++) {
                const profile = document.getElementById(`profile${i}`);
                if (!profile) {
                    console.error(`Profile ${i} not found`);
                    return false;
                }
                elements.profiles[i-1] = profile;
            }

            // Initialize chests
            for (let i = 1; i <= 4; i++) {
                const chest = document.getElementById(`chest${i}`);
                if (!chest) {
                    console.error(`Chest ${i} not found`);
                    return false;
                }
                chest.dataset.rank = i;
                elements.chests[i-1] = chest;
                
                // Ensure chest content structure exists
                const content = chest.querySelector(".chest-content");
                if (!content) {
                    console.error(`Chest ${i} content not found`);
                    return false;
                }
            }

            // Initialize game message
            elements.gameMessage = document.getElementById("gameMessage");
            if (!elements.gameMessage) {
                console.warn("Game message element not found");
            }
            
            return true;
        } catch (error) {
            console.error("Error initializing elements:", error);
            return false;
        }
    }

    function initializeAudio() {
        try {
            // Initialize all audio elements
            state.audio = {
                clickSound: document.getElementById(config.sounds.buttonClickSound),
                revealSound: document.getElementById(config.sounds.reveal),
                mixSound: document.getElementById(config.sounds.mix),
                bgMusic: document.getElementById(config.sounds.background),
                winnerSound: document.getElementById(config.sounds.reveal)
            };
            
            // Set initial volume levels
            if (state.audio.bgMusic) {
                state.audio.bgMusic.volume = 0.3; // Reduced volume for background music
            }
            if (state.audio.clickSound) {
                state.audio.clickSound.volume = 0.6;
            }
            
            return true;
        } catch (error) {
            console.error("Error initializing audio:", error);
            return false;
        }
    }
    
    // Screen Navigation
    function changeScreen(screenName) {
        console.log(`Attempting to change to screen: ${screenName}`);
        
        try {
            // Verify screens are initialized
            if (!elements.screens || Object.keys(elements.screens).length === 0) {
                console.error("Screens not initialized");
                return false;
            }

            // Hide all screens
            Object.values(elements.screens).forEach(screen => {
                if (screen) {
                    screen.classList.remove("active");
                }
            });

            // Show requested screen
            const targetScreen = elements.screens[screenName];
            if (targetScreen) {
                targetScreen.classList.add("active");
                state.currentScreen = screenName;
                console.log(`Successfully changed to screen: ${screenName}`);
                return true;
            } else {
                console.error(`Target screen not found: ${screenName}. Available screens:`, 
                    Object.keys(elements.screens));
                return false;
            }
        } catch (error) {
            console.error("Error changing screens:", error);
            return false;
        }
    }

    // Game Flow Functions
    function goToSelectMode() {
        changeScreen("selectMode");
    }

    function selectPlayers(numPlayers) {
        state.numPlayers = numPlayers;
        setupplayerNames();
        changeScreen("playerNames");
    }

    function setupplayerNames() {
        const container = document.querySelector(".player-inputs");
        if (!container) {
            console.error("Player inputs container not found");
            return;
        }
        
        container.innerHTML = "";
        
        for (let i = 0; i < state.numPlayers; i++) {
            const div = document.createElement("div");
            div.className = "player-input";
            div.innerHTML = `
                <label for="player${i+1}">Player ${i+1} Name:</label>
                <input type="text" id="player${i+1}" placeholder="Enter name">
            `;
            container.appendChild(div);
        }
    }

    function startGame() {
        try {
            // Get player names
            state.playerNames = [];
            for (let i = 0; i < state.numPlayers; i++) {
                const input = document.getElementById(`player${i+1}`);
                const name = input ? input.value.trim() || `Player ${i+1}` : `Player ${i+1}`;
                state.playerNames.push(name);
            }
            
            // Fill AI names
            for (let i = state.numPlayers; i < 4; i++) {
                state.playerNames.push(config.aiNames[i - state.numPlayers] || `AI Player ${i+1}`);
            }
            
            // Get rounds
            const roundsSelect = document.getElementById("rounds");
            state.rounds = roundsSelect ? parseInt(roundsSelect.value) : 5;
            state.currentRound = 1;
            state.scores = [0, 0, 0, 0];
            
            // Setup game screen
            setupgamescreen();
            
            if (!changeScreen("game")) {
                console.error("Failed to switch to game screen");
                return;
            }
            
            // Start first round
            startRound();
        } catch (error) {
            console.error("Error starting game:", error);
        }
    }

    function setupgamescreen() {
        // Setup player profiles
        for (let i = 0; i < 4; i++) {
            if (elements.profiles[i]) {
                const img = elements.profiles[i].querySelector("img");
                const nameEl = elements.profiles[i].querySelector(".name");
                const scoreEl = elements.profiles[i].querySelector(".score");
                
                if (img) img.src = config.playerImages[i];
                if (nameEl) nameEl.textContent = state.playerNames[i];
                if (scoreEl) scoreEl.textContent = "0 Points";
            }
        }
        
        // Start background music
        if (state.musicEnabled && state.audio.bgMusic) {
            state.audio.bgMusic.play().catch(e => console.log("Music autoplay blocked:", e));
        }
    }

    function startRound() {
        state.revealedCheats = [];
        if (elements.controls.nextRound) {
            elements.controls.nextRound.style.display = "none";
        }
        
        // Reset chests
        elements.chests.forEach(chest => {
            if (!chest) return;
            
            const content = chest.querySelector(".chest-content");
            if (content) {
                const roleEl = content.querySelector(".cheat-role");
                const pointsEl = content.querySelector(".points");
                if (roleEl) roleEl.textContent = "";
                if (pointsEl) pointsEl.textContent = "";
            }
            chest.style.opacity = "1";
            chest.style.pointerEvents = "auto";
            chest.style.backgroundColor = "white";
        });
        
        // Show mixing message
        showGameMessage("Mixing cheats...");
        
        // Start mixing animation
        const chestsContainer = document.querySelector(".chests-container");
        if (chestsContainer) {
            chestsContainer.classList.add("mixing");
            playSound("mix");
            
            setTimeout(() => {
                chestsContainer.classList.remove("mixing");
                assignCheats();
                showGameMessage("Click on cheats to reveal!", 2000);
            }, 2000);
        }
    }

    function assignCheats() {
        const shuffledRoles = [...config.roles].sort(() => Math.random() - 0.5);
        state.currentCheats = shuffledRoles;
        
        const chestsContainer = document.querySelector(".chests-container");
        if (chestsContainer) {
            chestsContainer.classList.add("assigned");
        }
        
        
        elements.chests.forEach((chest, index) => {
            if (!chest) return;
            
            chest.dataset.role = shuffledRoles[index].name;
            chest.dataset.points = shuffledRoles[index].points;
            const badge = chest.querySelector(".rank-badge");
            if (badge) {
                badge.textContent = `${index+1}${getOrdinalSuffix(index+1)}`;
            }
        });
    }

    function revealCheat(rank) {
        const chestIndex = parseInt(rank) - 1;
        const chest = elements.chests[chestIndex];
        if (!chest || state.revealedCheats.includes(rank)) return;
        
        const role = state.currentCheats[chestIndex];
        const content = chest.querySelector(".chest-content");
        if (!content) return;
        
        // Reveal the cheat
        const roleEl = content.querySelector(".cheat-role");
        const pointsEl = content.querySelector(".points");
        if (roleEl) roleEl.textContent = role.name;
        if (pointsEl) pointsEl.textContent = `${role.points} Points`;
        chest.style.backgroundColor = role.color;
    playSound("buttonClickSound")
        
        // Update player score
        const playerIndex = chestIndex;
        state.scores[playerIndex] += role.points;
        const scoreEl = elements.profiles[playerIndex]?.querySelector(".score");
        if (scoreEl) scoreEl.textContent = `${state.scores[playerIndex]} Points`;
        
        // Highlight the player
        if (elements.profiles[playerIndex]) {
            elements.profiles[playerIndex].classList.add("active");
            setTimeout(() => {
                elements.profiles[playerIndex].classList.remove("active");
            }, 1000);
        }
        
        // Mark as revealed
        state.revealedCheats.push(rank);
        
        // Check if all cheats revealed
        if (state.revealedCheats.length === 4) {
            setTimeout(() => {
                if (state.currentRound < state.rounds) {
                    if (elements.controls.nextRound) {
                        elements.controls.nextRound.style.display = "block";
                    }
                } else {
                    showResults();
                }
            }, 1000);
        }
    }

    function nextRound() {
        state.currentRound++;
        startRound();
    }

    function showResults() {
        playSound("reveal", true); // Special winner sound
    
        const players = [];
        for (let i = 0; i < state.numPlayers; i++) {
            players.push({
                name: state.playerNames[i],
                score: state.scores[i],
                index: i // Store original index for punishment
            });
        }
        
        players.sort((a, b) => b.score - a.score);
        
        const container = document.querySelector(".results-container");
        if (!container) return;
        
        container.innerHTML = "";
        
        // Add a title
        const title = document.createElement("h2");
        title.textContent = "Final Scores";
        container.appendChild(title);
        
        // Show all players
        players.forEach((player, index) => {
            const div = document.createElement("div");
            div.className = "result-item";
            
            let medal = "";
            if (index === 0) medal = "🥇";
            else if (index === 1) medal = "🥈";
            else if (index === 2 && players.length > 2) medal = "🥉";
            else medal = "😢";
            
            div.innerHTML = `
                <span class="result-name">${medal} ${player.name}</span>
                <span class="result-points">${player.score} Points</span>
            `;
            container.appendChild(div);
        });
        
        // Add punishment for last place
        if (players.length > 1) {
            const lastPlayer = players[players.length - 1];
            const randomPunishment = config.punishments[
                Math.floor(Math.random() * config.punishments.length)
            ];
            
            const punishmentDiv = document.createElement("div");
            punishmentDiv.className = "punishment";
            punishmentDiv.innerHTML = `
                <div class="punishment-title">${lastPlayer.name} gets a punishment! 😜</div>
                <div class="punishment-task">${randomPunishment}</div>
            `;
            container.appendChild(punishmentDiv);
        }
        
        changeScreen("results");
    }

    function restartGame() {
        state.currentRound = 1;
        state.scores = [0, 0, 0, 0];
        state.revealedCheats = [];
        changeScreen("selectMode");
    }

    function goTostart() {
        if (state.audio.bgMusic) {
            state.audio.bgMusic.pause();
            state.audio.bgMusic.currentTime = 0;
        }
        state.currentRound = 1;
        state.scores = [0, 0, 0, 0];
        state.revealedCheats = [];
        changeScreen("start");
    }

    // Helper Functions
    function getOrdinalSuffix(num) {
        const j = num % 10, k = num % 100;
        if (j === 1 && k !== 11) return "st";
        if (j === 2 && k !== 12) return "nd";
        if (j === 3 && k !== 13) return "rd";
        return "th";
    }

    function showGameMessage(message, duration = 1500) {
        if (!elements.gameMessage) return;
        
        elements.gameMessage.textContent = message;
        elements.gameMessage.classList.add("show");
        
        setTimeout(() => {
            if (elements.gameMessage) {
                elements.gameMessage.classList.remove("show");
            }
        }, duration);
    }

    // Audio Functions
    function playSound(soundKey, isWinner = false) {
        if (!state.soundEnabled) return;
        
        const sound = state.audio[config.sounds[soundKey]];
        if (!sound) return;
        
        // Special case for winner sound
        if (isWinner && state.audio.winnerSound) {
            state.audio.winnerSound.currentTime = 0;
            state.audio.winnerSound.play().catch(e => console.log("Winner sound error:", e));
            return;
        }
        
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound error:", e));
    }
    
    function toggleMusic() {
        state.musicEnabled = !state.musicEnabled;
        if (elements.controls.musicToggle) {
            elements.controls.musicToggle.textContent = state.musicEnabled ? "🔊 Music" : "🔇 Music";
        }
        if (state.musicEnabled) {
            state.audio.bgMusic?.play().catch(e => console.log("Music play error:", e));
        } else {
            state.audio.bgMusic?.pause();
        }
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;
        if (elements.controls.soundToggle) {
            elements.controls.soundToggle.textContent = state.soundEnabled ? "🔔 Sounds" : "🔕 Sounds";
        }
    }

    function setupEventListeners() {
        // Start button
        if (elements.controls.startButton) {
            elements.controls.startButton.addEventListener("click", function() {
                playSound("buttonClickSound");
                goToSelectMode();
            });
        }
            
        // Player select buttons
        const playerSelectButtons = document.querySelectorAll(".player-select");
        if (playerSelectButtons.length > 0) {
            playerSelectButtons.forEach(button => {
                button.addEventListener("click", function() {
                    selectPlayers(parseInt(this.dataset.players));
                });
            });
        } else {
            console.error("Player select buttons not found");
        }
        
        // Start game button
        if (elements.controls.startGameBtn) {
            elements.controls.startGameBtn.addEventListener("click", startGame);
        }
        
        // Next round button
        if (elements.controls.nextRound) {
            elements.controls.nextRound.addEventListener("click", nextRound);
        }
        
        // Restart game button
        if (elements.controls.restartGameBtn) {
            elements.controls.restartGameBtn.addEventListener("click", restartGame);
        }
        
        // Main menu button
        if (elements.controls.mainMenuBtn) {
            elements.controls.mainMenuBtn.addEventListener("click", goTostart);
        }
        
        // Music toggle
        if (elements.controls.musicToggle) {
            elements.controls.musicToggle.addEventListener("click", toggleMusic);
        }
        
        // Sound toggle
        if (elements.controls.soundToggle) {
            elements.controls.soundToggle.addEventListener("click", toggleSound);
        }

        document.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", function() {
                if (state.soundEnabled && state.audio.clickSound) {
                    state.audio.clickSound.currentTime = 0;
                    state.audio.clickSound.play().catch(e => console.log("Click sound error:", e));
                }
            });
        });
    
        // Chest click handlers
        elements.chests.forEach(chest => {
            if (chest) {
                chest.addEventListener("click", function() {
                    revealCheat(this.dataset.rank);
                });
            }
        });
    }

    // Start the game
    init();
});