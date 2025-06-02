import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import problemData from "./problemData";

const ContestStartPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [userCode, setUserCode] = useState(
    `function twoSum(nums, target) {
  // Your code here
}`
  );

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRun = () => {
    setConsoleOutput([
      "Running test cases...",
      "Test case 1: Passed ✅",
      "Test case 2: Passed ✅",
    ]);
  };

  const handleSubmit = () => {
    setConsoleOutput([
      "Submitting solution...",
      "All test cases passed! 🎉",
      "Your submission beats 95% of solutions",
    ]);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm font-semibold text-gray-200 transition-colors"
          >
            ← Go Back
          </button>
          <h1 className="text-xl font-bold">{problemData.title}</h1>
          <span
            className={`px-2 py-1 rounded-full text-sm 
            ${
              problemData.difficulty === "Easy"
                ? "bg-green-600"
                : problemData.difficulty === "Medium"
                ? "bg-yellow-600"
                : "bg-red-600"
            }`}
          >
            {problemData.difficulty}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-700 px-3 py-1 rounded">
            ⏳ {formatTime(timeLeft)}
          </div>
          <div className="bg-gray-700 px-3 py-1 rounded">
            Opponent: <span className="text-green-400 ml-1">❌ Not Solved</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem Description */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-700">
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-300">{problemData.description}</p>
            </section>
            {problemData.examples.map((ex, idx) => (
              <section key={idx}>
                <h3 className="font-medium mb-2">Example {idx + 1}:</h3>
                <div className="bg-gray-800 p-4 rounded">
                  <p className="text-gray-400">Input: {ex.input}</p>
                  <p className="text-gray-400">Output: {ex.output}</p>
                  {ex.explanation && (
                    <p className="text-gray-400 mt-2">
                      Explanation: {ex.explanation}
                    </p>
                  )}
                </div>
              </section>
            ))}
            <section>
              <h3 className="font-medium mb-2">Constraints:</h3>
              <ul className="list-disc list-inside text-gray-400">
                {problemData.constraints.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Fake Code Editor */}
        <div className="w-1/2 flex flex-col bg-gray-900">
          <div className="flex-1 p-4">
            <div className="bg-[#1e1e1e] rounded-lg shadow-inner border border-gray-700 h-full flex flex-col">
              <div className="flex items-center px-4 py-2 border-b border-gray-700 text-sm text-gray-400">
                <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-2"></span>
                <span className="w-3 h-3 bg-yellow-400 rounded-full inline-block mr-2"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-4"></span>
                <span>main.js</span>
              </div>
              <textarea
                className="flex-1 w-full bg-transparent text-gray-100 font-mono text-sm resize-none px-4 py-2 outline-none"
                style={{ minHeight: 300 }}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Console Output */}
          {consoleOutput.length > 0 && (
            <div className="h-40 bg-gray-800 p-4 overflow-y-auto border-t border-gray-700">
              {consoleOutput.map((line, idx) => (
                <pre key={idx} className="text-sm font-mono text-gray-300">
                  {line}
                </pre>
              ))}
            </div>
          )}

          {/* Control Bar */}
          <div className="bg-gray-800 p-4 flex justify-between items-center border-t border-gray-700">
            <button
              onClick={handleRun}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
            >
              Run
            </button>
            <button
              onClick={handleSubmit}
              className="bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded text-gray-900 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestStartPage;
