import { useState, useEffect } from "react";


export function extractNameFromLeetCodeUrl(url) {
    // LeetCode
    const lcMatch = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
    if (lcMatch) {
        const kebab = lcMatch[1];
        return kebab
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
    // GeeksforGeeks
    const gfgMatch = url.match(/geeksforgeeks\.org\/problems\/([a-z0-9-]+)/i);
    if (gfgMatch) {
        let kebab = gfgMatch[1];
        // Remove trailing -digits (e.g., -1611555638)
        kebab = kebab.replace(/-\d+$/, "");
        return kebab
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
    return url;
}

// Custom hook for localStorage-backed state
export function useLocalStorageState(key, defaultValue) {
    const [state, setState] = useState(() => {
        try {
            const value = window.localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}

export function getPlatformFromUrl(url) {
    if (/leetcode\.com\/problems\//i.test(url)) return "lc";
    if (/geeksforgeeks\.org\/problems\//i.test(url)) return "gfg";
    return "other";
}
