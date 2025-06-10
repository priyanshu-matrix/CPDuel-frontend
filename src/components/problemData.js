// problemData.js

const problems = [
    {
        id: 1,
        title: "1. Two Sum",
        difficulty: "Easy",
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
        $$ \\textbf{Sum} = \\sum_{i=0}^{n-1} nums[i] = target $$
        `,
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
                explanation: ""
            }
        ],
        constraints: [
            "$2 \\leq$ nums.length $\\leq 10⁴$",
            "$-10^{9} \\leq$ nums[i] $\\leq 10⁹$",
            "$-10⁹ \\leq$ target $\\leq 10⁹$"
        ]
    },
    {
        id: 2,
        title: "15. 3Sum",
        difficulty: "Medium",
        description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.`,
        examples: [
            {
                input: "nums = [-1,0,1,2,-1,-4]",
                output: "[[-1,-1,2],[-1,0,1]]",
                explanation: "The distinct triplets are [-1,0,1] and [-1,-1,2]."
            },
            {
                input: "nums = [0,1,1]",
                output: "[]",
                explanation: "The only possible triplet does not sum up to 0."
            }
        ],
        constraints: [
            "$3 \\leq$ nums.length $\\leq 3000$",
            "$-10^{5} \\leq$ nums[i] $\\leq 10^{5}$"
        ]
    },
    {
        id: 3,
        title: "121. Best Time to Buy and Sell Stock",
        difficulty: "Easy",
        description: `You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.`,
        examples: [
            {
                input: "prices = [7,1,5,3,6,4]",
                output: "5",
                explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
            },
            {
                input: "prices = [7,6,4,3,1]",
                output: "0",
                explanation: "In this case, no transactions are done and the max profit = 0."
            }
        ],
        constraints: [
            "$1 \\leq$ prices.length $\\leq 10^{5}$",
            "$0 \\leq$ prices[i] $\\leq 10^{4}$"
        ]
    },
    {
        id: 4,
        title: "20. Valid Parentheses",
        difficulty: "Easy",
        description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets and in the correct order.`,
        examples: [
            {
                input: "s = \"()\"",
                output: "true",
                explanation: ""
            },
            {
                input: "s = \"()[]{}\"",
                output: "true",
                explanation: ""
            },
            {
                input: "s = \"(]\"",
                output: "false",
                explanation: ""
            }
        ],
        constraints: [
            "$1 \\leq$ s.length $\\leq 10^{4}$",
            "s consists of parentheses only '()[]{}'."
        ]
    },
    {
        id: 5,
        title: "200. Number of Islands",
        difficulty: "Medium",
        description: `Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
        examples: [
            {
                input: "grid = [[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]]",
                output: "1",
                explanation: ""
            },
            {
                input: "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]",
                output: "3",
                explanation: ""
            }
        ],
        constraints: [
            "$m == $ grid.length",
            "$n == $ grid[i].length",
            "$1 \\leq m, n \\leq 300$",
            "grid[i][j] is '0' or '1'."
        ]
    }
];

// Function to get a random problem
const getRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * problems.length);
    return problems[randomIndex];
};

export default getRandomProblem;
