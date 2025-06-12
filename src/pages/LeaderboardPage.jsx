import React, { useState } from "react";
import leaderboardData from "../utils/leaderboardData";
import LeaderboardCard from "../components/LeaderboardCard";

const sortOptions = [
    { label: "By Rank", value: "rank" },
    { label: "By Score", value: "score" },
];

const LeaderboardPage = () => {
    const [sortBy, setSortBy] = useState("rank");
    const [filterTop3, setFilterTop3] = useState(false);

    // Sorting logic
    let leaderboard = [...leaderboardData];
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
                <section>
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
                            <span className="text-amber-400 drop-shadow">Leaderboard</span>
                        </h1>
                        <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                            {filterTop3
                                ? "Top 3 warriors in the coding arena"
                                : "Top 8 champions of the tournament"}
                        </p>
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
                                    key={user.rank}
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

export default LeaderboardPage;
