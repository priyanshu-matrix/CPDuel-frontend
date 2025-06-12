import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const ContestList = () => {
    const { contestId } = useParams();
    const [problems, setProblems] = useState([]);
    const [contestName, setContestName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // New state for adding problems
    const [showAddProblem, setShowAddProblem] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [availableProblems, setAvailableProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [addingProblem, setAddingProblem] = useState(false);
    const [loadingProblems, setLoadingProblems] = useState(false);

    const decodeFromBase64 = (encodedText) => {
        try {
            return atob(encodedText);
        } catch (error) {
            return encodedText;
        }
    };

    // Fetch all available problems when add problem modal is shown
    useEffect(() => {
        const fetchAvailableProblems = async () => {
            if (!contestId) return;

            setLoadingProblems(true);
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:3000/api/problems/getall",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                // Handle different response structures
                let allProblems = [];
                if (Array.isArray(response.data)) {
                    allProblems = response.data;
                } else if (response.data && typeof response.data === "object") {
                    if (response.data.problems) {
                        allProblems = response.data.problems;
                    } else if (response.data.data) {
                        allProblems = response.data.data;
                    } else {
                        const possibleProblems = Object.values(response.data).find((val) =>
                            Array.isArray(val)
                        );
                        if (possibleProblems) {
                            allProblems = possibleProblems;
                        }
                    }
                }

                // Filter out problems that are already in the contest
                const contestProblemIds = problems.map((p) => p._id || p.id);

                let availableToAdd = [];
                if (Array.isArray(allProblems)) {
                    availableToAdd = allProblems
                        .filter((p) => {
                            if (!p) return false;
                            const problemId = p._id || p.id;
                            return !contestProblemIds.includes(problemId);
                        })
                        .map((problem) => ({
                            ...problem,
                            title: problem.title
                                ? decodeFromBase64(problem.title)
                                : "Untitled Problem",
                        }));
                }

                setAvailableProblems(availableToAdd);
                setFilteredProblems(availableToAdd);
            } catch (error) {
                console.error("Error fetching problems:", error);
            } finally {
                setLoadingProblems(false);
            }
        };

        if (showAddProblem) {
            fetchAvailableProblems();
        }
    }, [showAddProblem, problems, contestId]);

    // Filter problems based on search query
    useEffect(() => {
        if (searchQuery) {
            const filtered = availableProblems.filter(
                (problem) =>
                    problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    problem.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProblems(filtered);
        } else {
            setFilteredProblems(availableProblems);
        }
    }, [searchQuery, availableProblems]);

    const addProblemToContest = async (problemId) => {
        if (!contestId) {
            toast.error("Contest ID is required");
            return;
        }

        setAddingProblem(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                "http://localhost:3000/api/contests/addProblemToContest",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ContestID: contestId,
                        ProblemID: problemId,
                    }),
                }
            );

            if (response.ok) {
                toast.success("Problem added successfully!");
                // Refresh the contest problems list
                fetchContestProblems();
                // Keep the modal open but reset search
                setSearchQuery("");
            } else {
                const errorData = await response.json();
                toast.error(
                    `Failed to add problem: ${errorData.message || "Unknown error"}`
                );
            }
        } catch (error) {
            console.error("Error adding problem:", error);
            toast.error("Error adding problem");
        } finally {
            setAddingProblem(false);
        }
    };

    const fetchContestProblems = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.get(
                `http://localhost:3000/api/contests/getContestProblems/${contestId}`,
                { headers }
            );
            const data = response.data;

            if (data.success && data.contest && data.contest.problems) {
                const decodedProblems = data.contest.problems.map((problem) => ({
                    ...problem,
                    title: decodeFromBase64(problem.title),
                }));
                setProblems(decodedProblems);
                setContestName(data.contest.name);
            } else if (data.problems) {
                const decodedProblems = data.problems.map((problem) => ({
                    ...problem,
                    title: decodeFromBase64(problem.title),
                }));
                setProblems(decodedProblems);
                setContestName(data.name || data.contestName || "Contest");
            } else if (Array.isArray(data)) {
                const decodedProblems = data.map((problem) => ({
                    ...problem,
                    title: decodeFromBase64(problem.title),
                }));
                setProblems(decodedProblems);
                setContestName("Contest");
            } else {
                setProblems([]);
                setContestName("");
                setError(`Contest not found or no problems available.`);
            }
        } catch (e) {
            setError(e.message);
            setProblems([]);
            setContestName("");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contestId) {
            fetchContestProblems();
        }
    }, [contestId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
                <p className="text-xl text-gray-300">Loading contest problems...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
                <p className="text-xl text-red-400">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-900 py-10 px-4">
            <h1 className="text-3xl font-bold text-gray-100 mb-8">
                {contestName ? `Problems for ${contestName}` : "Contest Problems"}
            </h1>

            {/* Add Problem Button */}
            <div className="mb-6 w-full max-w-2xl flex justify-between">
                <button
                    onClick={() => setShowAddProblem(!showAddProblem)}
                    className={`${showAddProblem
                        ? "bg-gray-600 hover:bg-gray-700"
                        : "bg-amber-500 hover:bg-amber-600"
                        } text-white px-6 py-3 rounded-lg transition font-semibold`}
                >
                    {showAddProblem ? "Close" : "Add Problems"}
                </button>

                {showAddProblem && (
                    <span className="text-gray-300 self-center">
                        {availableProblems.length} problems available to add
                    </span>
                )}
            </div>

            {/* Add Problem Panel */}
            <div
                className={`w-full max-w-2xl transition-all duration-500 ease-in-out overflow-hidden ${showAddProblem
                    ? "max-h-[500px] opacity-100 mb-8"
                    : "max-h-0 opacity-0"
                    }`}
            >
                {showAddProblem && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                        <h3 className="text-white text-xl font-semibold mb-4">
                            Add Problem to Contest
                        </h3>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search problems by title or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-amber-400"
                            />
                        </div>

                        {/* Problem Suggestions */}
                        <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                            {loadingProblems ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">Loading available problems...</p>
                                </div>
                            ) : filteredProblems.length > 0 ? (
                                filteredProblems.map((problem) => (
                                    <div
                                        key={problem._id}
                                        className="flex items-center justify-between bg-gray-700 rounded-lg px-5 py-4 hover:bg-gray-600 transition border border-gray-600"
                                    >
                                        <div className="flex-1 pr-4">
                                            <h4 className="text-white font-medium text-lg">
                                                {problem.title}
                                            </h4>
                                            <div className="flex mt-2 space-x-3">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${problem.difficulty === "Easy"
                                                        ? "bg-green-900 text-green-300"
                                                        : problem.difficulty === "Medium"
                                                            ? "bg-yellow-900 text-yellow-300"
                                                            : "bg-red-900 text-red-300"
                                                        }`}
                                                >
                                                    {problem.difficulty || "Unknown"}
                                                </span>
                                                {problem.points && (
                                                    <span className="text-xs px-2 py-1 rounded bg-blue-900 text-blue-300">
                                                        {problem.points} points
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addProblemToContest(problem._id)}
                                            disabled={addingProblem}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition font-semibold min-w-[100px] flex items-center justify-center"
                                        >
                                            {addingProblem ? "Adding..." : "Add"}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-gray-700 rounded-lg">
                                    <p className="text-gray-300">
                                        {searchQuery
                                            ? "No matching problems found"
                                            : availableProblems.length === 0
                                                ? "No problems available to add"
                                                : "Loading problems..."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Existing Problems List */}
            <h2 className="text-2xl font-bold text-gray-100 mb-4 w-full max-w-2xl">
                Current Contest Problems ({problems.length})
            </h2>

            {problems.length === 0 ? (
                <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-8 text-center">
                    <p className="text-lg text-gray-400">
                        No problems have been added to this contest yet.
                    </p>
                    <p className="text-gray-500 mt-2">
                        Use the "Add Problems" button to add problems.
                    </p>
                </div>
            ) : (
                <div className="w-full max-w-2xl space-y-4">
                    {problems.map((problem, index) => (
                        <div
                            key={problem._id}
                            className="bg-gray-800 shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-700"
                        >
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-2">
                                {String.fromCharCode(65 + index)}. {problem.title}
                            </h2>
                            <p className="text-gray-300 mb-1">
                                <span className="font-medium text-gray-200">Difficulty:</span>{" "}
                                {problem.difficulty}
                            </p>
                            <p className="text-gray-300 mb-3">
                                <span className="font-medium text-gray-200">Points:</span>{" "}
                                {problem.points || "N/A"}
                            </p>
                            <Link
                                to={`/problem/${problem._id}`}
                                className="inline-block bg-indigo-600 text-white font-semibold py-2 px-4 rounded hover:bg-indigo-700 transition-colors duration-300"
                            >
                                View Problem
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContestList;
