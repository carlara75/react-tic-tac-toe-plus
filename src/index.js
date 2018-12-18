import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      { props.winner ? (
        <span className="winner-square">{props.value}</span>
      ) : (
        props.value
      )}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i) {
    let isWinner = false;
    if (this.props.winnerLine) {
      isWinner = this.props.winnerLine.indexOf(i) > -1;
      console.log(i + ": " + isWinner);
    }

    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        winner={isWinner}
      />
    );
  }

  createBoard() {
    const board = [];
    let squareCount = 0;
    for (let y = 0; y < 3; y++) {
      const square = [];
      for (let x = 0; x < 3; x++) {
        square.push(this.renderSquare(squareCount));
        squareCount++;
      }
      board.push(<div key={y} className="board-row">{square}</div>);
    }
    return board;
  }

  render() {
    return this.createBoard();
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      col: -1,
      row: -1,
    };
  }

  handleClick(i) {
    const xy = getMovePosition(i);
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.setState({
      history: history.concat([{
        squares: squares,
        col: xy.col,
        row: xy.row,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      currentStep: -1,
      winnerLine: null,
    });
  }

  jumpTo(step) {
    console.log({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      currentStep: step
    });

    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      currentStep: step
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const result = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' (row: ' + step.row + ', col: ' + step.col + ')':
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {move === this.state.currentStep ? (
              <strong>{desc}</strong>
            ): (
              desc
            )}
          </button>
        </li>
      );
    });

    let status;
    if (result.winner) {
      status = 'Winner: ' + result.winner + ' [ ' + result.line + ' ]';
    } else if (this.state.stepNumber === 9 && !result.winner) {
      status = "Game ends in a draw. Please try again";
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerLine={result.line}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function getMovePosition(i) {
  const xy = new Map();
  let squares = 0;
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      xy.set(squares, {row: y, col: x});
      squares++;
    }
  }
  return xy.get(i);
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const result = {
    winner: null,
    line: null,
  }

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      result.winner = squares[a];
      result.line = lines[i];
      return result;
    }
  }
  return result;
}
