// src/components/Home.js
import React, { useState, useEffect } from "react";
import "./Home.css";

const sliderImages = [
  '/images/bg3.jpg',
  '/images/bg2.jpg',
  '/images/bg1.jpg',
];

const sliderText = [
  {
    title: "Building Resilience. Creating Opportunities.",
    description: "Supporting Coconut-Farming Communities Nationwide",
    buttonText: "Join Our Mission",
  },
  {
    title: "From Farm to World Markets",
    description: "Promoting Filipino-Made Coconut Products Globally",
    buttonText: "Discover Our Products",
  },
  {
    title: "Empowering Coconut Farmers",
    description: "Strengthening Livelihoods Across the Philippines",
    buttonText: "Learn More About Our Programs",
  },
];

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slider-wrapper" id="home"> {/* Added id="home" */}
      {/* Click Zones */}
      <div className="click-zone left" onClick={prevSlide}></div>
      <div className="click-zone right" onClick={nextSlide}></div>

      {/* Slider Track */}
      <div
        className="slider-track"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {sliderImages.map((img, index) => (
          <div key={index} className="slide">
            {/* Slide Background Image with Gradient */}
            <div className="slide-bg">
              <img src={img} alt={`slide-${index}`} />
            </div>

            {/* Text Overlay */}
            {currentSlide === index && (
              <div className="text-overlay">
                <h2>{sliderText[index].title}</h2>
                <p>{sliderText[index].description}</p>
                {sliderText[index].buttonText && (
                  <button className="learn-more">
                    {sliderText[index].buttonText}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
