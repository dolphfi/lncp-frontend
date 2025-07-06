import React from "react";
import Home from "./Home";
import About from "./About";
import Programs from "./Programs";
import Staff from "./Staff";
import Gallery from "./Gallery";
import Admissions from "./Admissions";
import Contact from "./Contact";

const MainLayout = () => {
  return (
    <>
      <Home />
      <main>
        <About />
        <Programs />
        <Staff />
        <Gallery />
        <Admissions />
        <Contact />
      </main>
    </>
  );
};

export default MainLayout;
