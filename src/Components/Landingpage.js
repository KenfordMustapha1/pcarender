// src/components/LandingPage.js
import React from "react";
import "./LandingPage.css";
import Home from "./Home";
import ContactUs from "./ContactUs";
import About from "./About";
import ClientLogo from "./ClientLogo";
import StepByStep from "./StepByStep";
  

const LandingPage = () => {
  return (
    <div className="landing-page">
      <section id="home">
        <Home />
      </section>

      <section id="about">
        <About />
      </section>
      
      <section id="clientlogo">
        <ClientLogo />
      </section>

       <section id="stepbystep">
        <StepByStep />
      </section>


      <section id="contact-us">
        <ContactUs />
      </section>
      

      <footer className="footer" id="footer">
        &copy; {new Date().getFullYear()} Philippine Coconut Authority. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
