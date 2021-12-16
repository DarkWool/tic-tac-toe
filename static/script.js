// Module to manage the game flow
const game = (function (game) {
	const playerOne = createPlayer("Wool", true, "x");
	const playerTwo = createPlayer("PC", false, "o");

	function changeTurn() {
		if (playerOne.turn) {
			playerOne.turn = false;
			playerTwo.turn = true;

			return playerOne.symbol;
		} else {
			playerOne.turn = true;
			playerTwo.turn = false;

			return playerTwo.symbol;
		}
	}

	return {
		changeTurn
	}
})();

// Module
const gameBoard = (function () {
	let board = Array(9).fill("");

	// DOM element
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

	function _detachEvents(box) {
		box.removeEventListener("click", _addNewPlay);
	}

	function _addNewPlay(e) {
		const box = e.target;
		let playerSymbol = game.changeTurn();

		if (box.textContent) return;
		board[boxesArray.indexOf(box)] = playerSymbol;

		_detachEvents(box);
		_render();
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