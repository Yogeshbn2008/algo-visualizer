import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [arraySize, setArraySize] = useState(20);
  const [speed, setSpeed] = useState(100); // ms delay between steps
  const [array, setArray] = useState(() => generateRandomArray(arraySize));
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
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
    setIsSorting(false);
    setStepIndex(0);
  }

  function handleSizeChange(e) {
    const newSize = Number(e.target.value);
    setArraySize(newSize);
    setArray(generateRandomArray(newSize));
    setIsSorting(false);
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

  function handleSortClick() {
    const newSteps = getBubbleSortSteps(array);
    setSteps(newSteps);
    setStepIndex(0);
    setIsSorting(true);
  }

  useEffect(() => {
    if (!isSorting) return;

    if (stepIndex >= steps.length) {
      setIsSorting(false);
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
  }, [isSorting, stepIndex, steps, speed]);

  return (
    <div className="app">
      <h1>DSA Algorithm Visualizer</h1>

      <div className="controls">
        <button onClick={handleGenerateClick} disabled={isSorting}>
          Generate New Array
        </button>
        <button onClick={handleSortClick} disabled={isSorting}>
          Sort (Bubble Sort)
        </button>

        <label>
          Size: {arraySize}
          <input
            type="range"
            min="5"
            max="50"
            value={arraySize}
            onChange={handleSizeChange}
            disabled={isSorting}
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
    </div>
  );
}

export default App;