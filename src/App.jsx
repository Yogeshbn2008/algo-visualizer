import './App.css';
import { useState, useEffect } from 'react';

const algorithmLabels = {
  bubble: 'Bubble Sort',
  merge: 'Merge Sort',
  quick: 'Quick Sort',
};

const complexityInfo = {
  bubble: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  merge: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  quick: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
};

function App() {
  const [arraySize, setArraySize] = useState(20);
  const [speed, setSpeed] = useState(100); // ms delay between steps
  const [array, setArray] = useState(() => generateRandomArray(arraySize));
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [originalArray, setOriginalArray] = useState([]);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [highlightedIndices, setHighlightedIndices] = useState([]);

  function generateRandomArray(size) {
    const newArray = [];
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * 100) + 5);
    }
    return newArray;
  }

  function handleGenerateClick() {
    setArray(generateRandomArray(arraySize));
    setIsPlaying(false);
    setStepIndex(0);
  }

  function handleSizeChange(e) {
    const newSize = Number(e.target.value);
    setArraySize(newSize);
    setArray(generateRandomArray(newSize));
    setIsPlaying(false);
    setStepIndex(0);
  }

  function getBubbleSortSteps(inputArray) {
    const arr = [...inputArray];
    const steps = [];

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        steps.push({ type: 'compare', indices: [j, j + 1], array: [...arr] });

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({ type: 'swap', indices: [j, j + 1], array: [...arr] });
        }
      }
    }

    return steps;
  }

  function getMergeSortSteps(inputArray) {
  const arr = [...inputArray];
  const steps = [];

  function mergeSort(start, end) {
    if (end - start <= 1) return; // 0 or 1 element = already "sorted"

    const mid = Math.floor((start + end) / 2);
    mergeSort(start, mid);
    mergeSort(mid, end);
    merge(start, mid, end);
  }

  function merge(start, mid, end) {
    const left = arr.slice(start, mid);
    const right = arr.slice(mid, end);
    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
      steps.push({ indices: [start + i, mid + j], array: [...arr] }); // comparing

      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }
      steps.push({ indices: [k], array: [...arr] }); // overwrite
      k++;
    }

    while (i < left.length) {
      arr[k] = left[i];
      steps.push({ indices: [k], array: [...arr] });
      i++;
      k++;
    }

    while (j < right.length) {
      arr[k] = right[j];
      steps.push({ indices: [k], array: [...arr] });
      j++;
      k++;
    }
  }

  mergeSort(0, arr.length);
  return steps;
}

function getQuickSortSteps(inputArray) {
  const arr = [...inputArray];
  const steps = [];

  function quickSort(low, high) {
    if (low >= high) return; // 0 or 1 element = already sorted

    const pivotIndex = partition(low, high);
    quickSort(low, pivotIndex - 1);
    quickSort(pivotIndex + 1, high);
  }

  function partition(low, high) {
    const pivotValue = arr[high]; // last element as pivot
    let i = low - 1; // boundary of "smaller than pivot" region

    for (let j = low; j < high; j++) {
      steps.push({ indices: [j, high], array: [...arr] }); // comparing to pivot

      if (arr[j] < pivotValue) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({ indices: [i, j], array: [...arr] }); // swap
      }
    }

    // place pivot in its final position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({ indices: [i + 1, high], array: [...arr] });

    return i + 1;
  }

  quickSort(0, arr.length - 1);
  return steps;
}

  function handleSortClick() {
    setOriginalArray(array);
  let newSteps;
  if (algorithm === 'bubble') newSteps = getBubbleSortSteps(array);
  else if (algorithm === 'merge') newSteps = getMergeSortSteps(array);
  else if (algorithm === 'quick') newSteps = getQuickSortSteps(array);

  setSteps(newSteps);
  setStepIndex(0);
  setIsPlaying(true);
}

function handlePauseClick() {
  setIsPlaying(false);
}

function handlePlayClick() {
  if (steps.length > 0 && stepIndex < steps.length) {
    setIsPlaying(true);
  }
}

function handleStepForward() {
  if (stepIndex < steps.length) {
    setIsPlaying(false);
    const currentStep = steps[stepIndex];
    setArray(currentStep.array);
    setHighlightedIndices(currentStep.indices);
    setStepIndex(stepIndex + 1);
  }
}

function handleStepBack() {
  if (stepIndex === 0) return;

  setIsPlaying(false);
  const newStepIndex = stepIndex - 1;

  if (newStepIndex === 0) {
    setArray(originalArray);
    setHighlightedIndices([]);
  } else {
    const prevStep = steps[newStepIndex - 1];
    setArray(prevStep.array);
    setHighlightedIndices(prevStep.indices);
  }
  setStepIndex(newStepIndex);
}

function handleReset() {
  setIsPlaying(false);
  setStepIndex(0);
  setHighlightedIndices([]);
  if (originalArray.length > 0) {
    setArray(originalArray);
  }
}

  useEffect(() => {
    if (!isPlaying) return;

    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      setHighlightedIndices([]);
      return;
    }

    const timer = setTimeout(() => {
      const currentStep = steps[stepIndex];
      setArray(currentStep.array);
      setHighlightedIndices(currentStep.indices);
      setStepIndex(stepIndex + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, steps, speed]);

  return (
    <div className="app">
      <h1>DSA Algorithm Visualizer</h1>

      <div className="controls">
        <button onClick={handleGenerateClick} disabled={isPlaying}>
          Generate New Array
        </button>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          disabled={isPlaying}
        >
          <option value="bubble">Bubble Sort</option>
          <option value="merge">Merge Sort</option>
          <option value="quick">Quick Sort</option>
        </select>
        
        <button onClick={handleStepBack} disabled={isPlaying || stepIndex === 0}>
          ⏮ Step Back
        </button>
        <button onClick={handleSortClick} disabled={isPlaying}>
          Sort ({algorithmLabels[algorithm]})
        </button>
        <button onClick={isPlaying ? handlePauseClick : handlePlayClick} disabled={steps.length === 0}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={handleStepForward} disabled={isPlaying || stepIndex >= steps.length}>
          Step Forward ⏭
        </button>
        <button onClick={handleReset} disabled={isPlaying}>
          ↻ Reset
        </button>

        <label>
          Size: {arraySize}
          <input
            type="range"
            min="5"
            max="50"
            value={arraySize}
            onChange={handleSizeChange}
            disabled={isPlaying}
          />
        </label>

        <label>
          Speed: {speed}ms
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="bar-container">
        {array.map((value, index) => (
          <div
            key={index}
            className={`bar ${highlightedIndices.includes(index) ? 'highlighted' : ''}`}
            style={{ height: `${value * 3}px` }}
          ></div>
          
        ))}
      </div>

      <div className="complexity-panel">
        <h3>{algorithmLabels[algorithm]} — Time Complexity</h3>
        <div className="complexity-grid">
          <div><strong>Best:</strong> {complexityInfo[algorithm].best}</div>
          <div><strong>Average:</strong> {complexityInfo[algorithm].average}</div>
          <div><strong>Worst:</strong> {complexityInfo[algorithm].worst}</div>
          <div><strong>Space:</strong> {complexityInfo[algorithm].space}</div>
        </div>
      </div>
    </div>
    
  );
}

export default App;