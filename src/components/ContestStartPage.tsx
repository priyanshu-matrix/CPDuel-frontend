import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getRandomProblem from "./problemData";
import MonacoEditor from "react-monaco-editor";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const problemData = getRandomProblem();

// Function to parse text and render inline/block math with better regex
const parseTextWithMath = (text) => {
  if (!text) return "";
  
  // Enhanced regex to handle nested $ and better math detection
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g;
  const parts = text.split(mathRegex);
  
  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const mathContent = part.slice(2, -2).trim();
      return <BlockMath key={index} math={mathContent} />;
    } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const mathContent = part.slice(1, -1).trim();
      return <InlineMath key={index} math={mathContent} />;
    }
    return part;
  });
};

const ContestStartPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [language_id, setLanguage_id] = useState(54);
  const [userCode, setUserCode] = useState(
    `#include <bits/stdc++.h>\nusing namespace std;\nint main() {
    // Your code here\n}`
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
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm font-semibold text-gray-200 transition-colors"
          >
            ← Go Back
          </button>
          <h1 className="text-xl font-bold">{problemData.title}</h1>
          <span
            className={`px-2 py-1 rounded ${
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
      <div className="flex-1 flex min-h-0">
        {/* Problem Description */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-700">
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-300">{parseTextWithMath(problemData.description)}</p>
            </section>
            {problemData.examples.map((ex, idx) => (
              <section key={idx}>
                <h3 className="font-medium mb-2">Example {idx + 1}:</h3>
                <div className="bg-gray-800 p-4 rounded">
                  <p className="text-gray-400">Input: {parseTextWithMath(ex.input)}</p>
                  <p className="text-gray-400">Output: {parseTextWithMath(ex.output)}</p>
                  {ex.explanation && (
                    <p className="text-gray-400 mt-2">
                      Explanation: {parseTextWithMath(ex.explanation)}
                    </p>
                  )}
                </div>
              </section>
            ))}
            <section>
              <h3 className="font-medium mb-2">Constraints:</h3>
              <ul className="list-disc list-inside text-gray-400">
                {problemData.constraints.map((c, idx) => (
                  <li key={idx}>{parseTextWithMath(c)}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Code Editor Section */}
        <div className="w-1/2 flex flex-col bg-gray-900 min-h-0">
          {/* Code Editor */}
          <div className="flex-1 p-4 min-h-0">
            <div className="bg-[#1e1e1e] rounded-lg border border-gray-700 h-full flex flex-col">
              <div className="flex items-center px-4 py-2 border-b border-gray-700 text-sm text-gray-400 shrink-0">
                <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-2"></span>
                <span className="w-3 h-3 bg-yellow-400 rounded-full inline-block mr-2"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-4"></span>
                {/* Language Selector */}
                <div className="">
                  <div className="flex items-center justify-between">
                    <select
                      id="language"
                      className="ml-2 rounded-md border-gray-700 bg-gray-700 text-gray-300 text-sm px-2 py-1"
                      onChange={(e) => {
                        setLanguage_id(parseInt(e.target.value, 10));
                        // console.log("Selected language ID:", language_id);
                      }}
                    >
                        <option value={54}>C++ (GCC 9.2.0)</option>
                        <option value={53}>C++ (GCC 8.3.0)</option>
                        <option value={52}>C++ (GCC 7.4.0)</option>
                        <option value={76}>C++ (Clang 7.0.1)</option>
                        <option value={50}>C (GCC 9.2.0)</option>
                        <option value={49}>C (GCC 8.3.0)</option>
                        <option value={48}>C (GCC 7.4.0)</option>
                        <option value={75}>C (Clang 7.0.1)</option>
                        <option value={71}>Python (3.8.1)</option>
                        <option value={70}>Python (2.7.17)</option>
                        <option value={62}>Java (OpenJDK 13.0.1)</option>
                        <option value={78}>Kotlin (1.3.70)</option>
                        <option value={73}>Rust (1.40.0)</option>
                        <option value={60}>Go (1.13.5)</option>
                        <option value={74}>TypeScript (3.7.4)</option>
                        <option value={63}>JavaScript (Node.js 12.14.0)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <MonacoEditor
                  height="100%"
                  width="100%"
                  language="cpp"
                  theme="vs-dark"
                  value={userCode}
                  onChange={(value) => setUserCode(value)}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Console Output */}
          {consoleOutput.length > 0 && (
            <div className="h-32 bg-gray-800 p-4 overflow-y-auto border-t border-gray-700 shrink-0">
              <h4 className="text-sm font-semibold text-gray-200 mb-2">
                Output:
              </h4>
              {consoleOutput.map((line, idx) => (
                <pre key={idx} className="text-sm font-mono text-gray-300">
                  {line}
                </pre>
              ))}
            </div>
          )}

          {/* Control Bar */}
          <div className="bg-gray-800 p-4 flex justify-between items-center border-t border-gray-700 shrink-0">
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
