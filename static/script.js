const menu = (function () {
	const onePlayerBtn = document.getElementById("onePlayer");
	const twoPlayersBtn = document.getElementById("twoPlayers");
	const menu = document.getElementById("gameMenu");
	const game = document.getElementById("game");
	const newBg = document.getElementsByClassName("green-bg")[0];
	
	onePlayerBtn.addEventListener("click", startGame);
	
	function startGame() {
		menu.remove();
		game.classList.add("flex-container", "active");
		newBg.classList.add("active");
	}
})();

// Module to manage the game flow
const game = (function () {
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
	restartBtn.addEventListener("click", _restartGame);
	for (box of boxes) {
		box.addEventListener("click", _newPlay);
	}

	// Initial state
	gameDisplay.textContent = `${playerOne.getMarker()}'s turn`;

	// General functions
	function _newPlay(e) {
		turnsPlayed++;
		const box = e.target;
		
		let player = _getPlayer();
		let marker = player.getMarker();
		(marker === 'O') ? box.classList.add("second-player") : false;
		
		gameBoard.addMarker(boxesArray.indexOf(box), marker);
		
		_render();
		_detachSingleEvent(box);

		// Check if anyone has won when 4 turns have passed,
		// if there is not any win and the number of turns is 9 it means that its a draw.
		if (turnsPlayed > 4 && gameBoard.checkForWin()) {
			_detachAllEvents();
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
	
	function _restartGame() {
		gameBoard.restartBoard();

		turnsPlayed = 0;
		turn = "playerOne";
		gameDisplay.textContent = `${playerOne.getMarker()}'s turn`;

		for (box of boxes) {
			box.innerHTML = "";
			box.classList.remove("second-player");
			box.addEventListener("click", _newPlay);
		}
	}

	function _render() {
		gameBoard.getBoard().forEach((el, index) => boxes[index].textContent = el);
	}

	// Event functions
	function _detachSingleEvent(box) {
		box.removeEventListener("click", _newPlay);
	}

	function _detachAllEvents() {
		for (box of boxes) {
			box.removeEventListener("click", _newPlay);
		}
	}
})();


let gameBoard = (function () {
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