import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ContestPage from "./pages/ContestPage";
import ContestBracketPage from "./pages/ContestBracketPage";
import ContestLeaderboardPage from "./pages/ContestLeaderboardPage";
import ContestStartPage from "./pages/ContestStartPage";
import SheetsPage from "./pages/SheetsPage";
import DPSheetPage from "./pages/DPSheetPage";
import GraphSheetPage from "./pages/GraphSheetPage";
import TreeSheetPage from "./pages/TreeSheetPage";
import RangeQuerySheetPage from "./pages/RangeQuerySheetPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/login";
import ContestList from "./components/ContestList";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import CreateContest from "./components/CreateContest";
import CreateProblem from "./components/CreateProblem";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Navbar />
                            <HomePage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/sign" element={<Signup />} />
                    <Route path="/home" element={
                        <ProtectedRoute>
                            <Navbar />
                            <HomePage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/leaderboard" element={
                        <ProtectedRoute>
                            <Navbar />
                            <LeaderboardPage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/contest" element={
                        <ProtectedRoute>
                            <Navbar />
                            <ContestPage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/add-contest" element={
                        <ProtectedRoute>
                            <Navbar />
                            <CreateContest />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/createproblems" element={
                        <ProtectedRoute>
                            <Navbar />
                            <CreateProblem />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/contest/:contestId" element={
                        <ProtectedRoute>
                            <Navbar />
                            <ContestBracketPage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/contest/:contestId/leaderboard" element={
                        <ProtectedRoute>
                            <Navbar />
                            <ContestLeaderboardPage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/contest/problemlist/:contestId" element={
                        <ProtectedRoute>
                            <Navbar />
                            <ContestList />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/contest/begin/:contestId" element={
                        <ProtectedRoute>
                            <Navbar />
                            <ContestStartPage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/sheets" element={
                        <ProtectedRoute>
                            <Navbar />
                            <SheetsPage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/sheets/dp" element={
                        <ProtectedRoute>
                            <Navbar />
                            <DPSheetPage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/sheets/graph" element={
                        <ProtectedRoute>
                            <Navbar />
                            <GraphSheetPage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/sheets/tree" element={
                        <ProtectedRoute>
                            <Navbar />
                            <TreeSheetPage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                    <Route path="/sheets/range-query" element={
                        <ProtectedRoute>
                            <Navbar />
                            <RangeQuerySheetPage />
                            <Footer />
                        </ProtectedRoute>
                    } />
                </Routes>
                <ToastContainer />
            </Router>
        </AuthProvider>
    );
}

export default App;
