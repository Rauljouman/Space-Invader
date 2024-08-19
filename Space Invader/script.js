const grid = document.querySelector(".grid");
const resultDisplay = document.querySelector(".results");
const restartButton = document.getElementById('restart');
let currentShooterIndex = 202;
const width = 16; // Ajustado para el nuevo tamaño del grid
const aliensRemoved = [];
let invadersId;
let isGoingRight = true;
let direction = 1;
let results = 0;
let canShoot = true;
let gameOver = false; // Nuevo estado para el fin del juego

// Crear el grid
for (let i = 0; i < width * width; i++) {
    const square = document.createElement("div");
    grid.appendChild(square);
}

const squares = Array.from(document.querySelectorAll(".grid div"));

const alienInvaders = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    32, 33, 34, 35, 36, 37, 38, 39, 40, 41
];

function draw() {
    for (let i = 0; i < alienInvaders.length; i++) {
        if (!aliensRemoved.includes(i)) {
            squares[alienInvaders[i]].classList.add("invader");
        }
    }
}

draw();

squares[currentShooterIndex].classList.add("shooter");

function remove() {
    for (let i = 0; i < alienInvaders.length; i++) {
        squares[alienInvaders[i]].classList.remove("invader");
    }
}

function moveShooter(e) {
    if (gameOver) return; // No permitir el movimiento si el juego ha terminado
    squares[currentShooterIndex].classList.remove("shooter");
    switch (e.key) {
        case "ArrowLeft":
            if (currentShooterIndex % width !== 0) currentShooterIndex -= 1;
            break;
        case "ArrowRight":
            if (currentShooterIndex % width < width - 1) currentShooterIndex += 1;
            break;
    }
    squares[currentShooterIndex].classList.add("shooter");
}

document.addEventListener("keydown", moveShooter);

function moveInvaders() {
    if (gameOver) return; // No permitir el movimiento si el juego ha terminado

    const leftEdge = alienInvaders[0] % width === 0;
    const rightEdge = alienInvaders[alienInvaders.length - 1] % width === width - 1;
    remove();

    if (rightEdge && isGoingRight) {
        for (let i = 0; i < alienInvaders.length; i++) {
            alienInvaders[i] += width + 1;
            direction = -1;
            isGoingRight = false;
        }
    }

    if (leftEdge && !isGoingRight) {
        for (let i = 0; i < alienInvaders.length; i++) {
            alienInvaders[i] += width - 1;
            direction = 1;
            isGoingRight = true;
        }
    }

    for (let i = 0; i < alienInvaders.length; i++) {
        alienInvaders[i] += direction;
    }

    draw();

    // Verificar si un invader toca al jugador
    if (squares[currentShooterIndex].classList.contains("invader")) {
        resultDisplay.innerHTML = "GAME OVER";
        gameOver = true; // Marcar el estado del juego como terminado
        clearInterval(invadersId);
        clearInterval(invaderShootInterval);
        return;
    }

    // Verificar si un invader llega al final del grid
    for (let i = 0; i < alienInvaders.length; i++) {
        if (alienInvaders[i] >= squares.length - width) {
            resultDisplay.innerHTML = "GAME OVER";
            gameOver = true; // Marcar el estado del juego como terminado
            clearInterval(invadersId);
            clearInterval(invaderShootInterval);
            return;
        }
    }

    if (aliensRemoved.length === alienInvaders.length) {
        resultDisplay.innerHTML = "YOU WIN";
        gameOver = true; // Marcar el estado del juego como terminado
        clearInterval(invadersId);
        clearInterval(invaderShootInterval);
    }
}

invadersId = setInterval(moveInvaders,500);

function shoot(e) {
    if (!canShoot || gameOver) return; // No permitir disparar si el juego ha terminado o no se puede disparar

    let laserId;
    let currentLaserIndex = currentShooterIndex;

    function moveLaser() {
        squares[currentLaserIndex].classList.remove("laser");
        currentLaserIndex -= width;
        if (currentLaserIndex >= 0) {
            squares[currentLaserIndex].classList.add("laser");

            if (squares[currentLaserIndex].classList.contains("invader")) {
                squares[currentLaserIndex].classList.remove("laser");
                squares[currentLaserIndex].classList.remove("invader");
                squares[currentLaserIndex].classList.add("boom");

                setTimeout(() => squares[currentLaserIndex].classList.remove("boom"), 300);
                clearInterval(laserId);

                const alienRemoved = alienInvaders.indexOf(currentLaserIndex);
                aliensRemoved.push(alienRemoved);
                results++;
                resultDisplay.innerHTML = results;
            }

            // Eliminar el láser si sale de la grid
            if (currentLaserIndex < width) {
                clearInterval(laserId);
                squares[currentLaserIndex].classList.remove("laser");
            }
        }
    }

    if (e.key === "ArrowUp") {
        laserId = setInterval(moveLaser, 100);

        // Establecer el cooldown
        canShoot = false;
        setTimeout(() => {
            canShoot = true;
        }, 1000); // Cooldown de 1 segundo
    }
}

document.addEventListener('keydown', shoot);

function invaderShoot() {
    if (gameOver) return; // No permitir disparos si el juego ha terminado

    const availableInvaders = alienInvaders.filter((_, index) => !aliensRemoved.includes(index));
    if (availableInvaders.length === 0) return;

    const randomInvaderIndex = Math.floor(Math.random() * availableInvaders.length);
    let currentLaserIndex = availableInvaders[randomInvaderIndex];

    function moveInvaderLaser() {
        squares[currentLaserIndex].classList.remove("laserInvader");
        currentLaserIndex += width;
        if (currentLaserIndex < squares.length) {
            squares[currentLaserIndex].classList.add("laserInvader");

            if (currentLaserIndex === currentShooterIndex) {
                resultDisplay.innerHTML = "GAME OVER";
                gameOver = true; // Marcar el estado del juego como terminado
                clearInterval(invadersId);
                clearInterval(invaderShootInterval);
                return;
            }

            setTimeout(() => {
                squares[currentLaserIndex].classList.remove("laserInvader");
            }, 100);
        } else {
            clearInterval(laserId);
        }
    }

    const laserId = setInterval(moveInvaderLaser, 300);
}

const invaderShootInterval = setInterval(invaderShoot, 1000); // Los invaders disparan cada segundo

function restartGame() {
    clearInterval(invadersId);
    clearInterval(invaderShootInterval);
    aliensRemoved.length = 0;
    results = 0;
    resultDisplay.innerHTML = results;
    currentShooterIndex = 202;
    direction = 1;
    isGoingRight = true;
    gameOver = false; // Resetear el estado del juego

    squares.forEach(square => {
        square.classList.remove('invader', 'shooter', 'laser', 'laserInvader', 'boom');
    });

    alienInvaders.forEach((invader, i) => {
        alienInvaders[i] = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
            32, 33, 34, 35, 36, 37, 38, 39, 40, 41
        ][i];
    });

    draw();
    squares[currentShooterIndex].classList.add('shooter');
    invadersId = setInterval(moveInvaders, 250);
    setInterval(invaderShoot, 1000); // Los invaders disparan cada segundo
}

restartButton.addEventListener('click', restartGame);
