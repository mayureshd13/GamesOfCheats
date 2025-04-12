// Game Configuration
const config = {
    roles: [
        { name: "RAJA", points: 1000, color: "#FFD700" },
        { name: "RANI", points: 800, color: "#C0C0C0" },
        { name: "GENERAL", points: 600, color: "#CD7F32" },
        { name: "SOLDIER", points: 400, color: "#B0C4DE" }
    ],
    playerImages: [
        "img/lion.png",
        "img/monkey.png",
        "img/puppy.png",
        "img/panda.png"
    ],
    aiNames: ["AI Raj", "AI Rani", "AI Chor"],
    sounds: {
        mix: "mixSound",
        reveal: "revealSound",
        background: "bgMusic"
    }
};

// Game State
const state = {
    currentScreen: "startScreen",
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
        bgMusic: null
    },
    revealedCheats: []
};

// Initialize Game
function init() {
    // Initialize audio elements
    state.audio.mixSound = document.getElementById(config.sounds.mix);
    state.audio.revealSound = document.getElementById(config.sounds.reveal);
    state.audio.bgMusic = document.getElementById(config.sounds.background);

    // Setup event listeners
    document.getElementById("startButton").addEventListener("click", goToSelectMode);
    
    document.querySelectorAll(".player-select").forEach(button => {
        button.addEventListener("click", function() {
            selectPlayers(parseInt(this.dataset.players));
        });
    });
    
    document.getElementById("startGameBtn").addEventListener("click", startGame);
    document.getElementById("nextRoundBtn").addEventListener("click", nextRound);
    document.getElementById("restartGameBtn").addEventListener("click", restartGame);
    document.getElementById("mainMenuBtn").addEventListener("click", goToStartScreen);
    
    document.getElementById("musicToggle").addEventListener("click", toggleMusic);
    document.getElementById("soundToggle").addEventListener("click", toggleSound);

    // Add click listeners to chests
    document.querySelectorAll(".chest").forEach(chest => {
        chest.addEventListener("click", function() {
            revealCheat(this.dataset.rank);
        });
    });

    // Show start screen
    changeScreen("startScreen");
}

// Screen Navigation
function changeScreen(screenName) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });
    document.getElementById(screenName).classList.add("active");
    state.currentScreen = screenName;
}

function goToSelectMode() {
    changeScreen("selectModeScreen");
}

function selectPlayers(numPlayers) {
    state.numPlayers = numPlayers;
    setupPlayerNamesScreen();
    changeScreen("playerNamesScreen");
}

function setupPlayerNamesScreen() {
    const container = document.querySelector(".player-inputs");
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

// Game Logic
function startGame() {
    // Get player names
    state.playerNames = [];
    for (let i = 0; i < state.numPlayers; i++) {
        const name = document.getElementById(`player${i+1}`).value.trim() || `Player ${i+1}`;
        state.playerNames.push(name);
    }
    
    // Fill AI names
    for (let i = state.numPlayers; i < 4; i++) {
        state.playerNames.push(config.aiNames[i - state.numPlayers]);
    }
    
    // Get rounds
    state.rounds = parseInt(document.getElementById("rounds").value);
    state.currentRound = 1;
    state.scores = [0, 0, 0, 0];
    
    // Setup game screen
    setupGameScreen();
    changeScreen("gameScreen");
    
    // Start first round
    startRound();
}

function setupGameScreen() {
    // Setup player profiles
    for (let i = 0; i < 4; i++) {
        const profile = document.getElementById(`profile${i+1}`);
        profile.querySelector("img").src = config.playerImages[i];
        profile.querySelector(".name").textContent = state.playerNames[i];
        profile.querySelector(".score").textContent = "0 Points";
    }
    
    // Start background music
    if (state.musicEnabled) {
        state.audio.bgMusic.play().catch(e => console.log("Music autoplay blocked:", e));
    }
}

function startRound() {
    state.revealedCheats = [];
    document.getElementById("nextRoundBtn").style.display = "none";
    document.querySelectorAll(".chest-content div").forEach(el => {
        el.textContent = "";
    });
    
    // Reset chest styles
    document.querySelectorAll(".chest").forEach(chest => {
        chest.style.opacity = "1";
        chest.style.pointerEvents = "auto";
    });
    
    // Show mixing message
    showGameMessage("Mixing cheats...");
    
    // Start mixing animation
    document.querySelector(".chests-container").classList.add("mixing");
    playSound("mix");
    
    setTimeout(() => {
        document.querySelector(".chests-container").classList.remove("mixing");
        assignCheats();
        showGameMessage("Click on cheats to reveal!", 2000);
    }, 2000);
}

function assignCheats() {
    // Shuffle roles
    const shuffledRoles = [...config.roles].sort(() => Math.random() - 0.5);
    state.currentCheats = shuffledRoles;
    
    // Move chests to players but don't reveal yet
    document.querySelector(".chests-container").classList.add("assigned");
    playSound("reveal");
    
    // Assign ranks to chests
    for (let i = 0; i < 4; i++) {
        const chest = document.getElementById(`chest${i+1}`);
        chest.dataset.role = shuffledRoles[i].name;
        chest.dataset.points = shuffledRoles[i].points;
        chest.querySelector(".rank-badge").textContent = `${i+1}${getOrdinalSuffix(i+1)}`;
    }
}

function revealCheat(rank) {
    const chest = document.getElementById(`chest${rank}`);
    const role = state.currentCheats[rank-1];
    
    if (state.revealedCheats.includes(rank)) return;
    
    // Reveal the cheat
    chest.querySelector(".cheat-role").textContent = role.name;
    chest.querySelector(".points").textContent = `${role.points} Points`;
    chest.style.backgroundColor = role.color;
    
    // Update player score
    const playerIndex = rank - 1;
    state.scores[playerIndex] += role.points;
    document.querySelector(`#profile${rank} .score`).textContent = `${state.scores[playerIndex]} Points`;
    
    // Highlight the player
    const profile = document.getElementById(`profile${rank}`);
    profile.classList.add("active");
    setTimeout(() => profile.classList.remove("active"), 1000);
    
    // Mark as revealed
    state.revealedCheats.push(rank);
    
    // Check if all cheats revealed
    if (state.revealedCheats.length === 4) {
        setTimeout(() => {
            if (state.currentRound < state.rounds) {
                document.getElementById("nextRoundBtn").style.display = "block";
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
    const players = [];
    for (let i = 0; i < state.numPlayers; i++) {
        players.push({
            name: state.playerNames[i],
            score: state.scores[i]
        });
    }
    
    players.sort((a, b) => b.score - a.score);
    
    const container = document.querySelector(".results-container");
    container.innerHTML = "";
    
    players.forEach((player, index) => {
        const div = document.createElement("div");
        div.className = "result-item";
        
        let medal = "";
        if (index === 0) medal = "🥇";
        else if (index === 1) medal = "🥈";
        else if (index === 2) medal = "🥉";
        else medal = "😢";
        
        div.innerHTML = `
            <span class="result-name">${medal} ${player.name}</span>
            <span class="result-points">${player.score} Points</span>
        `;
        container.appendChild(div);
    });
    
    changeScreen("resultsScreen");
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
    const messageEl = document.getElementById("gameMessage");
    messageEl.textContent = message;
    messageEl.classList.add("show");
    
    setTimeout(() => {
        messageEl.classList.remove("show");
    }, duration);
}

// Audio Functions
function playSound(soundKey) {
    if (!state.soundEnabled || !state.audio[config.sounds[soundKey]]) return;
    const sound = state.audio[config.sounds[soundKey]];
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Sound error:", e));
}

function toggleMusic() {
    state.musicEnabled = !state.musicEnabled;
    document.getElementById("musicToggle").textContent = state.musicEnabled ? "🔊 Music" : "🔇 Music";
    if (state.musicEnabled) {
        state.audio.bgMusic.play().catch(e => console.log("Music play error:", e));
    } else {
        state.audio.bgMusic.pause();
    }
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    document.getElementById("soundToggle").textContent = state.soundEnabled ? "🔔 Sounds" : "🔕 Sounds";
}

// Start the game when DOM is fully loaded
document.addEventListener("DOMContentLoaded", init);