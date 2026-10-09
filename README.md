# DSA Algorithm Visualizer

An interactive, frontend-only tool for visualizing how classic sorting, searching, and pathfinding algorithms work — built to strengthen my understanding of algorithm mechanics and React state management, as a companion project to [CodeTrack](https://github.com/Yogeshbn2008/codetrack).

**[Live Demo →](https://algo-visualizer-khaki.vercel.app/)**

## Features

### Sorting
- **Bubble Sort, Insertion Sort, Merge Sort, and Quick Sort** — each animated step-by-step
- **Web Audio Sonification**: Native Web Audio API synthesizer generating real-time sine wave audio tones pitched directly to bar height during comparisons and swaps (with Mute/Unmute toggle)
- **Curated Edge-Case Presets ("Algorithm Killers")**:
  - *Nearly Sorted*: Demonstrates why Insertion Sort runs in $O(n)$ time and beats QuickSort
  - *Reverse Sorted*: Demonstrates QuickSort worst-case performance ($O(n^2)$ with naive pivot)
  - *Few Unique / Duplicates*: Tests 3-way partitioning and duplicate value handling
- **Custom Array Input**: Type or paste any comma-separated sequence of numbers with real-time range validation
- **Adjustable Array Size & Animation Speed** (10ms to 500ms)
- **Full Playback Controls**: Play, Pause, Step Forward, Step Back, Reset
- **Real-Time Complexity Panel**: Best, Average, Worst time, and auxiliary space badges
- **Plain-English Step Explanations**: e.g., "Comparing 7 and 3", "Pivot 45 placed in final sorted position"

### Searching
- Linear Search with sequential highlighting
- Binary Search with automatic array sorting and live `low`/`mid`/`high` visualization — eliminated search space dims out as it narrows

### Pathfinding
- Interactive 15x30 grid: click or drag to paint walls, weights, start, and end nodes
- **A* Search (A-Star)**: Directed heuristic pathfinding using Manhattan distance ($f = g + h$), showing focused beam search toward target vs Dijkstra's radial expansion
- **Dijkstra's Algorithm**: Optimal pathfinding on weighted terrain (cost: 5)
- **BFS & DFS**: Classic unweighted graph traversal comparing queue (shortest path) vs stack (winding deep paths)
- **Maze Generation**:
  - *Recursive Division*: Procedural generation creating structured corridors and chambers
  - *Random Terrain*: Scatters randomized obstacles and weighted swamp cells
- **Live Telemetry & Diagnostics**: Real-time counter tracking cells visited, path length, and total traversal cost
- **"Clear Path" vs "Clear Board"**: Re-run multiple algorithms on the exact same maze without redrawing walls

## Tech Stack

- **React** (Vite) — no backend, no database; fully client-side
- Plain CSS (no framework) for styling
- Deployed on **Vercel** with continuous deployment from GitHub

## Architecture Notes

The core design pattern used throughout: **algorithm logic is fully decoupled from animation/rendering.**

Each algorithm function (`getBubbleSortSteps`, `getBFSSteps`, etc.) runs synchronously and returns an array of "step" objects describing exactly what happened at each moment (a comparison, a swap, a cell visited, etc.) along with a snapshot of state at that point. A separate playback engine (`useEffect` + `setTimeout`) then replays these steps on a timer, updating the UI.

This separation means:
- The algorithm code reads almost identically to how you'd write it for a LeetCode submission — no animation logic tangled into the core logic
- Play/Pause/Step Forward/Step Back all become trivial — they just move an index into the same recorded step array, rather than needing separate "forward" and "backward" algorithm implementations

## Running Locally

```bash
git clone https://github.com/Yogeshbn2008/algo-visualizer.git
cd algo-visualizer
npm install
npm run dev
```

## Roadmap

- [ ] Selection/Insertion sort (if time allows)
- [ ] Responsive/mobile layout pass
- [ ] A\* pathfinding algorithm

## Author

Built by Yogesh — [LeetCode](https://leetcode.com/u/Yogesh_B_N/) · [LinkedIn](https://www.linkedin.com/in/yogesh-b-n-876267352/) · [GitHub](https://github.com/Yogeshbn2008)