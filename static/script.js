// Module
const gameBoard = (function () {
    let boardContent = ["x", "o", "x", "o", "x", "x", "o", "o", "x"];
    const board = document.getElementById("gameBoard");

    // The purpose of this function will be to ONLY render the contents of the boardContent array to the page.
    function _render() {
        boardContent.forEach(el => {
            board.textContent += el;
        })
    }

    _render();
})();

// Factory Function
const createPlayer = () => {
    return {};
}