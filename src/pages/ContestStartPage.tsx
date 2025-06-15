import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MonacoEditor from "react-monaco-editor";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import axios from "axios";
import io from "socket.io-client";
import { toast } from "react-toastify";
import { API_URLS, getSocketUrl } from "../config/server";

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
    const [matchDetails, setMatchDetails] = useState<{ matchId: string; userId: string } | null>(null);
    const [socket, setSocket] = useState<any>(null);
    const [matchUpdateMessage, setMatchUpdateMessage] = useState<string | null>(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [matchResult, setMatchResult] = useState<'won' | 'lost' | null>(null);
    const [showMatchOverlay, setShowMatchOverlay] = useState(false);

    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    // after
    const [consoleOutput, setConsoleOutput] = useState<Array<{ text: string; type: string }>>([]);
    const [language_id, setLanguage_id] = useState(54);
    const [userCode, setUserCode] = useState(
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // Your code here\n    return 0;\n}`
    );
    const [isRunning, setIsRunning] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(5);

    // Effect to load code from localStorage when problemData is available
    useEffect(() => {
        if (problemData && contestId) {
            const localStorageKey = `contest-${contestId}-problem-${problemData._id}-code`;
            const savedCode = localStorage.getItem(localStorageKey);
            if (savedCode) {
                setUserCode(savedCode);
            }
        }
    }, [problemData, contestId]);

    // Effect to save code to localStorage when userCode changes
    useEffect(() => {
        if (problemData && contestId && userCode !== `// Default C++ template\n#include <iostream>\n\nint main() {\n    // Your code here\n    return 0;\n}`) { // Avoid saving initial default if not changed
            const localStorageKey = `contest-${contestId}-problem-${problemData._id}-code`;
            localStorage.setItem(localStorageKey, userCode);
        }
    }, [userCode, problemData, contestId]);

    // Fetch problem data
    useEffect(() => {
        const fetchUserMatchInfoAndProblem = async () => {
            if (!contestId) {
                setError("Contest ID is missing.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                // Step 0: Fetch User ID first
                const userInfoResponse = await axios.get(
                    API_URLS.USERS.INFO,
                    { headers }
                );

                if (!userInfoResponse.data || !userInfoResponse.data.uid) {
                    setError("Failed to retrieve user information.");
                    console.error("Unexpected user info response structure:", userInfoResponse.data);
                    setLoading(false);
                    return;
                }

                const Uid = userInfoResponse.data.uid;

                // Step 1: Fetch User Match Info
                const matchInfoResponse = await axios.post(
                    API_URLS.CONTESTS.GET_USER_MATCH_INFO,
                    { 
                        ContestID: contestId,
                        uid : Uid
                    },
                    { headers }
                );

                if (!matchInfoResponse.data || !matchInfoResponse.data.matchInfo) {
                    setError("Failed to retrieve match details.");
                    console.error("Unexpected match info response structure:", matchInfoResponse.data);
                    setLoading(false);
                    return;
                }
                
                const { matchId, userId, problemId, user2 , status } = matchInfoResponse.data.matchInfo;
                
                // Check if user gets a BYE (no problem assigned and user2 is "Bye")
                if (!problemId || user2 === "Bye") {
                    setError("You are promoted as BYE. Please wait until the next round starts.");
                    setLoading(false);
                    return;
                }
                if(status === "completed") {
                    setError("This match has already been completed. Please wait for the next round.");
                    setLoading(false);
                    return;
                }
                
                setMatchDetails({ matchId, userId }); // Optional: store if needed elsewhere

                // Step 2: Fetch Problem Data using obtained matchId and userId
                const problemResponse = await axios.post(
                    API_URLS.PROBLEMS.GET,
                    { 
                        id : problemId
                    },
                    { headers }
                );

                if (problemResponse.data && problemResponse.data.problem) {
                    // Work with plain text data directly - no decoding needed
                    const problemData = {
                        ...problemResponse.data.problem,
                        title: problemResponse.data.problem.title || "",
                        description: problemResponse.data.problem.description || "",
                        inputFormat: problemResponse.data.problem.inputFormat || "",
                        outputFormat: problemResponse.data.problem.outputFormat || "",
                        examples: problemResponse.data.problem.examples || [],
                        constraints: problemResponse.data.problem.constraints || [],
                        tags: problemResponse.data.problem.tags || [],
                    };
                    
                    // Debug log to check the data structure
                    console.log('Contest problem data received:', {
                        title: problemData.title,
                        constraints: problemData.constraints,
                        tags: problemData.tags
                    });
                    
                    setProblemData(problemData);
                    // setError(null); // setError(null) is already handled by the structure
                } else {
                    setError("Problem data is not in the expected format.");
                    console.error("Unexpected problem response structure:", problemResponse.data);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                if (axios.isAxiosError(err) && err.response) {
                    setError(`Failed to load data: ${err.response.data.message || err.message}`);
                } else {
                    setError("Failed to load data. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserMatchInfoAndProblem();
    }, [contestId]);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Socket connection and match update listener
    useEffect(() => {
        if (!matchDetails?.userId) return;

        // Establish socket connection
        const SERVER_URL = getSocketUrl();
        const socketConnection = io(SERVER_URL);
        setSocket(socketConnection);

        // Handle connection events
        socketConnection.on('connect', () => {
            console.log('Successfully connected to the socket server with ID:', socketConnection.id);
            setSocketConnected(true);
            
            // Join user-specific room after connecting
            const userId = matchDetails.userId;
            if (userId) {
                socketConnection.emit('joinUserRoom', userId);
                console.log(`Attempting to join room for user: ${userId}`);
            } else {
                console.error('User ID is not available. Cannot join user room.');
            }
        });

        socketConnection.on('disconnect', (reason) => {
            console.log('Disconnected from socket server:', reason);
            setSocketConnected(false);
        });

        socketConnection.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setSocketConnected(false);
        });

        // Listen for match updates
        socketConnection.on('matchUpdate', (data) => {
            console.log('Match Update Received:', data);
            
            if (data.status === 'won') {
                // Fetch opponent name
                const fetchOpponentName = async () => {
                    try {
                        const token = localStorage.getItem("token");
                        const headers = token ? { Authorization: `Bearer ${token}` } : {};
                        
                        const response = await axios.post(
                            API_URLS.USERS.GET_BY_UID,
                            { uid: data.opponentId },
                            { headers }
                        );
                        
                        const opponentName = response.data?.user?.name || data.opponentId;
                        
                        // Show success toast with opponent name
                        toast.success(`🎉 Congratulations! You won your match against ${opponentName}!`, {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    } catch (error) {
                        console.error('Failed to fetch opponent name:', error);
                        // Fallback to showing toast with opponent ID
                        toast.success(`🎉 Congratulations! You won your match against ${data.opponentId}!`, {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    }
                };
                
                fetchOpponentName();
                
                // Set match result and show overlay
                setMatchResult('won');
                setShowMatchOverlay(true);
                
                // Auto-redirect after 4 seconds
                setTimeout(() => {
                    navigate(`/contest/${contestId}`);
                }, 4000);
            } else if (data.status === 'lost') {
                // Fetch opponent name
                const fetchOpponentName = async () => {
                    try {
                        const token = localStorage.getItem("token");
                        const headers = token ? { Authorization: `Bearer ${token}` } : {};
                        
                        const response = await axios.post(
                            API_URLS.USERS.GET_BY_UID,
                            { uid: data.opponentId },
                            { headers }
                        );
                        
                        const opponentName = response.data?.user?.name || data.opponentId;
                        
                        // Show info toast for loss with opponent name
                        toast.info(`💪 Keep learning! Your opponent ${opponentName} won this time.`, {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    } catch (error) {
                        console.error('Failed to fetch opponent name:', error);
                        // Fallback to showing toast with opponent ID
                        toast.info(`💪 Keep learning! Your opponent ${data.opponentId} won this time.`, {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    }
                };
                
                fetchOpponentName();
                
                // Set match result and show overlay
                setMatchResult('lost');
                setShowMatchOverlay(true);
                
                // Auto-redirect after 4 seconds
                setTimeout(() => {
                    navigate(`/contest/${contestId}`);
                }, 4000);
            } else {
                console.warn('Received matchUpdate with unexpected status:', data.status);
            }
        });

        // Cleanup on component unmount
        return () => {
            socketConnection.disconnect();
            setSocket(null);
            setSocketConnected(false);
        };
    }, [matchDetails?.userId, contestId, navigate]);

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
        setConsoleOutput([{ text: "Running code...", type: "info" }]);

        if (!problemData || !matchDetails) {
            setConsoleOutput([{ text: "Error: Problem data or user details not loaded.", type: "error" }]);
            setIsRunning(false);
            return;
        }

        try {
            const payload = {
                language_id: language_id,
                code: btoa(userCode),
                question_id: problemData._id,
                userID: matchDetails.userId,
                runSampleOnly: true,
            };

            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(
                API_URLS.COMPILER.SUBMIT_CODE,
                payload,
                { headers }
            );

            const result = response.data; 
            const output: Array<{ text: string; type: string }> = [];

            const overallStatusText = `Overall Status: ${result.overallStatus || "Processing..."}`;
            output.push({ 
                text: overallStatusText, 
                type: result.overallStatus?.toLowerCase().includes("accept") ? "success" : (result.overallStatus ? "error" : "info") 
            });

            if (result.message) {
                let messageType = "info";
                const lowerCaseMessage = result.message.toLowerCase();
                if (lowerCaseMessage.includes("all test cases passed successfully") || 
                    (result.overallStatus?.toLowerCase().includes("accept") && lowerCaseMessage.includes("success"))) {
                    messageType = "success";
                } else if (lowerCaseMessage.includes("error") || lowerCaseMessage.includes("fail")) {
                    // Keep as error if overallStatus is also error, otherwise could be info
                    if (result.overallStatus && !result.overallStatus.toLowerCase().includes("accept")) {
                        messageType = "error";
                    }
                }
                output.push({ text: `Message: ${result.message}`, type: messageType });
            }

            if (result.details) {
                const details = result.details;
                // if (details.status && details.status.description) { // Removed Execution Status
                //     const executionStatusText = `Execution Status: ${details.status.description}`;
                //     output.push({ 
                //         text: executionStatusText, 
                //         type: details.status.description.toLowerCase().includes("accept") ? "success" : "error" 
                //     });
                // }
                if (details.time) output.push({ text: `Execution Time: ${details.time}s`, type: "info" });
                if (details.memory) output.push({ text: `Memory Used: ${details.memory / 1024}KB`, type: "info" }); // Assuming memory is in bytes

                if (details.stderr) {
                    output.push({ text: "--- Error ---", type: "error" });
                    try {
                        output.push({ text: atob(details.stderr), type: "error" });
                    } catch (e) {
                        output.push({ text: "Error decoding stderr: " + details.stderr, type: "error" });
                    }
                }
                if (details.compile_output) {
                    output.push({ text: "--- Compile Output ---", type: "info" });
                    try {
                        output.push({ text: atob(details.compile_output), type: "info" });
                    } catch (e) {
                        output.push({ text: "Error decoding compile_output: " + details.compile_output, type: "error" });
                    }
                }
            }
            
            // Handle detailed test case results if available (for runSampleOnly: true and if backend provides it)
            // This part might need adjustment based on actual API response for runSampleOnly with test cases
            if (result.testCaseResults && result.testCaseResults.length > 0) {
                output.push({ text: "--- Test Case Results ---", type: "info" });
                result.testCaseResults.forEach((tc, index) => {
                    const statusText = `Test Case ${index + 1}: ${tc.status}`;
                    output.push({ 
                        text: statusText, 
                        type: tc.status.toLowerCase().includes("accept") ? "success" : "error" 
                    });
                    if(tc.expectedOutput) output.push({ text: `  Expected: ${atob(tc.expectedOutput)}`, type: "info" });
                    if(tc.stderr) output.push({ text: `  Error: ${atob(tc.stderr)}`, type: "error" });
                });
            }

            setConsoleOutput(output);
        } catch (error) {
            console.error("Error executing code:", error);
            const errorMessages: Array<{ text: string; type: string }> = [];
            if (axios.isAxiosError(error) && error.response) {
                errorMessages.push({
                    text: `Error: Failed to execute code - ${error.response.data.message || error.message}`,
                    type: "error"
                });
                errorMessages.push({
                    text: `Details: ${JSON.stringify(error.response.data)}`,
                    type: "error"
                });
            } else {
                errorMessages.push({ text: "Error: Failed to execute code", type: "error" });
                errorMessages.push({ text: error.message, type: "error" });
            }
            setConsoleOutput(errorMessages);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsRunning(true); // Use isRunning to disable submit button too
        setConsoleOutput([{ text: "Submitting solution...", type: "info" }]);

        if (!problemData || !matchDetails) {
            setConsoleOutput([{ text: "Error: Problem data or user details not loaded.", type: "error" }]);
            setIsRunning(false);
            return;
        }

        try {
            const payload = {
                language_id: language_id,
                code: userCode,
                question_id: problemData._id,
                userId: matchDetails.userId,
                runSampleOnly: false,
                contestId: contestId, // Include contestId if needed by backend
            };

            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(
                API_URLS.COMPILER.SUBMIT_CODE,
                payload,
                { headers }
            );
            
            const result = response.data;
            const output: Array<{ text: string; type: string }> = [];

            const submissionStatusText = `Submission Status: ${result.overallStatus || "Processing..."}`;
            output.push({ 
                text: submissionStatusText, 
                type: result.overallStatus?.toLowerCase().includes("accept") ? "success" : (result.overallStatus ? "error" : "info")
            });
            
            // Check if submission is accepted
            if (result.overallStatus?.toLowerCase().includes("accept")) {
                setIsAccepted(true);
                output.push({ 
                    text: "🎉 Congratulations! Your solution has been accepted!", 
                    type: "success" 
                });
                output.push({ 
                    text: "Redirecting to contest page in 5 seconds...", 
                    type: "info" 
                });
                
                // Start countdown timer
                let countdown = 5;
                const countdownInterval = setInterval(() => {
                    countdown--;
                    setRedirectCountdown(countdown);
                    if (countdown <= 0) {
                        clearInterval(countdownInterval);
                        navigate(`/contest/${contestId}`);
                    }
                }, 1000);
            }

            if (result.message) {
                let messageType = "info";
                const lowerCaseMessage = result.message.toLowerCase();
                 if (lowerCaseMessage.includes("all test cases passed successfully") || 
                    (result.overallStatus?.toLowerCase().includes("accept") && (lowerCaseMessage.includes("success") || lowerCaseMessage.includes("accept")) )) {
                    messageType = "success";
                } else if (lowerCaseMessage.includes("error") || lowerCaseMessage.includes("fail") || (result.overallStatus && !result.overallStatus.toLowerCase().includes("accept"))) {
                     // If overallStatus is not accepted, and there's a message, it's likely related to the failure.
                    messageType = "error";
                }
                // Ensure if overall is success, message reflecting that is also success
                if (result.overallStatus?.toLowerCase().includes("accept") && (lowerCaseMessage.includes("success") || lowerCaseMessage.includes("accept"))) {
                    messageType = "success";
                }


                output.push({ text: `Message: ${result.message}`, type: messageType });
            }

            if (result.details) {
                const details = result.details;
                // if (details.status && details.status.description) { // Removed Execution Status
                //     const executionStatusText = `Execution Status: ${details.status.description}`;
                //     output.push({ 
                //         text: executionStatusText, 
                //         type: details.status.description.toLowerCase().includes("accept") ? "success" : "error" 
                //     });
                // }
                if (details.time) output.push({ text: `Execution Time: ${details.time}s`, type: "info" });
                if (details.memory) output.push({ text: `Memory Used: ${details.memory / 1024}KB`, type: "info" }); // Assuming memory is in bytes

                if (details.stderr) {
                    output.push({ text: "--- Error ---", type: "error" });
                     try {
                        output.push({ text: atob(details.stderr), type: "error" });
                    } catch (e) {
                        output.push({ text: "Error decoding stderr: " + details.stderr, type: "error" });
                    }
                }
                if (details.compile_output) {
                    output.push({ text: "--- Compile Output ---", type: "info" });
                    try {
                        output.push({ text: atob(details.compile_output), type: "info" });
                    } catch (e) {
                        output.push({ text: "Error decoding compile_output: " + details.compile_output, type: "error" });
                    }
                }
            }
            
            // This part for submissionDetails might be from an older API or a different flow.
            // If the new structure with `overallStatus` and `details` is standard, this might not be hit.
            if (result.submissionDetails) {
                output.push({ text: `Points Awarded: ${result.submissionDetails.points || 0}`, type: "info" });
                if (result.submissionDetails.testCaseResults && result.submissionDetails.testCaseResults.length > 0) {
                    output.push({ text: "--- Test Case Breakdown ---", type: "info" });
                    result.submissionDetails.testCaseResults.forEach((tc, index) => {
                        const statusText = `Test Case ${index + 1}: ${tc.status}`;
                        output.push({ 
                            text: statusText, 
                            type: tc.status.toLowerCase().includes("accept") ? "success" : "error" 
                        });
                    });
                }
            }

            setConsoleOutput(output);
        } catch (error) {
            console.error("Error submitting code:", error);
            const errorMessages: Array<{ text: string; type: string }> = [];
            if (axios.isAxiosError(error) && error.response) {
                errorMessages.push({
                    text: `Error: Failed to submit solution - ${error.response.data.message || error.message}`,
                    type: "error"
                });
                errorMessages.push({
                    text: `Details: ${JSON.stringify(error.response.data)}`,
                    type: "error"
                });
            } else {
                errorMessages.push({ text: "Error: Failed to submit solution", type: "error" });
                errorMessages.push({ text: error.message, type: "error" });
            }
            setConsoleOutput(errorMessages);
        } finally {
            setIsRunning(false);
        }
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
            {/* Success overlay with loading animation */}
            {isAccepted && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-lg p-8 text-center shadow-2xl border border-gray-600">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-400 border-opacity-75 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-green-400 mb-2">Solution Accepted! 🎉</h2>
                        <p className="text-gray-300 mb-4">Redirecting to contest page...</p>
                        <div className="text-3xl font-bold text-amber-400">{redirectCountdown}</div>
                        <button
                            onClick={() => navigate(`/contest/${contestId}`)}
                            className="mt-4 bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200"
                        >
                            Go Now
                        </button>
                    </div>
                </div>
            )}

            {/* Winner overlay with celebration animation */}
            {showMatchOverlay && matchResult === 'won' && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-green-800 to-emerald-900 rounded-lg p-8 text-center shadow-2xl border border-green-500 max-w-md">
                        {/* Winner animation - spinning trophy with celebration */}
                        <div className="relative mx-auto mb-6">
                            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-yellow-400 border-opacity-75 mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl animate-bounce">🏆</span>
                            </div>
                            {/* Celebration particles */}
                            <div className="absolute -top-2 -left-2 animate-ping">
                                <span className="text-yellow-400 text-lg">✨</span>
                            </div>
                            <div className="absolute -top-2 -right-2 animate-ping" style={{animationDelay: '0.5s'}}>
                                <span className="text-yellow-400 text-lg">🎉</span>
                            </div>
                            <div className="absolute -bottom-2 -left-2 animate-ping" style={{animationDelay: '1s'}}>
                                <span className="text-yellow-400 text-lg">⭐</span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 animate-ping" style={{animationDelay: '1.5s'}}>
                                <span className="text-yellow-400 text-lg">🎊</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-green-400 mb-4 animate-pulse">Victory! 🎉</h2>
                        <p className="text-green-200 mb-4 text-lg">Congratulations! You won the match!</p>
                        <p className="text-green-300 text-sm mb-6">Redirecting to contest page in 4 seconds...</p>
                        <button
                            onClick={() => navigate(`/contest/${contestId}`)}
                            className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
                        >
                            Go to Contest
                        </button>
                        <button
                            onClick={() => setShowMatchOverlay(false)}
                            className="ml-3 bg-gray-600 hover:bg-gray-500 px-4 py-3 rounded-lg text-gray-200 font-semibold transition-all duration-200"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Loser overlay with motivational animation */}
            {showMatchOverlay && matchResult === 'lost' && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-blue-800 to-indigo-900 rounded-lg p-8 text-center shadow-2xl border border-blue-500 max-w-md">
                        {/* Learning animation - rotating book with progress */}
                        <div className="relative mx-auto mb-6">
                            <div className="animate-pulse rounded-full h-20 w-20 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto flex items-center justify-center">
                                <span className="text-3xl animate-bounce">📚</span>
                            </div>
                            {/* Motivational elements */}
                            <div className="absolute -top-1 -left-1 animate-ping" style={{animationDelay: '0.5s'}}>
                                <span className="text-blue-400 text-sm">💪</span>
                            </div>
                            <div className="absolute -top-1 -right-1 animate-ping" style={{animationDelay: '1s'}}>
                                <span className="text-purple-400 text-sm">🚀</span>
                            </div>
                            <div className="absolute -bottom-1 -left-1 animate-ping" style={{animationDelay: '1.5s'}}>
                                <span className="text-blue-400 text-sm">⚡</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 animate-ping" style={{animationDelay: '2s'}}>
                                <span className="text-purple-400 text-sm">🎯</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-blue-400 mb-4 animate-pulse">Keep Learning! 💪</h2>
                        <p className="text-blue-200 mb-4 text-lg">Every challenge makes you stronger!</p>
                        <p className="text-blue-300 text-sm mb-6">Redirecting to contest page in 4 seconds...</p>
                        <button
                            onClick={() => navigate(`/contest/${contestId}`)}
                            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
                        >
                            Go to Contest
                        </button>
                        <button
                            onClick={() => setShowMatchOverlay(false)}
                            className="ml-3 bg-gray-600 hover:bg-gray-500 px-4 py-3 rounded-lg text-gray-200 font-semibold transition-all duration-200"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

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
                    <div className="bg-gray-700/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-600/50">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className="text-xs text-gray-300">
                            {socketConnected ? 'Connected' : 'Disconnected'}
                        </span>
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
                                    onChange={(value) => setUserCode(value || "")} // Ensure value is not undefined
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
                                <h4 className="text-sm font-semibold text-amber-400 flex items-center"></h4>
                                <div className=" p-4 flex justify-between items-center shrink-0">
                                    <button
                                        onClick={handleRun}
                                        disabled={isRunning}
                                        className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg ${isRunning
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
                                        disabled={isRunning} // Disable submit button while running/submitting
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
                                            className={`text-sm font-mono leading-relaxed mb-1 ${
                                                line.type === 'success' ? 'text-green-400' :
                                                line.type === 'error' ? 'text-red-400' :
                                                'text-gray-300' // Default for 'info'
                                            }`}
                                        >
                                            {line.text}
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
