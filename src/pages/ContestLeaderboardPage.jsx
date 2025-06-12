import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import contestLeaderboardData from "../utils/contestLeaderboardData";
import LeaderboardCard from "../components/LeaderboardCard";

const sortOptions = [
    { label: "By Rank", value: "rank" },
    { label: "By Score", value: "score" },
];

const roundOptions = [
    { label: "Round 1", value: "round1" },
    { label: "Semi-final", value: "semi-final" },
    { label: "Final", value: "final" },
];

const ContestLeaderboardPage = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState("rank");
    const [filterTop3, setFilterTop3] = useState(false);
    const [selectedRound, setSelectedRound] = useState("round1");

    // Filter by round
    let leaderboard = contestLeaderboardData.filter(
        (user) => user.round === selectedRound
    );

    // Sorting logic
    if (sortBy === "score") {
        leaderboard.sort((a, b) => b.score - a.score);
    } else {
        leaderboard.sort((a, b) => a.rank - b.rank);
    }

    // Filtering logic
    if (filterTop3) {
        leaderboard = leaderboard.slice(0, 3);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
            <main className="max-w-5xl mx-auto px-4 py-12">
                {/* Go Back Button */}
                <div className="mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm font-semibold text-gray-200 transition-colors"
                    >
                        ← Go Back
                    </button>
                </div>
                <section>
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
                            <span className="text-amber-400 drop-shadow">
                                {contestId.replace(/-/g, " ").toUpperCase()} Leaderboard
                            </span>
                        </h1>
                        <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                            {filterTop3
                                ? "Top 3 warriors in this contest"
                                : "Top participants of this contest"}
                        </p>
                    </div>

                    {/* Round Buttons */}
                    <div className="flex justify-center gap-4 mb-8">
                        {roundOptions.map((round) => (
                            <button
                                key={round.value}
                                onClick={() => setSelectedRound(round.value)}
                                className={`px-6 py-2 rounded-full font-semibold transition-all ${selectedRound === round.value
                                        ? "bg-amber-400 text-gray-900 shadow-lg"
                                        : "bg-gray-800 hover:bg-amber-400 hover:text-gray-900"
                                    }`}
                            >
                                {round.label}
                            </button>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 justify-center mb-12">
                        <button
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${filterTop3
                                    ? "bg-amber-400 text-gray-900"
                                    : "bg-gray-800 hover:bg-amber-400 hover:text-gray-900"
                                }`}
                            onClick={() => setFilterTop3((prev) => !prev)}
                        >
                            <span role="img" aria-label="filter">
                                ⚔️
                            </span>
                            {filterTop3 ? "Show All Fighters" : "Top 3 Gladiators"}
                        </button>

                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-amber-400 hover:text-gray-900 transition-all cursor-pointer"
                            >
                                {sortOptions.map((opt) => (
                                    <option
                                        key={opt.value}
                                        value={opt.value}
                                        className="text-gray-900"
                                    >
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Leaderboard Cards */}
                    <div className="grid gap-6">
                        {leaderboard.length === 0 ? (
                            <div className="text-center text-gray-400 py-10 text-xl">
                                No champions yet - be the first to duel!
                            </div>
                        ) : (
                            leaderboard.map((user) => (
                                <LeaderboardCard
                                    key={user.rank + user.name + user.round}
                                    user={user}
                                    className="hover:scale-[1.02] transition-transform"
                                />
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ContestLeaderboardPage;
