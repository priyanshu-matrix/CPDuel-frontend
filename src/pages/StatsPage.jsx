import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { API_URLS } from "../config/server";
import ViewQuestionComponent from '../components/ViewQuestionComponent';

const StatsPage = () => {
    const [userStats, setUserStats] = useState({
        name: '',
        isAdmin: false,
        totalProblems: 0,
        solvedProblems: [],
        difficultyStats: {
            easy: 0,
            medium: 0,
            hard: 0
        },
        contestStats: {
            participated: 0,
            won: 0,
            totalPoints: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login to view stats");
                setLoading(false);
                return;
            }

            // Fetch user info which includes solvedProblems and registeredContests
            const userResponse = await fetch(API_URLS.USERS.INFO, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!userResponse.ok) {
                throw new Error("Failed to fetch user info");
            }

            const userData = await userResponse.json();
            
            // Extract solved problems and contests from user data
            const solvedProblems = userData.solvedProblems || [];
            const registeredContests = userData.registeredContests || [];

            // Process solved problems to get problem details
            const processedSolvedProblems = await Promise.all(
                solvedProblems.map(async (solvedProblem, index) => {
                    // For now, we'll create mock data based on the solved problem
                    // In a real scenario, you might want to fetch problem details
                    const difficulties = ['Easy', 'Medium', 'Hard'];
                    const mockTitles = [
                        'Two Sum', 'Add Two Numbers', 'Longest Substring', 'Palindrome Number', 
                        'Regular Expression', 'Merge Intervals', 'Valid Parentheses', 'Binary Tree Traversal',
                        'Maximum Subarray', 'Climbing Stairs', 'House Robber', 'Coin Change',
                        'Word Break', 'Longest Palindrome', 'Edit Distance'
                    ];
                    
                    return {
                        id: solvedProblem.problemId || `problem-${index}`,
                        problemId: solvedProblem.problemId,
                        title: mockTitles[index % mockTitles.length] || `Problem ${index + 1}`,
                        difficulty: difficulties[index % 3],
                        points: difficulties[index % 3] === 'Easy' ? 100 : difficulties[index % 3] === 'Medium' ? 200 : 300,
                        solvedAt: solvedProblem.solvedAt ? new Date(solvedProblem.solvedAt).toLocaleDateString() : 'Recently'
                    };
                })
            );

            // Calculate difficulty stats
            const difficultyStats = processedSolvedProblems.reduce((acc, problem) => {
                const difficulty = problem.difficulty.toLowerCase();
                acc[difficulty] = (acc[difficulty] || 0) + 1;
                return acc;
            }, { easy: 0, medium: 0, hard: 0 });

            setUserStats({
                name: userData.name || 'User',
                isAdmin: userData.isAdmin || false,
                totalProblems: 150, // Mock total available problems
                solvedProblems: processedSolvedProblems,
                difficultyStats,
                contestStats: {
                    participated: registeredContests.length,
                    won: registeredContests.filter(contest => contest.status === 'finalists').length,
                    totalPoints: processedSolvedProblems.reduce((sum, p) => sum + p.points, 0)
                }
            });
        } catch (error) {
            console.error("Error fetching user stats:", error);
            setError("Failed to load stats");
        } finally {
            setLoading(false);
        }
    };

    const handleViewProblem = (problem) => {
        // Use the actual problemId from the database, fallback to mock id if not available
        const actualProblemId = problem.problemId || problem.id;
        setSelectedProblem(actualProblemId);
        setIsViewOpen(true);
    };

    const difficultyData = [
        { name: 'Easy', value: userStats.difficultyStats.easy, color: '#10B981' },
        { name: 'Medium', value: userStats.difficultyStats.medium, color: '#F59E0B' },
        { name: 'Hard', value: userStats.difficultyStats.hard, color: '#EF4444' },
    ];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                className="text-sm font-bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
                    <p className="text-gray-300">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-white mb-4">
                        📊 Your <span className="text-amber-400">Stats</span>
                    </h1>
                    <p className="text-xl text-gray-300">
                        Welcome back, <span className="font-bold text-amber-400">{userStats.name}</span>
                        {userStats.isAdmin && <span className="text-green-400 ml-2">(Admin)</span>}
                    </p>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
                        <div className="text-3xl font-extrabold">{userStats.solvedProblems.length}</div>
                        <div className="text-purple-200">Problems Solved</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
                        <div className="text-3xl font-extrabold">{userStats.contestStats.totalPoints}</div>
                        <div className="text-blue-200">Total Points</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white">
                        <div className="text-3xl font-extrabold">{userStats.contestStats.participated}</div>
                        <div className="text-green-200">Contests Joined</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-6 text-white">
                        <div className="text-3xl font-extrabold">{userStats.contestStats.won}</div>
                        <div className="text-amber-200">Contests Won</div>
                    </div>
                </div>

                {/* Charts and Stats Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Difficulty Distribution */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                            🎯 Problems by Difficulty
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={difficultyData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {difficultyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#374151', 
                                        border: 'none', 
                                        borderRadius: '8px',
                                        color: 'white'
                                    }} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-4">
                            {difficultyData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div 
                                        className="w-4 h-4 rounded-full" 
                                        style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span className="text-gray-300 font-medium">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Achievements & Badges */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                            🏅 Achievements
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl text-center ${userStats.solvedProblems.length >= 10 ? 'bg-gradient-to-br from-yellow-600 to-yellow-800' : 'bg-gray-700'}`}>
                                <div className="text-3xl mb-2">🏆</div>
                                <div className="text-sm font-bold">Problem Solver</div>
                                <div className="text-xs text-gray-300">Solve 10 problems</div>
                                <div className="text-xs mt-1">{userStats.solvedProblems.length}/10</div>
                            </div>
                            <div className={`p-4 rounded-xl text-center ${userStats.difficultyStats.hard >= 5 ? 'bg-gradient-to-br from-red-600 to-red-800' : 'bg-gray-700'}`}>
                                <div className="text-3xl mb-2">💪</div>
                                <div className="text-sm font-bold">Hard Crusher</div>
                                <div className="text-xs text-gray-300">Solve 5 hard problems</div>
                                <div className="text-xs mt-1">{userStats.difficultyStats.hard}/5</div>
                            </div>
                            <div className={`p-4 rounded-xl text-center ${userStats.contestStats.participated >= 5 ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gray-700'}`}>
                                <div className="text-3xl mb-2">🎪</div>
                                <div className="text-sm font-bold">Contest Master</div>
                                <div className="text-xs text-gray-300">Join 5 contests</div>
                                <div className="text-xs mt-1">{userStats.contestStats.participated}/5</div>
                            </div>
                            <div className={`p-4 rounded-xl text-center ${userStats.contestStats.won >= 1 ? 'bg-gradient-to-br from-purple-600 to-purple-800' : 'bg-gray-700'}`}>
                                <div className="text-3xl mb-2">👑</div>
                                <div className="text-sm font-bold">Champion</div>
                                <div className="text-xs text-gray-300">Win a contest</div>
                                <div className="text-xs mt-1">{userStats.contestStats.won}/1</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills & Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Contest Performance */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                            🏆 Contest Performance
                        </h2>
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-4xl font-extrabold text-amber-400 mb-2">
                                    {userStats.contestStats.participated}
                                </div>
                                <div className="text-gray-300">Contests Participated</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-gradient-to-br from-green-600 to-green-800 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{userStats.contestStats.won}</div>
                                    <div className="text-green-200 text-sm">Wins</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg">
                                    <div className="text-2xl font-bold text-white">
                                        {userStats.contestStats.participated > 0 ? 
                                            Math.round((userStats.contestStats.won / userStats.contestStats.participated) * 100) : 0}%
                                    </div>
                                    <div className="text-blue-200 text-sm">Win Rate</div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-white font-semibold mb-3">Contest Status Distribution:</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Primary</span>
                                        <span className="text-gray-400">
                                            {userStats.contestStats.participated - userStats.contestStats.won}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Winners</span>
                                        <span className="text-green-400">{userStats.contestStats.won}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                            � Activity Summary
                        </h2>
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-4xl font-extrabold text-purple-400 mb-2">
                                    {userStats.contestStats.totalPoints}
                                </div>
                                <div className="text-gray-300">Total Points Earned</div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                                    <span className="text-gray-300">Average Points per Problem:</span>
                                    <span className="text-amber-400 font-bold">
                                        {userStats.solvedProblems.length > 0 ? 
                                            Math.round(userStats.contestStats.totalPoints / userStats.solvedProblems.length) : 0}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                                    <span className="text-gray-300">Most Solved Difficulty:</span>
                                    <span className={`font-bold ${
                                        userStats.difficultyStats.easy >= userStats.difficultyStats.medium && 
                                        userStats.difficultyStats.easy >= userStats.difficultyStats.hard ? 'text-green-400' :
                                        userStats.difficultyStats.medium >= userStats.difficultyStats.hard ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                        {userStats.difficultyStats.easy >= userStats.difficultyStats.medium && 
                                         userStats.difficultyStats.easy >= userStats.difficultyStats.hard ? 'Easy' :
                                         userStats.difficultyStats.medium >= userStats.difficultyStats.hard ? 'Medium' : 'Hard'}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                                    <span className="text-gray-300">Account Status:</span>
                                    <span className="text-blue-400 font-bold">
                                        {userStats.isAdmin ? 'Admin' : 'User'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Solved Problems */}
                                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                                    <h2 className="text-2xl font-bold text-white mb-6">
                                        🏆 Recently Solved Problems
                                    </h2>
                                    {userStats.solvedProblems.length > 0 ? (
                                        <div className={`grid gap-4 ${userStats.solvedProblems.length > 4 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                                            {userStats.solvedProblems.map((problem) => (
                                                <div 
                                                    key={problem.id}
                                                    className="bg-gray-700 rounded-xl p-4 flex items-center justify-between hover:bg-gray-600 transition-colors cursor-pointer"
                                                    onClick={() => handleViewProblem(problem)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            problem.difficulty === 'Easy' ? 'bg-green-500' :
                                                            problem.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}></div>
                                                        <div>
                                                            <h3 className="text-white font-bold">{problem.title}</h3>
                                                            <p className="text-gray-400 text-sm">Solved on {new Date(problem.solvedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                            problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                                            problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                                                            'bg-red-500/20 text-red-400'
                                                        }`}>
                                                            {problem.difficulty}
                                                        </span>
                                                        <span className="text-amber-400 font-bold">+{problem.points} pts</span>
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">🚀</div>
                                            <h3 className="text-xl font-bold text-white mb-2">Start Your Coding Journey!</h3>
                                            <p className="text-gray-400 mb-6">
                                                Solve your first problem to see your progress here.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* View Question Modal */}
            {selectedProblem && (
                <ViewQuestionComponent
                    problemId={selectedProblem}
                    isOpen={isViewOpen}
                    onClose={() => {
                        setIsViewOpen(false);
                        setSelectedProblem(null);
                    }}
                />
            )}
        </div>
    );
};

export default StatsPage;
