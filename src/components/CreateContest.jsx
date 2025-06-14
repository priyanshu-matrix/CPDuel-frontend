import { useState } from "react";
import { toast } from "react-toastify";
import { API_URLS } from "../config/server";

const CreateContest = () => {
    const [formData, setFormData] = useState({
        id: "",
        title: "",
        date: "",
        duration: "",
        problems: "",
        level: "",
        description: "",
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_URLS.CONTESTS.ADD, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Contest created successfully:", data);
                toast.success("Contest created successfully!");
                // Optionally reset the form
                setFormData({
                    id: "",
                    title: "",
                    date: "",
                    duration: "",
                    problems: "",
                    level: "",
                    description: "",
                });
            } else {
                const errorData = await response.json();
                console.error("Error creating contest:", errorData);
                toast.error("Failed to create contest. Please try again.");
            }
        } catch (error) {
            console.error("Error creating contest:", error);
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Create New Contest
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Design and organize coding contests to challenge participants and
                        showcase their skills
                    </p>
                </div>

                {/* Form Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl p-8">
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Basic Information */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-purple-400 border-b border-purple-400/30 pb-2">
                                    Contest Information
                                </h2>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            htmlFor="id"
                                            className="block text-sm font-medium text-gray-300 mb-2"
                                        >
                                            Contest ID - Name
                                        </label>
                                        <input
                                            type="text"
                                            id="id"
                                            value={formData.id}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                            placeholder="Enter unique contest ID-NAME"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="title"
                                            className="block text-sm font-medium text-gray-300 mb-2"
                                        >
                                            Contest Title *
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                            placeholder="Enter contest title"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-300 mb-2"
                                    >
                                        Contest Description
                                    </label>
                                    <textarea
                                        id="description"
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                        placeholder="Describe the contest objectives and rules..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-purple-400 border-b border-purple-400/30 pb-2">
                                    Contest Details
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div>
                                        <label
                                            htmlFor="date"
                                            className="block text-sm font-medium text-gray-300 mb-2"
                                        >
                                            Contest Date
                                        </label>
                                        <input
                                            type="date"
                                            id="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="duration"
                                            className="block text-sm font-medium text-gray-300 mb-2"
                                        >
                                            Duration (hours)
                                        </label>
                                        <input
                                            type="string"
                                            id="duration"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                            placeholder="e.g., 2"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="problems"
                                            className="block text-sm font-medium text-gray-300 mb-2"
                                        >
                                            Number of Problems
                                        </label>
                                        <input
                                            type="number"
                                            id="problems"
                                            value={formData.problems}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                            placeholder="e.g., 5"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="level"
                                            className="block text-sm font-medium text-gray-300 mb-2"
                                        >
                                            Level
                                        </label>
                                        <input
                                            type="text"
                                            id="level"
                                            value={formData.level}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                            placeholder="e.g., Open for all..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-8">
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25"
                                >
                                    🏆 Create Contest
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateContest;
