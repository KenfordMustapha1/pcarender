import React, { useState } from 'react';
import './Marketnav.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import coconutOilImg from '../images/market-pic/coconut-oil.jpg';
import coconutMilkImg from '../images/market-pic/coconut-milk.jpg';
import coconutFlakesImg from '../images/market-pic/coconut-flaes.jpg';
import coconutVinegarImg from '../images/market-pic/coconut-vine.jpg';
import coconutWaterImg from '../images/market-pic/coconut-water.jpg';

import banner1 from '../images/market-pic/caro-main2.jpg';
import banner2 from '../images/market-pic/caro-main1.jpg';
import banner3 from '../images/market-pic/caro-main3.jpg';

function Market() {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const openModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  const categories = [
    { id: 1, name: 'Coconut Oil', image: coconutOilImg },
    { id: 2, name: 'Coconut Milk', image: coconutMilkImg },
    { id: 3, name: 'Coconut Flakes', image: coconutFlakesImg },
    { id: 4, name: 'Coconut Vinegar', image: coconutVinegarImg },
    { id: 5, name: 'Coconut Water', image: coconutWaterImg },
    { id: 6, name: 'Coconut Water', image: coconutWaterImg },
  ];

  const bannerItems = [
    { img: banner1, caption: "Fresh Coconut Product – Naturally Fermented" },
    { img: banner2, caption: "Premium Coconut Oil for a Healthier Life" },
    { img: banner3, caption: "Fresh Coconut Yogurt" }
  ];

  return (
    <div className="market-container">

      {/* Banner Carousel */}
      <div className="carousel-section-wrapper">
        <div className="top-banner">
          <Carousel
            autoPlay
            infiniteLoop
            showThumbs={false}
            showStatus={false}
            showIndicators={true}
            interval={3000}
          >
            {bannerItems.map((item, index) => (
              <div key={index} className="banner-slide">
                <img src={item.img} alt={`Slide ${index + 1}`} className="banner-image" />
                <p className="carousel-caption">{item.caption}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={closeModal}>×</button>
            <p>{modalMessage}</p>
          </div>
        </div>
      )}

      {/* Categories Header */}
      <div className="categories-header-container">
        <div className="categories-header">
          <h2 className="categories-title">Trending Categories</h2>
          <button
            className="show-more"
            onClick={() => openModal("Please log in to see more products.")}
          >
            Show More →
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-scroll-container">
        <div className="categories-scroll">
          {categories.map(category => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => openModal("Please log in to view this product.")}
            >
              <img
                src={category.image}
                alt={category.name}
                className="category-image"
              />
              <span className="category-name">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Market;
