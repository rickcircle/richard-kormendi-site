import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Hire from "./pages/Hire";
import Epk from "./pages/Epk";
import Casting from "./pages/Casting";
import Audit from "./pages/Audit";
import Proposal from "./pages/Proposal";
import Analytics from "./pages/Analytics";
import PressPage from "./pages/PressPage";
import DiscographyPage from "./pages/DiscographyPage";
import Cursor from "./components/Cursor";
import { track } from "./utils/track";

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    track("pageview");
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Cursor />
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hire" element={<Hire />} />
        <Route path="/epk" element={<Epk />} />
        <Route path="/casting" element={<Casting />} />
        <Route path="/press" element={<PressPage />} />
        <Route path="/discography" element={<DiscographyPage />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/proposal/:id" element={<Proposal />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}
