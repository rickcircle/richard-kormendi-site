import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Hire from "./pages/Hire";
import Epk from "./pages/Epk";
import Cursor from "./components/Cursor";

export default function App() {
  return (
    <BrowserRouter>
      <Cursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hire" element={<Hire />} />
        <Route path="/epk" element={<Epk />} />
      </Routes>
    </BrowserRouter>
  );
}
