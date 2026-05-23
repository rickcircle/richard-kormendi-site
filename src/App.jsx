import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Hire from "./pages/Hire";
import Epk from "./pages/Epk";
import Audit from "./pages/Audit";
import Proposal from "./pages/Proposal";
import Cursor from "./components/Cursor";

export default function App() {
  return (
    <BrowserRouter>
      <Cursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hire" element={<Hire />} />
        <Route path="/epk" element={<Epk />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/proposal/:id" element={<Proposal />} />
      </Routes>
    </BrowserRouter>
  );
}
