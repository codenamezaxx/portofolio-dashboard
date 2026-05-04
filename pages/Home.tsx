import React from 'react';
import Hero from '../components/sections/Hero';
import Journey from '../components/sections/Journey';
import TechStack from '../components/sections/TechStack';
import Projects from '../components/sections/Projects';
import Achievements from '../components/sections/Achievements';
import Contacts from '../components/sections/Contacts';

const Home: React.FC = () => {
  return (
    <>
      <main className="flex flex-col">
        <Hero />
        <Journey />
        <TechStack />
        <Projects />
        <Achievements />
        <Contacts />
      </main>
      
      <footer className="py-8 border-t border-accent text-center text-muted text-sm bg-background">
        <p>© {new Date().getFullYear()} | Made by codenamezaxx.</p>
      </footer>
    </>
  );
};

export default Home;
