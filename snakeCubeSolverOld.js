// My very first pet project circa 2018 when I had about 3 months self-taught coding experience
var chains = [2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 3, 1, 1, 1, 3, 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 3, 1, 1, 2, 1, 2],
  start = Date.now(),
  startingPos = [],
  blocks = [],
  blockPos = [],
  adjacent = [],
  blocksUsed = [],
  finale = [],
  indexStart = 0,
  current = 0,
  render = 0,
  joints, totalBlocks, cubeSize, square, cubeMiddle, forceOrphanCheck;

function totalBlocksFind() {
  joints = [chains[0]];
  for (i = 0; i < chains.length - 1;) {
    joints.push(joints[i] + chains[++i])
  }
  totalBlocks = joints[joints.length - 1];
}

function setCubeParams() {
  cubeSize = Math.cbrt(totalBlocks);
  square = Math.pow(cubeSize, 2);
  cubeMiddle = Math.ceil(cubeSize / 2);
}

function impossibleCubeCheck() {
  if (!Number.isInteger(cubeSize) || chains.some(function(element) {
      return element > cubeSize;
    })) {
    fatalError()
  }
}

function mapBlocks() {
  for (x = 1; x <= cubeSize; x++) {
    for (y = 1; y <= cubeSize; y++) {
      for (z = 1; z <= cubeSize; z++) {
        blocks[indexStart++] = [x, y, z];
      }
    }
  }
}

function possibleStartingBlocks() {
  for (z = 0; z < cubeMiddle; z++) {
    for (y = z; y < cubeMiddle; y++) {
      for (x = y; x < cubeMiddle; x++) {
        startingPos.push(x + y * cubeSize + z * square)
      }
    }
  }
}

function adjacentBlocksMatrix() {
  for (i = 0; i < totalBlocks; i++) {
    adjacent[i] = [];
    for (j = 0; j < totalBlocks; j++) {
      temp = blocks[i].toString().replace(/\,/g, '');
      if (temp[0].indexOf(blocks[j][0]) + temp[1].indexOf(blocks[j][1]) + temp[2].indexOf(blocks[j][2]) === -1 && Math.pow(blocks[i].reduce((a, b) => a + b, 0) - (blocks[j].reduce((a, b) => a + b, 0)), 2) === 1) {
        adjacent[i].push(j)
      }
    }
  }
}

function mainLoop() {
  while (current < totalBlocks) {
    blockPos[current] = blockPos[current] || 0;
    setCurrentBlockToPotentialSolutionMatrix();
    if (directionalError() || collisionCheck() || ((forceOrphanCheck || Number.isInteger(current / cubeSize)) ? checkForOrphanBlocks() : false)) {
      fixError()
    } else {
      current++
    }
  }
}

function setCurrentBlockToPotentialSolutionMatrix() {
  if (blocksUsed.length === 0 && startingPos[blockPos[current]] === undefined) {
    fatalError()
  }
  if (current === 0) {
    blocksUsed.push(startingPos[blockPos[current]])
  } else {
    blocksUsed.push(adjacent[blocksUsed[blocksUsed.length - 1]][blockPos[current]]);
  }
}

function collisionCheck() {
  return blocksUsed.length !== new Set(blocksUsed).size
}

function directionalError() {
  return current > 1 && ((blocksUsed[current] + blocksUsed[current - 2] === 2 * blocksUsed[current - 1]) === joints.indexOf(current) > -1)
}

function checkForOrphanBlocks() {
  temp1 = 0
  for (i = 0; i < totalBlocks; i++) {
    temp = 0;
    if (!blocksUsed.includes(i)) {
      for (j = 0; j < adjacent[i].length; j++) {
        if (!blocksUsed.includes(adjacent[i][j])) {
          temp++;
        }
      }
      if (temp === 1) {
        temp1++
      }
      if (temp1 > 2 || temp === 0) {
        return (forceOrphanCheck = true);
      }
    }
  }
  return (forceOrphanCheck = false)
}

function fixError() {
  blocksUsed.pop();
  blockPos[current]++;
  if (blocksUsed.length === 0) {
    blocksUsed = [];
    mainLoop();
  }
  if (adjacent[blocksUsed[blocksUsed.length - 1]][blockPos[current]] === undefined) {
    delete blockPos[current--];
    fixError();
  }
}

function fatalError() {
  console.log("cube cannot be resolved. Check chains length and try again");
  throw new Error();
}

function renderResult() {
  while (render < totalBlocks) {
    finale.push(blocks[blocksUsed[render++]])
  }
  console.table(finale);
  console.log("resolved in " + (Date.now() - start) / 1000 + " seconds!");
}

totalBlocksFind();
setCubeParams();
impossibleCubeCheck();
mapBlocks();
possibleStartingBlocks();
adjacentBlocksMatrix();
mainLoop();
renderResult();
