// src/Components/About.js
import React, { useState, useEffect, useRef } from "react";
import "./About.css";
import { getAchievements } from "../utils/achievements";
import { Link } from 'react-router-dom'; // Added import

const About = () => {
  const [achievements, setAchievements] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    setAchievements(getAchievements());
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -420, // approx 1 card + gap
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 420,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="about" id="about">
      {/* Full-Width PCA About Section */}
      <div className="about-intro-section-full">
        <div className="about-intro-image-full">
          <img
            src="https://via.placeholder.com/800x400?text=Coconut+Farmers+Working"
            alt="Coconut Farmers Working Together"
          />
        </div>
        <div className="about-intro-content-full">
          <h2>About the Philippine Coconut Authority</h2>
          <p>
            The <strong>Philippine Coconut Authority (PCA)</strong> is a government agency under the Department of Agriculture committed to developing a sustainable and globally competitive coconut industry.
          </p>
          <p>
            Since its establishment, PCA has served as the lead agency for promoting the growth, development, and diversification of the coconut sector in the Philippines. Our mission is to uplift the lives of coconut farmers through research, enterprise development, and product innovation.
          </p>
          <p>
            Through programs like Community Enterprise Development, CocoHub Development, and Product Research & Innovation, PCA aims to create value, ensure food security, and promote inclusive growth within the industry.
          </p>
        </div>
      </div>

      {/* Achievements Title */}
      <div className="achievements-title">
        <h2>Achievements</h2>
      </div>

      {/* Carousel Wrapper with Navigation */}
      <div className="achievements-carousel">
        <button className="carousel-arrow left-arrow" onClick={scrollLeft}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="about-cards-container">
          <div className="about-cards" ref={scrollRef}>
            {achievements.length > 0 ? (
              achievements.map((item) => (
                <div className="about-card" key={item.id}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="card-image"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x250?text=Image+Not+Found";
                    }}
                  />
                  <div className="card-content">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <Link to={`/achievement/${item.id}`} className="btn">
                      VIEW PROGRAMS
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-achievements">No achievements posted yet.</p>
            )}
          </div>
        </div>

        <button className="carousel-arrow right-arrow" onClick={scrollRight}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </section>
  );
};

export default About;