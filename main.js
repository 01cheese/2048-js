<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2048 Game</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #faf8ef;
            margin: 0;
            flex-direction: column;
        }

        .game-container {
            display: inline-block;
            background-color: #bbada0;
            border-radius: 6px;
            padding: 15px;
            position: relative;
        }

        .grid-container {
            position: relative;
            width: 500px;
            height: 500px;
            background-color: #bbada0;
            border-radius: 10px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(4, 1fr);
            gap: 10px;
        }

        .grid-cell {
            width: 100px;
            height: 100px;
            background-color: rgba(238, 228, 218, 0.35);
            border-radius: 5px;
        }

        .tile {
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100px;
            height: 100px;
            font-size: 40px;
            color: #776e65;
            border-radius: 5px;
            transition: all 0.3s ease;
        }

        .tile-merge {
            animation: mergeAnimation 0.3s ease;
        }

        @keyframes mergeAnimation {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.2);
            }
            100% {
                transform: scale(1);
            }
        }

        .tile-2 { background-color: #eee4da; }
        .tile-4 { background-color: #ede0c8; }
        .tile-8 { background-color: #f2b179; color: #f9f6f2; }
        .tile-16 { background-color: #f59563; color: #f9f6f2; }
        .tile-32 { background-color: #f67c5f; color: #f9f6f2; }
        .tile-64 { background-color: #f65e3b; color: #f9f6f2; }
        .tile-128 { background-color: #edcf72; color: #f9f6f2; }
        .tile-256 { background-color: #edcc61; color: #f9f6f2; }
        .tile-512 { background-color: #edc850; color: #f9f6f2; }
        .tile-1024 { background-color: #edc53f; color: #f9f6f2; }
        .tile-2048 { background-color: #edc22e; color: #f9f6f2; }

        /* Popup for Game Over */
        .game-over-popup {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(255, 255, 255, 0.9);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            font-size: 24px;
        }

        .game-over-popup button {
            padding: 10px 20px;
            font-size: 18px;
            border: none;
            background-color: #8f7a66;
            color: white;
            cursor: pointer;
            border-radius: 5px;
        }

        .score-container {
            margin-bottom: 20px;
        }

        .score {
            font-size: 24px;
            color: #776e65;
        }

        .undo-button {
            padding: 10px 20px;
            background-color: #8f7a66;
            color: white;
            cursor: pointer;
            border: none;
            border-radius: 5px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="score-container">
        <span class="score">Score: <span id="scoreValue">0</span></span>
        <button class="undo-button" onclick="undoMove()">Undo Move</button>
    </div>
    <div class="game-container">
        <div class="grid-container"></div>

        <!-- Popup for Game Over -->
        <div class="game-over-popup" id="gameOverPopup">
            <p>Game Over!</p>
            <button onclick="restartGame()">Restart</button>
        </div>
    </div>

    <script>
        const GRID_SIZE = 4;
        let score = 0;
        let previousState = null;

        class Grid {
            constructor(gridElement) {
                this.gridElement = gridElement;
                this.cells = [];
                for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
                    const cell = document.createElement('div');
                    cell.classList.add('grid-cell');
                    this.gridElement.append(cell);
                    this.cells.push(cell);
                }
                this.tiles = [];
                this.createTile();
                this.createTile();
                this.setupInput();
            }

            createTile() {
                const emptyCells = this.cells.filter(cell => !cell.hasChildNodes());
                if (emptyCells.length === 0) return;

                const randomIndex = Math.floor(Math.random() * emptyCells.length);
                const newTile = new Tile();
                emptyCells[randomIndex].appendChild(newTile.element);
                this.tiles.push(newTile);
            }

            setupInput() {
                window.addEventListener('keydown', (e) => {
                    if (!this.checkGameOver()) {
                        previousState = this.saveState(); // Save current state before move
                        switch (e.key) {
                            case 'ArrowUp':
                                this.move('up');
                                break;
                            case 'ArrowDown':
                                this.move('down');
                                break;
                            case 'ArrowLeft':
                                this.move('left');
                                break;
                            case 'ArrowRight':
                                this.move('right');
                                break;
                        }
                    }
                });
            }

            move(direction) {
                let hasMoved = false;

                const groupings = this.getGroupings(direction);
                groupings.forEach(group => {
                    let [newGroup, moved] = this.processGroup(group);
                    if (moved) hasMoved = true;
                });

                if (hasMoved) {
                    this.createTile();
                    if (this.checkGameOver()) {
                        this.showGameOverPopup();
                    }
                }
            }

            getGroupings(direction) {
                const groupings = [];
                for (let i = 0; i < GRID_SIZE; i++) {
                    const group = [];
                    for (let j = 0; j < GRID_SIZE; j++) {
                        if (direction === 'up' || direction === 'down') {
                            group.push(this.cells[j * GRID_SIZE + i]);
                        } else {
                            group.push(this.cells[i * GRID_SIZE + j]);
                        }
                    }
                    if (direction === 'down' || direction === 'right') group.reverse();
                    groupings.push(group);
                }
                return groupings;
            }

            processGroup(group) {
                let moved = false;
                let values = group.map(cell => cell.hasChildNodes() ? parseInt(cell.firstChild.textContent) : 0);
                let newValues = [];

                for (let i = 0; i < values.length; i++) {
                    if (values[i] !== 0) {
                        if (newValues.length > 0 && newValues[newValues.length - 1] === values[i]) {
                            newValues[newValues.length - 1] *= 2;
                            score += newValues[newValues.length - 1]; // Update score
                            document.getElementById('scoreValue').textContent = score;
                            group[i].firstChild.classList.add('tile-merge'); // Add merge animation
                        } else {
                            newValues.push(values[i]);
                        }
                    }
                }

                while (newValues.length < GRID_SIZE) newValues.push(0);

                for (let i = 0; i < group.length; i++) {
                    if (newValues[i] !== values[i]) moved = true;
                    if (newValues[i] !== 0) {
                        if (group[i].hasChildNodes()) group[i].firstChild.remove();
                        const newTile = new Tile(newValues[i]);
                        group[i].appendChild(newTile.element);
                    } else if (group[i].hasChildNodes()) {
                        group[i].firstChild.remove();
                    }
                }

                return [newValues, moved];
            }

            checkGameOver() {
                for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
                    if (!this.cells[i].hasChildNodes()) return false;
                }

                // Check if any moves are possible
                for (let i = 0; i < GRID_SIZE; i++) {
                    for (let j = 0; j < GRID_SIZE; j++) {
                        const currentValue = this.cells[i * GRID_SIZE + j].hasChildNodes()
                            ? parseInt(this.cells[i * GRID_SIZE + j].firstChild.textContent)
                            : 0;
                        if (i < GRID_SIZE - 1) {
                            const downValue = this.cells[(i + 1) * GRID_SIZE + j].hasChildNodes()
                                ? parseInt(this.cells[(i + 1) * GRID_SIZE + j].firstChild.textContent)
                                : 0;
                            if (currentValue === downValue) return false;
                        }
                        if (j < GRID_SIZE - 1) {
                            const rightValue = this.cells[i * GRID_SIZE + j + 1].hasChildNodes()
                                ? parseInt(this.cells[i * GRID_SIZE + j + 1].firstChild.textContent)
                                : 0;
                            if (currentValue === rightValue) return false;
                        }
                    }
                }

                return true;
            }

            showGameOverPopup() {
                document.getElementById('gameOverPopup').style.display = 'block';
            }

            saveState() {
                return this.cells.map(cell => {
                    return cell.hasChildNodes() ? parseInt(cell.firstChild.textContent) : 0;
                });
            }

            restoreState(state) {
                for (let i = 0; i < state.length; i++) {
                    if (state[i] !== 0) {
                        if (this.cells[i].hasChildNodes()) this.cells[i].firstChild.remove();
                        const newTile = new Tile(state[i]);
                        this.cells[i].appendChild(newTile.element);
                    } else if (this.cells[i].hasChildNodes()) {
                        this.cells[i].firstChild.remove();
                    }
                }
            }
        }

        class Tile {
            constructor(value = Math.random() > 0.9 ? 4 : 2) {
                this.value = value;
                this.element = document.createElement('div');
                this.updateTile();
            }

            updateTile() {
                this.element.className = `tile tile-${this.value}`;
                this.element.textContent = this.value;
            }
        }

        function restartGame() {
            document.getElementById('gameOverPopup').style.display = 'none';
            score = 0;
            document.getElementById('scoreValue').textContent = score;
            const gridContainer = document.querySelector('.grid-container');
            gridContainer.innerHTML = '';
            new Grid(gridContainer);
        }

        function undoMove() {
            if (previousState) {
                grid.restoreState(previousState);
                previousState = null;
            }
        }

        const gridContainer = document.querySelector('.grid-container');
        const grid = new Grid(gridContainer);
    </script>
</body>
</html>
