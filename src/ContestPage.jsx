import React from "react";
import ContestCard from "./ContestCard";

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

const ContestPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center py-16">
    <h1 className="text-4xl font-extrabold mb-10 text-amber-400 drop-shadow text-center">
      Upcoming Contests
    </h1>
    <ContestCard contest={dummyContest} />
  </div>
);

export default ContestPage;
