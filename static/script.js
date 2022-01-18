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
	const modeDisplay = document.getElementById("modeDisplay");
	const restartBtn = document.getElementById("restartGame");
	const boxes = document.getElementById("gameBoard").children;
	const boxesArray = Array.from(boxes);
	const changeMode = document.getElementById("changeMode");
	const changeDifficulty = document.getElementById("gameDifficulty");
	
	// Variables
	let turn = "playerOne";
	let turnsPlayed = 0;
	let wrapper;
	let maxDepth = -1;
	
	// Initial state
	if (mode === "onePlayer") {
		changeDifficulty.hidden = false;
		changeDifficulty.addEventListener("change", _changeDifficulty);

		modeDisplay.textContent = "Single player mode";
		restartBtn.addEventListener("click", wrapper = function () { _restartGame(_playerTurn) });
		_attachAllEvents(_playerTurn);
	} else {
		changeDifficulty.hidden = true;

		modeDisplay.textContent = "Two players mode";
		restartBtn.addEventListener("click", wrapper = function () { _restartGame(_newPlay) });
		_attachAllEvents(_newPlay);
	}

	changeMode.addEventListener("click", _changeMode);

	// Initial state
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

		if (turnsPlayed > 4 && gameBoard.checkForWin()) {
			_detachAllEvents(_playerTurn);
			_setWinMessage(marker);
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
			
			// Get the value from minimax and compare it with the best one that has been found.
			// if its less than the minimum value store it in the "best" object replacing the current one. 
			if (depth !== 0) {
				moves.push(result);
			} else {
				(map.has(result)) ? map.get(result).push(el) : map.set(result, [el]);
			}
		});	

		
		if (depth === 0) {
			let minResult = Math.min(...map.keys());
			let index = Math.floor(Math.random() * (map.get(minResult).length));
			return map.get(minResult)[index];
		}
		
		// You store the return values of the minimax functions inside an array, compare the values and return a single one.
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

		// Check if anyone has won when 4 turns have passed,
		// if there is not any win and the number of turns is 9 it means that its a draw.
		if (turnsPlayed > 4 && gameBoard.checkForWin()) {
			_detachAllEvents(_newPlay);
			return _setWinMessage(marker);
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
	
	function _setWinMessage(marker) {
		gameDisplay.textContent = `${marker}'s have won!`;
	}
	
	function _setDrawMessage() {
		gameDisplay.textContent = "Draw";
	}
	
	function _restartGame(callback) {
		gameBoard.restartBoard();

		turnsPlayed = 0;
		turn = "playerOne";
		gameDisplay.textContent = `${playerOne.marker}'s turn`;

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
			changeDifficulty.hidden = true;
			mode = "twoPlayers";
			modeDisplay.textContent = "Two players mode";
			_detachAllEvents(_playerTurn);
			_restartGame(_newPlay);
			restartBtn.removeEventListener("click", wrapper);
			restartBtn.addEventListener("click", wrapper = function () { _restartGame(_newPlay) });
		} else {
			changeDifficulty.hidden = false;
			mode = "onePlayer";
			modeDisplay.textContent = "Single player mode";
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