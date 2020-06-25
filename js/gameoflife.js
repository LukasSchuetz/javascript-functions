const { jsxSpreadAttribute } = require("jscodeshift");

function seed(a, b, c) {
  return [...arguments];
}

function same([x, y], [j, k]) {
  if ((x === j) && (y === k)) {
    return true;
  }
}

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
  for (let c of this) {
    if (same(c, cell)) return true;
  }
  return false;
}

const printCell = (cell, state) => {
  if (contains.call(state, cell)) {
    return '\u25A3';
  } else {
    return '\u25A2';
  }
};

const corners = (state = []) => {
  if (state.length === 0) {
    return { topRight: [0, 0], bottomLeft: [0, 0] }
  } else {
    let xmin = state[0][0];
    let xmax = state[0][0];
    let ymin = state[0][1];
    let ymax = state[0][1];

    for (let cell of state) {
      if (cell[0] < xmin) {
        xmin = cell[0];
      }
      if (cell[0] > xmax) {
        xmax = cell[0];
      }
      if (cell[1] < ymin) {
        ymin = cell[1];
      }
      if (cell[1] > ymax) {
        ymax = cell[1];
      }
    }
    return { topRight: [xmax, ymax], bottomLeft: [xmin, ymin] };
  }
};

const printCells = (state) => {
  const { topRight, bottomLeft } = corners(state);
  let xmin = bottomLeft[0];
  let xmax = topRight[0];
  let ymin = bottomLeft[1];
  let ymax = topRight[1];
  result = '';
  for (let y = ymax; y >= ymin; y--) {
    for (let x = xmin; x <= xmax; x++) {
      result += `${printCell([x, y], state)} `;
    }
    result += '\n';
  }
  return result;
};

const getNeighborsOf = ([x, y]) => [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1], [x - 1, y - 1], [x - 1, y + 1], [x + 1, y + 1], [x + 1, y - 1]];

const getLivingNeighbors = (cell, state) => {
  const neighbors = getNeighborsOf(cell);
  return neighbors.filter(neighbor => contains.bind(state)(neighbor));
};

const willBeAlive = (cell, state) => {
  if (getLivingNeighbors(cell, state).length === 3 || (contains.call(state, cell) && getLivingNeighbors(cell, state).length === 2)) {
    return true;
  } else {
    return false;
  }
};

const calculateNext = (state) => {
  const { topRight, bottomLeft } = corners(state);
  const xmin = bottomLeft[0] - 1;
  const ymin = bottomLeft[1] - 1;
  const xmax = topRight[0] + 1;
  const ymax = topRight[1] + 1;
  const newState = [];

  for (let x = xmin; x <= xmax; x++) {
    for (let y = ymin; y <= ymax; y++) {
      const cell = [x, y];
      if (willBeAlive(cell, state)) {
        newState.push(cell);
      }
    }
  }
  return newState;
};

const iterate = (state, iterations) => {
  const states = [state];
  for (let i = 0; i < iterations; i++) {
    states.push(calculateNext(states[states.length - 1]));
  }
  return states;
};

const main = (pattern, iterations) => {
  states = iterate(startPatterns[pattern], iterations);
  for (let state of states) {
    console.log(printCells(state) + '\n');
  }
};

const startPatterns = {
  rpentomino: [
    [3, 2],
    [2, 3],
    [3, 3],
    [3, 4],
    [4, 4]
  ],
  glider: [
    [-2, -2],
    [-1, -2],
    [-2, -1],
    [-1, -1],
    [1, 1],
    [2, 1],
    [3, 1],
    [3, 2],
    [2, 3]
  ],
  square: [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2]
  ]
};

const [pattern, iterations] = process.argv.slice(2);
const runAsScript = require.main === module;

if (runAsScript) {
  if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
    main(pattern, parseInt(iterations));
  } else {
    console.log("Usage: node js/gameoflife.js rpentomino 50");
  }
}

exports.seed = seed;
exports.same = same;
exports.contains = contains;
exports.getNeighborsOf = getNeighborsOf;
exports.getLivingNeighbors = getLivingNeighbors;
exports.willBeAlive = willBeAlive;
exports.corners = corners;
exports.calculateNext = calculateNext;
exports.printCell = printCell;
exports.printCells = printCells;
exports.startPatterns = startPatterns;
exports.iterate = iterate;
exports.main = main;