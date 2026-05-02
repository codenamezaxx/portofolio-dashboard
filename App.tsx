import React from 'react';
import Navbar from './components/layout/Navbar';
import BackgroundGrid from './components/shared/BackgroundGrid';
import Hero from './components/sections/Hero';
import Journey from './components/sections/Journey';
import TechStack from './components/sections/TechStack';
import Projects from './components/sections/Projects';
import Achievements from './components/sections/Achievements';
import Contacts from './components/sections/Contacts';

const App: React.FC = () => {
  return (
    <div className="antialiased text-primary selection:bg-accent/30 selection:text-white">
      <BackgroundGrid />
      <Navbar />
      
      <main className="flex flex-col">
        <Hero />
        <Journey />
        <TechStack />
        <Projects />
        <Achievements />
        <Contacts />
      </main>
      
      <footer className="py-8 border-t border-accent/10 text-center text-muted text-sm bg-background">
        <p>© {new Date().getFullYear()} | Made by codenamezaxx.</p>
      </footer>
    </div>
  );
};

export default App;