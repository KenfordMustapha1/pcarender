import React from "react";
import "./ClientLogo.css";

const logos = [
  "/images/clientlog1.png",
  "/images/clientlog2.png",
  "/images/clientlog3.png",
  "/images/clientlog4.png",
  "/images/clientlog5.png",
];

const ClientLogos = () => {
  return (
    <section className="client-logos">
      {/* Top row - right scroll */}
      <div className="logos-slider right">
        <div className="logos-track">
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <img src={logo} alt={`Logo ${index + 1}`} key={`top-${index}`} />
          ))}
        </div>
      </div>

      {/* Bottom row - left scroll */}
      <div className="logos-slider left">
        <div className="logos-track">
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <img src={logo} alt={`Logo ${index + 1}`} key={`bottom-${index}`} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
