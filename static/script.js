const menu = (function () {
	const onePlayerBtn = document.getElementById("onePlayer");
	const twoPlayersBtn = document.getElementById("twoPlayers");
	const menu = document.getElementById("gameMenu");
	const gameSection = document.getElementById("game");
	const newBg = document.getElementsByClassName("green-bg")[0];
	
	onePlayerBtn.addEventListener("click", startGame.bind(onePlayerBtn, "onePlayer"));
	twoPlayersBtn.addEventListener("click", startGame.bind(twoPlayersBtn, "twoPlayers"));
	
	function startGame(mode) {
		game(mode);
		menu.remove();
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
	const boardSection = document.getElementById("gameBoard");
	const gameDisplay = document.getElementById("gameDisplay");
	const restartBtn = document.getElementById("restartGame");
	const boxes = document.getElementById("gameBoard").children;
	const boxesArray = Array.from(boxes);

	// Variables
	let turn = "playerOne";
	let turnsPlayed = 0;

	// Events
	if (mode === "onePlayer") {
		restartBtn.addEventListener("click", _restartGame.bind(restartBtn, _spNewPlay));
		_attachAllEvents(_spNewPlay);
	} else {
		restartBtn.addEventListener("click", _restartGame.bind(restartBtn, _newPlay));
		_attachAllEvents(_newPlay);
	}

	// Initial state
	gameDisplay.textContent = `${playerOne.getMarker()}'s turn`;

	// Functions and vars for Single Player mode.
	let markerOne = playerOne.getMarker();
	let markerTwo = playerTwo.getMarker();

	function _spNewPlay(e) {
		const box = e.target;
		if (_turnLogic(boxesArray.indexOf(box), box, markerOne)) return;

		_newComputerPlay();
	}

	function _newComputerPlay() {
		let index;
		let board = gameBoard.getBoard();

		do {
			index = _getRandomIndex();
		} while (board[index]);

		boxes[index].classList.add("second-player");
		_turnLogic(index, boxes[index], markerTwo);
	}

	function _turnLogic(index, box, marker) {
		turnsPlayed++;

		gameBoard.addMarker(index, marker);
		
		_render();
		box.removeEventListener("click", _spNewPlay);

		if (_checkForWinOrDraw(marker)) return true;

		_changePlayersTurn();
	}

	function _getRandomIndex() {
		return Math.floor(Math.random() * 9);
	}

	function _checkForWinOrDraw(marker) {
		if (turnsPlayed > 4 && gameBoard.checkForWin()) {
			_detachAllEvents(_spNewPlay);
			_setWinMessage(marker);
			return true;
		} else if (turnsPlayed === 9) {
			_setDrawMessage();
			return true;
		}
	}

	

	// General functions
	function _newPlay(e) {
		turnsPlayed++;
		const box = e.target;
		
		let player = _getPlayer();
		let marker = player.getMarker();
		(marker === 'O') ? box.classList.add("second-player") : false;
		
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

	function _changePlayersTurn() {
		if (turn === "playerOne") {
			turn = "playerTwo";
			gameDisplay.textContent = `${playerTwo.getMarker()}'s turn`;
		} else {
			turn = "playerOne";
			gameDisplay.textContent = `${playerOne.getMarker()}'s turn`;
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
		gameDisplay.textContent = `${playerOne.getMarker()}'s turn`;

		for (box of boxes) {
			box.innerHTML = "";
			box.classList.remove("second-player");
			box.addEventListener("click", callback);
		}
	}

	function _render() {
		gameBoard.getBoard().forEach((el, index) => boxes[index].textContent = el);
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

	function checkForWin() {
		const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

		return winConditions.find((curr, index) => {
			return (board[curr[0]] &&
				(board[curr[0]] === board[curr[1]] && board[curr[1]] === board[curr[2]]));
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
		name,
		marker,
		getMarker() {
			return this.marker;
		}
	};
}