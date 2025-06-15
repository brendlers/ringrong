// Globale Variablen
var playerA = 5;
var playerB = 5;
var gameRunning = false;
var gameEnded = false;
var gamePaused = false;
var gameCount = 0;
var trailColors = ['oklch(1 1 0)', 'oklch(1 1 180)', 'oklch(1 1 90)', 'oklch(1 1 270)', 'oklch(1 0.5 0)', 'oklch(1 0.5 180)', 'oklch(1 0.5 90)', 'oklch(1 0.5 270)'];
var trail = []; // Globales Trail-Array

// SVG laden und ins DOM einfügen
fetch('game.svg')
    .then(response => response.text())
    .then(svgContent => {
        const container = document.getElementById('game-container');
        
        // Titel, SVG und HUD zusammen einfügen
        const titleHTML = `<div class="title">RING RONG</div>`;
        const hudHTML = `
            <div class="hud">
                <div class="playerScoreA paddleA">5</div>
                <div class="starter">Start</div>
                <div class="playerScoreB paddleB">5</div>
            </div>
            <div class="info">Press S to save image - Press P to pause</div>
        `;
        
        container.innerHTML = titleHTML + svgContent + hudHTML;
        
        // Warten bis DOM aktualisiert ist, dann Spiel initialisieren
        setTimeout(initializeGame, 100);
    });

function initializeGame() {
    // Hier wird der gesamte Spiel-Code ausgeführt, nachdem SVG geladen wurde
    startGameLogic();
}

function startGameLogic() {

// Funktion zum Speichern des aktuellen SVG mit allen Trails
function saveSVGWithTrails() {
    const svg = document.querySelector('.window svg');
    if (!svg) return;
    
    // SVG-Element klonen für Export
    const svgClone = svg.cloneNode(true);
    
    // Namespace und Attribute für eigenständiges SVG hinzufügen
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    
    // Metadaten als Kommentar hinzufügen
    const metadata = `
    <!-- Ring Rong Game State Export -->
    <!-- Generated: ${new Date().toISOString()} -->
    <!-- Player A Score: ${playerA} -->
    <!-- Player B Score: ${playerB} -->
    <!-- Game Count: ${gameCount} -->
    <!-- Trails: ${document.querySelectorAll('.trail-container path').length} -->
    `;
    
    // SVG-String erstellen
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgClone);
    
    // Metadaten einfügen (nach dem SVG-Tag)
    svgString = svgString.replace('>', '>' + metadata);
    
    // Aktuelles Datum und Zeit für Dateiname
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `ringrong-trails-${timestamp}.svg`;
    
    // Download erstellen
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log(`SVG gespeichert als: ${filename}`);
    
    // Kurze Bestätigung im UI
    const starter = document.querySelector('.starter');
    const originalText = starter.textContent;
    starter.textContent = 'SVG Saved!';
    setTimeout(() => {
        starter.textContent = originalText;
    }, 1000);
}

/**
 * Berechnet den SVG-Path für einen Kreisbogen.
 */
function describeArc(cx, cy, r, startAngle, arcAngle) {
    const rad = (deg) => (deg - 90) * Math.PI / 180;
    const start = {
        x: cx + r * Math.cos(rad(startAngle)),
        y: cy + r * Math.sin(rad(startAngle))
    };
    const end = {
        x: cx + r * Math.cos(rad(startAngle + arcAngle)),
        y: cy + r * Math.sin(rad(startAngle + arcAngle))
    };
    const largeArcFlag = arcAngle > 180 ? 1 : 0;
    const sweepFlag = 1;
    return [
        "M", start.x, start.y,
        "A", r, r, 0, largeArcFlag, sweepFlag, end.x, end.y
    ].join(" ");
}

/**
 * Zeichnet ein Paddle mit verlängerten roten Enden
 */
function drawPaddleWithEnds(cx, cy, r, startAngle, arcAngle, paddleClass) {
    if (arcAngle <= 0) return; // Paddle ist unsichtbar
    
    const svg = document.querySelector('.window svg');
    const paddle = svg.querySelector(`.${paddleClass}`);
    const end1 = svg.querySelector(`.${paddleClass}-end1`);
    const end2 = svg.querySelector(`.${paddleClass}-end2`);
    
    // Haupt-Paddle
    paddle.setAttribute('d', describeArc(cx, cy, r, startAngle, arcAngle));
    
    // Enden nur zeichnen wenn Paddle sichtbar ist
    end1.setAttribute('d', describeArc(cx, cy, r, startAngle - 10, 10));
    end2.setAttribute('d', describeArc(cx, cy, r, startAngle + arcAngle, 10));
}

function duplicateCurrentTrail() {
    const svg = document.querySelector('.window svg');
    const trailContainer = svg.querySelector('.trail-container');
    const currentTrail = svg.querySelector('.ball-trail');
    
    if (currentTrail.getAttribute('d')) {
        // Aktuelle Trail duplizieren
        const duplicatedTrail = currentTrail.cloneNode(true);
        duplicatedTrail.classList.remove('ball-trail');
        duplicatedTrail.classList.add(`historical-trail-${gameCount}`);
        // Farbe basierend auf Spielanzahl
        const color = trailColors[gameCount % trailColors.length];
       

        duplicatedTrail.setAttribute('stroke', color);
        duplicatedTrail.setAttribute('opacity', '0.1');
        
        // Vor der aktuellen Trail einfügen
        trailContainer.insertBefore(duplicatedTrail, currentTrail);
    }
    
    // Aktuelle Trail zurücksetzen
    currentTrail.setAttribute('d', '');
    trail = []; // Trail-Array leeren
    gameCount++;
    
    // Neue Farbe für die aktuelle Trail
    const newColor = trailColors[gameCount % trailColors.length];
    currentTrail.setAttribute('stroke', newColor);
}


// Cursor-Element in SVG bewegen
(function() {
    const svg = document.querySelector('.window svg');
    const cursor = svg.querySelector('.cursor');
    const bbox = svg.viewBox.baseVal;
    let mouseOver = false;
    let target = { x: 50, y: 50 };
    let pos = { x: 50, y: 50 };
    let animFrame;    function svgCoords(evt) {
        const rect = svg.getBoundingClientRect();
        // Touch oder Mouse Event behandeln
        const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
        const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
        const x = ((clientX - rect.left) / rect.width) * bbox.width;
        const y = ((clientY - rect.top) / rect.height) * bbox.height;
        return { x, y };
    }

    function handlePointerMove(evt) {
        mouseOver = true;
        target = svgCoords(evt);
        moveCursor();
        
        // X/Y steuern die Startwinkel der Paddles
        const xNorm = Math.max(0, Math.min(1, (target.x - bbox.x) / bbox.width));
        const yNorm = Math.max(0, Math.min(1, (target.y - bbox.y) / bbox.height));
        const startA = xNorm * 360;
        const startB = yNorm * 360;
        
        // Paddle-Breiten aus Leben berechnen
        const arcA = playerA * 10;
        const arcB = playerB * 10;
        drawPaddleWithEnds(50, 50, 45, startA, arcA, 'paddleA');
        drawPaddleWithEnds(50, 50, 42, startB, arcB, 'paddleB');
    }
    
    // Mouse Events
    svg.addEventListener('mousemove', handlePointerMove);
      // Touch Events
    svg.addEventListener('touchmove', (evt) => {
        evt.preventDefault(); // Verhindert Scrolling
        handlePointerMove(evt);
    });
    
    svg.addEventListener('touchstart', (evt) => {
        evt.preventDefault();
        mouseOver = true;
        handlePointerMove(evt);
    });
    
    svg.addEventListener('touchend', (evt) => {
        evt.preventDefault();
        mouseOver = false;
        animateToCenter();
    });
    
    // Mouse Events  
    svg.addEventListener('mouseleave', () => {
        mouseOver = false;
        animateToCenter();
    });
    
    svg.addEventListener('mouseenter', () => {
        mouseOver = true;
    });

    function moveCursor() {
        pos.x = target.x;
        pos.y = target.y;
        cursor.setAttribute('cx', pos.x);
        cursor.setAttribute('cy', pos.y);
    }

    function animateToCenter() {
        cancelAnimationFrame(animFrame);
        function step() {
            if (mouseOver) return;
            pos.x += (50 - pos.x) * 0.08;
            pos.y += (50 - pos.y) * 0.08;
            cursor.setAttribute('cx', pos.x);
            cursor.setAttribute('cy', pos.y);
            if (Math.abs(pos.x - 50) > 0.1 || Math.abs(pos.y - 50) > 0.1) {
                animFrame = requestAnimationFrame(step);
            } else {
                pos.x = 50; pos.y = 50;
                cursor.setAttribute('cx', 50);
                cursor.setAttribute('cy', 50);
            }
        }
        step();
    }
})();

// Start-Button und SVG-Klick Events - werden nach SVG-Loading gesetzt
// Start-Button Event
// Universelle Funktion für Start-Button Click/Touch
function handleStarterInteraction() {
    const starter = document.querySelector('.starter');
    if (!gameRunning && !gameEnded) {
        gameRunning = true;
        starter.textContent = 'Running...';
        starter.style.pointerEvents = 'none';
    } else if (gameEnded) {
        // Spiel neustarten - Trail duplizieren
        duplicateCurrentTrail();
        playerA = 5;
        playerB = 5;
        gameRunning = true;
        gameEnded = false;
        starter.textContent = 'Running...';
        starter.style.pointerEvents = 'none';
        // Ball zurücksetzen
        document.querySelector('.ball').setAttribute('cx', 50);
        document.querySelector('.ball').setAttribute('cy', 50);
        trail = []; // Trail-Array explizit leeren
    }
}

// Start-Button Events (Click und Touch)
document.querySelector('.starter').addEventListener('click', handleStarterInteraction);
document.querySelector('.starter').addEventListener('touchend', function(evt) {
    evt.preventDefault();
    handleStarterInteraction();
});

// SVG-Klick Event zum Starten/Neustarten
// Universelle Funktion für SVG Click/Touch
function handleSVGInteraction() {
    const starter = document.querySelector('.starter');
    if (!gameRunning && !gameEnded) {
        gameRunning = true;
        starter.textContent = 'Running...';
        starter.style.pointerEvents = 'none';
    } else if (gameEnded) {
        // Spiel neustarten - Trail duplizieren
        duplicateCurrentTrail();
        playerA = 5;
        playerB = 5;
        gameRunning = true;
        gameEnded = false;
        starter.textContent = 'Running...';
        starter.style.pointerEvents = 'none';
        // Ball zurücksetzen
        document.querySelector('.ball').setAttribute('cx', 50);
        document.querySelector('.ball').setAttribute('cy', 50);
        trail = []; // Trail-Array explizit leeren
    }
}

// Click und Touch Events für SVG
document.querySelector('.window svg').addEventListener('click', handleSVGInteraction);
document.querySelector('.window svg').addEventListener('touchend', function(evt) {
    evt.preventDefault();
    handleSVGInteraction();
});

// Ball-Logik: Bewegung, Kollision
(function() {
    const svg = document.querySelector('.window svg');
    const ball = svg.querySelector('.ball');
    const paddleA = svg.querySelector('.paddleA');
    const paddleB = svg.querySelector('.paddleB');
    let bx = 50, by = 50, vx = 1, vy = -1.5;
    const r = 3; // Ballradius
    const minSpeed = 0.8; // Mindestgeschwindigkeit
    let lastPaddle = null; // 'A' oder 'B'
    
    // Ballspur
    const ballTrail = svg.querySelector('.ball-trail');
    const maxTrailLength = 1500;
    
    const scoreA = document.querySelector('.playerScoreA');
    const scoreB = document.querySelector('.playerScoreB');
    
    function updateScores() {
        scoreA.textContent = playerA;
        scoreB.textContent = playerB;
        
        // Prüfe auf Spielende
        if (playerA <= 0 || playerB <= 0) {
            gameRunning = false;
            gameEnded = true;
            const starter = document.querySelector('.starter');
            if (playerA <= 0) {
                starter.textContent = 'Player B Wins! Click to restart';
            } else {
                starter.textContent = 'Player A Wins! Click to restart';
            }
            starter.style.pointerEvents = 'auto';
            return;
        }
        
        // Paddelbreite anpassen: 10° * Leben
        const arcA = Math.max(0, playerA) * 10;
        const arcB = Math.max(0, playerB) * 10;
        
        // Aktuelle Startwinkel beibehalten
        let startA = 0, startB = 0;
        const dA = paddleA.getAttribute('d');
        const dB = paddleB.getAttribute('d');
        
        if (dA) {
            const coords = dA.match(/M ([\d.]+) ([\d.]+)/);
            if (coords) {
                const x = parseFloat(coords[1]);
                const y = parseFloat(coords[2]);
                startA = (Math.atan2(y - 50, x - 50) * 180 / Math.PI + 90 + 360) % 360;
            }
        }
        if (dB) {
            const coords = dB.match(/M ([\d.]+) ([\d.]+)/);
            if (coords) {
                const x = parseFloat(coords[1]);
                const y = parseFloat(coords[2]);
                startB = (Math.atan2(y - 50, x - 50) * 180 / Math.PI + 90 + 360) % 360;
            }
        }
          drawPaddleWithEnds(50, 50, 45, startA, arcA, 'paddleA');
        drawPaddleWithEnds(50, 50, 42, startB, arcB, 'paddleB');
    }
    updateScores();

    function updateBall() {
        // Nur bewegen wenn Spiel läuft und nicht pausiert ist
        if (!gameRunning || gamePaused) {
            requestAnimationFrame(updateBall);
            return;
        }
        
        // Bewegung
        bx += vx;
        by += vy;

        // Mindestgeschwindigkeit durchsetzen
        let speed = Math.hypot(vx, vy);
        if (speed < minSpeed) {
            if (speed === 0) {
                // Falls Ball steht, zufällige Richtung geben
                const angle = Math.random() * 2 * Math.PI;
                vx = minSpeed * Math.cos(angle);
                vy = minSpeed * Math.sin(angle);
            } else {
                vx = (vx / speed) * minSpeed;
                vy = (vy / speed) * minSpeed;
            }
        }

        // Frame-Kollisionen (Kreis)
        const frame = svg.querySelector('.frame');
        const frameR = parseFloat(frame.getAttribute('r'));
        const cx = parseFloat(frame.getAttribute('cx'));
        const cy = parseFloat(frame.getAttribute('cy'));
        const distToCenter = Math.hypot(bx - cx, by - cy);
        
        if (distToCenter + r > frameR) {
            // Ball ist außerhalb des Kreises: Reflektiere mit Dämpfung
            const nx = (bx - cx) / distToCenter;
            const ny = (by - cy) / distToCenter;
            const dot = vx * nx + vy * ny;
            const damping = 0.7;
            vx = (vx - 2 * dot * nx) * damping;
            vy = (vy - 2 * dot * ny) * damping;
            bx = cx + (frameR - r - 0.5) * nx;
            by = cy + (frameR - r - 0.5) * ny;
            
            // Leben abziehen
            if (lastPaddle === 'A') {
                playerB = Math.max(0, playerB - 1);
            } else if (lastPaddle === 'B') {
                playerA = Math.max(0, playerA - 1);
            }
            updateScores();
        }

        // Paddle-Kollisionen
        if (collidesWithArc(bx, by, 45, paddleA)) {
            reflectFromArc(45);
            lastPaddle = 'A';
        }
        
        // Kollision mit roten Enden von PaddleA
        const paddleAEnd1 = svg.querySelector('.paddleA-end1');
        const paddleAEnd2 = svg.querySelector('.paddleA-end2');
        if (collidesWithArc(bx, by, 45, paddleAEnd1) || collidesWithArc(bx, by, 45, paddleAEnd2)) {
            reflectFromPaddleEnd(45);
            lastPaddle = 'A';
        }
        
        if (collidesWithArc(bx, by, 42, paddleB)) {
            reflectFromArc(42);
            lastPaddle = 'B';
        }
        
        // Kollision mit roten Enden von PaddleB
        const paddleBEnd1 = svg.querySelector('.paddleB-end1');
        const paddleBEnd2 = svg.querySelector('.paddleB-end2');
        if (collidesWithArc(bx, by, 42, paddleBEnd1) || collidesWithArc(bx, by, 42, paddleBEnd2)) {
            reflectFromPaddleEnd(42);
            lastPaddle = 'B';
        }

        // Ballspur aktualisieren
        updateTrail(bx, by);

        ball.setAttribute('cx', bx);
        ball.setAttribute('cy', by);
        
        requestAnimationFrame(updateBall);
    }

    function updateTrail(x, y) {
        // Neue Position zur Spur hinzufügen
        trail.push({ x, y });
        if (trail.length > maxTrailLength) {
            trail.shift(); // Älteste Position entfernen
        }
        // Spur-Path erstellen
        const d = trail.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        ballTrail.setAttribute('d', d);
    }

    function collidesWithArc(x, y, radius, paddle) {
        const d = paddle.getAttribute('d');
        if (!d) return false;
        
        // Extrahiere Start- und Endwinkel
        const match = d.match(/M ([\d.]+) ([\d.]+) A [\d.]+ [\d.]+ 0 [01] 1 ([\d.]+) ([\d.]+)/);
        if (!match) return false;
        
        const cx = 50, cy = 50;
        const start = Math.atan2(match[2] - cy, match[1] - cx);
        const end = Math.atan2(match[4] - cy, match[3] - cx);
        let angle = Math.atan2(y - cy, x - cx);
        
        // Normalisiere Winkelbereich
        let a1 = start, a2 = end;
        if (a2 < a1) a2 += 2 * Math.PI;
        if (angle < a1) angle += 2 * Math.PI;
        
        // Prüfe Distanz und Winkelbereich
        const dist = Math.hypot(x - cx, y - cy);
        return Math.abs(dist - radius) < r + 1 && angle >= a1 && angle <= a2;
    }

    function reflectFromArc(radius) {
        // Reflektiere Ball entlang Normale des Bogens zur Kreismitte
        const cx = 50, cy = 50;
        const nx = (cx - bx) / Math.hypot(bx - cx, by - cy);
        const ny = (cy - by) / Math.hypot(bx - cx, by - cy);
        const dot = vx * nx + vy * ny;
        vx = vx - 2 * dot * nx;
        vy = vy - 2 * dot * ny;
        // Ball nach innen schieben
        bx = cx + (radius - r - 0.5) * (bx - cx) / Math.hypot(bx - cx, by - cy);
        by = cy + (radius - r - 0.5) * (by - cy) / Math.hypot(bx - cx, by - cy);
    }

    function reflectFromPaddleEnd(radius) {
        // Spezielle Reflexion für Paddelenden - mehr Spin und Geschwindigkeit
        const cx = 50, cy = 50;
        const nx = (cx - bx) / Math.hypot(bx - cx, by - cy);
        const ny = (cy - by) / Math.hypot(bx - cx, by - cy);
        const dot = vx * nx + vy * ny;
        vx = vx - 2 * dot * nx;
        vy = vy - 2 * dot * ny;
        
        // Zusätzlicher "Spin"-Effekt: Geschwindigkeit erhöhen und abwinkeln
        const speedBoost = 1.3;
        vx *= speedBoost;
        vy *= speedBoost;
        
        // Leichte seitliche Ablenkung für mehr Dynamik
        const spinAngle = (Math.random() - 0) * 0.5;
        const newVx = vx * Math.cos(spinAngle) - vy * Math.sin(spinAngle);
        const newVy = vx * Math.sin(spinAngle) + vy * Math.cos(spinAngle);
        vx = newVx;
        vy = newVy;
        
        // Ball nach innen schieben
        bx = cx + (radius - r - 0.5) * (bx - cx) / Math.hypot(bx - cx, by - cy);
        by = cy + (radius - r - 0.5) * (by - cy) / Math.hypot(bx - cx, by - cy);
    }    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            vy = vy * 1.5;
            vx = vx * 1.5;
        }
        if (e.code === 'KeyP') {
            gamePaused = !gamePaused;
        }
        if (e.code === 'KeyS') {
            saveSVGWithTrails();
        }
    });

    updateBall();
})();

} // Ende von startGameLogic()

