import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import HomeVideos from "../components/HomeVideos";
import Releases from "../components/Releases";
import Press from "../components/Press";
import Shows from "../components/Shows";
import Newsletter from "../components/Newsletter";
import Photos from "../components/Photos";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import "./Home.css";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="artist-home">
        <Hero />
        <About />
        <Releases compact />
        <HomeVideos />
        <Press compact />
        <Photos />
        <Shows />
        <Newsletter />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
