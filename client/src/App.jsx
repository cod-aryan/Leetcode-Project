import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home.jsx";
import "./App.css";
import Auth from "./pages/Auth.jsx";
import Navbar from "./components/Navbar.jsx";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;