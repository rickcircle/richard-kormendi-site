import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Music from "../components/Music";
import Shows from "../components/Shows";
import Newsletter from "../components/Newsletter";
import Photos from "../components/Photos";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import StickyPlayer from "../components/StickyPlayer";
import PreSavePopup from "../components/PreSavePopup";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Music />
      <Shows />
      <Newsletter />
      <Photos />
      <Contact />
      <Footer />
      <StickyPlayer />
      <PreSavePopup />
    </>
  );
}
