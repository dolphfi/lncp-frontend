import React from "react";
import Navbar from "./components/includes/Navbar";
import Footer from "./components/includes/Footer";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Programs from "./components/pages/Programs";
import Staff from "./components/pages/Staff";
import Admissions from "./components/pages/Admissions";
import Contact from "./components/pages/Contact";
import Gallery from "./components/pages/Gallery";


function App() {
  return (
    <div className="bg-white">
      <Navbar />
      {/* <Routes>
        <Route path="/" element={ */}
      <>
        <Home />
        <main
        // className="px-6 md:px-16 lg:px-32 pt-20 pb-16 md:pb-0"
        >
          <About />
          <Programs />
          <Staff />
          <Gallery />
          <Admissions />
          <Contact />
        </main>
        <Footer />
      </>
      {/* } />
        <Route path="/login" element={<Login />} />
      </Routes> */}
    </div>
  );
}

export default App;
