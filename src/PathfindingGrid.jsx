import { useState, useEffect } from 'react';
import './PathfindingGrid.css';

const ROWS = 15;
const COLS = 30;
const DEFAULT_START = { row: 7, col: 4 };
const DEFAULT_END = { row: 7, col: 25 };

const algorithmDescriptions = {
  astar: {
    name: 'A* Search',
    badge: 'Weighted + Heuristic',
    guarantee: 'Guarantees Shortest Path (with admissible Manhattan distance)',
    summary:
      'Combines Dijkstra distance g(n) with heuristic distance to goal h(n): f(n) = g(n) + h(n). Expands directly toward the target while routing around costly weights and walls.',
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    badge: 'Weighted',
    guarantee: 'Guarantees Shortest Path',
    summary:
      'Explores outwards uniformly in order of cumulative distance. Handles weighted cells (cost: 5) to find the absolute minimum-cost path.',
  },
  bfs: {
    name: 'Breadth-First Search (BFS)',
    badge: 'Unweighted',
    guarantee: 'Guarantees Shortest Path (in steps)',
    summary:
      'Explores the grid layer by layer using a FIFO queue. Fast and guarantees shortest step count, but ignores cell weights entirely.',
  },
  dfs: {
    name: 'Depth-First Search (DFS)',
    badge: 'Unweighted',
    guarantee: 'Does NOT guarantee shortest path',
    summary:
      'Explores as deep as possible along each branch before backtracking using a LIFO stack. Highly prone to winding, non-optimal paths.',
  },
};

function createGrid(start = DEFAULT_START, end = DEFAULT_END) {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push({
        row,
        col,
        isWall: false,
        isStart: start ? row === start.row && col === start.col : false,
        isEnd: end ? row === end.row && col === end.col : false,
        weight: 1,
      });
    }
    grid.push(currentRow);
  }
  return grid;
}

function getBFSSteps(grid, startNode, endNode) {
  const steps = [];
  const queue = [[startNode.row, startNode.col]];
  const visited = new Set([`${startNode.row},${startNode.col}`]);
  const parent = {};
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let found = false;

  while (queue.length > 0) {
    const [r, c] = queue.shift();

    if (r === endNode.row && c === endNode.col) {
      found = true;
      break;
    }

    if (!(r === startNode.row && c === startNode.col)) {
      steps.push({ type: 'visit', row: r, col: c });
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;

      const inBounds = nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length;
      if (inBounds && !visited.has(key) && !grid[nr][nc].isWall) {
        visited.add(key);
        parent[key] = [r, c];
        queue.push([nr, nc]);
      }
    }
  }

  if (found) {
    const path = [];
    let curr = [endNode.row, endNode.col];
    while (curr[0] !== startNode.row || curr[1] !== startNode.col) {
      path.push(curr);
      curr = parent[`${curr[0]},${curr[1]}`];
    }
    path.push([startNode.row, startNode.col]);
    path.reverse();

    for (const [r, c] of path) {
      steps.push({ type: 'path', row: r, col: c });
    }
  } else {
    steps.push({ type: 'not-found' });
  }

  return steps;
}

function getDFSSteps(grid, startNode, endNode) {
  const steps = [];
  const stack = [[startNode.row, startNode.col]];
  const visited = new Set([`${startNode.row},${startNode.col}`]);
  const parent = {};
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let found = false;

  while (stack.length > 0) {
    const [r, c] = stack.pop();

    if (r === endNode.row && c === endNode.col) {
      found = true;
      break;
    }

    if (!(r === startNode.row && c === startNode.col)) {
      steps.push({ type: 'visit', row: r, col: c });
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;

      const inBounds = nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length;
      if (inBounds && !visited.has(key) && !grid[nr][nc].isWall) {
        visited.add(key);
        parent[key] = [r, c];
        stack.push([nr, nc]);
      }
    }
  }

  if (found) {
    const path = [];
    let curr = [endNode.row, endNode.col];
    while (curr[0] !== startNode.row || curr[1] !== startNode.col) {
      path.push(curr);
      curr = parent[`${curr[0]},${curr[1]}`];
    }
    path.push([startNode.row, startNode.col]);
    path.reverse();

    for (const [r, c] of path) {
      steps.push({ type: 'path', row: r, col: c });
    }
  } else {
    steps.push({ type: 'not-found' });
  }

  return steps;
}

function getDijkstraSteps(grid, startNode, endNode) {
  const steps = [];
  const rows = grid.length;
  const cols = grid[0].length;

  const dist = {};
  const parent = {};
  const visited = new Set();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dist[`${r},${c}`] = Infinity;
    }
  }
  dist[`${startNode.row},${startNode.col}`] = 0;

  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let found = false;

  while (true) {
    let current = null;
    let smallestDist = Infinity;

    for (const key in dist) {
      if (!visited.has(key) && dist[key] < smallestDist) {
        smallestDist = dist[key];
        current = key;
      }
    }

    if (current === null || smallestDist === Infinity) break;

    const [r, c] = current.split(',').map(Number);
    visited.add(current);

    if (r === endNode.row && c === endNode.col) {
      found = true;
      break;
    }

    if (!(r === startNode.row && c === startNode.col)) {
      steps.push({ type: 'visit', row: r, col: c });
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      if (!inBounds || grid[nr][nc].isWall) continue;

      const neighborKey = `${nr},${nc}`;
      const newDist = dist[current] + grid[nr][nc].weight;

      if (newDist < dist[neighborKey]) {
        dist[neighborKey] = newDist;
        parent[neighborKey] = [r, c];
      }
    }
  }

  if (found) {
    const path = [];
    let curr = [endNode.row, endNode.col];
    while (curr[0] !== startNode.row || curr[1] !== startNode.col) {
      path.push(curr);
      curr = parent[`${curr[0]},${curr[1]}`];
    }
    path.push([startNode.row, startNode.col]);
    path.reverse();

    for (const [r, c] of path) {
      steps.push({ type: 'path', row: r, col: c });
    }
  } else {
    steps.push({ type: 'not-found' });
  }

  return steps;
}

function getAStarSteps(grid, startNode, endNode) {
  const steps = [];
  const rows = grid.length;
  const cols = grid[0].length;

  const gScore = {};
  const fScore = {};
  const parent = {};
  const openSet = new Set();
  const closedSet = new Set();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      gScore[`${r},${c}`] = Infinity;
      fScore[`${r},${c}`] = Infinity;
    }
  }

  const startKey = `${startNode.row},${startNode.col}`;
  gScore[startKey] = 0;
  const hStart = Math.abs(startNode.row - endNode.row) + Math.abs(startNode.col - endNode.col);
  fScore[startKey] = hStart;
  openSet.add(startKey);

  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let found = false;

  while (openSet.size > 0) {
    let current = null;
    let lowestF = Infinity;
    let lowestH = Infinity;

    for (const key of openSet) {
      const f = fScore[key];
      const [r, c] = key.split(',').map(Number);
      const h = Math.abs(r - endNode.row) + Math.abs(c - endNode.col);
      if (f < lowestF || (f === lowestF && h < lowestH)) {
        lowestF = f;
        lowestH = h;
        current = key;
      }
    }

    if (!current || lowestF === Infinity) break;

    const [r, c] = current.split(',').map(Number);
    if (r === endNode.row && c === endNode.col) {
      found = true;
      break;
    }

    openSet.delete(current);
    closedSet.add(current);

    if (!(r === startNode.row && c === startNode.col)) {
      steps.push({ type: 'visit', row: r, col: c });
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      if (!inBounds || grid[nr][nc].isWall) continue;

      const neighborKey = `${nr},${nc}`;
      if (closedSet.has(neighborKey)) continue;

      const tentativeG = gScore[current] + grid[nr][nc].weight;

      if (tentativeG < gScore[neighborKey]) {
        parent[neighborKey] = [r, c];
        gScore[neighborKey] = tentativeG;
        const h = Math.abs(nr - endNode.row) + Math.abs(nc - endNode.col);
        fScore[neighborKey] = tentativeG + h;
        openSet.add(neighborKey);
      }
    }
  }

  if (found) {
    const path = [];
    let curr = [endNode.row, endNode.col];
    while (curr[0] !== startNode.row || curr[1] !== startNode.col) {
      path.push(curr);
      curr = parent[`${curr[0]},${curr[1]}`];
    }
    path.push([startNode.row, startNode.col]);
    path.reverse();

    for (const [r, c] of path) {
      steps.push({ type: 'path', row: r, col: c });
    }
  } else {
    steps.push({ type: 'not-found' });
  }

  return steps;
}

function getRecursiveDivisionMaze(grid, startNode, endNode) {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = grid.map((r) =>
    r.map((c) => ({
      ...c,
      isWall: false,
      weight: 1,
    }))
  );

  function divide(rStart, rEnd, cStart, cEnd) {
    if (rEnd - rStart < 2 || cEnd - cStart < 2) return;

    const isHorizontal = rEnd - rStart > cEnd - cStart ? Math.random() < 0.65 : Math.random() < 0.35;

    if (isHorizontal) {
      const wallRow = Math.floor(Math.random() * (rEnd - rStart - 1)) + rStart + 1;
      const passageCol = Math.floor(Math.random() * (cEnd - cStart + 1)) + cStart;

      for (let c = cStart; c <= cEnd; c++) {
        if (c !== passageCol) {
          if (
            !(wallRow === startNode?.row && c === startNode?.col) &&
            !(wallRow === endNode?.row && c === endNode?.col)
          ) {
            newGrid[wallRow][c].isWall = true;
          }
        }
      }

      divide(rStart, wallRow - 1, cStart, cEnd);
      divide(wallRow + 1, rEnd, cStart, cEnd);
    } else {
      const wallCol = Math.floor(Math.random() * (cEnd - cStart - 1)) + cStart + 1;
      const passageRow = Math.floor(Math.random() * (rEnd - rStart + 1)) + rStart;

      for (let r = rStart; r <= rEnd; r++) {
        if (r !== passageRow) {
          if (
            !(r === startNode?.row && wallCol === startNode?.col) &&
            !(r === endNode?.row && wallCol === endNode?.col)
          ) {
            newGrid[r][wallCol].isWall = true;
          }
        }
      }

      divide(rStart, rEnd, cStart, wallCol - 1);
      divide(rStart, rEnd, wallCol + 1, cEnd);
    }
  }

  divide(0, rows - 1, 0, cols - 1);

  if (startNode) {
    newGrid[startNode.row][startNode.col].isWall = false;
    if (startNode.col + 1 < cols) newGrid[startNode.row][startNode.col + 1].isWall = false;
  }
  if (endNode) {
    newGrid[endNode.row][endNode.col].isWall = false;
    if (endNode.col - 1 >= 0) newGrid[endNode.row][endNode.col - 1].isWall = false;
  }

  return newGrid;
}

function getRandomTerrain(grid, startNode, endNode) {
  return grid.map((r) =>
    r.map((c) => {
      if (
        (startNode && c.row === startNode.row && c.col === startNode.col) ||
        (endNode && c.row === endNode.row && c.col === endNode.col)
      ) {
        return { ...c, isWall: false, weight: 1 };
      }
      const rand = Math.random();
      if (rand < 0.28) {
        return { ...c, isWall: true, weight: 1 };
      } else if (rand < 0.45) {
        return { ...c, isWall: false, weight: 5 };
      }
      return { ...c, isWall: false, weight: 1 };
    })
  );
}

function PathfindingGrid() {
  const [startNode, setStartNode] = useState(DEFAULT_START);
  const [endNode, setEndNode] = useState(DEFAULT_END);
  const [grid, setGrid] = useState(() => createGrid(DEFAULT_START, DEFAULT_END));
  const [placingMode, setPlacingMode] = useState('wall'); // 'wall' | 'weight' | 'eraser' | 'start' | 'end'
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragAction, setDragAction] = useState(null);

  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visitedCells, setVisitedCells] = useState(new Set());
  const [pathCells, setPathCells] = useState(new Set());
  const [notFound, setNotFound] = useState(false);
  const [pathAlgorithm, setPathAlgorithm] = useState('astar');

  // Handle global mouseup to stop dragging smoothly
  useEffect(() => {
    function handleGlobalMouseUp() {
      setIsMouseDown(false);
      setDragAction(null);
    }
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  function updateCell(row, col, updates) {
    setGrid((prevGrid) =>
      prevGrid.map((gridRow) =>
        gridRow.map((cell) => {
          if (cell.row === row && cell.col === col) {
            return { ...cell, ...updates };
          }
          return cell;
        })
      )
    );
  }

  function handleCellMouseDown(cell) {
    if (isPlaying) return;
    setIsMouseDown(true);

    if (placingMode === 'start') {
      const newGrid = grid.map((gridRow) =>
        gridRow.map((c) => {
          if (c.row === cell.row && c.col === cell.col) {
            return { ...c, isStart: true, isWall: false, weight: 1 };
          }
          if (c.isStart) return { ...c, isStart: false };
          return c;
        })
      );
      setGrid(newGrid);
      setStartNode({ row: cell.row, col: cell.col });
    } else if (placingMode === 'end') {
      const newGrid = grid.map((gridRow) =>
        gridRow.map((c) => {
          if (c.row === cell.row && c.col === cell.col) {
            return { ...c, isEnd: true, isWall: false, weight: 1 };
          }
          if (c.isEnd) return { ...c, isEnd: false };
          return c;
        })
      );
      setGrid(newGrid);
      setEndNode({ row: cell.row, col: cell.col });
    } else if (placingMode === 'eraser') {
      if (cell.isStart || cell.isEnd) return;
      setDragAction('eraser');
      updateCell(cell.row, cell.col, { isWall: false, weight: 1 });
    } else if (placingMode === 'weight') {
      if (cell.isStart || cell.isEnd) return;
      const nextWeight = cell.weight === 1 ? 5 : 1;
      const action = nextWeight === 5 ? 'draw-weight' : 'erase-weight';
      setDragAction(action);
      updateCell(cell.row, cell.col, { weight: nextWeight, isWall: false });
    } else {
      // Wall mode: toggle wall or drag-paint
      if (cell.isStart || cell.isEnd) return;
      const action = cell.isWall ? 'erase-wall' : 'draw-wall';
      setDragAction(action);
      updateCell(cell.row, cell.col, { isWall: !cell.isWall, weight: 1 });
    }
  }

  function handleCellMouseEnter(cell) {
    if (isPlaying || !isMouseDown || cell.isStart || cell.isEnd) return;

    if (dragAction === 'draw-wall') {
      updateCell(cell.row, cell.col, { isWall: true, weight: 1 });
    } else if (dragAction === 'erase-wall' || dragAction === 'eraser') {
      updateCell(cell.row, cell.col, { isWall: false, weight: 1 });
    } else if (dragAction === 'draw-weight') {
      updateCell(cell.row, cell.col, { weight: 5, isWall: false });
    } else if (dragAction === 'erase-weight') {
      updateCell(cell.row, cell.col, { weight: 1 });
    }
  }

  function handleVisualizeClick() {
    if (!startNode || !endNode) return;

    handleClearPath();

    const newSteps =
      pathAlgorithm === 'bfs'
        ? getBFSSteps(grid, startNode, endNode)
        : pathAlgorithm === 'dfs'
        ? getDFSSteps(grid, startNode, endNode)
        : pathAlgorithm === 'dijkstra'
        ? getDijkstraSteps(grid, startNode, endNode)
        : getAStarSteps(grid, startNode, endNode);

    setSteps(newSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }

  function handleClearPath() {
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
    setVisitedCells(new Set());
    setPathCells(new Set());
    setNotFound(false);
  }

  function handleClearBoard() {
    handleClearPath();
    setGrid(createGrid(startNode, endNode));
  }

  function handleGenerateMaze(type) {
    if (isPlaying) return;
    handleClearPath();
    if (type === 'recursive') {
      setGrid((prev) => getRecursiveDivisionMaze(prev, startNode, endNode));
    } else if (type === 'terrain') {
      setGrid((prev) => getRandomTerrain(prev, startNode, endNode));
    }
  }

  function step_delay(step) {
    return step && step.type === 'path' ? 30 : 10;
  }

  useEffect(() => {
    if (!isPlaying) return;

    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const step = steps[stepIndex];
      const key = `${step.row},${step.col}`;

      if (step.type === 'visit') {
        setVisitedCells((prev) => new Set(prev).add(key));
      } else if (step.type === 'path') {
        setPathCells((prev) => new Set(prev).add(key));
      } else if (step.type === 'not-found') {
        setNotFound(true);
      }

      setStepIndex(stepIndex + 1);
    }, step_delay(steps[stepIndex]));

    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, steps]);

  function getCellClass(cell) {
    const key = `${cell.row},${cell.col}`;
    if (cell.isStart) return 'cell start';
    if (cell.isEnd) return 'cell end';
    if (pathCells.has(key)) return cell.weight > 1 ? 'cell path weighted' : 'cell path';
    if (visitedCells.has(key)) return cell.weight > 1 ? 'cell visited weighted' : 'cell visited';
    if (cell.isWall) return 'cell wall';
    if (cell.weight > 1) return 'cell weighted';
    return 'cell';
  }

  // Calculate total path cost (sum of weights)
  let pathCost = 0;
  if (pathCells.size > 0) {
    for (const key of pathCells) {
      const [r, c] = key.split(',').map(Number);
      if (!(r === startNode?.row && c === startNode?.col)) {
        pathCost += grid[r][c]?.weight || 1;
      }
    }
  }

  const currentAlgo = algorithmDescriptions[pathAlgorithm] || algorithmDescriptions.astar;

  return (
    <div className="pathfinding-container">
      {/* Tool & Action Bar */}
      <div className="pathfinding-toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">Drawing Tools:</span>
          <button
            className={placingMode === 'wall' ? 'active' : ''}
            onClick={() => setPlacingMode('wall')}
            disabled={isPlaying}
            title="Click or drag to draw/erase walls"
          >
            Draw Walls
          </button>
          <button
            className={placingMode === 'weight' ? 'active' : ''}
            onClick={() => setPlacingMode('weight')}
            disabled={isPlaying}
            title="Click or drag to add weight cost 5"
          >
            Add Weight (5)
          </button>
          <button
            className={placingMode === 'eraser' ? 'active' : ''}
            onClick={() => setPlacingMode('eraser')}
            disabled={isPlaying}
            title="Click or drag to erase walls and weights"
          >
            Eraser
          </button>
          <button
            className={placingMode === 'start' ? 'active' : ''}
            onClick={() => setPlacingMode('start')}
            disabled={isPlaying}
          >
            Move Start (S)
          </button>
          <button
            className={placingMode === 'end' ? 'active' : ''}
            onClick={() => setPlacingMode('end')}
            disabled={isPlaying}
          >
            Move End (E)
          </button>
        </div>

        <div className="toolbar-group">
          <span className="toolbar-label">Mazes & Patterns:</span>
          <button
            onClick={() => handleGenerateMaze('recursive')}
            disabled={isPlaying}
            title="Generate a labyrinth using Recursive Division"
          >
            Recursive Division Maze
          </button>
          <button
            onClick={() => handleGenerateMaze('terrain')}
            disabled={isPlaying}
            title="Generate random walls and weighted terrain"
          >
            Random Terrain
          </button>
        </div>

        <div className="toolbar-group primary-actions">
          <select
            value={pathAlgorithm}
            onChange={(e) => setPathAlgorithm(e.target.value)}
            disabled={isPlaying}
            className="algo-select"
          >
            <option value="astar">A* Search (Recommended)</option>
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="bfs">Breadth-First Search (BFS)</option>
            <option value="dfs">Depth-First Search (DFS)</option>
          </select>
          <button
            onClick={handleVisualizeClick}
            disabled={!startNode || !endNode || isPlaying}
            className="visualize-btn"
          >
            {isPlaying ? 'Visualizing...' : `Visualize ${currentAlgo.name}`}
          </button>
          <button onClick={handleClearPath} disabled={isPlaying}>
            Clear Path
          </button>
          <button onClick={handleClearBoard} disabled={isPlaying}>
            Clear Board
          </button>
        </div>
      </div>

      {/* Real-time Telemetry / Stats */}
      <div className="pathfinding-stats-banner">
        <div className="stat-pill">
          <span>Visited Cells:</span> <strong>{visitedCells.size}</strong>
        </div>
        <div className="stat-pill">
          <span>Path Length:</span> <strong>{pathCells.size > 0 ? pathCells.size : 0} steps</strong>
        </div>
        {pathCost > 0 && (
          <div className="stat-pill">
            <span>Total Path Cost:</span> <strong>{pathCost}</strong>
          </div>
        )}
        <div className="stat-badge">{currentAlgo.badge}</div>
      </div>

      {notFound && (
        <div className="pathfinding-notice">No path found — end node is completely walled off!</div>
      )}

      {/* Grid Canvas */}
      <div className="grid-wrapper">
        <div className="grid">
          {grid.map((gridRow, rowIndex) => (
            <div key={rowIndex} className="grid-row">
              {gridRow.map((cell) => (
                <div
                  key={`${cell.row}-${cell.col}`}
                  className={getCellClass(cell)}
                  onMouseDown={() => handleCellMouseDown(cell)}
                  onMouseEnter={() => handleCellMouseEnter(cell)}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Algorithm Explainer Card */}
      <div className="algo-info-card">
        <h4>
          {currentAlgo.name} &bull; <small>{currentAlgo.guarantee}</small>
        </h4>
        <p>{currentAlgo.summary}</p>
        <p className="hint-text">
          Tip: Click and drag across the board to smoothly draw walls or weights. Use <strong>Clear Path</strong> to
          compare how different algorithms solve the exact same maze without erasing your walls!
        </p>
      </div>
    </div>
  );
}

export default PathfindingGrid;