# DSA Algorithm Visualizer

An interactive, frontend-only tool for visualizing how classic sorting, searching, and pathfinding algorithms work — built to strengthen my understanding of algorithm mechanics and React state management, as a companion project to [CodeTrack](https://github.com/Yogeshbn2008/codetrack).

**[Live Demo →](https://algo-visualizer-khaki.vercel.app/)**

## Features

### Sorting
- Bubble Sort, Merge Sort, and Quick Sort — each animated step-by-step
- Adjustable array size and animation speed
- Full playback controls: Play, Pause, Step Forward, Step Back, Reset
- Real-time time/space complexity panel per algorithm
- Plain-English step explanation (e.g. "Comparing 7 and 3")

### Searching
- Linear Search with sequential highlighting
- Binary Search with automatic array sorting and live `low`/`mid`/`high` visualization — eliminated search space dims out as it narrows

### Pathfinding
- Interactive grid: click to place a start node, end node, and walls
- BFS (guarantees shortest path), DFS (explores depth-first, no shortest-path guarantee), and Dijkstra's algorithm (shortest path on a *weighted* grid)
- Weighted cells to demonstrate how Dijkstra routes around costly terrain, unlike BFS/DFS which ignore weight entirely
- Animated "flood fill" exploration followed by a traced final path

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