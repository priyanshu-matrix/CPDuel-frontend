// problemData.js

const problemData = {
    title: "1. Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.`,
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
        "2 <= nums.length <= 10⁴",
        "-10⁹ <= nums[i] <= 10⁹",
        "-10⁹ <= target <= 10⁹"
    ]
};

export default problemData;
