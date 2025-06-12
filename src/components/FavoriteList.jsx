// FavoriteList.js
import React from "react";
import { extractNameFromLeetCodeUrl } from "../utils/utils";

const FavoriteList = ({ favoriteProblems, handleFavorite, visible }) => {
    if (!visible) return null;

    return (
        <div className="mb-10">
            <h2 className="text-2xl font-bold text-amber-400 mb-2">⭐ Favorites</h2>
            {favoriteProblems.length === 0 ? (
                <div className="text-gray-400 italic mb-4">
                    No favorites yet. Click the star next to a problem to add it here!
                </div>
            ) : (
                <ul className="space-y-3 mb-4">
                    {favoriteProblems.map(({ sectionIdx, problemIdx, url }) => (
                        <li
                            key={`${sectionIdx}-${problemIdx}`}
                            className="flex items-center gap-2"
                        >
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-amber-300 font-medium transition"
                            >
                                {extractNameFromLeetCodeUrl(url)}
                            </a>
                            <button
                                className="ml-auto text-amber-400 hover:text-amber-200"
                                title="Remove from favorites"
                                onClick={() => handleFavorite(sectionIdx, problemIdx, url)}
                            >
                                ★
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FavoriteList;
