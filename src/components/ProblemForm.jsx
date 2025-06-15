import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ProblemForm = ({ 
    initialData = null, 
    onSubmit, 
    onCancel, 
    isEditing = false,
    title = "Create New Problem" 
}) => {
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

    // Initialize form with data for editing
    useEffect(() => {
        if (initialData && isEditing) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                difficulty: initialData.difficulty || 'Easy',
                inputFormat: initialData.inputFormat || '',
                outputFormat: initialData.outputFormat || '',
                examples: Array.isArray(initialData.examples) 
                    ? JSON.stringify(initialData.examples, null, 2) 
                    : initialData.examples || '',
                constraints: Array.isArray(initialData.constraints) 
                    ? JSON.stringify(initialData.constraints, null, 2) 
                    : initialData.constraints || '',
                timeLimit: initialData.timeLimit || 1,
                memoryLimit: initialData.memoryLimit || 256,
                tags: Array.isArray(initialData.tags) 
                    ? JSON.stringify(initialData.tags, null, 2) 
                    : initialData.tags || '',
                points: initialData.points || 100,
            });
        }
    }, [initialData, isEditing]);

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

        const processedData = { ...formData };
        
        // Process JSON fields
        for (const field of fieldsToValidateAsJson) {
            const value = formData[field].trim();
            if (value) {
                try {
                    processedData[field] = JSON.parse(value);
                } catch (parseError) {
                    processedData[field] = [];
                }
            } else {
                processedData[field] = [];
            }
        }

        onSubmit(processedData, testCasesZipFile);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-purple-400">
                            {title}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-400/30 pb-2">
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                                        Problem Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                        placeholder="Enter problem title"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300 mb-2">
                                        Difficulty *
                                    </label>
                                    <select
                                        id="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                        required
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                                    Problem Description *
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 resize-vertical"
                                    placeholder="Describe the problem statement..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Input/Output Format */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-400/30 pb-2">
                                Input/Output Format
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="inputFormat" className="block text-sm font-medium text-gray-300 mb-2">
                                        Input Format
                                    </label>
                                    <textarea
                                        id="inputFormat"
                                        value={formData.inputFormat}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 resize-vertical"
                                        placeholder="Describe the input format..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-300 mb-2">
                                        Output Format
                                    </label>
                                    <textarea
                                        id="outputFormat"
                                        value={formData.outputFormat}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 resize-vertical"
                                        placeholder="Describe the output format..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Examples and Constraints */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="examples" className="block text-sm font-medium text-gray-300 mb-2">
                                    Examples (JSON format)
                                </label>
                                <textarea
                                    id="examples"
                                    value={formData.examples}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 resize-vertical font-mono text-sm"
                                    placeholder='[{"input": "sample input", "output": "sample output"}]'
                                />
                            </div>

                            <div>
                                <label htmlFor="constraints" className="block text-sm font-medium text-gray-300 mb-2">
                                    Constraints (JSON format)
                                </label>
                                <textarea
                                    id="constraints"
                                    value={formData.constraints}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 resize-vertical font-mono text-sm"
                                    placeholder='["1 ≤ n ≤ 1000", "1 ≤ arr[i] ≤ 10^9"]'
                                />
                            </div>
                        </div>

                        {/* Technical Details */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-400/30 pb-2">
                                Technical Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        max="10"
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
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
                                        min="64"
                                        max="512"
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
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
                                        min="10"
                                        max="1000"
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tags and Test Cases */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                                    Tags (JSON format)
                                </label>
                                <textarea
                                    id="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 resize-vertical font-mono text-sm"
                                    placeholder='["array", "sorting", "algorithms"]'
                                />
                            </div>

                            {!isEditing && (
                                <div>
                                    <label htmlFor="testCasesZipFile" className="block text-sm font-medium text-gray-300 mb-2">
                                        Test Cases (ZIP file)
                                    </label>
                                    <input
                                        type="file"
                                        id="testCasesZipFile"
                                        accept=".zip"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
                            >
                                {isEditing ? 'Update Problem' : 'Create Problem'}
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProblemForm;
