// --- CONFIGURATION ---
const moveList = ["Rock", "Paper", "Scissors"];
const styleList = ["bg-rock", "bg-paper", "bg-scissors"]; 

// --- DOM ELEMENTS ---
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const statusDisplay = document.getElementById('status-head');
const titleSmall = document.getElementById('title-small');
const buttonWrapper = document.querySelector('.game-button-wrapper');
const resultDisplays = document.querySelectorAll('.move-display h2');

// SCORE ELEMENTS
const scoreBoard = document.getElementById('score-board');
const scoreP1Display = document.getElementById('score-p1');
const scoreCpuDisplay = document.getElementById('score-cpu');

// --- GAME STATE ---
let gameMode = 'cpu'; 
let player1Move = null;
let player2Move = null;
let playerScore = 0;
let cpuScore = 0;

// CHALLENGE VARS
let targetScore = 5; 
const challengeTargets = [3, 5, 7]; 

// --- AUDIO ENGINE ---
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound() {
    initAudio();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = 'sine'; o.frequency.setValueAtTime(200, audioCtx.currentTime); o.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.1); g.gain.setValueAtTime(0.3, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    o.start(); o.stop(audioCtx.currentTime + 0.1);
}

function playRestartSound() {
    initAudio();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = 'triangle'; o.frequency.setValueAtTime(250, audioCtx.currentTime); o.frequency.linearRampToValueAtTime(450, audioCtx.currentTime + 0.3); g.gain.setValueAtTime(0.3, audioCtx.currentTime); g.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    o.start(); o.stop(audioCtx.currentTime + 0.3);
}

function playHoverSound() {
    if (!audioCtx) return; 
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = 'sine'; o.frequency.setValueAtTime(450, audioCtx.currentTime); g.gain.setValueAtTime(0.05, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    o.start(); o.stop(audioCtx.currentTime + 0.05);
}

function playBackSound() {
    initAudio();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = 'sine'; o.frequency.setValueAtTime(200, audioCtx.currentTime); o.frequency.exponentialRampToValueAtTime(650, audioCtx.currentTime + 0.2); g.gain.setValueAtTime(0.3, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    o.start(); o.stop(audioCtx.currentTime + 0.2);
}

function playVictorySound() {
    initAudio();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
        const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.connect(g); g.connect(audioCtx.destination);
        o.type = 'triangle'; o.frequency.value = freq; const now = audioCtx.currentTime; const startTime = now + (i * 0.1); g.gain.setValueAtTime(0.2, startTime); g.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        o.start(startTime); o.stop(startTime + 0.4);
    });
}

function playDefeatSound() {
    initAudio();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.connect(g); g.connect(audioCtx.destination);
    o.type = 'triangle'; o.frequency.setValueAtTime(300, audioCtx.currentTime); o.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5); g.gain.setValueAtTime(0.15, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    o.start(); o.stop(audioCtx.currentTime + 0.5);
}

function playTieSound() {
    initAudio();
    [0, 0.15].forEach((delay) => {
        const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.connect(g); g.connect(audioCtx.destination);
        o.type = 'square'; o.frequency.setValueAtTime(150, audioCtx.currentTime + delay); g.gain.setValueAtTime(0.1, audioCtx.currentTime + delay); g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.1);
        o.start(audioCtx.currentTime + delay); o.stop(audioCtx.currentTime + delay + 0.1);
    });
}

// --- MENU LOGIC ---

window.selectMode = function(mode) {
    playSound(); 
    
    gameMode = mode;
    playerScore = 0;
    cpuScore = 0;

    if (gameMode === 'challenge') {
        targetScore = challengeTargets[Math.floor(Math.random() * challengeTargets.length)];
        scoreBoard.style.display = 'flex';
    } else if (gameMode === 'cpu') {
        scoreBoard.style.display = 'flex';
    } else {
        scoreBoard.style.display = 'none';
    }

    updateScoreDisplay();
    menuScreen.style.display = 'none';
    gameScreen.style.display = 'grid';
    startGame();
}

window.showMainMenu = function() {
    menuScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    scoreBoard.style.display = 'none';
    statusDisplay.style.color = "#fff"; 
}

function updateScoreDisplay() {
    if(scoreP1Display) scoreP1Display.textContent = playerScore;
    if(scoreCpuDisplay) scoreCpuDisplay.textContent = cpuScore;
}

// --- GAME LOGIC ---
function startGame() {
    statusDisplay.classList.remove('pulsing'); 
    statusDisplay.classList.add('floating-text'); 
    statusDisplay.textContent = "Choose!";
    statusDisplay.style.color = "#fff"; 
    
    resultDisplays[0].style.display = 'none';
    resultDisplays[1].style.display = 'none';

    if (gameMode === 'cpu') {
        titleSmall.textContent = "Beat the Computer";
        renderGameButtons((index) => handleSinglePlayerMove(index));
    } 
    else if (gameMode === 'challenge') {
        titleSmall.textContent = `Mission: First to ${targetScore} Wins!`;
        renderGameButtons((index) => handleSinglePlayerMove(index));
    }
    else {
        setupMultiPlayerP1();
    }
}

function handleSinglePlayerMove(index) {
    buttonWrapper.innerHTML = '';
    statusDisplay.classList.remove('floating-text'); 
    statusDisplay.textContent = "Computer Thinking...";
    statusDisplay.classList.add('pulsing'); 

    setTimeout(() => {
        statusDisplay.classList.remove('pulsing');
        let cpuMove = Math.floor(Math.random() * 3);
        showResults(index, cpuMove, "You", "Computer");
    }, 1500); 
}

function setupMultiPlayerP1() {
    statusDisplay.textContent = "Player 1";
    titleSmall.textContent = "Pick a card (Secretly)";
    renderGameButtons((index) => {
        player1Move = index;
        startIntermission();
    });
}

function startIntermission() {
    buttonWrapper.innerHTML = `
        <button class="action-btn" onclick="playSound(); setupMultiPlayerP2()">
            Pass to Player 2
        </button>
    `;
    statusDisplay.textContent = "Stop!";
    titleSmall.textContent = "Don't peek!";
}

function setupMultiPlayerP2() {
    statusDisplay.textContent = "Player 2";
    titleSmall.textContent = "Pick a card";
    renderGameButtons((index) => {
        player2Move = index;
        showResults(player1Move, player2Move, "Player 1", "Player 2");
    });
}

function renderGameButtons(clickCallback) {
    buttonWrapper.innerHTML = ''; 
    moveList.forEach((move, index) => {
        let btn = document.createElement('div');
        btn.className = `game-card ${styleList[index]}`;
        btn.innerHTML = `<div class="card-label">${move}</div>`;
        btn.onclick = () => { playSound(); clickCallback(index); };
        btn.onmouseenter = () => { playHoverSound(); };
        buttonWrapper.appendChild(btn);
    });
}

function showResults(move1, move2, name1, name2) {
    let res = move1 - move2;
    let msg = "";
    
    // 1. DETERMINE ROUND WINNER
    if (move1 === move2) {
        msg = "It's a Tie!";
        playTieSound();
    } 
    else if (res === 1 || res === -2) {
        msg = (name1 === "You") ? "You Win!" : `${name1} Wins!`;
        playVictorySound();
        
        if (gameMode === 'cpu' || gameMode === 'challenge') {
            playerScore++;
            updateScoreDisplay();
        }
    } 
    else {
        msg = `${name2} Wins!`;
        
        if (gameMode === 'cpu' || gameMode === 'challenge') {
            playDefeatSound();
            cpuScore++;
            updateScoreDisplay();
        } else {
            playVictorySound();
        }
    }

    // 2. CHECK FOR CHALLENGE ENDING
    if (gameMode === 'challenge') {
        if (playerScore >= targetScore) {
            endChallenge(true); 
            return;
        } 
        if (cpuScore >= targetScore) {
            endChallenge(false);
            return;
        }
    }

    // 3. RENDER RESULT
    statusDisplay.textContent = msg;
    statusDisplay.classList.remove('floating-text'); 
    titleSmall.textContent = "Round Over";

    resultDisplays[0].style.display = 'flex';
    resultDisplays[0].className = `result-card ${styleList[move1]}`;
    resultDisplays[0].innerHTML = `<div class="result-text">${name1}: ${moveList[move1]}</div>`;

    resultDisplays[1].style.display = 'flex';
    resultDisplays[1].className = `result-card ${styleList[move2]}`;
    resultDisplays[1].innerHTML = `<div class="result-text">${name2}: ${moveList[move2]}</div>`;

    buttonWrapper.innerHTML = `
        <button class="action-btn" onclick="playRestartSound(); startGame()">
            <i class="fa-solid fa-rotate-right"></i> Next Round
        </button>
    `;
}

function endChallenge(playerWon) {
    statusDisplay.classList.remove('floating-text');
    resultDisplays[0].style.display = 'none';
    resultDisplays[1].style.display = 'none';

    if (playerWon) {
        statusDisplay.textContent = "CHAMPION!";
        titleSmall.textContent = `You reached ${targetScore} wins first!`;
        statusDisplay.style.color = "#FFD700"; 
        playVictorySound();
        setTimeout(playVictorySound, 300); 
    } else {
        statusDisplay.textContent = "DEFEATED";
        titleSmall.textContent = "Computer reached the target first.";
        statusDisplay.style.color = "#FF5252"; 
        playDefeatSound();
    }

    buttonWrapper.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px;">
            <button class="action-btn" onclick="playRestartSound(); showMainMenu()">
                Return to Menu
            </button>
             <button class="action-btn" style="background:rgba(255,255,255,0.2); color:#fff;" onclick="playSound(); selectMode('challenge')">
                Retry Challenge
            </button>
        </div>
    `;

}
