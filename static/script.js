const menu = (function () {
	const onePlayerBtn = document.getElementById("onePlayer");
	const twoPlayersBtn = document.getElementById("twoPlayers");
	const menu = document.getElementById("gameMenu");
	const gameSection = document.getElementById("game");
	const newBg = document.getElementsByClassName("green-bg")[0];
	
	onePlayerBtn.addEventListener("click", _startGame);
	twoPlayersBtn.addEventListener("click", _startGame);

	function _startGame(e) {
		onePlayerBtn.removeEventListener("click", _startGame);
		twoPlayersBtn.removeEventListener("click", _startGame);

		game(e.target.id);

		setTimeout(() => menu.remove(), 500);
		gameSection.classList.add("flex-container", "active");
		newBg.classList.add("active");
	}
})();

// Module to manage the game flow
const game = (mode) => {
	// Players
	const playerOne = createPlayer("Wool", "X");
	const playerTwo = createPlayer("PC", "O");

	// DOM elements
	const gameGrid = document.getElementById("gameBoard");
	const gameDisplay = document.getElementById("gameDisplay");
	const restartBtn = document.getElementById("restartGame");
	const boxes = document.getElementById("gameBoard").children;
	const boxesArray = Array.from(boxes);
	const changeMode = document.getElementById("changeMode");
	
	// Variables
	let turn = "playerOne";
	let turnsPlayed = 0;
	let wrapper;
	let maxDepth = -1;
	const difficultyMenuCode = `<select name="gameDifficulty" id="gameDifficulty" autocomplete="off">
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
                <option selected value="impossible">Impossible</option>
            </select>`;
	let difficultyMenu;

	// Initial state
	if (mode === "onePlayer") {
		changeMode.textContent = "2 PLAYERS";

		gameGrid.insertAdjacentHTML("afterend", difficultyMenuCode);
		difficultyMenu = document.getElementById("gameDifficulty");
		difficultyMenu.addEventListener("change", _changeDifficulty);
		
		restartBtn.addEventListener("click", wrapper = function () { _restartGame(_playerTurn) });
		_attachAllEvents(_playerTurn);
	} else {
		changeMode.textContent = "PLAY VS PC";

		restartBtn.addEventListener("click", wrapper = function () { _restartGame(_newPlay) });
		_attachAllEvents(_newPlay);
	}

	changeMode.addEventListener("click", _changeMode);
	gameDisplay.textContent = `${playerOne.marker}'s turn`;

	// Functions and vars for Single Player mode.
	let markerOne = playerOne.marker;
	let markerTwo = playerTwo.marker;

	function _playerTurn(e) {
		const box = e.target;
		box.classList.add("first-player");
		if (_turnLogic(boxesArray.indexOf(box), box, markerOne)) return;

		_computerTurn();
	}

	function _computerTurn() {
		gameGrid.classList.add("game-block");
		let board = gameBoard.getBoard();
		let finalResults = new Map();
		let index = _minimax(board, false, 0, finalResults);

		setTimeout(() => {
			boxes[index].classList.add("second-player");
			_turnLogic(index, boxes[index], markerTwo);
			gameGrid.classList.remove("game-block");
		}, 325);

	}

	function _turnLogic(index, box, marker) {
		turnsPlayed++;

		gameBoard.addMarker(index, marker);
		
		_render();
		box.removeEventListener("click", _playerTurn);

		let winningResult = gameBoard.checkForWin();
		if (turnsPlayed > 4 && winningResult) {
			_detachAllEvents(_playerTurn);
			_setWinState(marker, winningResult);
			return true;
		} else if (turnsPlayed === 9) {
			_setDrawMessage();
			return true;
		}

		_changePlayersTurn();
	}

	function _minimax(newBoard, maximizing = true, depth = 0, map) {
		// Base case
		if (gameBoard.checkForWin(newBoard)) {
			return (!maximizing) ? 100 - depth : depth + -100;
		} else if (newBoard.every(el => el !== "") || depth === maxDepth) {
			return 0;
		}

		let availSpots = _getAvailableSpots(newBoard);
		const moves = [];

		// Recursive case
		availSpots.forEach((el) => {
			let arr = [...newBoard];
			let result;

			if (maximizing) {
				arr[el] = "X";
				result = _minimax(arr, false, depth + 1);
			} else {
				arr[el] = "O";
				result = _minimax(arr, true, depth + 1);
			}
			
			// If this is NOT the first function call push the result to the 'moves' array to get the minimum value later.
			if (depth !== 0) {
				moves.push(result);
			} else {
				// Add the result of the minimax function call to 'map' with its respective index
				// if it has not been added yet create a new array with the first result, otherwise just push the result.
				(map.has(result)) ? map.get(result).push(el) : map.set(result, [el]);
			}
		});	

		
		if (depth === 0) {
			let minResult = Math.min(...map.keys());
			let index = Math.floor(Math.random() * (map.get(minResult).length));
			return map.get(minResult)[index];
		}
		
		// You store the return values of the minimax functions inside an array, get the min value and return it.
		if (maximizing) return Math.max(...moves);
		else return Math.min(...moves);
	}

	function _getAvailableSpots(board) {
		const spots = [];
		board.forEach((el, index) => {
			if (el === "") spots.push(index);
		});
		return spots;
	}

	function _changeDifficulty(e) {
		_restartGame(_playerTurn);

		switch (e.target.value) {
			case "easy":
				maxDepth = 1;
				break;
			case "normal":
				maxDepth = 4;
				break;
			case "hard":
				maxDepth = 8;
				break;
			default:
				maxDepth = -1;
		}
	}

	// Functions for 2 players mode
	function _newPlay(e) {
		turnsPlayed++;
		const box = e.target;
		
		let player = _getPlayer();
		let marker = player.marker;
		(marker === 'O') ? box.classList.add("second-player") : box.classList.add("first-player");
		
		gameBoard.addMarker(boxesArray.indexOf(box), marker);
		
		_render();
		box.removeEventListener("click", _newPlay);

		let winningResult = gameBoard.checkForWin();
		
		// Check if anyone has won when 4 turns have passed,
		// if there is not any win and the number of turns is 9 it means that its a draw.
		if (turnsPlayed > 4 && winningResult) {
			_detachAllEvents(_newPlay);
			return _setWinState(marker, winningResult);
		} else if (turnsPlayed === 9) {
			return _setDrawMessage();
		}

		_changePlayersTurn();
	}

	function _getPlayer() {
		return (turn === "playerOne") ? playerOne : playerTwo;
	}

	// General functions
	function _changePlayersTurn() {
		if (turn === "playerOne") {
			turn = "playerTwo";
			gameDisplay.textContent = `${playerTwo.marker}'s turn`;
		} else {
			turn = "playerOne";
			gameDisplay.textContent = `${playerOne.marker}'s turn`;
		}
	}
	
	function _setWinState(marker, move) {
		gameDisplay.textContent = `${marker}'s have won!`;
		gameDisplay.classList.add("end-result");

		move = move.join("");
		switch (move) {
			case "012":
			case "345":
			case "678":
				gameGrid.classList.add("final-h");
				break;
			case "036":
			case "147":
			case "258":
				gameGrid.classList.add("final-v");
				break;
			case "048":
			case "246":
				gameGrid.classList.add("final-d");
				break;
		}

		gameGrid.classList.add(`mv${move}`);
	}
	
	function _setDrawMessage() {
		gameDisplay.textContent = "Draw";
		gameDisplay.classList.add("end-result");
	}
	
	function _restartGame(callback) {
		gameBoard.restartBoard();

		turnsPlayed = 0;
		turn = "playerOne";
		gameDisplay.textContent = `${playerOne.marker}'s turn`;
		gameDisplay.classList.remove("end-result");

		gameGrid.removeAttribute("class");

		for (box of boxes) {
			box.innerHTML = "";
			box.classList.remove("first-player", "second-player");
			box.addEventListener("click", callback);
		}
	}

	function _render() {
		gameBoard.getBoard().forEach((el, index) => boxes[index].textContent = el);
	}

	function _changeMode() {
		if (mode === "onePlayer") {
			(difficultyMenu) ? difficultyMenu.remove() : false;

			mode = "twoPlayers";
			changeMode.textContent = "PLAY vs PC";

			_detachAllEvents(_playerTurn);
			_restartGame(_newPlay);

			restartBtn.removeEventListener("click", wrapper);
			restartBtn.addEventListener("click", wrapper = function () { _restartGame(_newPlay) });
		} else {
			gameGrid.insertAdjacentHTML("afterend", difficultyMenuCode);
			difficultyMenu = document.getElementById("gameDifficulty");
			difficultyMenu.addEventListener("change", _changeDifficulty);

			mode = "onePlayer";
			changeMode.textContent = "2 PLAYERS MODE";

			_detachAllEvents(_newPlay);
			_restartGame(_playerTurn);

			restartBtn.removeEventListener("click", wrapper);
			restartBtn.addEventListener("click", wrapper = function () { _restartGame(_playerTurn) });
		}
	}

	// Events functions
	function _attachAllEvents(callback) {
		for (box of boxes) {
			box.addEventListener("click", callback);
		}
	}

	function _detachAllEvents(callback) {
		for (box of boxes) {
			box.removeEventListener("click", callback);
		}
	}
};

const gameBoard = (function () {
	let board = Array(9).fill("");

	function addMarker(index, mark) {
		board[index] = mark;
	}

	function restartBoard() {
		board = Array(9).fill("");
	}

	function checkForWin(newBoard = board) {
		const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

		return winConditions.find((curr) => {
			return (newBoard[curr[0]] &&
				(newBoard[curr[0]] === newBoard[curr[1]] && newBoard[curr[1]] === newBoard[curr[2]]));
		})
	}

	function getBoard() {
		return [...board];
	}

	return {
		addMarker,
		restartBoard,
		checkForWin,
		getBoard
	}
})();

function createPlayer(name, marker) {
	return {
		get name() {
			return name;
		},
		get marker() {
			return marker;
		}
	};
}