import React, { useState, useEffect } from "react";
import ContestCard from "./ContestCard";
import axios from "axios";

const ContestPage = () => {
  const [contests, setContests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contestsPerPage = 3;

  useEffect(() => {
    fetchContests();
  }, [currentPage]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      // Get token from storage
      const token = localStorage.getItem("token");

      // Set headers with token if available
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        "http://localhost:3000/api/contests/getall",
        { headers }
      );

      // Log the response to see its structure
      console.log("API Response:", response.data);

      // Check different possible data structures
      let contestsData = [];

      if (response.data && Array.isArray(response.data)) {
        // If the response is directly an array of contests
        contestsData = response.data;
      } else if (
        response.data &&
        response.data.contests &&
        Array.isArray(response.data.contests)
      ) {
        // If the contests are in a property called "contests"
        contestsData = response.data.contests;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        // If the contests are in a property called "data" (common pattern)
        contestsData = response.data.data;
      } else if (response.data && typeof response.data === "object") {
        // If the response is an object with contest IDs as keys
        contestsData = Object.values(response.data);
      }

      console.log("Processed contests data:", contestsData);

      if (contestsData.length > 0) {
        setContests(contestsData);
        setTotalPages(Math.ceil(contestsData.length / contestsPerPage));
      } else {
        // Check if we have the dummy contest to use as fallback
        const dummyContest = {
          id: "tcp-open-1",
          title: "TCP Open Contest 1",
          date: "June 15, 2025",
          duration: "2 hours",
          problems: 5,
          level: "Open for all",
          description:
            "Join the very first TCP Open Contest! Test your skills with 5 unique problems, compete with the best, and climb the leaderboard. Prizes for top performers!",
        };

        setContests([dummyContest]);
        setTotalPages(1);
        console.log("Using fallback dummy contest data");
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching contests:", err);
      setError("Failed to load contests. Please try again later.");
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  // Get current contests for pagination
  const indexOfLastContest = currentPage * contestsPerPage;
  const indexOfFirstContest = indexOfLastContest - contestsPerPage;
  const currentContests = contests.slice(indexOfFirstContest, indexOfLastContest);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center py-16 px-4">
      <h1 className="text-5xl font-extrabold mb-10 text-amber-400 drop-shadow text-center">
        Upcoming Contests
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-400"></div>
        </div>
      ) : error ? (
        <div className="bg-red-800 text-white p-4 rounded-lg shadow-lg max-w-xl text-center">
          <p>{error}</p>
          <button
            onClick={fetchContests}
            className="mt-4 bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {contests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl text-gray-400">
                No contests available at the moment.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-5xl space-y-8">
              {currentContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {contests.length > 0 && (
            <div className="mt-12 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-600"
                  } transition-colors`}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === index + 1
                        ? "bg-amber-500"
                        : "bg-gray-700 hover:bg-gray-600"
                    } transition-colors`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-600"
                  } transition-colors`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContestPage;
