import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const ContestCard = ({ contest }) => {
    const [registered, setRegistered] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: "",
        date: "",
        duration: "",
        problems: "",
        level: "",
        description: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize form data with current contest details
        if (contest) {
            setEditFormData({
                title: contest.title || "",
                date: contest.date || "",
                duration: contest.duration || "",
                problems: contest.problems || "",
                level: contest.level || "",
                description: contest.description || "",
            });
        }
    }, [contest]);

    // Check if the user is an admin
    useEffect(() => {
        const checkAdminStatus = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(
                    "http://localhost:3000/api/users/info",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.data.isAdmin) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (err) {
                console.error("Error checking admin status:", err);
                setError("Failed to check admin status");
            } finally {
                setLoading(false);
            }
        };
        checkAdminStatus();
    }, []);

    useEffect(() => {
        const checkIfRegistered = async () => {
            try {
                const token = localStorage.getItem("token");
                const contestIdentifier = contest.id || contest._id;
                const response = await fetch(
                    `http://localhost:3000/api/users/checkContestRegistration/${contestIdentifier}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.isRegistered) {
                        setRegistered(true);
                    } else {
                        setRegistered(false);
                    }
                } else {
                    console.error("Failed to check registration status");
                    setRegistered(false); // Assume not registered in case of error
                }
            } catch (error) {
                console.error("Error checking registration status:", error);
                setRegistered(false); // Assume not registered in case of error
            }
        };

        checkIfRegistered();
    }, [contest.id, contest._id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value,
        });
    };

    const handleRegister = async () => {
        try {
            setRegistered(true);
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:3000/api/users/registerContest",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ contestId: contest._id }),
                }
            );

            if (response.ok) {
                toast.success("Successfully registered for the contest");
                navigate(`/contest/${contest._id}`);
            } else {
                navigate(`/contest/${contest._id}`);
                toast.success("Already registered for the contest");
            }
        } catch (error) {
            console.error("Error registering for contest:", error);
            alert("An error occurred during registration. Please try again.");
            setRegistered(false);
        }
    };

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:3000/api/contests/edit/${contest._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editFormData),
                }
            );

            if (response.ok) {
                console.log("Contest edited successfully");
                setShowEditModal(false);
                // You might want to refresh the contest data or provide feedback to the user
                window.location.reload(); // Simple approach to refresh the data
            } else {
                console.error("Failed to edit contest");
                alert("Failed to update contest. Please try again.");
            }
        } catch (error) {
            console.error("Error editing contest:", error);
            alert("An error occurred while updating the contest.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this contest?")) {
            try {
                const token = localStorage.getItem("token");
                const url = `http://localhost:3000/api/contests/delete/${contest._id}`;
                const response = await fetch(url, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    console.log("Contest deleted successfully");
                    window.location.reload();
                    // Optionally refresh the contest list here
                } else {
                    try {
                        const errorData = await response.json();
                        console.error(
                            "Failed to delete contest:",
                            errorData.message || "Unknown error"
                        );
                    } catch (jsonError) {
                        console.error("Failed to parse error response:", jsonError);
                        console.error("Original response status:", response.status);
                    }
                }
            } catch (error) {
                console.error("Error deleting contest:", error);
            }
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg max-w-xl mx-auto hover:border-amber-400 transition-all relative">
            {isAdmin && (
                <button
                    onClick={() => navigate(`/contest/problemlist/${contest._id}`)}
                    className="absolute top-4 right-4 bg-blue-500 text-white font-semibold px-3 py-1 rounded-md hover:bg-blue-400 transition text-sm"
                    title="Manage Problems"
                >
                    Manage Problems
                </button>
            )}
            <h2 className="text-2xl font-bold text-amber-400 mb-2 mt-8">
                {" "}
                {/* Added mt-8 for spacing if button is present */}
                {contest.title}
            </h2>
            <div className="text-gray-300 mb-3">
                <span className="font-semibold">Date:</span> {contest.date}
            </div>
            <div className="text-gray-300 mb-3">
                <span className="font-semibold">Duration:</span> {contest.duration}
            </div>
            <div className="text-gray-300 mb-3">
                <span className="font-semibold">Problems:</span> {contest.problems}
            </div>
            <div className="text-gray-300 mb-3">
                <span className="font-semibold">Level:</span> {contest.level}
            </div>
            <div className="text-gray-400 mb-4">{contest.description}</div>
            {!registered ? (
                <button
                    className="bg-amber-400 text-gray-900 font-semibold px-6 py-2 rounded-full hover:bg-amber-300 transition"
                    onClick={handleRegister}
                >
                    Register
                </button>
            ) : (
                <button
                    className="bg-green-500 text-white font-semibold px-6 py-2 rounded-full transition"
                >
                    Loading...
                </button>
            )}
            {isAdmin && (
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleEdit}
                        className="text-amber-500 hover:text-amber-400 mr-2"
                    >
                        <AiFillEdit size={24} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-400"
                    >
                        <AiFillDelete size={24} />
                    </button>
                </div>
            )}

            {/* Edit Contest Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full max-h-90vh overflow-y-auto">
                        <h2 className="text-2xl font-bold text-amber-400 mb-6">
                            Edit Contest
                        </h2>

                        <form onSubmit={handleSubmitEdit}>
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editFormData.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Date</label>
                                <input
                                    type="text"
                                    name="date"
                                    value={editFormData.date}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Duration</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={editFormData.duration}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Problems</label>
                                <input
                                    type="number"
                                    name="problems"
                                    value={editFormData.problems}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Level</label>
                                <input
                                    type="text"
                                    name="level"
                                    value={editFormData.level}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-300 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={editFormData.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-24 resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-400 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContestCard;
