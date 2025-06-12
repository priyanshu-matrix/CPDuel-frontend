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

import { ToastContainer } from "react-toastify";
import CreateContest from "./components/CreateContest";
import CreateProblem from "./components/CreateProblem";

function App() {
    const token = localStorage.getItem("token");
    return (
        <Router>
            <Routes>
                <Route path="/" element={token ? (
                    <>
                        <Navbar />
                        <HomePage />
                        <Footer />
                    </>
                ) : <Login />} />
                <Route path="/sign" element={token ? <HomePage /> : <Signup />} />
                <Route
                    path="/home"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <HomePage />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/leaderboard"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <LeaderboardPage />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/contest"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <ContestPage />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/add-contest"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <CreateContest />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/createproblems"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <CreateProblem />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/contest/:contestId"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <ContestBracketPage />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/contest/:contestId/leaderboard"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <ContestLeaderboardPage />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/contest/problemlist/:contestId"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <ContestList />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/contest/begin/:contestId"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <ContestStartPage />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/sheets"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <SheetsPage />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/sheets/dp"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <DPSheetPage />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/sheets/graph"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <GraphSheetPage />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/sheets/tree"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <TreeSheetPage />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/sheets/range-query"
                    element={
                        token ? (
                            <>
                                <Navbar />
                                <RangeQuerySheetPage />
                                <Footer />
                            </>
                        ) : (
                            <Login />
                        )
                    }
                />
            </Routes>
            <ToastContainer />
        </Router>
    );
}

export default App;
