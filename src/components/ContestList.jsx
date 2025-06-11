import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ContestList = () => {
  const { contestId } = useParams();
  const [problems, setProblems] = useState([]);
  const [contestName, setContestName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const decodeBase64Title = (encodedTitle) => {
    try {
        return atob(encodedTitle);
    } catch (error) {
        console.error('Failed to decode base64 title:', error);
        return encodedTitle; // Return original if decoding fails
    }
};

useEffect(() => {
    const fetchContestProblems = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.get(`http://localhost:3000/api/contests/getContestProblems/${contestId}`, { headers });
            const data = response.data;
            
            // Handle different possible response structures
            if (data.success && data.contest && data.contest.problems) {
                const decodedProblems = data.contest.problems.map(problem => ({
                    ...problem,
                    title: decodeBase64Title(problem.title)
                }));
                setProblems(decodedProblems);
                setContestName(data.contest.name);
            } else if (data.problems) {
                // Alternative structure where problems are directly in data
                const decodedProblems = data.problems.map(problem => ({
                    ...problem,
                    title: decodeBase64Title(problem.title)
                }));
                setProblems(decodedProblems);
                setContestName(data.name || data.contestName || 'Contest');
            } else if (Array.isArray(data)) {
                // If data is directly an array of problems
                const decodedProblems = data.map(problem => ({
                    ...problem,
                    title: decodeBase64Title(problem.title)
                }));
                setProblems(decodedProblems);
                setContestName('Contest');
            } else {
                setProblems([]);
                setContestName('');
                setError(`Contest not found or no problems available. Response: ${JSON.stringify(data)}`);
            }
        } catch (e) {
            setError(e.message);
            setProblems([]);
            setContestName('');
        } finally {
            setLoading(false);
        }
    };

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
    <div className='flex flex-col items-center min-h-screen bg-gray-900 py-10 px-4'>
      <h1 className="text-3xl font-bold text-gray-100 mb-8">
        {contestName ? `Problems for ${contestName}` : 'Contest Problems'}
      </h1>
      {problems.length === 0 ? (
        <p className="text-lg text-gray-400">No problems found for this contest.</p>
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
                <span className="font-medium text-gray-200">Difficulty:</span> {problem.difficulty}
              </p>
              <p className="text-gray-300 mb-3">
                <span className="font-medium text-gray-200">Points:</span> {problem.points || 'N/A'}
              </p>
              {/* Assuming you have a route for indivcontestIdual problems */}
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
