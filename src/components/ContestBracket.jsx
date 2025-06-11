import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TROPHY_IMG = "https://img.icons8.com/fluency/96/trophy.png";


const ContestBracket = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSection, setOpenSection] = useState(null); // Track which section is open
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get("http://localhost:3000/api/users/all", { headers });
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
        const response = await axios.get(`http://localhost:3000/api/contests/getcon/${contestId}`, { headers });
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
        const response = await axios.get("http://localhost:3000/api/users/info", {
          headers: { Authorization: `Bearer ${token}` }
        });
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
  const handleStatusChange = async (userId, newStatus) => { // userId is assumed to be user._id (MongoDB ID)
    try {
      setStatusChangeLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setStatusChangeLoading(false); // Reset loading state on early exit
        return;
      }

      const userToUpdate = users.find(u => u._id === userId); 
      
      if (!userToUpdate) {
        setError("User not found locally. Cannot determine API UID.");
        setStatusChangeLoading(false); // Reset loading state on early exit
        return;
      }

      const apiUserUid = userToUpdate.uid; // Assuming the Firebase-like UID field is named 'uid'

      if (!apiUserUid) {
        setError("API UID (e.g., Firebase UID) is missing for the selected user.");
        setStatusChangeLoading(false); // Reset loading state on early exit
        return;
      }
      
      await axios.post(
        "http://localhost:3000/api/users/changeUserStatus",
        {
          uid: apiUserUid, // Use the correct Firebase-like UID for the API
          contestId,
          contestStatus: newStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state. 'userId' is user._id, suitable for this.
      setUsers(prevUsers =>
        prevUsers.map(user => {
          if (user._id === userId) { 
            const updatedContests = user.registeredContests.map(contest => {
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
        `http://localhost:3000/api/contests/getcon/${contestId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
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

  // Start a new round
  const startNewRound = async () => {
    try {
      setMatchesLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setMatchesLoading(false); // Reset loading state
        return;
      }
      
      console.log("Starting new round for contest:", contestId);
      const response = await axios.post(
        `http://localhost:3000/api/contests/startContest`, // Updated endpoint
        { 
          ContestID: contestId, // Updated payload
         },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Use matches and round from response directly
      setMatches(response.data.matches || []);
      setCurrentRound(response.data.round || 0);
      setError(null); // Clear previous errors

    } catch (err) {
      console.error("Error starting new round:", err);
      setError(err.response?.data?.message || "Failed to start new round");
    } finally {
      setMatchesLoading(false);
    }
  };

  // Update a match result
  const updateMatchResult = async (round, matchId, winner, status = "completed") => { // `round` param might be unused if backend uses currentRound
    try {
      setMatchesLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setMatchesLoading(false); // Reset loading state on early exit
        return;
      }
      
      const response = await axios.post( // Corrected from axios.postut
        `http://localhost:3000/api/contests/updateMatchWinner`, // Updated endpoint
        {
          ContestID: contestId, // Updated payload
          matchID: matchId,     // Updated payload
          uid: winner,          // Updated payload (winner is the user ID)
          // `round` is implicitly contest's current round on backend
          // `status` is implicitly "completed" on backend
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Backend returns the updated list of matches for the current round
      setMatches(response.data.matches || []); 
      setError(null); // Clear error on success
    } catch (err) {
      console.error("Error updating match:", err);
      setError("Failed to update match");
    } finally {
      setMatchesLoading(false);
    }
  };

  // Helper to get user details from the users list
  const getUserDetailsById = (userId) => {
    if (!userId || userId === "Bye") return null;
    return users.find(u => u._id === userId);
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

      const pendingMatches = matches.filter(match => match.status === "pending");
      
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
          console.warn("Skipping match with invalid participants:", match.matchId);
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

  // Load initial matches
  useEffect(() => {
    const loadInitialMatches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const contestResponse = await axios.get(
          `http://localhost:3000/api/contests/getcon/${contestId}`,
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
  const primaryUsers = users.filter(user => 
    user.registeredContests && user.registeredContests.some(contest => 
      contest.contestId === contestId && contest.status === 'primary'
    )
  );
  
  const semiFinalists = users.filter(user => 
    user.registeredContests && user.registeredContests.some(contest => 
      contest.contestId === contestId && contest.status === 'semi-finalists'
    )
  );
  
  const finalists = users.filter(user => 
    user.registeredContests && user.registeredContests.some(contest => 
      contest.contestId === contestId && contest.status === 'finalists'
    )
  );

  // Toggle function to handle opening/closing sections
  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null); // Close if already open
    } else {
      setOpenSection(section); // Open the selected section
    }
  };

  // Display user in a bracket slot
  const renderUser = (user) => {
    if (!user) return (
      <div className="bg-gray-700 rounded-lg h-10 w-full mx-auto flex items-center justify-center text-gray-400">
        TBD
      </div>
    );
    
    // Find the registration entry for this specific contest
    const contestRegistration = user.registeredContests?.find(
      registration => registration.contestId === contestId
    );
    
    return (
      <div className="bg-gray-700 rounded-lg w-full mx-auto flex items-center justify-between text-white font-medium overflow-hidden text-ellipsis px-4 py-2">
        <div>
          <span>{user.name || "Player"}</span>
          {contestRegistration && (
            <span className="ml-2 text-xs text-gray-400">
              {new Date(contestRegistration.registeredAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {isAdmin && (
          <div className="ml-4">
            <select
              className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600"
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
    );
  };

  // Helper function to render a single match for the new match display section
  const renderMatchDisplay = (match) => {
    const user1 = getUserDetailsById(match.user1);
    const user2 = match.user2 === "Bye" ? "Bye" : getUserDetailsById(match.user2);

    const user1Name = user1 ? user1.name : (match.user1 ? "Player 1" : "N/A");
    const user2Name = user2 === "Bye" ? "BYE" : (user2 ? user2.name : "N/A");

    // Winner ID is stored in match.winner
    const isUser1Winner = match.winner && match.user1 && match.winner === match.user1;
    const isUser2Winner = match.winner && match.user2 && match.user2 !== "Bye" && match.winner === match.user2;

    return (
      <div key={match.matchId} className="bg-gray-800 p-3 rounded-lg shadow border border-gray-700 mb-3">
        <div className="text-xs text-gray-400 mb-1">Match ID: {match.matchId} (Round: {match.round || currentRound})</div>
        <div className="flex flex-col space-y-2">
          {/* Player 1 */}
          <div className={`p-2 rounded ${isUser1Winner ? 'bg-amber-500 bg-opacity-30 border border-amber-400' : 'bg-gray-700'}`}>
            <span>{user1Name}</span>
            {isUser1Winner && <span className="text-amber-400 font-bold ml-2">★ Winner</span>}
          </div>

          {/* Player 2 or Bye */}
          <div className={`p-2 rounded ${isUser2Winner ? 'bg-amber-500 bg-opacity-30 border border-amber-400' : (user2 === "Bye" ? 'bg-gray-700 opacity-60' : 'bg-gray-700')}`}>
            <span>{user2Name}</span>
            {isUser2Winner && <span className="text-amber-400 font-bold ml-2">★ Winner</span>}
          </div>
        </div>
        <div className="text-sm text-gray-300 mt-2">Status: <span className={match.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}>{match.status}</span></div>
        
        {isAdmin && match.status === 'pending' && match.user1 && match.user2 && match.user2 !== "Bye" && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => updateMatchResult(currentRound, match.matchId, match.user1)} // Pass user1 ID
              disabled={matchesLoading}
              className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
            >
              Set {user1Name} as Winner
            </button>
            <button
              onClick={() => updateMatchResult(currentRound, match.matchId, match.user2)} // Pass user2 ID
              disabled={matchesLoading}
              className="bg-purple-500 hover:bg-purple-400 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
            >
              Set {user2Name} as Winner
            </button>
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12">
      {/* Go Back Button */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <button
          onClick={() => navigate(-1)}
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
      {error && (
        <div className="text-red-400 text-center mb-8">
          {error}
        </div>
      )}
      
      {/* Buttons */}
      <div className="flex flex-col md:flex-row justify-center gap-6 mb-10">
        <button
          className="bg-gray-700 text-white px-8 py-3 rounded-full hover:bg-gray-600 transition text-lg font-semibold"
          onClick={() => navigate(`/contest/${contestId}/leaderboard`)}
        >
          Leaderboard
        </button>
        <button
          className="bg-amber-400 text-gray-900 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-amber-300 transition text-lg"
          onClick={() => navigate(`/contest/begin/${contestId}`)}
        >
          Start
        </button>
      </div>

      {/* Trophy Display */}
      <div className="flex justify-center mb-8">
        <img
          src={TROPHY_IMG}
          alt="Trophy"
          className="w-24 h-24 md:w-28 md:h-28 drop-shadow-lg"
        />
      </div>

      {/* Collapsible Tournament Sections */}
      <div className="max-w-2xl mx-auto px-4 space-y-4 mb-10">
        {/* Finals Section */}
        <div className="border-2 border-amber-500 rounded-lg overflow-hidden shadow-lg">
          <button
            onClick={() => toggleSection('finals')}
            className="w-full flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl font-bold text-amber-400">FINALS</span>
            <span className="text-amber-400 text-xl">
              {openSection === 'finals' ? '▼' : '▶'}
            </span>
          </button>
          
          {openSection === 'finals' && (
            <div className={`p-4 bg-gray-900 space-y-3 ${finalists.length > 5 ? 'max-h-60 overflow-y-scroll' : ''}`}>
              {finalists.length > 0 ? (
                finalists.map((user, index) => (
                  <div key={index} className="mb-2">
                    {renderUser(user)}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-2">No finalists yet</div>
              )}
            </div>
          )}
        </div>

        {/* Semi-Finals Section */}
        <div className="border-2 border-amber-500 rounded-lg overflow-hidden shadow-lg">
          <button
            onClick={() => toggleSection('semifinals')}
            className="w-full flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl font-bold text-amber-400">SEMI-FINALS</span>
            <span className="text-amber-400 text-xl">
              {openSection === 'semifinals' ? '▼' : '▶'}
            </span>
          </button>
          
          {openSection === 'semifinals' && (
            <div className={`p-4 bg-gray-900 space-y-3 ${semiFinalists.length > 5 ? 'max-h-60 overflow-y-scroll' : ''}`}>
              {semiFinalists.length > 0 ? (
                semiFinalists.map((user, index) => (
                  <div key={index} className="mb-2">
                    {renderUser(user)}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-2">No semi-finalists yet</div>
              )}
            </div>
          )}
        </div>

        {/* Primary Round Section */}
        <div className="border-2 border-amber-500 rounded-lg overflow-hidden shadow-lg">
          <button
            onClick={() => toggleSection('primary')}
            className="w-full flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl font-bold text-amber-400">PRIMARY ROUND PARTICIPANTS</span>
            <span className="text-amber-400 text-xl">
              {openSection === 'primary' ? '▼' : '▶'}
            </span>
          </button>
          
          {openSection === 'primary' && (
            <div className={`p-4 bg-gray-900 space-y-3 ${primaryUsers.length > 5 ? 'max-h-60 overflow-y-scroll' : ''}`}>
              {primaryUsers.length > 0 ? (
                primaryUsers.map((user, index) => (
                  <div key={index} className="mb-2">
                    {renderUser(user)}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-2">No primary participants yet</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Current Round Matches Display */}
      <div className="max-w-4xl mx-auto px-4 mt-12 mb-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-amber-400">
          {currentRound > 0 ? `Current Round: ${currentRound}` : "Tournament Not Started"}
        </h2>

        {isAdmin && (
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={startNewRound}
              disabled={matchesLoading}
              className="bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
            >
              {currentRound === 0 ? 'Start Tournament (Round 1)' : `Start Next Round (${currentRound + 1})`}
            </button>
            {matches.length > 0 && matches.some(m => m.status === 'pending') && (
              <button
                onClick={autoResolveAllMatches}
                disabled={matchesLoading}
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
              >
                Auto-Resolve Current Round
              </button>
            )}
          </div>
        )}

        {matchesLoading && currentRound > 0 && (
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-amber-300"></div>
          </div>
        )}

        {currentRound > 0 && !matchesLoading && matches.length === 0 && (
          <div className="text-gray-400 text-center py-4">No matches found for this round. Try starting the round.</div>
        )}
        
        {matches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(match => renderMatchDisplay(match))}
          </div>
        )}
      </div>
      
      <div className="mt-8 text-3xl font-bold text-center tracking-wide text-amber-400">
        {contestTitle.toUpperCase().replace(/-/g, ' ')}
      </div>
      <div className="mt-2 text-lg text-gray-300 text-center">
        Who will be crowned champion?
      </div>
    </div>
  );
};

export default ContestBracket;
