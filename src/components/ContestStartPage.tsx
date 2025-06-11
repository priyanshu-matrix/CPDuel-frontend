import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MonacoEditor from "react-monaco-editor";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import axios from "axios";

// Define an interface for the problem data structure
interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemData {
  _id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  difficulty: "Easy" | "Medium" | "Hard";
  examples: ProblemExample[];
  constraints: string[];
  timeLimit: number;
  memoryLimit: number;
  tags: string[];
  points: number;
}

// Function to parse text and render inline/block math with better regex
const parseTextWithMath = (text) => {
  if (!text) return "";

  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g;
  const parts = text.split(mathRegex);

  return parts.map((part, index) => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const mathContent = part.slice(2, -2).trim();
      return <BlockMath key={index} math={mathContent} />;
    } else if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const mathContent = part.slice(1, -1).trim();
      return <InlineMath key={index} math={mathContent} />;
    }
    return part;
  });
};

const ContestStartPage = () => {
  const navigate = useNavigate();
  const { contestId } = useParams<{ contestId: string }>();

  const [problemData, setProblemData] = useState<ProblemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [language_id, setLanguage_id] = useState(54);
  const [userCode, setUserCode] = useState(
    `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // Your code here\n    return 0;\n}`
  );
  const [isRunning, setIsRunning] = useState(false);

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      if (!contestId) {
        setError("Contest ID is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(
          `http://localhost:3000/api/contests/getRandomContestProblem/${contestId}`,
          { headers }
        );

        if (response.data && response.data.problem) {
          const decodedProblem = {
            ...response.data.problem,
            title: response.data.problem.title
              ? atob(response.data.problem.title)
              : "",
            description: response.data.problem.description
              ? atob(response.data.problem.description)
              : "",
            inputFormat: response.data.problem.inputFormat
              ? atob(response.data.problem.inputFormat)
              : "",
            outputFormat: response.data.problem.outputFormat
              ? atob(response.data.problem.outputFormat)
              : "",
            examples:
              response.data.problem.examples?.map((ex) => ({
                ...ex,
                input: ex.input ? atob(ex.input) : "",
                output: ex.output ? atob(ex.output) : "",
                explanation: ex.explanation ? atob(ex.explanation) : "",
              })) || [],
            constraints:
              response.data.problem.constraints?.map((constraint) =>
                constraint ? atob(constraint) : ""
              ) || [],
            tags:
              response.data.problem.tags?.map((tag) =>
                tag ? atob(tag) : ""
              ) || [],
          };
          setProblemData(decodedProblem);
        } else {
          setError("Problem data is not in the expected format.");
          console.error("Unexpected response structure:", response.data);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching problem data:", err);
        setError("Failed to load problem. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [contestId]);

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-emerald-500 text-emerald-100";
      case "Medium":
        return "bg-amber-500 text-amber-100";
      case "Hard":
        return "bg-red-500 text-red-100";
      default:
        return "bg-gray-500 text-gray-100";
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setConsoleOutput(["Running code..."]);

    try {
      // Simulate API call for code execution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock response - replace with actual API call
      const mockResult = {
        status: "Accepted",
        stdout: "Hello World!\n",
        stderr: null,
        compile_output: null,
        time: "0.02",
        memory: 2048,
      };

      const output = [];
      output.push(`Status: ${mockResult.status}`);
      output.push(`Execution Time: ${mockResult.time}s`);
      output.push(`Memory Used: ${mockResult.memory}KB`);
      output.push("--- Output ---");
      if (mockResult.stdout) {
        output.push(mockResult.stdout);
      }
      if (mockResult.stderr) {
        output.push("--- Error ---");
        output.push(mockResult.stderr);
      }
      if (mockResult.compile_output) {
        output.push("--- Compile Output ---");
        output.push(mockResult.compile_output);
      }

      setConsoleOutput(output);
    } catch (error) {
      setConsoleOutput(["Error: Failed to execute code", error.message]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = () => {
    setConsoleOutput(["Submitting solution..."]);
    // Add submit logic here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-400 border-opacity-75"></div>
        <p className="mt-4 text-xl font-medium">Loading problem...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
          <p className="text-xl text-red-400">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg text-sm font-semibold text-gray-200 transition-all duration-200 hover:scale-105"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!problemData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
        <p className="text-xl">No problem data available.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg text-sm font-semibold text-gray-200 transition-all duration-200"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Enhanced Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 p-4 flex justify-between items-center shrink-0 shadow-lg">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700/80 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-semibold text-gray-200 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
          >
            ← Go Back
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              {problemData.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                problemData.difficulty
              )}`}
            >
              {problemData.difficulty}
            </span>
            {/* <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/30">
              {problemData.points} pts
            </span> */}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-700/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-600/50">
            <span className="text-amber-400">⏳</span> {formatTime(timeLeft)}
          </div>
          <div className="bg-gray-700/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-600/50">
            Opponent: <span className="text-red-400 ml-1">❌ Not Solved</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Enhanced Problem Description */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-700/50 bg-gray-800/20">
          <div className="space-y-6">
            {/* Tags */}
            {problemData.tags && problemData.tags.length > 0 && (
              <section>
                <div className="flex flex-wrap gap-2 mb-4">
                  {problemData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-xs font-medium border border-purple-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Problem Limits */}
            <section className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-3 text-amber-400">
                Problem Constraints
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <span className="text-gray-400">Time Limit:</span>
                  <span className="ml-2 font-mono text-green-400">
                    {problemData.timeLimit}s
                  </span>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <span className="text-gray-400">Memory Limit:</span>
                  <span className="ml-2 font-mono text-blue-400">
                    {problemData.memoryLimit}MB
                  </span>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-3 text-amber-400">
                Description
              </h2>
              <div className="text-gray-300 leading-relaxed">
                {parseTextWithMath(problemData.description)}
              </div>
            </section>

            {/* Input/Output Format */}
            {problemData.inputFormat && (
              <section className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50">
                <h2 className="text-lg font-semibold mb-3 text-amber-400">
                  Input Format
                </h2>
                <div className="text-gray-300 leading-relaxed">
                  {parseTextWithMath(problemData.inputFormat)}
                </div>
              </section>
            )}

            {problemData.outputFormat && (
              <section className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50">
                <h2 className="text-lg font-semibold mb-3 text-amber-400">
                  Output Format
                </h2>
                <div className="text-gray-300 leading-relaxed">
                  {parseTextWithMath(problemData.outputFormat)}
                </div>
              </section>
            )}

            {/* Examples */}
            {problemData.examples.map((ex, idx) => (
              <section
                key={idx}
                className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50"
              >
                <h3 className="font-semibold mb-3 text-amber-400">
                  Example {idx + 1}:
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-600/30">
                    <p className="text-green-400 font-medium mb-1">Input:</p>
                    <pre className="text-gray-300 font-mono text-sm">
                      {parseTextWithMath(ex.input)}
                    </pre>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-600/30">
                    <p className="text-blue-400 font-medium mb-1">Output:</p>
                    <pre className="text-gray-300 font-mono text-sm">
                      {parseTextWithMath(ex.output)}
                    </pre>
                  </div>
                  {ex.explanation && (
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-600/30">
                      <p className="text-purple-400 font-medium mb-1">
                        Explanation:
                      </p>
                      <div className="text-gray-300 text-sm">
                        {parseTextWithMath(ex.explanation)}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            ))}

            {/* Constraints */}
            <section className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50">
              <h3 className="font-semibold mb-3 text-amber-400">
                Constraints:
              </h3>
              <ul className="space-y-1">
                {problemData.constraints.map((c, idx) => (
                  <li key={idx} className="text-gray-300 flex items-start">
                    <span className="text-amber-400 mr-2">•</span>
                    <span>{parseTextWithMath(c)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Enhanced Code Editor Section */}
        <div className="w-1/2 flex flex-col bg-gray-900/30 min-h-0">
          {/* Code Editor - Now takes half of the available space */}
          <div className="flex-1 p-4 min-h-0">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 h-full flex flex-col shadow-xl">
              <div className="flex items-center px-4 py-3 border-b border-gray-700/50 text-sm text-gray-400 shrink-0 bg-gray-800/80">
                <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-2"></span>
                <span className="w-3 h-3 bg-yellow-400 rounded-full inline-block mr-2"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-4"></span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 font-medium">Language:</span>
                  <select
                    id="language"
                    className="rounded-md border-gray-600 bg-gray-700/80 text-gray-300 text-sm px-3 py-1 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    value={language_id}
                    onChange={(e) =>
                      setLanguage_id(parseInt(e.target.value, 10))
                    }
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
                    fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                    lineHeight: 22,
                    renderLineHighlight: "gutter",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Console Output - Now takes half of the available space */}
          <div className="flex-1 p-4 min-h-0">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 h-full flex flex-col shadow-xl">
              <div className="px-4 py-3 border-b border-gray-700/50 shrink-0 bg-gray-800/80">
                <h4 className="text-sm font-semibold text-amber-400 flex items-center">
                </h4>
                <div className=" p-4 flex justify-between items-center shrink-0">
                  <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg ${
                      isRunning
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600/80 hover:bg-blue-600 hover:scale-105"
                    }`}
                  >
                    <span>{isRunning ? "⏳" : "▶️"}</span>
                    <span>{isRunning ? "Running..." : "Run"}</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-2 rounded-lg text-gray-900 font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <span>🚀</span>
                    <span>Submit</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto min-h-0">
                {consoleOutput.length > 0 ? (
                  consoleOutput.map((line, idx) => (
                    <pre
                      key={idx}
                      className="text-sm font-mono text-gray-300 leading-relaxed mb-1"
                    >
                      {line}
                    </pre>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    Run your code to see output...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Control Bar */}
        </div>
      </div>
    </div>
  );
};

export default ContestStartPage;
