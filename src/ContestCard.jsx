import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ContestCard = ({ contest }) => {
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const handleRegister = () => {
    setRegistered(true);
    setTimeout(() => {
      navigate(`/contest/${contest.id}`);
    }, 500); // Optional: small delay to show button change
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg max-w-xl mx-auto hover:border-amber-400 transition-all">
      <h2 className="text-2xl font-bold text-amber-400 mb-2">
        {contest.title}
      </h2>
      <div className="text-gray-300 mb-3">
        <span className="font-semibold">Date:</span> {contest.date}
      </div>
      <div className="text-gray-300 mb-3">
        <span className="font-semibold">Duration:</span> {contest.duration}
      </div>
      <div className="text-gray-300 mb-3">
        <span className="font-semibold">Problems:</span> {contest.problems}
      </div>
      <div className="text-gray-300 mb-3">
        <span className="font-semibold">Level:</span> {contest.level}
      </div>
      <div className="text-gray-400 mb-4">{contest.description}</div>
      {!registered ? (
        <button
          className="bg-amber-400 text-gray-900 font-semibold px-6 py-2 rounded-full hover:bg-amber-300 transition"
          onClick={handleRegister}
        >
          Register
        </button>
      ) : (
        <button
          className="bg-green-500 text-white font-semibold px-6 py-2 rounded-full transition"
          disabled
        >
          Joining...
        </button>
      )}
    </div>
  );
};

export default ContestCard;
