import React from 'react';
import ReactDOM from 'react-dom';


const NUM_ROWS = 3;
const NUM_COLS = 3;
const NUM_TILES = NUM_ROWS * NUM_COLS;
const EMPTY_INDEX = NUM_TILES - 1;
const SHUFFLE_MOVES_RANGE = [60, 80];
const MOVE_DIRECTIONS = ["up", "down", "left", "right"];

function rand(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

class GameState {
  static instance = null;

  static getInstance() {
    if (!GameState.instance) GameState.instance = new GameState();
    return GameState.instance;
  }

  static getNewBoard() {
    return Array(NUM_TILES)
      .fill(0)
      .map((x, index) => [Math.floor(index / NUM_ROWS), index % NUM_COLS]);
  }
  static solvedBoard = GameState.getNewBoard();

  constructor () {
    this.startNewGame();
  }

  startNewGame () {
    this.moves = 0;
    this.board = GameState.getNewBoard();
    this.stack = [];
    this.shuffle();
  }

  shuffle () {
    this.shuffling = true;
    let shuffleMoves = rand(...SHUFFLE_MOVES_RANGE);
    while (shuffleMoves --> 0) {
      this.moveInDirection (MOVE_DIRECTIONS[rand(0,3)]);
    }
    this.shuffling = false;
  }

  canMoveTile (index) {
    //don't move tile if at incorrect spot
    if (index < 0 || index >= NUM_TILES) return false;

    //gets position of current tile and empty tile
    const tilePos = this.board[index];
    const emptyPos = this.board[EMPTY_INDEX];

    if (tilePos[0] === emptyPos[0])
      return Math.abs(tilePos[1] - emptyPos[1]) === 1;

    else if (tilePos[1] === emptyPos[1])
      return Math.abs(tilePos[0] - emptyPos[0]) === 1;  

    else return false;  
  }

  moveTile (index) {
    if (!this.shuffling && this.isSolved()) return false;

    if (!this.canMoveTile(index)) return false;

    //get positions of tile and empty tile
    const emptyPosition = [...this.board[EMPTY_INDEX]];
    const tilePosition = [...this.board[index]];


    // Swap positions of tiles
    let boardAfterMove = [...this.board];
    boardAfterMove[EMPTY_INDEX] = tilePosition;
    boardAfterMove[index] = emptyPosition;

    //update board, moves and stack
    if (!this.shuffling) this.stack.push(this.board);
    this.board = boardAfterMove;
    if (!this.shuffling) this.moves += 1;

    return true;
  }

  isSolved () {
    for (let i=0; i<NUM_TILES; i++) {
      if (this.board[i][0] !== GameState.solvedBoard[i][0] || this.board[i][1] !== GameState.solvedBoard[i][1])
        return false;
    }
    return true;
  }

  moveInDirection (dir) {
    const epos = this.board[EMPTY_INDEX];

    //direction to move tile
    const posToMove = dir === 'up' ? [epos[0]+1, epos[1]]
    : dir === 'down' ? [epos[0]-1, epos[1]]
    : dir === 'left' ? [epos[0], epos[1]+1]
    : dir === 'right' ? [epos[0], epos[1]-1]
    : epos;

    // find index of tile in posToMove
    let tileToMove = EMPTY_INDEX;
    for (let i=0; i<NUM_TILES; i++) {
      if (this.board[i][0] === posToMove[0] && this.board[i][1] === posToMove[1]) {
        tileToMove = i;
        break;
      }
    }
    //move tile
    this.moveTile(tileToMove);
  }
  undo () {
    if (this.stack.length === 0) return false;
    this.board = this.stack.pop();
    this.moves -= 1;
  }

  getState () {
    const self = this;

    return {
      board: self.board,
      moves: self.moves,
      solved: self.isSolved(),
    };
  }
}

function useGameState () {
  const gameState = GameState.getInstance();

  const [state, setState] = React.useState(gameState.getState());

  function newGame () {
    gameState.startNewGame();
    setState(gameState.getState());

  }

  function undo () {
    gameState.undo();
    setState(gameState.getState());
  }

  function move (i) {
    return function () {
      gameState.moveTile(i);
      setState(gameState.getState());
    }
  }



function Tile ({index, pos, onClick}) {
  const top = pos[0]*100 + 5;
  const left = pos[1]*100 + 5;
  const bgLeft = (index%4)*100 + 5;
  const bgTop = Math.floor(index/4)*100 + 5;

  return <div 
    className='tile'
    onClick={onClick}
    style={{top, left, backgroundPosition: `-${bgLeft}px -${bgTop}px`}} 
  />;
}


function App () {
  const [board, moves, solved, newGame, undo, move] = useGameState();

  return (
    <div className='game-container'>
      <div className='game-header'>
        <div className='moves'>
          {moves}
        </div>
        <button className='big-button' onClick={undo}> UNDO </button>
      </div>
      <div className='board'>
      {
        board.slice(0,-1).map((pos, index) => ( 
          <Tile index={index} pos={pos} onClick={move(index)} />
        ))
      }
      { solved &&
          <div className='overlay'>
            <button className='big-button' onClick={newGame}>
              PLAY AGAIN 
            </button>
          </div>
      }
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));

export default App;
