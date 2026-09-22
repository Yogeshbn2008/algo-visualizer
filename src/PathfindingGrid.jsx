import { useState, useEffect } from 'react';
import './PathfindingGrid.css';

const ROWS = 15;
const COLS = 30;

function createGrid() {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push({
        row,
        col,
        isWall: false,
        isStart: false,
        isEnd: false,
      });
    }
    grid.push(currentRow);
  }
  return grid;
}

// NEW: BFS step-generator
function getBFSSteps(grid, startNode, endNode) {
  const steps = [];
  const queue = [[startNode.row, startNode.col]];
  const visited = new Set([`${startNode.row},${startNode.col}`]);
  const parent = {};
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
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

function PathfindingGrid() {
  const [grid, setGrid] = useState(createGrid());
  const [placingMode, setPlacingMode] = useState('wall');
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);

  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visitedCells, setVisitedCells] = useState(new Set());
  const [pathCells, setPathCells] = useState(new Set());
  const [notFound, setNotFound] = useState(false);

  function updateCell(row, col, updates) {
    const newGrid = grid.map((gridRow) =>
      gridRow.map((cell) => {
        if (cell.row === row && cell.col === col) {
          return { ...cell, ...updates };
        }
        return cell;
      })
    );
    setGrid(newGrid);
  }
function handleCellClick(cell) {
  if (isPlaying) return;

  if (placingMode === 'start') {
    const newGrid = grid.map((gridRow) =>
      gridRow.map((c) => {
        if (c.row === cell.row && c.col === cell.col) {
          return { ...c, isStart: true, isWall: false };
        }
        if (c.isStart) {
          return { ...c, isStart: false };
        }
        return c;
      })
    );
    setGrid(newGrid);
    setStartNode({ row: cell.row, col: cell.col });
  } else if (placingMode === 'end') {
    const newGrid = grid.map((gridRow) =>
      gridRow.map((c) => {
        if (c.row === cell.row && c.col === cell.col) {
          return { ...c, isEnd: true, isWall: false };
        }
        if (c.isEnd) {
          return { ...c, isEnd: false };
        }
        return c;
      })
    );
    setGrid(newGrid);
    setEndNode({ row: cell.row, col: cell.col });
  } else {
    if (cell.isStart || cell.isEnd) return;
    updateCell(cell.row, cell.col, { isWall: !cell.isWall });
  }
}

  function handleVisualizeClick() {
    if (!startNode || !endNode) return;

    setVisitedCells(new Set());
    setPathCells(new Set());
    setNotFound(false);

    const newSteps = getBFSSteps(grid, startNode, endNode);
    setSteps(newSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }

  function handleClearBoard() {
    setGrid(createGrid());
    setStartNode(null);
    setEndNode(null);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
    setVisitedCells(new Set());
    setPathCells(new Set());
    setNotFound(false);
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

  function step_delay(step) {
    // Path-tracing should be slower/more dramatic than the flood-fill visiting
    return step && step.type === 'path' ? 40 : 8;
  }

  function getCellClass(cell) {
    const key = `${cell.row},${cell.col}`;
    if (cell.isStart) return 'cell start';
    if (cell.isEnd) return 'cell end';
    if (pathCells.has(key)) return 'cell path';
    if (visitedCells.has(key)) return 'cell visited';
    if (cell.isWall) return 'cell wall';
    return 'cell';
  }

  return (
    <div className="pathfinding-container">
      <div className="pathfinding-controls">
        <button
          className={placingMode === 'wall' ? 'active' : ''}
          onClick={() => setPlacingMode('wall')}
          disabled={isPlaying}
        >
          Draw Walls
        </button>
        <button
          className={placingMode === 'start' ? 'active' : ''}
          onClick={() => setPlacingMode('start')}
          disabled={isPlaying}
        >
          Place Start
        </button>
        <button
          className={placingMode === 'end' ? 'active' : ''}
          onClick={() => setPlacingMode('end')}
          disabled={isPlaying}
        >
          Place End
        </button>
        <button onClick={handleVisualizeClick} disabled={!startNode || !endNode || isPlaying}>
          Visualize BFS
        </button>
        <button onClick={handleClearBoard} disabled={isPlaying}>
          Clear Board
        </button>
      </div>

      {notFound && <div className="pathfinding-notice">No path found — end node is unreachable.</div>}

      <div className="grid">
        {grid.map((gridRow, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {gridRow.map((cell) => (
              <div
                key={`${cell.row}-${cell.col}`}
                className={getCellClass(cell)}
                onClick={() => handleCellClick(cell)}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PathfindingGrid;