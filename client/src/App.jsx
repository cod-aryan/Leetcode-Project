import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home.jsx";
import "./App.css";
import Auth from "./pages/Auth.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;