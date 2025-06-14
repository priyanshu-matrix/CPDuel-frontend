import { useState } from 'react';
import { toast } from 'react-toastify';
import { API_URLS } from "../config/server";

const CreateProblem = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        inputFormat: '',
        outputFormat: '',
        examples: '',
        constraints: '',
        timeLimit: 1,
        memoryLimit: 256,
        tags: '',
        points: 100,
    });
    const [testCasesZipFile, setTestCasesZipFile] = useState(null);

    const handleChange = (e) => {
        const { id, value, type } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleFileChange = (e) => {
        setTestCasesZipFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.difficulty) {
            toast.error('Title, Description, and Difficulty are required.');
            return;
        }

        // Validate JSON format for relevant fields if they are not empty
        const fieldsToValidateAsJson = ['examples', 'constraints', 'tags'];
        for (const field of fieldsToValidateAsJson) {
            if (formData[field] && formData[field].trim()) {
                try {
                    JSON.parse(formData[field].trim());
                } catch (parseError) {
                    toast.error(`Invalid JSON format in ${field}. Please check your input.`);
                    return;
                }
            }
        }

        const payload = new FormData();
        // Append all form data fields
        for (const key in formData) {
            if (fieldsToValidateAsJson.includes(key)) {
                const value = formData[key].trim();
                if (value) {
                    // Send the validated JSON string
                    payload.append(key, value);
                } else {
                    // If field is empty, send string representation of an empty array
                    payload.append(key, "[]");
                }
            } else {
                payload.append(key, formData[key]);
            }
        }

        // Append the test case file if selected
        if (testCasesZipFile) {
            payload.append('testCasesFile', testCasesZipFile);
        }

        try {
            const response = await fetch(API_URLS.PROBLEMS.ADD, {
                method: 'POST',
                headers: {
                    // "Content-Type": "application/json", // Removed for FormData
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                },
                body: payload, // Use FormData object
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Problem created successfully:", data);
                toast.success('Problem created successfully!');
                setFormData({
                    title: '',
                    description: '',
                    difficulty: 'Easy',
                    inputFormat: '',
                    outputFormat: '',
                    examples: '',
                    constraints: '',
                    timeLimit: 1,
                    memoryLimit: 256,
                    tags: '',
                    points: 100,
                });
                setTestCasesZipFile(null);
                // Reset file input element
                const fileInput = document.getElementById('testCasesZipFile');
                if (fileInput) {
                    fileInput.value = null;
                }
            } else {
                const errorData = await response.json();
                console.error("Error creating problem:", errorData);
                toast.error(errorData.message || 'Failed to create problem. Please try again.');
            }
        } catch (error) {
            console.error("Error creating problem:", error);
            toast.error('An error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Create New Problem
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Design challenging problems to test coding skills and expand the problem repository
                    </p>
                </div>

                {/* Form Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl p-8">
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Basic Information */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-purple-400 border-b border-purple-400/30 pb-2">
                                    Basic Information
                                </h2>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                                            Problem Title *
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                            placeholder="Enter problem title"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300 mb-2">
                                            Difficulty Level *
                                        </label>
                                        <select
                                            id="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                        >
                                            <option value="Easy">🟢 Easy</option>
                                            <option value="Medium">🟡 Medium</option>
                                            <option value="Hard">🔴 Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                                        Problem Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        rows="6"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                        placeholder="Describe the problem statement in detail..."
                                    />
                                </div>
                            </div>

                            {/* Input/Output Format */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-purple-400 border-b border-purple-400/30 pb-2">
                                    Format Specifications
                                </h2>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="inputFormat" className="block text-sm font-medium text-gray-300 mb-2">
                                            Input Format
                                        </label>
                                        <textarea
                                            id="inputFormat"
                                            rows="4"
                                            value={formData.inputFormat}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                            placeholder="Describe the input format..."
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-300 mb-2">
                                            Output Format
                                        </label>
                                        <textarea
                                            id="outputFormat"
                                            rows="4"
                                            value={formData.outputFormat}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                            placeholder="Describe the output format..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Examples and Constraints */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-purple-400 border-b border-purple-400/30 pb-2">
                                    Examples & Constraints
                                </h2>

                                <div>
                                    <label htmlFor="examples" className="block text-sm font-medium text-gray-300 mb-2">
                                        Examples (JSON format)
                                    </label>
                                    <textarea
                                        id="examples"
                                        rows="8"
                                        value={formData.examples}
                                        onChange={handleChange}
                                        placeholder='[{"input": "4 9\n2 7 11 15", "output": "0 1", "explanation": "nums[0] + nums[1] = 2 + 7 = 9"}]'
                                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="constraints" className="block text-sm font-medium text-gray-300 mb-2">
                                        Constraints (JSON array)
                                    </label>
                                    <textarea
                                        id="constraints"
                                        rows="4"
                                        value={formData.constraints}
                                        onChange={handleChange}
                                        placeholder='["2 <= n <= 10^4", "-10^9 <= nums[i] <= 10^9"]'
                                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 font-mono text-sm"
                                    />
                                </div>
                            </div>

                            {/* Technical Settings */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-purple-400 border-b border-purple-400/30 pb-2">
                                    Technical Settings
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div>
                                        <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-300 mb-2">
                                            Time Limit (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            id="timeLimit"
                                            value={formData.timeLimit}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="memoryLimit" className="block text-sm font-medium text-gray-300 mb-2">
                                            Memory Limit (MB)
                                        </label>
                                        <input
                                            type="number"
                                            id="memoryLimit"
                                            value={formData.memoryLimit}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="points" className="block text-sm font-medium text-gray-300 mb-2">
                                            Points
                                        </label>
                                        <input
                                            type="number"
                                            id="points"
                                            value={formData.points}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                                            Tags (JSON array)
                                        </label>
                                        <input
                                            type="text"
                                            id="tags"
                                            value={formData.tags}
                                            onChange={handleChange}
                                            placeholder='["array", "hash-table"]'
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Test Cases */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-purple-400 border-b border-purple-400/30 pb-2">
                                    Test Cases
                                </h2>

                                <div>
                                    <label htmlFor="testCasesZipFile" className="block text-sm font-medium text-gray-300 mb-2">
                                        Test Cases (ZIP file)
                                    </label>
                                    <input
                                        type="file"
                                        id="testCasesZipFile"
                                        onChange={handleFileChange}
                                        accept=".zip"
                                        className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-700/50 border border-slate-600 rounded-lg"
                                    />
                                    {testCasesZipFile && <p className="text-xs text-gray-400 mt-1">Selected: {testCasesZipFile.name}</p>}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-8">
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25"
                                >
                                    🚀 Create Problem
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProblem;
