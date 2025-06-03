import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TROPHY_IMG = "https://img.icons8.com/fluency/96/trophy.png";

const ContestBracket = () => {
  const { contestId } = useParams();
  const {contestName} = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSection, setOpenSection] = useState(null); // Track which section is open
  const [isAdmin, setIsAdmin] = useState(false); // Track if current user is admin
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get("http://localhost:3000/api/users/all", { headers });
        setUsers(response.data);
        
        // Check if current user is admin from localStorage
        if (token) {
          const isAdminValue = localStorage.getItem("isAdmin") === "true";
          setIsAdmin(isAdminValue);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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
          onClick={() => navigate(`/contest/${contestId}/start`)}
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
            <span className="text-xl font-bold text-amber-400">PRIMARY ROUND</span>
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
      
      <div className="mt-8 text-3xl font-bold text-center tracking-wide text-amber-400">
        {contestId.toUpperCase().replace(/-/g, ' ')}
      </div>
      <div className="mt-2 text-lg text-gray-300 text-center">
        Who will be crowned champion?
      </div>
    </div>
  );
};

export default ContestBracket;
