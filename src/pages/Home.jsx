import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Music from "../components/Music";
import Press from "../components/Press";
import Shows from "../components/Shows";
import Newsletter from "../components/Newsletter";
import Photos from "../components/Photos";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Music />
      <Press />
      <Shows />
      <Newsletter />
      <Photos />
      <Contact />
      <Footer />
    </>
  );
}
