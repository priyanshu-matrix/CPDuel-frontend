import { useState } from 'react';
import { toast } from 'react-toastify';

const CreateContest = () => {
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        date: '',
        duration: '',
        problems: '',
        level: '',
        description: '',
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
            const response = await fetch('http://localhost:3000/api/contests/add', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`, // Include token for authentication
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Contest created successfully:", data);
                toast.success('Contest created successfully!');
                // Optionally reset the form
                setFormData({
                    id: '',
                    title: '',
                    date: '',
                    duration: '',
                    problems: '',
                    level: '',
                    description: '',
                });
            } else {
                const errorData = await response.json();
                console.error("Error creating contest:", errorData);
                toast.error('Failed to create contest. Please try again.');
            }
        } catch (error) {
            console.error("Error creating contest:", error);
            toast.error('An error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Create Contest</h1>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="id" className="block text-sm font-medium text-gray-300">ID</label>
                        <input
                            type="text"
                            id="id"
                            value={formData.id}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date</label>
                        <input
                            type="text"
                            id="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-300">Duration</label>
                        <input
                            type="text"
                            id="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="problems" className="block text-sm font-medium text-gray-300">Problems</label>
                        <input
                            type="number"
                            id="problems"
                            value={formData.problems}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="level" className="block text-sm font-medium text-gray-300">Level</label>
                        <input
                            type="text"
                            id="level"
                            value={formData.level}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                        <textarea
                            id="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        ></textarea>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContest;
