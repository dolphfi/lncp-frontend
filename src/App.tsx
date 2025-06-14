import React from 'react';
import Navbar from './components/includes/Navbar';
import Footer from './components/includes/Footer';
import Home from './components/pages/Home';
import About from './components/pages/About';
import Programs from './components/pages/Programs';
import Admissions from './components/pages/Admissions';
import Contact from './components/pages/Contact';

function App() {
  return (
    <div className="bg-primary">
      <Navbar />
      <main>
        <Home />
        <About />
        <Programs />
        <Admissions />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;

