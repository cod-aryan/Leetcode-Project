import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home.jsx";
import "./App.css";
import Auth from "./pages/Auth.jsx";
import Navbar from "./components/Navbar.jsx";
import Logout from "./components/Logout.jsx";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;