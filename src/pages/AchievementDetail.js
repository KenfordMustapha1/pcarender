// src/pages/AchievementDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAchievements } from '../utils/achievements';
import './AchievementDetail.css';

const AchievementDetail = () => {
  const { id } = useParams();
  const [achievement, setAchievement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const achievements = getAchievements();
    const foundAchievement = achievements.find(item => item.id === parseInt(id));
    setAchievement(foundAchievement);
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="achievement-detail-loading">Loading...</div>;
  }

  if (!achievement) {
    return <div className="achievement-detail-not-found">Achievement not found.</div>;
  }

  return (
    <div className="achievement-detail">
      <div className="achievement-detail-content">
        <div className="achievement-detail-image">
          <img 
            src={achievement.imageUrl} 
            alt={achievement.title}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/800x400?text=No+Image";
            }}
          />
        </div>
        <div className="achievement-detail-info">
          <h1 className="achievement-detail-title">{achievement.title}</h1>
          <p className="achievement-detail-description">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
};

export default AchievementDetail;