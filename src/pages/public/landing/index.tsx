import Hero from "./components/Hero";
import About from "./components/About";
import Sectors from "./components/Sectors";
import Procedure from "./components/Procedure";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <About />
      <Sectors />
      <Procedure />
      <Footer />
    </div>
  );
}