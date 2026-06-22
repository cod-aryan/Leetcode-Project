import { BrowserRouter, Route, Routes } from "react-router";
import Problems from "./pages/Problems.jsx";
import ProblemSolve from "./pages/ProblemSolve.jsx";
import "./App.css";
import Auth from "./pages/Auth.jsx";
import Navbar from "./components/Navbar.jsx";
import Logout from "./components/Logout.jsx";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Problems />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/problems/:id" element={<ProblemSolve />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;