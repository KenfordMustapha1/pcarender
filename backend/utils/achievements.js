// src/utils/achievements.js

const STORAGE_KEY = 'pca_achievements';

// Compress image to reduce base64 size
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            const compressedReader = new FileReader();
            compressedReader.onload = () => resolve(compressedReader.result);
            compressedReader.onerror = reject;
            compressedReader.readAsDataURL(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const saveAchievement = async (achievement) => {
  try {
    // If there's an image file (not just preview), compress it
    let imageUrl = achievement.imageUrl;
    if (achievement.imageFile) {
      imageUrl = await compressImage(achievement.imageFile);
    }

    const newAchievement = {
      ...achievement,
      imageUrl,
      imageFile: undefined, // Don't store File object
    };

    const existing = getAchievements();
    const updated = [newAchievement, ...existing];

    // Try to save
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      alert('Storage full! Please delete some achievements before adding more.');
    } else {
      console.error('Failed to save achievement:', error);
      alert('Failed to save achievement. See console for details.');
    }
    throw error;
  }
};

export const getAchievements = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('Failed to read achievements from localStorage:', error);
    return [];
  }
};

export const deleteAchievement = (id) => {
  try {
    const existing = getAchievements();
    const filtered = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete achievement:', error);
    alert('Failed to delete achievement.');
  }
};