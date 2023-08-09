import chalk from "chalk";

const width = 11;
const height = 11;
const mines = 5;
let board = [];
let score = 0;

class Square {
  constructor(id, column, row, isMine, isSelected) {
    this.id = id;
    this.column = column;
    this.row = row;
    this.isMarked = false;
    this.isMine = isMine || false;
    this.siblings = [];
    this.isOpen = false;
    this.isSelected = isSelected || false;
    this.minesNearby = " ";
  }
}

async function initGame() {
  // Init all squares with default values
  let currentColumn = 1;
  let currentRow = 1;
  for (let index = 1; index <= width * height; index++) {
    let isSelected = index === 1 ? true : false;
    board.push(new Square(index, currentColumn, currentRow, false, isSelected));
    currentColumn++;
    if (index % width === 0) {
      currentColumn = 1;
      currentRow++;
    }
  }

  // Randomly add Mines
  let minesArr = [];
  while (minesArr.length < mines) {
    let randomIdWithMine = Math.floor(Math.random() * board.length);
    if (minesArr.indexOf(randomIdWithMine) < 0) {
      minesArr.push(randomIdWithMine);
    }
  }
  minesArr.forEach((id) => {
    board[id].isMine = true;
  });

  // Populate Siblings Array
  board.forEach(function (square) {
    let siblings = [];

    if (square.column > 1) {
      let siblingLeft = square.id - 1;
      siblings.push(siblingLeft);
    }
    if (square.column < width) {
      let siblingRight = square.id + 1;
      siblings.push(siblingRight);
    }

    if (square.row > 1) {
      let SiblingAboveCenter = square.id - width;
      siblings.push(SiblingAboveCenter);

      if (square.column > 1) {
        let SiblingAboveLeft = square.id - width - 1;
        siblings.push(SiblingAboveLeft);
      }
      if (square.column < width) {
        let SiblingAboveRight = square.id - width + 1;
        siblings.push(SiblingAboveRight);
      }
    }

    if (square.row < height) {
      let SiblingBelowCenter = square.id + width;
      siblings.push(SiblingBelowCenter);

      if (square.column > 1) {
        let SiblingBelowLeft = square.id + width - 1;
        siblings.push(SiblingBelowLeft);
      }
      if (square.column < width) {
        let SiblingBelowRight = square.id + width + 1;
        siblings.push(SiblingBelowRight);
      }
    }

    siblings.sort();
    siblings.forEach((id) => {
      if (id > 0 && id <= width * height) {
        square.siblings.push(id);
      }
    });
  });

  // Add minesNearby count
  board.forEach((sq) => {
    let minesNearby = [];
    sq.siblings.forEach((id) => {
      let mine = board.find((square) => {
        return square.id === id && square.isMine;
      });
      if (mine) {
        minesNearby.push(mine);
      }
    });
    sq.minesNearby = minesNearby.length > 0 ? minesNearby.length : " ";
  });
}

async function showData(erase) {
  // DATA
  console.log("Data:");
  console.table(board);
}

async function render(erase) {
  if (erase !== false) {
    // clear screen
    for (let index = 0; index < 8 + height; index++) {
      process.stdout.moveCursor(0, -1); // up one line
      process.stdout.clearLine(1); // from cursor to end
    }
  }

  console.log(`=============================================`);
  console.log(`Minesweeper Node.`);
  console.log(`\u2190 \u2191 \u2192 \u2193  ARROWS to move.`);
  console.log(`SPACEBAR to open selected square.`);
  console.log(`M to mark a mine. Ctrl-C to Exit.`);
  console.log(`=============================================`);

  console.log(`Score: ${score}`);
  console.log(`Mines: ${mines}`);
  board.forEach((sq) => {
    if (sq.isMine && sq.isOpen) {
      process.stdout.write(chalk.bgRgb(255, 0, 0).bold(" X "));
    } else if (sq.isMarked && sq.isSelected) {
      process.stdout.write(chalk.bgRgb(200, 0, 0).bold(" ? "));
    } else if (sq.isMarked) {
      process.stdout.write(chalk.bgRgb(255, 0, 0).bold(" ? "));
    } else if (sq.isOpen && !sq.isSelected) {
      process.stdout.write(
        chalk.bgRgb(100, 100, 100).bold(` ${sq.minesNearby} `)
      );
    } else if (sq.isOpen && sq.isSelected) {
      process.stdout.write(chalk.bgRgb(0, 25, 50).bold(` ${sq.minesNearby} `));
    } else if (!sq.isOpen & !sq.isSelected) {
      // standard view
      if (sq.id % 2 === 0) {
        // even
        process.stdout.write(chalk.bgRgb(255, 255, 255).bold(`   `));
      } else {
        process.stdout.write(chalk.bgRgb(235, 235, 235).bold(`   `));
        // odd
      }
    } else if (!sq.isOpen & sq.isSelected) {
      // selected
      process.stdout.write(chalk.bgRgb(0, 50, 100).bold(`   `));
    }

    if (sq.id % width === 0) {
      console.log("");
    }
  });
}

async function openSquare() {
  const selectedSq = board.find((sq) => {
    return sq.isSelected === true;
  });
  const selectedId = selectedSq.id;
  if (!board[selectedId - 1].isMarked) {
    board[selectedId - 1].isOpen = true;
  }
  if (board[selectedId - 1].isMine) {
    gameOver();
  } else {
    score++;
  }
}

async function markMine() {
  const selectedSq = board.find((sq) => {
    return sq.isSelected === true;
  });
  const selectedId = selectedSq.id;
  if (!board[selectedId - 1].isOpen) {
    board[selectedId - 1].isMarked = !board[selectedId - 1].isMarked;
  }
}

async function navigate(direction) {
  const selectedSq = board.find((sq) => {
    return sq.isSelected === true;
  });
  const selectedId = selectedSq.id;
  let newSelectedId = null;

  if (direction === "right" && selectedSq.column < width) {
    newSelectedId = selectedSq.id + 1;
  }
  if (direction === "left" && selectedSq.column > 0) {
    newSelectedId = selectedSq.id - 1;
  }
  if (direction === "up" && selectedSq.row > 1) {
    newSelectedId = selectedSq.id - width;
  }
  if (direction === "down" && selectedSq.row < height) {
    newSelectedId = selectedSq.id + width;
  }

  if (newSelectedId) {
    // clear selection
    // index is === id - 1
    board.map((sq) => {
      sq.isSelected = false;
    });
    board[newSelectedId - 1].isSelected = true;
  }
}

async function controls() {
  process.stdin.setRawMode(true); // stream
  // process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", function (key) {
    // ctrl-c EXIT
    if (key === "\u0003") {
      process.exit();
    }
    // top arrow
    if (key.includes("[A")) {
      process.stdout.write("\u2191");
      navigate("up");
      render();
    }

    // bottom arrow
    if (key.includes("[B")) {
      process.stdout.write("\u2193");
      navigate("down");
      render();
    }

    // left arrow
    if (key.includes("[D")) {
      process.stdout.write("\u2190");
      navigate("left");
      render();
    }

    // right arrow
    if (key.includes("[C")) {
      process.stdout.write("\u2192");
      navigate("right");
      render();
    }

    // spacebar
    if (key === " ") {
      process.stdout.write("?");
      openSquare();
      render();
    }

    // spacebar
    if (key === "m" || key === "M") {
      process.stdout.write("M");
      markMine();
      render();
    }
  });
}
async function gameOver() {
  await render();
  console.log("===============");
  console.log("|  GAME OVER  |");
  console.log("===============");
  process.exit();
}

async function run() {
  await initGame();
  // await showData();
  await render(false);
  await controls();
}

run();
