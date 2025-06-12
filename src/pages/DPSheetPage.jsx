import React, { useState } from "react";
import dpSections from "../utils/dpSections";
import { useLocalStorageState } from "../utils/utils";
import FavoriteList from "../components/FavoriteList";
import ProblemList from "../components/ProblemList";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const DPSheetPage = () => {
    const [checked, setChecked] = useLocalStorageState("dpChecklistState", {});
    const [favorites, setFavorites] = useLocalStorageState("dpFavorites", {});
    const [openIndex, setOpenIndex] = useState(0);
    const [showFavorites, setShowFavorites] = useState(false);

    const toggleSection = (idx) => setOpenIndex(openIndex === idx ? null : idx);

    const handleCheck = (sectionIdx, problemIdx) => {
        setChecked((prev) => ({
            ...prev,
            [`${sectionIdx}-${problemIdx}`]: !prev[`${sectionIdx}-${problemIdx}`],
        }));
    };

    const handleFavorite = (sectionIdx, problemIdx, url) => {
        setFavorites((prev) => {
            const key = `${sectionIdx}-${problemIdx}`;
            if (prev[key]) {
                const updated = { ...prev };
                delete updated[key];
                return updated;
            } else {
                return {
                    ...prev,
                    [key]: { sectionIdx, problemIdx, url },
                };
            }
        });
    };

    // Progress calculations
    const totalProblems = dpSections.reduce(
        (sum, section) => sum + (section.links?.length || 0),
        0
    );
    const totalSolved = dpSections.reduce(
        (sum, section, sectionIdx) =>
            sum +
            (section.links
                ? section.links.filter(
                    (_, problemIdx) => checked[`${sectionIdx}-${problemIdx}`]
                ).length
                : 0),
        0
    );
    const overallPercent =
        totalProblems === 0 ? 0 : Math.round((totalSolved / totalProblems) * 100);

    const favoriteProblems = Object.values(favorites);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                            <span className="text-amber-400 drop-shadow">DP Sheet</span>
                        </h1>
                        <p className="text-lg text-white italic font-medium">
                            Isko Laga Dala To DP Jhingalala!
                        </p>
                        <div className="mt-4 text-lg text-gray-300 font-semibold">
                            Total Progress:{" "}
                            <span className="text-amber-400">{totalSolved}</span>
                            <span className="text-gray-400"> / {totalProblems}</span>
                        </div>
                    </div>
                    <div className="w-32 h-32 flex-shrink-0">
                        <CircularProgressbar
                            value={overallPercent}
                            text={`${overallPercent}%`}
                            styles={buildStyles({
                                pathColor: "#f59e42",
                                textColor: "#fff",
                                trailColor: "#333",
                                textSize: "24px",
                                strokeLinecap: "round",
                            })}
                            strokeWidth={10}
                        />
                    </div>
                </div>

                {/* Favorites Toggle Button */}
                <div className="mb-6 flex justify-end">
                    <button
                        className={`
              relative flex items-center gap-2
              px-5 py-2.5
              rounded-full
              bg-gradient-to-r from-amber-400 via-yellow-300 to-yellow-400
              text-gray-900 font-bold
              shadow-lg
              hover:from-yellow-400 hover:to-amber-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-amber-300
              group
            `}
                        onClick={() => setShowFavorites((v) => !v)}
                    >
                        <span className="font-semibold tracking-wide">Favorites</span>
                        <span
                            className={`
                text-xl transition-transform duration-200
                ${showFavorites
                                    ? "rotate-12 scale-110 text-amber-600"
                                    : "group-hover:scale-110"
                                }
              `}
                            aria-label="star"
                            role="img"
                        >
                            ★
                        </span>
                        {favoriteProblems.length > 0 && (
                            <span
                                className="
                  absolute -top-2 -right-2
                  bg-red-500 text-white rounded-full
                  w-6 h-6 flex items-center justify-center
                  text-xs font-bold shadow
                  border-2 border-white
                "
                            >
                                {favoriteProblems.length}
                            </span>
                        )}
                    </button>
                </div>
                {/* Favorites List (hidden/shown by button) */}
                <FavoriteList
                    favoriteProblems={favoriteProblems}
                    handleFavorite={handleFavorite}
                    visible={showFavorites}
                />

                {/* Sections */}
                <div className="space-y-6">
                    {dpSections.map((section, sectionIdx) => {
                        const links = section.links || [];
                        const solved = links.filter(
                            (_, problemIdx) => checked[`${sectionIdx}-${problemIdx}`]
                        ).length;
                        const percent =
                            links.length === 0
                                ? 0
                                : Math.round((solved / links.length) * 100);

                        return (
                            <div
                                key={section.title}
                                className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl p-6"
                            >
                                {/* Progress Bar and Count */}
                                <div className="flex items-center mb-3">
                                    <div className="flex-1 mr-4">
                                        <div className="relative h-3 w-full rounded-full bg-gray-700 overflow-hidden">
                                            <div
                                                className="absolute h-full rounded-full bg-amber-400 transition-all duration-500"
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-white text-base font-semibold min-w-[60px] text-right">
                                        {solved} / {links.length}
                                    </div>
                                </div>
                                {/* Accordion Button */}
                                <button
                                    onClick={() => toggleSection(sectionIdx)}
                                    className={`w-full flex justify-between items-center px-2 py-3 text-xl font-bold focus:outline-none transition-colors rounded-xl ${openIndex === sectionIdx
                                        ? "text-amber-400"
                                        : "text-white hover:text-amber-400"
                                        }`}
                                >
                                    {section.title}
                                    <span className="ml-4">
                                        {openIndex === sectionIdx ? (
                                            <svg
                                                width="20"
                                                height="20"
                                                fill="currentColor"
                                                className="rotate-180 transition-transform"
                                            >
                                                <path d="M6 8l4 4 4-4" />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="20"
                                                height="20"
                                                fill="currentColor"
                                                className="transition-transform"
                                            >
                                                <path d="M6 8l4 4 4-4" />
                                            </svg>
                                        )}
                                    </span>
                                </button>
                                {/* Accordion Content */}
                                <div
                                    className={`px-2 pb-2 text-gray-200 text-base transition-all duration-300 ease-in-out ${openIndex === sectionIdx ? "block" : "hidden"
                                        }`}
                                >
                                    {links.length > 0 ? (
                                        <ProblemList
                                            links={links}
                                            sectionIdx={sectionIdx}
                                            checked={checked}
                                            favorites={favorites}
                                            handleCheck={handleCheck}
                                            handleFavorite={handleFavorite}
                                        />
                                    ) : (
                                        <span>{section.description}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DPSheetPage;
