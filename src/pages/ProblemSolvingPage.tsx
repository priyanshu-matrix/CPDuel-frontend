import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

type TestCase = {
    input: string;
    output: string;
};

const ProblemSolvingPage: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 minutes in seconds
    const [code, setCode] = useState<string>(`function twoSum(nums, target) {
  // Your code here
}`);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

    // Mock problem data
    const problem = {
        title: "1. Two Sum",
        difficulty: "Easy",
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.`,
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
            },
            {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
                explanation: "",
            },
        ],
        constraints: [
            "2 <= nums.length <= 10⁴",
            "-10⁹ <= nums[i] <= 10⁹",
            "-10⁹ <= target <= 10⁹",
        ],
    };

    // Timer management
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleRun = () => {
        // Mock execution
        setConsoleOutput([
            "Running test cases...",
            "Test case 1: Passed ✅",
            "Test case 2: Passed ✅",
        ]);
    };

    const handleSubmit = () => {
        // Mock submission
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
                    <h1 className="text-xl font-bold">{problem.title}</h1>
                    <span
                        className={`px-2 py-1 rounded-full text-sm 
            ${problem.difficulty === "Easy"
                                ? "bg-green-600"
                                : problem.difficulty === "Medium"
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                            }`}
                    >
                        {problem.difficulty}
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="bg-gray-700 px-3 py-1 rounded">
                        ⏳ {formatTime(timeLeft)}
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
                            <p className="text-gray-300">{problem.description}</p>
                        </section>

                        {problem.examples.map((ex, idx) => (
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
                                {problem.constraints.map((c, idx) => (
                                    <li key={idx}>{c}</li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>

                {/* Code Editor Section */}
                <div className="w-1/2 flex flex-col">
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    {/* Console Output */}
                    {consoleOutput.length > 0 && (
                        <div className="h-48 bg-gray-800 p-4 overflow-y-auto border-t border-gray-700">
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
                        <div className="flex space-x-4">
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
        </div>
    );
};

export default ProblemSolvingPage;
