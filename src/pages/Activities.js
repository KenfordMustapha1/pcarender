// src/pages/Activities.js
import React, { useState, useEffect } from 'react';
import './Activities.css';
import { saveAchievement, getAchievements, deleteAchievement } from '../utils/achievements';

const Activities = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [achievements, setAchievements] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !imageFile) {
      alert('Please fill in all fields and select an image.');
      return;
    }

    setIsPosting(true);

    try {
      const newAchievement = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        imageFile, // Pass the actual file for compression
      };

      await saveAchievement(newAchievement);
      setAchievements((prev) => [newAchievement, ...prev]);

      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      alert('Achievement posted successfully!');
    } catch (error) {
      // Error already handled in saveAchievement
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      deleteAchievement(id);
      setAchievements((prev) => prev.filter((item) => item.id !== id));
    }
  };

  useEffect(() => {
    setAchievements(getAchievements());
  }, []);

  return (
    <div className="activities-wrapper">
      <div className="page-header">
        <h1 className="page-title">Achievement Manager</h1>
        <p className="page-subtitle">Share and manage organizational achievements</p>
      </div>

      {/* Post Form */}
      <div className="post-form-section">
        <h2>Create New Achievement</h2>
        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter achievement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Describe the achievement"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Image</label>
            <div className="image-upload-container">
              {imagePreview ? (
                <div className="image-preview-wrapper">
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                  <label className="change-image-btn">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      hidden
                    />
                  </label>
                </div>
              ) : (
                <label className="upload-placeholder">
                  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Click to upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    hidden
                  />
                </label>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isPosting}>
            {isPosting ? 'Posting...' : 'Publish Achievement'}
          </button>
        </form>
      </div>

      {/* Posted Achievements Section */}
      <div className="achievements-section">
        <h2>Published Achievements</h2>
        {achievements.length > 0 ? (
          <div className="achievements-grid">
            {achievements.map((item) => (
              <div key={item.id} className="achievement-card">
                <div className="achievement-image-container">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="achievement-image"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                </div>
                <div className="achievement-content">
                  <h3 className="achievement-title">{item.title}</h3>
                  <p className="achievement-description">{item.description}</p>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDelete(item.id)}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <h3>No Achievements Yet</h3>
            <p>Start sharing your organization's accomplishments by creating your first achievement.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;