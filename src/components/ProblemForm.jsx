import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

const AVAILABLE_TAGS = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
    'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search', 'Database',
    'Breadth-First Search', 'Tree', 'Matrix', 'Two Pointers', 'Binary Tree',
    'Bit Manipulation', 'Heap', 'Stack', 'Graph', 'Design',
    'Simulation', 'Backtracking', 'Linked List', 'Union Find', 'Sliding Window',
    'Recursion', 'Divide and Conquer', 'Trie', 'Segment Tree', 'Binary Indexed Tree',
    'Geometry', 'Number Theory', 'Game Theory', 'Interactive', 'Constructive'
];

const DIFFICULTY_COLORS = {
    'Easy': 'text-green-400 bg-green-400/10 border-green-400/30',
    'Medium': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    'Hard': 'text-red-400 bg-red-400/10 border-red-400/30'
};

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
        timeLimit: 1,
        memoryLimit: 256,
        points: 100,
    });
    
    const [examples, setExamples] = useState([
        { input: '', output: '', explanation: '' }
    ]);
    
    const [constraints, setConstraints] = useState(['']);
    
    const [selectedTags, setSelectedTags] = useState([]);
    
    const [testCasesZipFile, setTestCasesZipFile] = useState(null);
    
    // New state for tag search and management
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
    const [customTag, setCustomTag] = useState('');
    
    // Filter tags based on search query
    const filteredTags = useMemo(() => {
        return AVAILABLE_TAGS.filter(tag => 
            tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
        );
    }, [tagSearchQuery]);

    // Initialize form with data for editing
    useEffect(() => {
        if (initialData && isEditing) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                difficulty: initialData.difficulty || 'Easy',
                inputFormat: initialData.inputFormat || '',
                outputFormat: initialData.outputFormat || '',
                timeLimit: initialData.timeLimit || 1,
                memoryLimit: initialData.memoryLimit || 256,
                points: initialData.points || 100,
            });
            
            // Handle examples
            if (initialData.examples && Array.isArray(initialData.examples)) {
                setExamples(initialData.examples.length > 0 ? initialData.examples : [{ input: '', output: '', explanation: '' }]);
            }
            
            // Handle constraints
            if (initialData.constraints && Array.isArray(initialData.constraints)) {
                setConstraints(initialData.constraints.length > 0 ? initialData.constraints : ['']);
            }
            
            // Handle tags
            if (initialData.tags && Array.isArray(initialData.tags)) {
                setSelectedTags(initialData.tags);
            }
        }
    }, [initialData, isEditing]);

    // Lock body scroll when modal is open
    useEffect(() => {
        // Simply hide overflow to prevent background scrolling
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        // Restore scroll when modal closes
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

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

    // Example management functions
    const addExample = () => {
        setExamples([...examples, { input: '', output: '', explanation: '' }]);
    };

    const removeExample = (index) => {
        if (examples.length > 1) {
            setExamples(examples.filter((_, i) => i !== index));
        }
    };

    const updateExample = (index, field, value) => {
        const updatedExamples = examples.map((example, i) => 
            i === index ? { ...example, [field]: value } : example
        );
        setExamples(updatedExamples);
    };

    // Constraint management functions
    const addConstraint = () => {
        setConstraints([...constraints, '']);
    };

    const removeConstraint = (index) => {
        if (constraints.length > 1) {
            setConstraints(constraints.filter((_, i) => i !== index));
        }
    };

    const updateConstraint = (index, value) => {
        const updatedConstraints = constraints.map((constraint, i) => 
            i === index ? value : constraint
        );
        setConstraints(updatedConstraints);
    };

    // Tag management functions
    const toggleTag = (tag) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };
    
    const addCustomTag = () => {
        if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
            setSelectedTags(prev => [...prev, customTag.trim()]);
            setCustomTag('');
        }
    };
    
    const removeTag = (tagToRemove) => {
        setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
    };
    
    const clearAllTags = () => {
        setSelectedTags([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.difficulty) {
            toast.error('Title, Description, and Difficulty are required.');
            return;
        }

        // Validate examples
        const validExamples = examples.filter(ex => ex.input.trim() && ex.output.trim());
        if (validExamples.length === 0) {
            toast.error('At least one example with input and output is required.');
            return;
        }

        // Validate constraints
        const validConstraints = constraints.filter(c => c.trim());
        if (validConstraints.length === 0) {
            toast.error('At least one constraint is required.');
            return;
        }

        const processedData = {
            ...formData,
            examples: validExamples,
            constraints: validConstraints,
            tags: selectedTags
        };

        onSubmit(processedData, testCasesZipFile);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                // Close modal when clicking on backdrop
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
            onWheel={(e) => {
                // Only prevent wheel events if they would reach the backdrop
                // This allows scrolling within the modal content
                if (e.target === e.currentTarget) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}
            onTouchMove={(e) => {
                // Only prevent touch scrolling on the backdrop
                if (e.target === e.currentTarget) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}
        >
            <div 
                className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden"
                data-modal="true"
                onClick={(e) => {
                    // Prevent modal content clicks from closing modal
                    e.stopPropagation();
                }}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-slate-700/50 bg-slate-800/80">
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {title}
                            </h2>
                            <p className="text-gray-400 mt-1">
                                {isEditing ? 'Update problem details and settings' : 'Create a new coding challenge'}
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div 
                        className="flex-1 overflow-y-auto custom-scrollbar"
                        style={{ 
                            maxHeight: 'calc(95vh - 120px)', // Account for header height
                            overflowY: 'auto' 
                        }}
                    >
                        <form className="p-6 space-y-8" onSubmit={handleSubmit}>
                            {/* Basic Information */}
                            <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                                        <span className="text-white font-bold">1</span>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-white">Basic Information</h3>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                                            Problem Title *
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 hover:border-slate-500"
                                            placeholder="e.g., Two Sum Problem"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300">
                                            Difficulty Level *
                                        </label>
                                        <select
                                            id="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 hover:border-slate-500"
                                            required
                                        >
                                            <option value="Easy">🟢 Easy</option>
                                            <option value="Medium">🟡 Medium</option>
                                            <option value="Hard">🔴 Hard</option>
                                        </select>
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[formData.difficulty]}`}>
                                            {formData.difficulty} Level
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                                        Problem Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 hover:border-slate-500 resize-none"
                                        placeholder="Describe the problem statement in detail. Include what the function should do, any special conditions, and expected behavior..."
                                        required
                                    />
                                    <div className="text-xs text-gray-400">
                                        {formData.description.length}/2000 characters
                                    </div>
                                </div>
                            </div>

                            {/* Input/Output Format */}
                            <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
                                        <span className="text-white font-bold">2</span>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-white">Format Specifications</h3>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="inputFormat" className="block text-sm font-medium text-gray-300">
                                            Input Format
                                        </label>
                                        <textarea
                                            id="inputFormat"
                                            value={formData.inputFormat}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 hover:border-slate-500 resize-none"
                                            placeholder="First line: integer n (size of array)&#10;Second line: n space-separated integers"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-300">
                                            Output Format
                                        </label>
                                        <textarea
                                            id="outputFormat"
                                            value={formData.outputFormat}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 hover:border-slate-500 resize-none"
                                            placeholder="Single line: the expected result"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Examples and Constraints */}
                            <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                                        <span className="text-white font-bold">3</span>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-white">Examples & Constraints</h3>
                                </div>

                                {/* Examples Section */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Examples *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addExample}
                                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors font-medium"
                                        >
                                            + Add Example
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {examples.map((example, index) => (
                                            <div key={index} className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-medium text-gray-300">Example {index + 1}</h4>
                                                    {examples.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExample(index)}
                                                            className="text-red-400 hover:text-red-300 text-sm transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Input *</label>
                                                        <textarea
                                                            rows={3}
                                                            value={example.input}
                                                            onChange={(e) => updateExample(index, 'input', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white text-sm placeholder-gray-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all duration-200"
                                                            placeholder="Enter input..."
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Output *</label>
                                                        <textarea
                                                            rows={3}
                                                            value={example.output}
                                                            onChange={(e) => updateExample(index, 'output', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white text-sm placeholder-gray-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all duration-200"
                                                            placeholder="Enter output..."
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3">
                                                    <label className="block text-xs text-gray-400 mb-1">Explanation (Optional)</label>
                                                    <textarea
                                                        rows={2}
                                                        value={example.explanation}
                                                        onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white text-sm placeholder-gray-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all duration-200"
                                                        placeholder="Explain the example (optional)..."
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Constraints Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Constraints *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addConstraint}
                                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors font-medium"
                                        >
                                            + Add Constraint
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {constraints.map((constraint, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={constraint}
                                                        onChange={(e) => updateConstraint(index, e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-600/50 text-white text-sm placeholder-gray-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all duration-200"
                                                        placeholder="Enter constraint (e.g., 1 <= n <= 10^5)"
                                                    />
                                                </div>
                                                {constraints.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeConstraint(index)}
                                                        className="text-red-400 hover:text-red-300 px-2 py-1 transition-colors"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Technical Settings */}
                            <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3">
                                        <span className="text-white font-bold">4</span>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-white">Technical Settings</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="space-y-2">
                                        <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-300">
                                            Time Limit
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="timeLimit"
                                                value={formData.timeLimit}
                                                onChange={handleChange}
                                                min="1"
                                                max="10"
                                                className="w-full px-4 py-3 pr-16 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200 hover:border-slate-500"
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                                sec
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="memoryLimit" className="block text-sm font-medium text-gray-300">
                                            Memory Limit
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="memoryLimit"
                                                value={formData.memoryLimit}
                                                onChange={handleChange}
                                                min="64"
                                                max="1024"
                                                className="w-full px-4 py-3 pr-16 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200 hover:border-slate-500"
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                                MB
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="points" className="block text-sm font-medium text-gray-300">
                                            Points
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="points"
                                                value={formData.points}
                                                onChange={handleChange}
                                                min="10"
                                                max="1000"
                                                className="w-full px-4 py-3 pr-16 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200 hover:border-slate-500"
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                                pts
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Tags Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Tags & Topics
                                            {selectedTags.length > 0 && (
                                                <span className="ml-2 px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full">
                                                    {selectedTags.length} selected
                                                </span>
                                            )}
                                        </label>
                                        {selectedTags.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={clearAllTags}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                Clear all
                                            </button>
                                        )}
                                    </div>

                                    {/* Selected Tags Display */}
                                    {selectedTags.length > 0 && (
                                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                                            <p className="text-xs text-gray-400 mb-2">Selected tags:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200 text-sm rounded-full border border-emerald-500/30 group hover:border-emerald-400/50 transition-all duration-200"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="ml-2 text-emerald-300 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tag Search and Selection */}
                                    <div className="space-y-3">
                                        {/* Search Input */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={tagSearchQuery}
                                                onChange={(e) => setTagSearchQuery(e.target.value)}
                                                onFocus={() => setIsTagDropdownOpen(true)}
                                                className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200"
                                                placeholder="Search tags (Array, String, DP, etc.)"
                                            />
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Custom Tag Input */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={customTag}
                                                onChange={(e) => setCustomTag(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                                                className="flex-1 px-4 py-2 rounded-lg bg-slate-800/70 border border-slate-600/50 text-white placeholder-gray-400 text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400/20 transition-all duration-200"
                                                placeholder="Add custom tag"
                                            />
                                            <button
                                                type="button"
                                                onClick={addCustomTag}
                                                disabled={!customTag.trim()}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors font-medium"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        {/* Available Tags Grid */}
                                        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-600/30">
                                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                                {(tagSearchQuery ? filteredTags : AVAILABLE_TAGS).map((tag) => {
                                                    const isSelected = selectedTags.includes(tag);
                                                    return (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => toggleTag(tag)}
                                                            className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 font-medium ${
                                                                isSelected
                                                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-500 text-white shadow-lg transform scale-105'
                                                                    : 'bg-slate-700/50 border-slate-600/50 text-gray-300 hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-700/70 hover:scale-105'
                                                            }`}
                                                        >
                                                            {tag}
                                                        </button>
                                                    );
                                                })}
                                                {tagSearchQuery && filteredTags.length === 0 && (
                                                    <p className="text-gray-400 text-sm italic">No tags found. Try adding it as a custom tag!</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Test Cases */}
                            {!isEditing && (
                                <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                                    <div className="flex items-center mb-6">
                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                                            <span className="text-white font-bold">5</span>
                                        </div>
                                        <h3 className="text-2xl font-semibold text-white">Test Cases</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="testCasesZipFile" className="block text-sm font-medium text-gray-300">
                                            Test Cases (ZIP file)
                                        </label>
                                        <input
                                            type="file"
                                            id="testCasesZipFile"
                                            accept=".zip"
                                            onChange={handleFileChange}
                                            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-800/70 border border-slate-600/50 rounded-xl"
                                        />
                                        {testCasesZipFile && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Selected: {testCasesZipFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25"
                                >
                                    🚀 {isEditing ? 'Update Problem' : 'Create Problem'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 bg-gray-600/80 hover:bg-gray-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 border border-gray-500/50 hover:border-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemForm;
