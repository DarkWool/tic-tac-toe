// Module to manage the game flow
const game = (function () {
	const playerOne = createPlayer("Wool", true, "x");
	const playerTwo = createPlayer("PC", false, "o");

	const boardSection = document.getElementById("gameBoard");
	const gameResult = document.createElement("p");
	gameResult.classList.add("game-status");

	function _changeTurn() {
		playerOne.turn = (playerOne.turn) ? false : true;
		playerTwo.turn = (playerTwo.turn) ? false : true;
	}

	function getSymbol() {
		return (playerOne.turn) ? playerOne.symbol : playerTwo.symbol;
	}

	function _gameWon() {
		gameResult.textContent = (playerOne.turn) ? `${playerOne.name} has won!` :
			`${playerTwo.name} has won!`;
		boardSection.after(gameResult);
	}

	function _gameDraw() {
		gameResult.textContent = `Draw.`;
		boardSection.after(gameResult);
	}

	function checkStatus(index) {
		// DRAW
		(gameBoard.board.every(el => el)) ? _gameDraw() : false;

		// ROWS
		for (let i = 0; i < 9; i += 3) {
			if (!gameBoard.board[i]) continue;

			if (gameBoard.board[i] === gameBoard.board[i + 1] &&
				gameBoard.board[i] === gameBoard.board[i + 2]) {
				_gameWon();
				return true;
			}
		}
		
		// COLUMNS
		for (let i = 0; i < 3; i++) {
			if (!gameBoard.board[i]) continue;

			if (gameBoard.board[i] === gameBoard.board[i + 3] &&
				gameBoard.board[i] === gameBoard.board[i + 6]) {
				_gameWon();
				return true;
			}
		}

		// DIAGONAL
		if (index % 2 === 0) {
			let [topLeft, , topRight, , middle, , bottomLeft, , bottomRight] = gameBoard.board;

			if ((topLeft && topLeft === middle && topLeft === bottomRight) ||
				(topRight && topRight === middle && topRight === bottomLeft)) {
				_gameWon();
				return true;
			}
		}

		_changeTurn();
	}

	return {
		getSymbol,
		checkStatus
	}
})();

// Module
const gameBoard = (function () {
	let board = Array(9).fill("");

	// DOM elements
	const boxes = document.getElementById("gameBoard").children;
	const boxesArray = Array.from(boxes);

	// Bind events to game boxes
	for (box of boxes) {
		box.addEventListener("click", _addNewPlay);
	}

	function _render() {
		board.forEach((el, index) => {
			boxes[index].textContent = el;
		});
	}

	function _detachSingleEvent(box) {
		box.removeEventListener("click", _addNewPlay);
	}

	function _detachEvents() {
		for (let box of boxes) {
			box.removeEventListener("click", _addNewPlay)
		}
	}

	function _addNewPlay(e) {
		let symbol = game.getSymbol();

		const box = e.target;
		let index = boxesArray.indexOf(box);
		board[index] = symbol;					
		_render();

		if (game.checkStatus(index)) {
			return _detachEvents();
		}

		return _detachSingleEvent(box);
	}

	_render();

	return {
		board
	}
})();

// Factory Function
function createPlayer(name, turn, symbol) {
	return {
		name,
		turn,
		symbol
	};
}