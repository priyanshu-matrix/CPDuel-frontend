import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import LeaderboardPage from "./LeaderboardPage";
import ContestPage from "./ContestPage";
import ContestBracketPage from "./ContestBracketPage";
import ContestLeaderboardPage from "./ContestLeaderboardPage";
import ContestStartPage from "./ContestStartPage";
import SheetsPage from "./SheetsPage";
import DPSheetPage from "./DPSheetPage";
import GraphSheetPage from "./GraphSheetPage";
import TreeSheetPage from "./TreeSheetPage";
import RangeQuerySheetPage from "./RangeQuerySheetPage";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Login from "./login";
import Signup from "./Signup";
import { ToastContainer } from "react-toastify";

function App() {
  const token = localStorage.getItem("token");
  return (
    <Router>
      <Routes>
        <Route path="/" element={token ?  (
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
          path="/contest/:contestId/start"
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
