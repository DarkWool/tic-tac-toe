// Module
const gameBoard = (function () {
    let boardContent = ["x", "o", "x", "o", "o", "x"];

    // DOM element
    const boxes = document.getElementById("gameBoard").children;

    // Bind events
    for (box of boxes) {
        box.addEventListener("click", addNewPlay);
    }

    function _render() {
        boardContent.forEach((el, index) => {
            boxes[index].textContent = el;
        })
    }

    function _detachEvents(box) {
        box.removeEventListener("click", addNewPlay);
    }

    function addNewPlay(e) {
        const box = e.target;
        console.log(e);
        if (!box.textContent) {
            box.textContent = "x";
        }

        _detachEvents(box);
    }

    _render();

    return {
        boardContent
    }
})();

// Factory Function
const createPlayer = (name, turn) => {
    return { name, turn };
}

let playerOne = createPlayer('wool', false);
console.log(playerOne);