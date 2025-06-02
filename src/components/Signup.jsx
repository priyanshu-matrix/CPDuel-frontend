import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase/firebase'; 
import { toast } from 'react-toastify';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleregister = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            const user = auth.currentUser;
            console.log("User created successfully:", user);
            toast.success('User created successfully!');

            // Get the Firebase ID token
            const token = await user.getIdToken();

            // Send the token to your backend for verification and to retrieve user roles/permissions
            const response = await fetch('http://localhost:3000/api/users/signup', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: username
                })
            });

            const data = await response.json();
            if (data.isAdmin) {
                // Redirect to admin panel
                localStorage.setItem('token', token);
                window.location.href = "/";
                toast.success('Welcome Admin!');
            } else {
                // Regular user page
                localStorage.setItem('token', token);
                window.location.href = "/";
                toast.success('Welcome CPer!');
            }


        }
        catch (error) {
            console.error("Error creating user:", error);
            toast.error('Failed to create user.');
            // Handle error appropriately, e.g., show a notification
        }
    }


    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-800 to-gray-600 py-8">
            <div className="bg-gray-700 rounded-lg shadow-xl w-full max-w-md p-8 border border-gray-600">
                <div className="text-center mb-6">
                    <h1 className="text-2xl text-yellow-500 font-semibold mb-2">Sign Up</h1>
                    <p className="text-gray-300">Create your account</p>
                </div>
                <form onSubmit={handleregister}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-200 text-sm font-medium mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter your username"
                            className="w-full px-3 py-2 placeholder-gray-500 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:border-yellow-500 transition duration-300"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-200 text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            className="w-full px-3 py-2 placeholder-gray-500 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:border-yellow-500 transition duration-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-200 text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            className="w-full px-3 py-2 placeholder-gray-500 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:border-yellow-500 transition duration-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength="6"
                            required
                        />
                         <p className="text-gray-400 text-xs mt-1">Must be at least 6 characters</p>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-yellow-500 text-gray-900 py-2 rounded-md hover:bg-yellow-600 transition duration-300"
                    >
                        Sign Up
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Already have an account?
                        <a href="/" className="text-yellow-500 hover:underline ml-1">
                            Login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup
