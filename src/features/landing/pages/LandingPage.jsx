import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import { StatsBar, Services, About, Footer } from '../components/Sections';

export default function LandingPage() {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #e8f6f0 0%, #dff0ea 30%, #e0f0f8 60%, #d6eaf8 100%)',
      minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Services />
        <About />
      </main>
      <Footer />
    </div>
  );
}
