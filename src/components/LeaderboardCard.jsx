import React from "react";

const LeaderboardCard = ({ user }) => (
    <li
        className={`flex items-center bg-gray-800 rounded-xl px-6 py-5 shadow-lg border-l-4 ${user.rank === 1
                ? "border-amber-400"
                : user.rank === 2
                    ? "border-gray-400"
                    : user.rank === 3
                        ? "border-yellow-600"
                        : "border-gray-700"
            } hover:scale-[1.025] transition-transform`}
    >
        <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-gray-700 mr-5"
        />
        <div className="flex-1">
            <div className="flex items-center gap-3">
                <span className="font-bold text-xl">{user.name}</span>
                <span className="text-gray-400 text-base">#{user.rank}</span>
            </div>
            <div className="flex flex-wrap items-center gap-8 mt-2 text-sm">
                <span className="font-semibold">
                    <span className="text-amber-400">Score:</span> {user.score}
                </span>
                <span className="flex items-center gap-1">
                    <span role="img" aria-label="clock">
                        ⏱️
                    </span>{" "}
                    {user.matchTime}
                </span>
                <span className="flex items-center gap-1">
                    <span role="img" aria-label="timer">
                        ⏰
                    </span>{" "}
                    {user.countdown}
                </span>
            </div>
        </div>
    </li>
);

export default LeaderboardCard;
