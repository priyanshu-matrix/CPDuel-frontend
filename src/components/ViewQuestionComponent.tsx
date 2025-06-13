import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Define interfaces for problem data structure
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

interface ViewQuestionComponentProps {
    problemId: string;
    isOpen: boolean;
    onClose: () => void;
}

// Function to parse text and render inline/block math with better regex
const parseTextWithMath = (text: string) => {
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

const ViewQuestionComponent: React.FC<ViewQuestionComponentProps> = ({ 
    problemId, 
    isOpen, 
    onClose
}) => {
    const [problemData, setProblemData] = useState<ProblemData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch problem data when component opens
    useEffect(() => {
        if (isOpen && problemId) {
            fetchProblemData();
        }
    }, [isOpen, problemId]);

    const fetchProblemData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(
                `http://localhost:3000/api/problems/get`,
                { id: problemId },
                { headers }
            );

            if (response.data && response.data.problem) {
                const decodedProblem: ProblemData = {
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
                        response.data.problem.examples?.map((ex: any) => ({
                            ...ex,
                            input: ex.input ? atob(ex.input) : "",
                            output: ex.output ? atob(ex.output) : "",
                            explanation: ex.explanation ? atob(ex.explanation) : "",
                        })) || [],
                    constraints:
                        response.data.problem.constraints?.map((constraint: string) =>
                            constraint ? atob(constraint) : ""
                        ) || [],
                    tags:
                        response.data.problem.tags?.map((tag: string) =>
                            tag ? atob(tag) : ""
                        ) || [],
                };
                setProblemData(decodedProblem);
            } else {
                setError("Problem data is not in the expected format.");
            }
        } catch (err) {
            console.error("Error fetching problem:", err);
            if (axios.isAxiosError(err) && err.response) {
                setError(`Failed to load problem: ${err.response.data.message || err.message}`);
            } else {
                setError("Failed to load problem. Please try again.");
            }
        } finally {
            setLoading(false);
        }
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gray-700 px-6 py-4 flex justify-between items-center border-b border-gray-600">
                    <h2 className="text-2xl font-bold text-white">Problem Preview</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-400 border-opacity-75"></div>
                            <p className="mt-4 text-gray-300">Loading problem...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-6">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <p className="text-red-400">{error}</p>
                            </div>
                        </div>
                    )}

                    {problemData && (
                        <div className="p-6 text-gray-100">
                            {/* Problem Header */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h1 className="text-3xl font-bold text-white">
                                        {problemData.title}
                                    </h1>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(problemData.difficulty)}`}>
                                        {problemData.difficulty}
                                    </span>
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <span>⏱️ Time: {problemData.timeLimit}s</span>
                                    <span>💾 Memory: {problemData.memoryLimit}MB</span>
                                    <span>🎯 Points: {problemData.points}</span>
                                </div>

                                {/* Tags */}
                                {problemData.tags && problemData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {problemData.tags.map((tag, index) => (
                                            <span key={index} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Problem Description */}
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-amber-400 mb-3 border-b border-amber-400/30 pb-1">
                                    Problem Statement
                                </h2>
                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {parseTextWithMath(problemData.description)}
                                </div>
                            </div>

                            {/* Input Format */}
                            {problemData.inputFormat && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-emerald-400 mb-3 border-b border-emerald-400/30 pb-1">
                                        Input Format
                                    </h2>
                                    <div className="bg-gray-700/50 rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
                                        {parseTextWithMath(problemData.inputFormat)}
                                    </div>
                                </div>
                            )}

                            {/* Output Format */}
                            {problemData.outputFormat && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-purple-400 mb-3 border-b border-purple-400/30 pb-1">
                                        Output Format
                                    </h2>
                                    <div className="bg-gray-700/50 rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
                                        {parseTextWithMath(problemData.outputFormat)}
                                    </div>
                                </div>
                            )}

                            {/* Examples */}
                            {problemData.examples && problemData.examples.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-cyan-400 mb-3 border-b border-cyan-400/30 pb-1">
                                        Examples
                                    </h2>
                                    <div className="space-y-4">
                                        {problemData.examples.map((example, index) => (
                                            <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                                                <h3 className="font-semibold text-cyan-300 mb-2">Example {index + 1}</h3>
                                                
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-400 mb-1">Input:</h4>
                                                        <pre className="bg-gray-800 rounded p-2 text-green-300 text-sm overflow-x-auto">
                                                            {example.input}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-400 mb-1">Output:</h4>
                                                        <pre className="bg-gray-800 rounded p-2 text-blue-300 text-sm overflow-x-auto">
                                                            {example.output}
                                                        </pre>
                                                    </div>
                                                </div>
                                                
                                                {example.explanation && (
                                                    <div className="mt-3">
                                                        <h4 className="text-sm font-medium text-gray-400 mb-1">Explanation:</h4>
                                                        <div className="text-gray-300 text-sm whitespace-pre-wrap">
                                                            {parseTextWithMath(example.explanation)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Constraints */}
                            {problemData.constraints && problemData.constraints.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-orange-400 mb-3 border-b border-orange-400/30 pb-1">
                                        Constraints
                                    </h2>
                                    <div className="bg-gray-700/30 rounded-lg p-4">
                                        <ul className="space-y-1 text-gray-300">
                                            {problemData.constraints.map((constraint, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-orange-400 mr-2">•</span>
                                                    <span className="whitespace-pre-wrap">
                                                        {parseTextWithMath(constraint)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-6 border-t border-gray-600">
                                <button
                                    onClick={onClose}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewQuestionComponent;
