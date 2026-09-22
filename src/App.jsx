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

function getStepExplanation(step, mode, target) {
  if (!step) {
    return mode === 'search' ? 'Enter a target and click Search.' : 'Click Sort to begin.';
  }

  const [a, b] = step.indices;
  const valA = step.array[a];
  const valB = b !== undefined ? step.array[b] : undefined;

  if (step.type === 'compare') return `Comparing ${valA} and ${valB}.`;
  if (step.type === 'swap') return `${valA} and ${valB} are out of order — swapping them.`;
  if (step.type === 'write') return `Placing ${valA} into position ${a}.`;
  if (step.type === 'pivot-placed') return `Pivot ${valB} placed in its final sorted position.`;
  if (step.type === 'checking') return `Checking index ${a}: is ${valA} equal to ${target}?`;
  if (step.type === 'found') return `Found it! ${valA} equals ${target} at index ${a}.`;
  if (step.type === 'not-found') return `${target} was not found in the array.`;
  return '';
}

function App() {
  const [mode, setMode] = useState('sort'); // 'sort' or 'search'
  const [arraySize, setArraySize] = useState(20);
  const [speed, setSpeed] = useState(100);
  const [array, setArray] = useState(() => generateRandomArray(arraySize));
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [originalArray, setOriginalArray] = useState([]);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [highlightedIndices, setHighlightedIndices] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [searchTarget, setSearchTarget] = useState('');

  function generateRandomArray(size) {
    const newArray = [];
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * 100) + 5);
    }
    return newArray;
  }

  function resetPlaybackState() {
    setIsPlaying(false);
    setStepIndex(0);
    setCurrentStep(null);
    setHighlightedIndices([]);
    setSteps([]);
  }

  function handleGenerateClick() {
    setArray(generateRandomArray(arraySize));
    resetPlaybackState();
  }

  function handleSizeChange(e) {
    const newSize = Number(e.target.value);
    setArraySize(newSize);
    setArray(generateRandomArray(newSize));
    resetPlaybackState();
  }

  function handleModeChange(newMode) {
    setMode(newMode);
    resetPlaybackState();
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
      if (end - start <= 1) return;

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
        steps.push({ type: 'compare', indices: [start + i, mid + j], array: [...arr] });

        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        steps.push({ type: 'write', indices: [k], array: [...arr] });
        k++;
      }

      while (i < left.length) {
        arr[k] = left[i];
        steps.push({ type: 'write', indices: [k], array: [...arr] });
        i++;
        k++;
      }

      while (j < right.length) {
        arr[k] = right[j];
        steps.push({ type: 'write', indices: [k], array: [...arr] });
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
      if (low >= high) return;

      const pivotIndex = partition(low, high);
      quickSort(low, pivotIndex - 1);
      quickSort(pivotIndex + 1, high);
    }

    function partition(low, high) {
      const pivotValue = arr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        steps.push({ type: 'compare', indices: [j, high], array: [...arr] });

        if (arr[j] < pivotValue) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({ type: 'swap', indices: [i, j], array: [...arr] });
        }
      }

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      steps.push({ type: 'pivot-placed', indices: [i + 1, high], array: [...arr] });

      return i + 1;
    }

    quickSort(0, arr.length - 1);
    return steps;
  }

    function getLinearSearchSteps(inputArray, target) {
    const steps = [];
    let found = false;

    for (let i = 0; i < inputArray.length; i++) {
      steps.push({
        type: inputArray[i] === target ? 'found' : 'checking',
        indices: [i],
        array: inputArray,
      });
      if (inputArray[i] === target) {
        found = true;
        break;
      }
    }

    if (!found) {
      steps.push({ type: 'not-found', indices: [], array: inputArray });
    }

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
    setCurrentStep(null);
    setIsPlaying(true);
  }

  function handleSearchClick() {
    const target = Number(searchTarget);
    if (searchTarget === '' || isNaN(target)) return;

    setOriginalArray(array);
    const newSteps = getLinearSearchSteps(array, target);
    setSteps(newSteps);
    setStepIndex(0);
    setCurrentStep(null);
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
      const step = steps[stepIndex];
      setArray(step.array);
      setHighlightedIndices(step.indices);
      setCurrentStep(step);
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
      setCurrentStep(null);
    } else {
      const prevStep = steps[newStepIndex - 1];
      setArray(prevStep.array);
      setHighlightedIndices(prevStep.indices);
      setCurrentStep(prevStep);
    }
    setStepIndex(newStepIndex);
  }

  function handleReset() {
    setIsPlaying(false);
    setStepIndex(0);
    setHighlightedIndices([]);
    setCurrentStep(null);
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
      const step = steps[stepIndex];
      setArray(step.array);
      setHighlightedIndices(step.indices);
      setCurrentStep(step);
      setStepIndex(stepIndex + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, steps, speed]);

  return (
    <div className="app">
      <h1>DSA Algorithm Visualizer</h1>

      <div className="mode-toggle">
        <button
          className={mode === 'sort' ? 'active' : ''}
          onClick={() => handleModeChange('sort')}
          disabled={isPlaying}
        >
          Sorting
        </button>
        <button
          className={mode === 'search' ? 'active' : ''}
          onClick={() => handleModeChange('search')}
          disabled={isPlaying}
        >
          Searching
        </button>
      </div>

      <div className="controls">
        <button onClick={handleGenerateClick} disabled={isPlaying}>
          Generate New Array
        </button>

        {mode === 'sort' && (
          <>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              disabled={isPlaying}
            >
              <option value="bubble">Bubble Sort</option>
              <option value="merge">Merge Sort</option>
              <option value="quick">Quick Sort</option>
            </select>
            <button onClick={handleSortClick} disabled={isPlaying}>
              Sort ({algorithmLabels[algorithm]})
            </button>
          </>
        )}

        {mode === 'search' && (
          <>
            <input
              type="number"
              placeholder="Target value"
              value={searchTarget}
              onChange={(e) => setSearchTarget(e.target.value)}
              disabled={isPlaying}
            />
            <button onClick={handleSearchClick} disabled={isPlaying}>
              Search
            </button>
          </>
        )}

        <button onClick={handleStepBack} disabled={isPlaying || stepIndex === 0}>
          ⏮ Step Back
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
            className={`bar ${
              highlightedIndices.includes(index)
                ? currentStep?.type === 'found'
                  ? 'found'
                  : 'highlighted'
                : ''
            }`}
            style={{ height: `${value * 3}px` }}
          >
            <span className="bar-label">{value}</span>
          </div>
        ))}
      </div>
      

      <div className="explanation-panel">
        <strong>Step {stepIndex} / {steps.length}</strong>
        <p>{getStepExplanation(currentStep, mode, searchTarget)}</p>
      </div>

      {mode === 'sort' && (
        <div className="complexity-panel">
          <h3>{algorithmLabels[algorithm]} — Time Complexity</h3>
          <div className="complexity-grid">
            <div><strong>Best:</strong> {complexityInfo[algorithm].best}</div>
            <div><strong>Average:</strong> {complexityInfo[algorithm].average}</div>
            <div><strong>Worst:</strong> {complexityInfo[algorithm].worst}</div>
            <div><strong>Space:</strong> {complexityInfo[algorithm].space}</div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default App;