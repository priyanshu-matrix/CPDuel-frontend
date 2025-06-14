import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URLS } from "../config/server";

const TROPHY_IMG = "https://img.icons8.com/fluency/96/trophy.png";

const ContestBracket = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusChangeLoading, setStatusChangeLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const response = await axios.get(
                    API_URLS.USERS.ALL,
                    { headers }
                );
                setUsers(response.data);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const [contestTitle, setContestTitle] = useState("");

    useEffect(() => {
        const fetchContestTitle = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required");
                setLoading(false);
                return;
            }
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            try {
                const response = await axios.get(
                    API_URLS.CONTESTS.GET_BY_ID(contestId),
                    { headers }
                );
                setContestTitle(response.data.contest.title);
            } catch (error) {
                console.error("Error fetching contest title:", error);
                setError("Failed to load contest title");
            }
        };

        fetchContestTitle();
    }, [contestId]);

    // Check if the user is an admin
    useEffect(() => {
        const checkAdminStatus = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(
                    API_URLS.USERS.INFO,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.data.isAdmin) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (err) {
                console.error("Error checking admin status:", err);
                setError("Failed to check admin status");
            } finally {
                setLoading(false);
            }
        };
        checkAdminStatus();
    }, []);

    // Handle status change for admin
    const handleStatusChange = async (userId, newStatus) => {
        // userId is assumed to be user._id (MongoDB ID)
        try {
            setStatusChangeLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required");
                setStatusChangeLoading(false); // Reset loading state on early exit
                return;
            }

            const userToUpdate = users.find((u) => u._id === userId);

            if (!userToUpdate) {
                setError("User not found locally. Cannot determine API UID.");
                setStatusChangeLoading(false); // Reset loading state on early exit
                return;
            }

            const apiUserUid = userToUpdate.uid; // Assuming the Firebase-like UID field is named 'uid'

            if (!apiUserUid) {
                setError(
                    "API UID (e.g., Firebase UID) is missing for the selected user."
                );
                setStatusChangeLoading(false); // Reset loading state on early exit
                return;
            }

            await axios.post(
                API_URLS.USERS.CHANGE_STATUS,
                {
                    uid: apiUserUid, // Use the correct Firebase-like UID for the API
                    contestId,
                    contestStatus: newStatus,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state. 'userId' is user._id, suitable for this.
            setUsers((prevUsers) =>
                prevUsers.map((user) => {
                    if (user._id === userId) {
                        const updatedContests = user.registeredContests.map((contest) => {
                            if (contest.contestId === contestId) {
                                return { ...contest, status: newStatus };
                            }
                            return contest;
                        });
                        return { ...user, registeredContests: updatedContests };
                    }
                    return user;
                })
            );
            setError(null); // Clear any previous error on success
        } catch (err) {
            console.error("Error changing user status:", err);
            setError("Failed to update user status");
        } finally {
            setStatusChangeLoading(false);
        }
    };

    // State for matches and rounds
    const [matches, setMatches] = useState([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [matchesLoading, setMatchesLoading] = useState(false);

    // Fetch matches for a specific round
    const fetchMatchesByRound = async (roundToFetch) => {
        try {
            setMatchesLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required");
                setMatchesLoading(false);
                return;
            }

            const response = await axios.get(
                API_URLS.CONTESTS.GET_BY_ID(contestId),
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const contestData = response.data.contest;
            if (contestData && contestData.matches) {
                // Assuming contestData.matches is an object like { "1": [...], "2": [...] }
                // Or if it's a Map, this might need adjustment based on how it's serialized/deserialized.
                // For now, assuming object access.
                setMatches(contestData.matches[String(roundToFetch)] || []);
            } else {
                setMatches([]);
            }
            setCurrentRound(contestData.currentRound || 0); // Update currentRound from the authoritative source
        } catch (err) {
            console.error("Error fetching matches:", err);
            setError("Failed to load matches for round " + roundToFetch);
            // Don't clear matches on error, keep existing view if any
        } finally {
            setMatchesLoading(false);
        }
    };

    // Start a new round with winner promotion check first
    const startNewRound = async () => {
        try {
            setMatchesLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required");
                setMatchesLoading(false);
                return;
            }

            // Step 1: First check and promote winners from current round
            await promoteRoundWinners();
            
            // Small delay to ensure promotion is complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Step 2: Start the actual new round
            const response = await axios.post(
                API_URLS.CONTESTS.START_CONTEST,
                {
                    ContestID: contestId,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Use matches and round from response directly
            setMatches(response.data.matches || []);
            setCurrentRound(response.data.round || 0);
            setError(null);
        } catch (err) {
            console.error("Error starting new round:", err);
            setError(err.response?.data?.message || "Failed to start new round");
        } finally {
            setMatchesLoading(false);
        }
    };

    // Update a match result
    const updateMatchResult = async (
        round,
        matchId,
        winner,
        status = "completed"
    ) => {
        // `round` param might be unused if backend uses currentRound
        try {
            setMatchesLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required");
                setMatchesLoading(false); // Reset loading state on early exit
                return;
            }

            const response = await axios.post(
                // Corrected from axios.postut
                API_URLS.CONTESTS.UPDATE_MATCH_WINNER, // Updated endpoint
                {
                    ContestID: contestId, // Updated payload
                    matchID: matchId, // Updated payload
                    uid: winner, // Updated payload (winner is the user ID)
                    // `round` is implicitly contest's current round on backend
                    // `status` is implicitly "completed" on backend
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Backend returns the updated list of matches for the current round
            setMatches(response.data.matches || []);
            setError(null); // Clear error on success
            
            // Check for winner-based promotion after match completion
            setTimeout(() => {
                promoteRoundWinners();
            }, 1000); // Delay to ensure state updates
        } catch (err) {
            console.error("Error updating match:", err);
            setError("Failed to update match");
        } finally {
            setMatchesLoading(false);
        }
    };

    // Helper to get user details from the users list
    const getUserDetailsByUid = (uid) => {
        if (!uid || uid === "Bye") return null;
        return users.find((u) => u.uid === uid); // Changed from u._id to u.uid
    };

    // Auto-resolve all matches with random winners
    const autoResolveAllMatches = async () => {
        try {
            setMatchesLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required");
                setMatchesLoading(false);
                return;
            }

            const pendingMatches = matches.filter(
                (match) => match.status === "pending"
            );

            for (const match of pendingMatches) {
                let winnerId = null;
                // Assuming match.user1 and match.user2 are user IDs or null/"Bye"
                const user1Id = match.user1;
                const user2Id = match.user2 === "Bye" ? null : match.user2;

                if (!user1Id && user2Id) {
                    winnerId = user2Id;
                } else if (user1Id && !user2Id) {
                    winnerId = user1Id;
                } else if (user1Id && user2Id) {
                    winnerId = Math.random() > 0.5 ? user1Id : user2Id;
                } else {
                    console.warn(
                        "Skipping match with invalid participants:",
                        match.matchId
                    );
                    continue;
                }

                if (winnerId) {
                    // updateMatchResult expects round, matchId, winnerId.
                    // The `round` parameter for updateMatchResult might be implicitly handled by backend's currentRound.
                    // Pass currentRound state as the round for consistency, though backend might ignore it.
                    await updateMatchResult(currentRound, match.matchId, winnerId);
                }
            }

            // Fetch updated matches for the current round after all updates
            // This might be redundant if updateMatchResult correctly updates the full match list
            // but kept for safety to ensure final state is accurate.
            if (currentRound > 0) {
                fetchMatchesByRound(currentRound);
            }
        } catch (err) {
            console.error("Error resolving matches:", err);
            setError("Failed to auto-resolve matches");
        } finally {
            setMatchesLoading(false);
        }
    };

    // Auto-promotion logic using direct API calls
    const autoPromoteUsers = async () => {
        try {
            setStatusChangeLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required");
                setStatusChangeLoading(false);
                return;
            }

            // Get the last 4 users from primary round (assuming they are the survivors)
            const lastFourPrimary = primaryUsers.slice(-4);
            
            // Promote last 4 primary users to semi-finalists
            for (const user of lastFourPrimary) {
                const apiUserUid = user.uid; // Use Firebase UID
                if (!apiUserUid) {
                    console.error("API UID missing for user:", user.name);
                    continue;
                }

                await axios.post(
                    API_URLS.USERS.CHANGE_STATUS,
                    {
                        uid: apiUserUid,
                        contestId,
                        contestStatus: "semi-finalists",
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Update local state
                setUsers((prevUsers) =>
                    prevUsers.map((u) => {
                        if (u._id === user._id) {
                            const updatedContests = u.registeredContests.map((contest) => {
                                if (contest.contestId === contestId) {
                                    return { ...contest, status: "semi-finalists" };
                                }
                                return contest;
                            });
                            return { ...u, registeredContests: updatedContests };
                        }
                        return u;
                    })
                );
            }

            // If there's only 1 semi-finalist left, promote to finalist
            if (semiFinalists.length === 1) {
                const winner = semiFinalists[0];
                const apiUserUid = winner.uid;
                
                if (apiUserUid) {
                    await axios.post(
                        API_URLS.USERS.CHANGE_STATUS,
                        {
                            uid: apiUserUid,
                            contestId,
                            contestStatus: "finalists",
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    // Update local state
                    setUsers((prevUsers) =>
                        prevUsers.map((u) => {
                            if (u._id === winner._id) {
                                const updatedContests = u.registeredContests.map((contest) => {
                                    if (contest.contestId === contestId) {
                                        return { ...contest, status: "finalists" };
                                    }
                                    return contest;
                                });
                                return { ...u, registeredContests: updatedContests };
                            }
                            return u;
                        })
                    );
                }
            }

            setError(null);
            
            // Refresh users data to get updated status
            await refreshUsersData();
        } catch (err) {
            console.error("Error in auto-promotion:", err);
            setError("Failed to auto-promote users: " + err.message);
        } finally {
            setStatusChangeLoading(false);
        }
    };

    // Get current round winners from completed matches
    const getCurrentRoundWinners = () => {
        const completedMatches = matches.filter(match => match.status === "completed" && match.winner);
        const winners = completedMatches.map(match => match.winner);
        const uniqueWinners = [...new Set(winners)];
        
        return uniqueWinners;
    };

    // Auto-promotion based on round winners
    const promoteRoundWinners = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const winners = getCurrentRoundWinners();
            const allMatchesCompleted = matches.length > 0 && matches.every(match => match.status === "completed");
            
            if (!allMatchesCompleted) {
                return;
            }

            // Promote winners based on count
            if (winners.length === 4) {
                setStatusChangeLoading(true);
                
                for (const winnerUid of winners) {
                    try {
                        await axios.post(
                            API_URLS.USERS.CHANGE_STATUS,
                            {
                                uid: winnerUid,
                                contestId,
                                contestStatus: "semi-finalists",
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    } catch (err) {
                        console.error(`Failed to promote ${winnerUid}:`, err);
                    }
                }
                
                await refreshUsersData();
                setStatusChangeLoading(false);
                
            } else if (winners.length === 1) {
                setStatusChangeLoading(true);
                
                try {
                    await axios.post(
                        API_URLS.USERS.CHANGE_STATUS,
                        {
                            uid: winners[0],
                            contestId,
                            contestStatus: "finalists",
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    await refreshUsersData();
                } catch (err) {
                    console.error(`Failed to crown champion:`, err);
                }
                
                setStatusChangeLoading(false);
            }
            
        } catch (err) {
            console.error("Error in promoteRoundWinners:", err);
            setStatusChangeLoading(false);
        }
    };

    // Refresh users data after promotions
    const refreshUsersData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.get(
                API_URLS.USERS.ALL,
                { headers }
            );
            setUsers(response.data);
        } catch (err) {
            console.error("Error refreshing users data:", err);
        }
    };

    // Check if auto-promotion should happen after match completion
    const checkAutoPromotion = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            // Auto-promote when primary round is down to 4 users
            if (primaryUsers.length === 4 && semiFinalists.length === 0) {
                await autoPromoteUsers();
            }
            // Auto-promote semi-finalist to finalist when only 1 remains
            else if (semiFinalists.length === 1 && finalists.length === 0) {
                const winner = semiFinalists[0];
                const apiUserUid = winner.uid;
                
                if (apiUserUid) {
                    await axios.post(
                        API_URLS.USERS.CHANGE_STATUS,
                        {
                            uid: apiUserUid,
                            contestId,
                            contestStatus: "finalists",
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    // Update local state
                    setUsers((prevUsers) =>
                        prevUsers.map((u) => {
                            if (u._id === winner._id) {
                                const updatedContests = u.registeredContests.map((contest) => {
                                    if (contest.contestId === contestId) {
                                        return { ...contest, status: "finalists" };
                                    }
                                    return contest;
                                });
                                return { ...u, registeredContests: updatedContests };
                            }
                            return u;
                        })
                    );
                }
            }
        } catch (err) {
            console.error("Error in checkAutoPromotion:", err);
            setError("Failed to check auto-promotion: " + err.message);
        }
    };

    // Enhanced auto-resolve function with winner-based promotion logic
    const autoResolveAllMatchesWithPromotion = async () => {
        // First resolve all matches
        await autoResolveAllMatches();
        
        // Then check for winner-based promotion
        setTimeout(() => {
            promoteRoundWinners();
        }, 1500); // Delay to ensure state updates
    };

    // Load initial matches
    useEffect(() => {
        const loadInitialMatches = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const contestResponse = await axios.get(
                    API_URLS.CONTESTS.GET_BY_ID(contestId),
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const round = contestResponse.data.contest.currentRound || 0;
                if (round > 0) {
                    fetchMatchesByRound(round);
                } else {
                    setCurrentRound(0);
                }
            } catch (err) {
                console.error("Error loading initial matches:", err);
                setError("Failed to load tournament data");
            }
        };

        loadInitialMatches();
    }, [contestId]);

    // Filter users by their registration status for this specific contest
    const primaryUsers = users.filter(
        (user) =>
            user.registeredContests &&
            user.registeredContests.some(
                (contest) =>
                    contest.contestId === contestId && contest.status === "primary"
            )
    );

    const semiFinalists = users.filter(
        (user) =>
            user.registeredContests &&
            user.registeredContests.some(
                (contest) =>
                    contest.contestId === contestId && contest.status === "semi-finalists"
            )
    );

    const finalists = users.filter(
        (user) =>
            user.registeredContests &&
            user.registeredContests.some(
                (contest) =>
                    contest.contestId === contestId && contest.status === "finalists"
            )
    );

    // Display user in a futuristic bracket slot
    const renderUser = (user, isWinner = false, status = 'active') => {
        if (!user)
            return (
                <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-xl h-16 w-full mx-auto flex items-center justify-center text-gray-400 border border-gray-600 shadow-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-mono">AWAITING_PLAYER</span>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            );

        // Find the registration entry for this specific contest
        const contestRegistration = user.registeredContests?.find(
            (registration) => registration.contestId === contestId
        );

        const statusColors = {
            active: 'from-cyan-500 to-blue-600',
            winner: 'from-amber-400 to-yellow-500',
            eliminated: 'from-red-500 to-red-700',
            qualified: 'from-green-500 to-emerald-600'
        };

        const borderColors = {
            active: 'border-cyan-400',
            winner: 'border-amber-400',
            eliminated: 'border-red-400',
            qualified: 'border-green-400'
        };

        const glowColors = {
            active: 'shadow-cyan-500/50',
            winner: 'shadow-amber-500/60',
            eliminated: 'shadow-red-500/30',
            qualified: 'shadow-green-500/50'
        };

        return (
            <div className={`relative bg-gradient-to-r ${statusColors[status]} rounded-xl w-full mx-auto overflow-hidden transform transition-all duration-300 hover:scale-105 ${borderColors[status]} border-2 shadow-xl ${glowColors[status]}`}>
                {/* Animated background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse"></div>
                
                {/* Main content */}
                <div className="relative flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center space-x-4">
                        {/* Avatar placeholder */}
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${statusColors[status]} flex items-center justify-center border-2 ${borderColors[status]} shadow-lg`}>
                            <span className="text-black font-bold text-lg">
                                {(user.name || "P").charAt(0).toUpperCase()}
                            </span>
                        </div>
                        
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="text-white font-bold text-lg tracking-wide">
                                    {user.name || "Player"}
                                </span>
                                {isWinner && (
                                    <div className="flex items-center space-x-1">
                                        <svg className="w-5 h-5 text-amber-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                        </svg>
                                        <span className="text-amber-400 font-bold text-sm">CHAMPION</span>
                                    </div>
                                )}
                            </div>
                            {contestRegistration && (
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-cyan-400' : status === 'winner' ? 'bg-amber-400' : status === 'eliminated' ? 'bg-red-400' : 'bg-green-400'} animate-pulse`}></div>
                                    <span className="text-gray-300 text-xs font-mono">
                                        REGISTERED: {new Date(contestRegistration.registeredAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex flex-col items-end space-y-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                            status === 'active' ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400' :
                            status === 'winner' ? 'bg-amber-500/30 text-amber-200 border border-amber-400' :
                            status === 'eliminated' ? 'bg-red-500/30 text-red-200 border border-red-400' :
                            'bg-green-500/30 text-green-200 border border-green-400'
                        }`}>
                            {status.toUpperCase()}
                        </div>
                        
                        {isAdmin && (
                            <div className="opacity-80 hover:opacity-100 transition-opacity">
                                <select
                                    className="bg-black/50 text-white text-xs rounded-lg px-2 py-1 border border-gray-500 backdrop-blur-sm focus:border-cyan-400 focus:outline-none"
                                    value={contestRegistration?.status || ""}
                                    onChange={(e) => handleStatusChange(user._id, e.target.value)}
                                    disabled={statusChangeLoading}
                                >
                                    <option value="primary">Primary</option>
                                    <option value="semi-finalists">Semi-finalist</option>
                                    <option value="finalists">Finalist</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Animated border glow effect */}
                <div className={`absolute inset-0 rounded-xl border-2 ${borderColors[status]} opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
            </div>
        );
    };

    // Helper function to render a single match for the futuristic match display section
    const renderMatchDisplay = (match) => {
        const user1 = getUserDetailsByUid(match.user1);
        const user2 = match.user2 === "Bye" ? "Bye" : getUserDetailsByUid(match.user2);

        const user1Name = user1 ? user1.name : match.user1 ? "Player 1" : "N/A";
        const user2Name = user2 === "Bye" ? "BYE" : user2 ? user2.name : "N/A";

        const isUser1Winner = match.winner && match.user1 && match.winner === match.user1;
        const isUser2Winner = match.winner && match.user2 && match.user2 !== "Bye" && match.winner === match.user2;

        return (
            <div
                key={match.matchId}
                className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/20"
            >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse"></div>
                
                {/* Match header */}
                <div className="relative p-4 bg-black/30 backdrop-blur-sm border-b border-cyan-500/20">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                            <span className="text-cyan-400 font-mono text-sm font-bold">
                                MATCH #{match.matchId}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400 font-mono">ROUND</span>
                            <span className="text-amber-400 font-bold">{match.round || currentRound}</span>
                        </div>
                    </div>
                </div>

                {/* Players section */}
                <div className="relative p-4 space-y-3">
                    {/* Player 1 */}
                    <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        isUser1Winner 
                            ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400 shadow-lg shadow-amber-500/20" 
                            : "bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600 hover:border-cyan-400/50"
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                    isUser1Winner ? "bg-amber-400 text-black" : "bg-cyan-500 text-white"
                                }`}>
                                    {user1Name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className="text-white font-bold">{user1Name}</span>
                                    {isUser1Winner && (
                                        <div className="flex items-center space-x-1 mt-1">
                                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                            <span className="text-amber-400 font-bold text-xs">VICTOR</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isUser1Winner && (
                                <div className="text-amber-400 font-bold text-lg animate-pulse">👑</div>
                            )}
                        </div>
                    </div>

                    {/* VS Divider */}
                    <div className="flex items-center justify-center py-2">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                            <span className="text-cyan-400 font-bold text-sm px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                                VS
                            </span>
                            <div className="w-8 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                        </div>
                    </div>

                    {/* Player 2 */}
                    <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        isUser2Winner 
                            ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400 shadow-lg shadow-amber-500/20" 
                            : user2 === "Bye"
                                ? "bg-gradient-to-r from-gray-800/30 to-gray-700/30 border-gray-700 opacity-60"
                                : "bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600 hover:border-cyan-400/50"
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                    isUser2Winner ? "bg-amber-400 text-black" : 
                                    user2 === "Bye" ? "bg-gray-600 text-gray-400" : "bg-purple-500 text-white"
                                }`}>
                                    {user2Name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className={`font-bold ${user2 === "Bye" ? "text-gray-400" : "text-white"}`}>
                                        {user2Name}
                                    </span>
                                    {isUser2Winner && (
                                        <div className="flex items-center space-x-1 mt-1">
                                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                            <span className="text-amber-400 font-bold text-xs">VICTOR</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isUser2Winner && (
                                <div className="text-amber-400 font-bold text-lg animate-pulse">👑</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Match status */}
                <div className="relative p-4 bg-black/20 backdrop-blur-sm border-t border-cyan-500/20">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-sm font-mono">STATUS:</span>
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold ${
                                match.status === "completed"
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${
                                    match.status === "completed" ? "bg-green-400" : "bg-yellow-400"
                                }`}></div>
                                {match.status.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Admin controls */}
                    {isAdmin && match.status === "pending" && match.user1 && match.user2 && match.user2 !== "Bye" && (
                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => updateMatchResult(currentRound, match.matchId, match.user1)}
                                disabled={matchesLoading}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                🏆 {user1Name} Wins
                            </button>
                            <button
                                onClick={() => updateMatchResult(currentRound, match.matchId, match.user2)}
                                disabled={matchesLoading}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                🏆 {user2Name} Wins
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12">
            {/* Go Back Button */}
            <div className="max-w-6xl mx-auto px-4 mb-6">
                <button
                    onClick={() => navigate("/contest")}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm font-semibold text-gray-200 transition-colors"
                >
                    ← Go Back
                </button>
            </div>
            <h1 className="text-5xl font-extrabold mb-10 tracking-tight text-center">
                THE <span className="text-amber-400 drop-shadow">PLAYOFFS</span>
            </h1>

            {/* Loading Indicator */}
            {loading && (
                <div className="flex justify-center mb-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-400"></div>
                </div>
            )}

            {/* Error Message */}
            {error && <div className="text-red-400 text-center mb-8">{error}</div>}

            {/* Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-6 mb-10">
                <button
                    className="bg-amber-400 text-gray-900 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-amber-300 transition text-lg"
                    onClick={() => navigate(`/contest/begin/${contestId}`)}
                >
                    Start
                </button>
            </div>

            {/* Trophy Display with Champion Name */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative">
                    <img
                        src={TROPHY_IMG}
                        alt="Trophy"
                        className="w-24 h-24 md:w-28 md:h-28 drop-shadow-lg"
                    />
                    {/* Golden glow effect for trophy when there's a finalist */}
                    {finalists.length > 0 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-500/30 to-amber-400/20 rounded-full blur-lg animate-pulse"></div>
                    )}
                </div>
                
                {/* Champion Name Display */}
                {finalists.length > 0 && (
                    <div className="mt-4 text-center">
                        <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent text-2xl md:text-3xl font-bold tracking-wide animate-pulse">
                            🏆 {finalists[0].name} 🏆
                        </div>
                        <div className="text-amber-300 text-sm md:text-base font-semibold mt-1 tracking-wider">
                            TOURNAMENT CHAMPION
                        </div>
                        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2 rounded-full"></div>
                    </div>
                )}
                
                {/* Awaiting Champion Message */}
                {finalists.length === 0 && (
                    <div className="mt-4 text-center">
                        <div className="text-gray-400 text-lg font-semibold">
                            Awaiting Champion...
                        </div>
                        <div className="text-gray-500 text-sm mt-1">
                            The crown awaits its rightful owner
                        </div>
                    </div>
                )}
            </div>

            {/* Futuristic Tournament Arena */}
            <div className="max-w-7xl mx-auto px-4 mb-10">
                <div className="relative">
                    {/* Arena Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-blue-900/20 rounded-3xl backdrop-blur-sm border border-cyan-500/30"></div>
                    
                    {/* Header */}
                    <div className="relative p-8 text-center">
                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                            BATTLE ARENA
                        </h2>
                        <div className="flex justify-center space-x-8 mb-8">
                            <div className="text-center relative">
                                <div className="text-2xl font-bold text-cyan-400">
                                    {primaryUsers.length}
                                </div>
                                <div className="text-sm text-gray-400">FIGHTERS</div>
                            </div>
                            <div className="text-center relative">
                                <div className="text-2xl font-bold text-purple-400">
                                    {semiFinalists.length}
                                </div>
                                <div className="text-sm text-gray-400">SEMI-FINALISTS</div>
                            </div>
                            <div className="text-center relative">
                                <div className={`text-2xl font-bold ${finalists.length > 0 ? 'text-amber-400 animate-pulse' : 'text-amber-400'}`}>
                                    {finalists.length}
                                </div>
                                <div className="text-sm text-gray-400">FINALISTS</div>
                                {finalists.length > 0 && (
                                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-amber-400 rounded-full animate-ping"></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tournament Grid */}
                    <div className="relative p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Primary Round Arena */}
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-cyan-400 mb-2">PRIMARY ARENA</h3>
                                <div className="h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"></div>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                {primaryUsers.length > 0 ? (
                                    primaryUsers.map((user, index) => (
                                        <div key={index} className="transform transition-all duration-300 hover:translate-x-2">
                                            {renderUser(user, false, 'active')}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">⚔️</span>
                                        </div>
                                        <p>Awaiting brave warriors...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Semi-Finals Arena */}
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-purple-400 mb-2">ELITE ARENA</h3>
                                <div className="h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full"></div>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                {semiFinalists.length > 0 ? (
                                    semiFinalists.map((user, index) => (
                                        <div key={index} className="transform transition-all duration-300 hover:translate-x-2">
                                            {renderUser(user, false, 'qualified')}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">🏆</span>
                                        </div>
                                        <p>Elite fighters emerge here...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Finals Arena */}
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-amber-400 mb-2">CHAMPION</h3>
                                <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"></div>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                {finalists.length > 0 ? (
                                    finalists.map((user, index) => (
                                        <div key={index} className="transform transition-all duration-300 hover:translate-x-2">
                                            {renderUser(user, index === 0, index === 0 ? 'winner' : 'qualified')}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">👑</span>
                                        </div>
                                        <p>The throne awaits its champion...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Arena Connections - Visual Lines */}
                    <div className="absolute inset-0 pointer-events-none hidden lg:block">
                        <svg className="w-full h-full" style={{zIndex: -1}}>
                            {/* Connection lines between arenas */}
                            <defs>
                                <linearGradient id="connectionGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="cyan" stopOpacity="0.3"/>
                                    <stop offset="100%" stopColor="purple" stopOpacity="0.3"/>
                                </linearGradient>
                                <linearGradient id="connectionGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="purple" stopOpacity="0.3"/>
                                    <stop offset="100%" stopColor="gold" stopOpacity="0.3"/>
                                </linearGradient>
                            </defs>
                            <line x1="33%" y1="50%" x2="66%" y2="50%" stroke="url(#connectionGradient1)" strokeWidth="2" className="animate-pulse"/>
                            <line x1="66%" y1="50%" x2="100%" y2="50%" stroke="url(#connectionGradient2)" strokeWidth="2" className="animate-pulse"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Enhanced Tournament Control Center */}
            <div className="max-w-6xl mx-auto px-4 mt-12 mb-10">
                {/* Tournament Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-amber-500/10 rounded-2xl p-6 border border-cyan-500/30 backdrop-blur-sm">
                        <div className="w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                            {currentRound > 0 ? `ROUND ${currentRound} - COMBAT ZONE` : "TOURNAMENT INITIALIZATION"}
                        </h2>
                        <div className="w-4 h-4 bg-amber-400 rounded-full animate-ping"></div>
                    </div>
                </div>

                {/* Admin Control Panel */}
                {isAdmin && (
                    <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-2xl p-6 mb-8 border border-cyan-500/20 backdrop-blur-sm">
                        <div className="text-center mb-4">
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">ADMIN COMMAND CENTER</h3>
                            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={startNewRound}
                                disabled={matchesLoading}
                                className="relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-green-500/20"
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <span>⚡</span>
                                    <span>
                                        {currentRound === 0
                                            ? "INITIATE TOURNAMENT"
                                            : `ADVANCE TO ROUND ${currentRound + 1}`}
                                    </span>
                                    <span>⚡</span>
                                </div>
                            </button>
                            
                            {matches.length > 0 && matches.some((m) => m.status === "pending") && (
                                <button
                                    onClick={autoResolveAllMatchesWithPromotion}
                                    disabled={matchesLoading || statusChangeLoading}
                                    className="relative bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-yellow-500/20"
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <span>🎲</span>
                                        <span>AUTO-RESOLVE & PROMOTE</span>
                                        <span>🎲</span>
                                    </div>
                                </button>
                            )}
                            
                            {/* Debug & Test Buttons (only for admins) */}
                            {false && isAdmin && (
                                <>
                                    <button
                                        onClick={() => {}}
                                        disabled={true}
                                    >
                                        � DEBUG STATUS
                                    </button>
                                    <button
                                        onClick={promoteRoundWinners}
                                        disabled={statusChangeLoading}
                                        className="relative bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-bold px-6 py-2 rounded-lg transition-all duration-300 text-sm disabled:opacity-50"
                                    >
                                        🏆 CHECK WINNERS
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {matchesLoading && currentRound > 0 && (
                    <div className="flex flex-col items-center justify-center my-8 p-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-500/20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-cyan-500/20 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-cyan-400 font-mono mt-4">PROCESSING COMBAT DATA...</p>
                    </div>
                )}

                {/* No Matches State */}
                {currentRound > 0 && !matchesLoading && matches.length === 0 && (
                    <div className="text-center py-8 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600">
                        <div className="text-6xl mb-4">⚔️</div>
                        <p className="text-gray-400 text-lg">
                            No active matches found. Initiate the round to begin combat.
                        </p>
                    </div>
                )}

                {/* Active Matches Display */}
                {matches.length > 0 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/30">
                                <span className="text-2xl">⚔️</span>
                                <span className="text-xl font-bold text-purple-400">ACTIVE COMBATS</span>
                                <span className="text-2xl">⚔️</span>
                            </div>
                        </div>
                        <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ${
                            matches.length > 6 ? "max-h-[80vh] overflow-y-auto custom-scrollbar" : ""
                        }`}>
                            {matches.map((match) => renderMatchDisplay(match))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-3xl font-bold text-center tracking-wide text-amber-400">
                {contestTitle.toUpperCase().replace(/-/g, " ")}
            </div>
            <div className="mt-2 text-lg text-gray-300 text-center">
                Who will be crowned champion?
            </div>
        </div>
    );
};

export default ContestBracket;
