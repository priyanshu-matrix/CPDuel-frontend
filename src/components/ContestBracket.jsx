import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const TROPHY_IMG = "https://img.icons8.com/fluency/96/trophy.png";

const ContestBracket = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();

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
      <div className="flex flex-col items-center">
        {/* Bracket Container */}
        <div className="flex flex-row items-center justify-center w-full max-w-6xl">
          {/* Left Bracket */}
          <div className="flex flex-col items-end gap-10 mr-4">
            {[0, 1].map((_, i) => (
              <div key={i} className="flex flex-col gap-6">
                <div className="border-2 border-amber-400 bg-gray-800 rounded-xl p-4 w-40 h-20 flex flex-col justify-center shadow-lg">
                  <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto mb-2"></div>
                  <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto"></div>
                </div>
                <div className="border-2 border-amber-400 bg-gray-800 rounded-xl p-4 w-40 h-20 flex flex-col justify-center shadow-lg">
                  <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto mb-2"></div>
                  <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
          {/* Semi Final Left */}
          <div className="flex flex-col items-center gap-20 mx-2">
            <div className="border-2 border-amber-500 bg-gray-900 rounded-xl p-4 w-40 h-20 flex flex-col justify-center shadow-lg">
              <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto mb-2"></div>
              <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto"></div>
            </div>
            <div className="border-2 border-amber-500 bg-gray-900 rounded-xl p-4 w-40 h-20 flex flex-col justify-center shadow-lg">
              <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto mb-2"></div>
              <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto"></div>
            </div>
          </div>
          {/* Final - Centered Trophy */}
          <div className="flex flex-col items-center mx-4">
            <div className="flex items-center">
              <div className="flex flex-col items-center mr-2">
                <div className="bg-gray-800 rounded-lg h-12 w-28 flex items-center justify-center mb-2 font-semibold shadow-lg border-2 border-amber-400 text-amber-400 text-lg">
                  Finalist
                </div>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src={TROPHY_IMG}
                  alt="Trophy"
                  className="w-24 h-24 md:w-28 md:h-28 drop-shadow-lg mx-auto"
                />
                <div className="text-xl font-bold text-center text-amber-400 mt-2">
                  FINAL
                </div>
              </div>
              <div className="flex flex-col items-center ml-2">
                <div className="bg-gray-800 rounded-lg h-12 w-28 flex items-center justify-center mb-2 font-semibold shadow-lg border-2 border-amber-400 text-amber-400 text-lg">
                  Finalist
                </div>
              </div>
            </div>
          </div>
          {/* Semi Final Right */}
          <div className="flex flex-col items-center gap-20 mx-2">
            <div className="border-2 border-amber-500 bg-gray-900 rounded-xl p-4 w-40 h-20 flex flex-col justify-center shadow-lg">
              <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto mb-2"></div>
              <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto"></div>
            </div>
            <div className="border-2 border-amber-500 bg-gray-900 rounded-xl p-4 w-40 h-20 flex flex-col justify-center shadow-lg">
              <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto mb-2"></div>
              <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto"></div>
            </div>
          </div>
          {/* Right Bracket */}
          <div className="flex flex-col items-start gap-10 ml-4">
            {[0, 1].map((_, i) => (
              <div key={i} className="flex flex-col gap-6">
                <div className="border-2 border-amber-400 bg-gray-800 rounded-xl p-4 w-40 h-20 flex flex-col justify-center shadow-lg">
                  <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto mb-2"></div>
                  <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto"></div>
                </div>
                <div className="border-2 border-amber-400 bg-gray-800 rounded-xl p-4 w-40 h-20 flex flex-col justify-center shadow-lg">
                  <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto mb-2"></div>
                  <div className="bg-gray-700 rounded-lg h-8 w-28 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 text-3xl font-bold text-center tracking-wide text-amber-400">
          TCP OPEN CONTEST 1
        </div>
        <div className="mt-2 text-lg text-gray-300 text-center">
          Who will be crowned champion?
        </div>
      </div>
    </div>
  );
};

export default ContestBracket;
