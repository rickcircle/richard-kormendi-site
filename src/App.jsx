import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Hire from "./pages/Hire";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hire" element={<Hire />} />
      </Routes>
    </BrowserRouter>
  );
}
