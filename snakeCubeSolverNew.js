// 6 years later, with better recursion skills vs litteral backtracking
// And better knowledge/understanding of things like sets.

const start = Date.now();
// Number of blocks to place before turning
const chains = [2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 3, 1, 1, 1, 3, 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 3, 1, 1, 2, 1, 2];
const directions = [[0, 0, -1], [0, -1, 0], [-1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]];
const startingPos = [];
const turn = new Set();
const neighbors = {};
let bean = 0;
let totalBlocks, cubeSize, cubeMiddle, square, adjacents, stop;

(function setCubeParamsAndStartingPos() {
    totalBlocks = chains.reduce((a, b) => a + b, 0);
    cubeSize = Math.cbrt(totalBlocks);
    cubeMiddle = Math.ceil(cubeSize / 2);
    square = cubeSize ** 2;
    // Not a cube
    if (!Number.isInteger(cubeSize) || chains.some(elem => elem > cubeSize)) {
        console.log('WTF is this?');
        throw new Error();
    }
    // Set array of adjacent block's distance
    adjacents = [cubeSize * cubeSize * -1, cubeSize * -1, -1, 1, cubeSize, cubeSize * cubeSize];
    // A corner is a corner, an edge is an edge. a center is a center, etc.
    // No need to try starting from multiple corners
    for (let z = 0; z < cubeMiddle; z++)
        for (let y = z; y < cubeMiddle; y++)
            for (let x = y; x < cubeMiddle; x++)
                startingPos.push(x + y * cubeSize + z * cubeSize * cubeSize);
})();

(function setNeighbors() {
    for (let i = 0; i < totalBlocks; i++) {
        neighbors[i] = [];
        const x = i % cubeSize;
        const y = Math.floor(i / cubeSize) % cubeSize;
        const z = Math.floor(i / (square));
        directions.forEach(([dx, dy, dz]) => {
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;
            // Check if the neighbor is within bounds
            if (nx >= 0 && nx < cubeSize && ny >= 0 && ny < cubeSize && nz >= 0 && nz < cubeSize) {
                const neighbor = nx + ny * cubeSize + nz * square;
                neighbors[i].push(neighbor);
            }
        });
    }
})();

(function setWhenToTurn() {
    let cumulativeLength = 0;
    for (let i = 0; i < chains.length - 1; i++) {
        cumulativeLength += chains[i];
        turn.add(cumulativeLength);
    }
})();

function solve(previousDir, used, previousPos) {
    const len = used.size;
    if (stop) return;
    // Answer found
    if (len === totalBlocks) {
        bean++;
        // Convert blocks back into x, y, z pos and print result
        const results = [];
        for (const pos of used) {
            results.push([pos % cubeSize, Math.floor((pos % square) / cubeSize), Math.floor(pos / square)]);
        }
        console.table(results);
        console.log(`${bean} ANSWER(S) FOUND IN ${Date.now() - start} MS.`);
        // Stop after a single answer is found, if desired
        stop = true;
        return;
    }

    // Sometimes check for orphan blocks
    // Compute intensive but when used with moderation, it prevents a lot of useless computations
    // Could also use a floodlill approach
    if (len > square && turn.has(len)) {
        let hasASingleNeighbor = 0;
        for (let i = 0; i < totalBlocks; i++) {
            let neighborCount = 0;
            // Find unused blocks
            if (!used.has(i)) {
                // Check how many unused neighbors they have
                for (const neighbor of neighbors[i]) {
                    if (!used.has(neighbor)) neighborCount++;
                }
                // Unused block has no neighbors
                if (!neighborCount) return;
                // Unused block has a single neighbor
                if (neighborCount === 1) hasASingleNeighbor++;
                // Single neighbor blocks are extremities
                // And therefore we can only have 2
                if (hasASingleNeighbor > 2) return;
            }
        }
    }

    adjacents.forEach(dir => {
        // Going backward
        if (previousDir ** 2 === -1 * (dir ** 2)) return;
        const goingStraight = !previousDir ? true : previousDir === dir;
        const shouldGoStraight = !turn.has(len);
        // Wrong direction
        if (goingStraight !== shouldGoStraight) return;
        const nextPos = previousPos + dir;
        // Collision
        if (used.has(nextPos)) return;
        // Not a neighbor
        if (!neighbors[previousPos].includes(nextPos)) return;
        // Passed all checks. Recurse
        solve(dir, new Set([...used, nextPos]), nextPos);
    });
}

// Starting pos loop
// TODO:
// Set a starting direction to prevent symmetrical evaluations
for (let i = 0; i < startingPos.length; i++) solve(0, new Set([startingPos[i]]), startingPos[i]); 
