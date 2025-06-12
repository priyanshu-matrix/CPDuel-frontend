import React from "react";
import { extractNameFromLeetCodeUrl, getPlatformFromUrl } from "../utils/utils";
import lcLogo from "../assets/lc.svg";
import gfgLogo from "../assets/gfg.svg";

const platformLogo = {
    lc: lcLogo,
    gfg: gfgLogo,
};

const ProblemList = ({
    links,
    sectionIdx,
    checked,
    favorites,
    handleCheck,
    handleFavorite,
}) => (
    <ul className="space-y-2 mt-2">
        {links.map((url, problemIdx) => {
            const favKey = `${sectionIdx}-${problemIdx}`;
            const isFav = !!favorites[favKey];
            const platform = getPlatformFromUrl(url);
            const logo = platformLogo[platform];

            return (
                <li
                    key={url}
                    className="flex items-center gap-3 bg-gray-700 rounded-lg px-3 py-2 hover:bg-gray-600 transition"
                >
                    <input
                        type="checkbox"
                        className="accent-amber-400 w-5 h-5"
                        checked={!!checked[favKey]}
                        onChange={() => handleCheck(sectionIdx, problemIdx)}
                        id={`dp-${sectionIdx}-${problemIdx}`}
                    />
                    <label
                        htmlFor={`dp-${sectionIdx}-${problemIdx}`}
                        className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-amber-300 font-medium transition"
                        >
                            {extractNameFromLeetCodeUrl(url)}
                        </a>
                        {logo && (
                            <img
                                src={logo}
                                alt={platform}
                                className="w-6 h-6 inline-block align-middle"
                                style={{ minWidth: 24 }}
                            />
                        )}
                    </label>
                    <button
                        className={`ml-auto text-2xl focus:outline-none transition-colors ${isFav ? "text-amber-400" : "text-gray-500 hover:text-amber-300"
                            }`}
                        title={isFav ? "Remove from favorites" : "Add to favorites"}
                        onClick={() => handleFavorite(sectionIdx, problemIdx, url)}
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                        }}
                        type="button"
                    >
                        {isFav ? "★" : "☆"}
                    </button>
                </li>
            );
        })}
    </ul>
);

export default ProblemList;
