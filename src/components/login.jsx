import { useState } from "react";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../utils/firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [resetEmail, setResetEmail] = useState("");
    const [resetError, setResetError] = useState("");
    const [showResetForm, setShowResetForm] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [isPasswordReset, setIsPasswordReset] = useState(false);

    // Redirect if already logged in
    if (user) {
        navigate('/home');
        return null;
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = auth.currentUser;
            console.log("User logged in successfully:", user);

            // Get the Firebase ID token
            const token = await user.getIdToken();

            // Send the token to your backend for verification and to retrieve user roles/permissions
            const response = await fetch("http://localhost:3000/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.isAdmin) {
                // Store admin status
                localStorage.setItem("isAdmin", "true");
                toast.success("Welcome back, Admin!");
            } else {
                toast.success("Logged in successfully!");
            }
            // AuthContext will handle token management automatically
            // Small delay to show toast before navigation
            setTimeout(() => {
                navigate('/home');
            }, 1500);
        } catch (error) {
            console.error("Error logging in:", error);
            toast.error("Invalid credentials. Please try again.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setIsPasswordReset(true);
            setResetError("");
            setResetSuccess(true);
            toast.success("Password reset email sent! Check your inbox.");
        } catch (error) {
            console.error("Error sending password reset email:", error);
            setResetError(error.message);
            setIsPasswordReset(false);
            setResetSuccess(false);
            toast.error("Failed to send password reset email.");
        }
    };

    const openResetForm = () => {
        setShowResetForm(true);
    };

    const closeResetForm = () => {
        setShowResetForm(false);
        setResetEmail("");
        setIsPasswordReset(false);
        setResetError("");
        setResetSuccess(false);
    };

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("User logged in successfully with Google:", user);

            // Get the Firebase ID token
            const token = await user.getIdToken();

            // Send the token to your backend for verification and to retrieve user roles/permissions
            const response = await fetch("http://localhost:3000/api/users/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                }),
            });

            const data = await response.json();
            if (data.isAdmin) {
                // Store admin status
                localStorage.setItem("isAdmin", "true");
                toast.success("Welcome back, Admin! (Google Sign-in)");
            } else {
                toast.success("Logged in successfully with Google!");
            }
            // AuthContext will handle token management automatically
            // Small delay to show toast before navigation
            setTimeout(() => {
                navigate('/home');
            }, 1500);
        } catch (error) {
            console.error("Error logging in with Google:", error);
            toast.error("Failed to login with Google.");
        }
    };

    return (
        <div className="login-container">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className="login-card">
                <div className="login-header">
                    <h1 className="text-3xl font-bold">CP Duel</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="form-options">
                        <button
                            type="button"
                            className="forgot-password"
                            onClick={openResetForm}
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button type="submit" className="login-button">
                        Sign In
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        Don't have an account? <a href="/sign">Sign up</a>
                    </p>

                    <div className="social-login">
                        <p>Or continue with</p>
                        <div className="social-buttons">
                            <button className="social-btn google" onClick={signInWithGoogle}>
                                Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showResetForm && (
                <div
                    className="modal"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backdropFilter: "blur(5px)", // Added backdrop-filter for blur effect
                    }}
                >
                    <div
                        className="modal-content"
                        style={{
                            backgroundColor: "#fff",
                            padding: "20px",
                            borderRadius: "8px",
                            width: "400px",
                            position: "relative",
                        }}
                    >
                        <span
                            className="close"
                            onClick={closeResetForm}
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                fontSize: "20px",
                                cursor: "pointer",
                            }}
                        >
                            &times;
                        </span>
                        <h2
                            style={{
                                fontSize: "20px",
                                marginBottom: "15px",
                                textAlign: "center",
                            }}
                        >
                            Reset Password
                        </h2>
                        <form onSubmit={handleResetPassword}>
                            <label
                                htmlFor="resetEmail"
                                style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    fontWeight: "bold",
                                }}
                            >
                                Email:
                            </label>
                            <input
                                type="email"
                                id="resetEmail"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    fontSize: "16px",
                                    borderRadius: "4px",
                                    border: "1px solid #ddd",
                                    marginBottom: "15px",
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    backgroundColor: "#007bff",
                                    color: "#fff",
                                    padding: "12px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                Reset Password
                            </button>
                        </form>
                        {resetSuccess && (
                            <div
                                className="success-popup"
                                style={{ marginTop: "10px", color: "green" }}
                            >
                                Password reset email sent! Check your inbox.
                            </div>
                        )}
                        {resetError && (
                            <p style={{ color: "red", marginTop: "10px" }}>
                                Error: {resetError}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
