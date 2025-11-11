// src/Components/Profile.js
import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [gender, setGender] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [email, setEmail] = useState('');

  // STATE FOR ADDRESS
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [savedProvince, setSavedProvince] = useState('');
  const [savedCity, setSavedCity] = useState('');
  const [savedBarangay, setSavedBarangay] = useState('');

  // STATE FOR ADDRESS MODAL
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tempProvince, setTempProvince] = useState('');
  const [tempCity, setTempCity] = useState('');
  const [tempBarangay, setTempBarangay] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('name') || '';
    const storedGender = localStorage.getItem('profileGender') || '';
    const storedImage = localStorage.getItem('profileImage') || '';
    const storedEmail = localStorage.getItem('email') || '';

    // Retrieve saved address components
    const storedProvince = localStorage.getItem('profileProvince') || '';
    const storedCity = localStorage.getItem('profileCity') || '';
    const storedBarangay = localStorage.getItem('profileBarangay') || '';

    setName(storedName);
    setSavedName(storedName);
    setGender(storedGender);
    setImagePreview(storedImage);
    setEmail(storedEmail);

    // Set initial state for address components
    setProvince(storedProvince);
    setCity(storedCity);
    setBarangay(storedBarangay);
    setSavedProvince(storedProvince);
    setSavedCity(storedCity);
    setSavedBarangay(storedBarangay);
  }, []);

  // Define the address options based on the CSV data
  const addressOptions = {
    "Quezon": {
      "Lucena City": [
        "Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5",
        "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10",
        "Barangay 11", "Barra", "Bocohan", "Cotta", "Dalahican",
        "Domoit", "Gulang-Gulang", "Ibabang Dupay", "Ilayang Dupay", "Ibabang Iyam",
        "Ilayang Iyam", "Ibabang Talim", "Ilayang Talim", "Isabang", "Market View",
        "Mayao Castillo", "Mayao Crossing", "Ibabang Bukal", "Ilayang Bukal", "Mayao Kanluran",
        "Mayao Parada", "Mayao Silangan", "Ransohan"
      ],
      "Mauban": [
        "Abo-abo", "Alitap", "Baao", "Balaybalay", "Bato",
        "Bagong Bayan", "Cagbalete I", "Cagbalete II", "Cagsiay I", "Cagsiay II",
        "Cagsiay III", "Concepcion", "Liwayway", "Lucutan", "Luya-luya",
        "Macasin", "Lual", "Mabato", "Daungan", "Rizaliana",
        "Sadsaran", "Polo", "Remedios I", "Remedios II", "Rosario",
        "San Gabriel", "San Isidro", "San José", "San Lorenzo", "San Miguel",
        "San Rafael", "San Roque", "San Vicente", "Santa Lucía", "Santo Ángel",
        "Santo Niño", "Santol", "Soledad", "Tapucan", "Lual Rural"
      ],
      "Tayabas City": [
        "Alitao", "Alsam Ibaba", "Alsam Ilaya", "Alupay", "Angeles Zone I",
        "Angeles Zone II", "Angeles Zone III", "Angeles Zone IV", "Angustias Zone I", "Angustias Zone II",
        "Angustias Zone III", "Angustias Zone IV", "Anos", "Ayaas", "Baguio",
        "Banilad", "Ibabang Bukal", "Ilayang Bukal", "Calantas", "Calumpang",
        "Camaysa", "Dapdap", "Kanlurang Domoit", "Silangang Domoit", "Gibanga",
        "Ibas", "Ilasan Ibaba", "Ilasan Ilaya", "Ipilan", "Isabang",
        "Katigan Kanluran", "Katigan Silangan", "Lakawan", "Lalo", "Lawigue",
        "Lita", "Malaoa", "Masin", "Mate", "Mateuna",
        "Mayowe", "Ibabang Nangka", "Ilayang Nangka", "Opias", "Ibabang Palale",
        "Ilayang Palale", "Kanlurang Palale", "Silangang Palale", "Pandakaki", "Pook",
        "Potol", "San Diego Zone I", "San Diego Zone II", "San Diego Zone III", "San Diego Zone IV",
        "San Isidro Zone I", "San Isidro Zone II", "San Isidro Zone III", "San Isidro Zone IV", "San Roque Zone I",
        "San Roque Zone II", "Talolong", "Tamlong", "Tongko", "Valencia",
        "Wakas"
      ],
      "Lucban": [
        "Abang", "Aliliw", "Atulinao", "Ayuti", "Barangay 1",
        "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6",
        "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", "Igang",
        "Kabatete", "Kakawit", "Kalangay", "Kalyaat", "Kilib",
        "Kulapi", "Mahabang Parang", "Malupak", "Manasa", "May-It",
        "Nagsinamo", "Nalunao", "Palola", "Piis", "Samil",
        "Tiawe", "Tinamnan"
      ],
      "Sariaya": [
        "Antipolo", "Balubal", "Barangay 1", "Barangay 2", "Barangay 3",
        "Barangay 4", "Barangay 5", "Barangay 6", "Bignay 1", "Bignay 2",
        "Bucal", "Canda", "Castañas", "Concepcion Banahaw", "Concepcion 1",
        "Concepcion Palasan", "Concepcion Pinagbakuran", "Gibanga", "Guisguis San Roque", "Guisguis Talon",
        "Janagdong 1", "Janagdong 2", "Limbon", "Lutucan 1", "Lutucan Bata",
        "Lutucan Malabag", "Mamala 1", "Mamala 2", "Manggalang Bantilan", "Manggalang Kiling",
        "Manggalang Tulo-Tulo", "Montecillo", "Morong", "Pili", "Sampaloc 1",
        "Sampaloc 2", "Sampaloc Bogon", "Santo Cristo", "Talaan Aplaya", "Talaan Pantoc",
        "Tumbaga 1", "Tumbaga 2", "Poblacion Extension"
      ]
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 1048576) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setImagePreview(imageUrl);
        localStorage.setItem('profileImage', imageUrl);
      };
      reader.readAsDataURL(file);
    } else {
      alert("File is too large or invalid format.");
    }
  };

  // Handle opening address modal
  const handleAddressClick = () => {
    setTempProvince(province);
    setTempCity(city);
    setTempBarangay(barangay);
    setShowAddressModal(true);
  };

  // Handle confirming address selection
  const handleConfirmAddress = () => {
    setProvince(tempProvince);
    setCity(tempCity);
    setBarangay(tempBarangay);
    setShowAddressModal(false);
  };

  // Handle canceling address modal
  const handleCancelAddress = () => {
    setShowAddressModal(false);
  };

  // Get cities based on selected province
  const cities = tempProvince ? Object.keys(addressOptions[tempProvince] || {}) : [];
  
  // Get barangays based on selected province and city
  const barangays = tempProvince && tempCity ? addressOptions[tempProvince][tempCity] || [] : [];

  // Handle saving address along with other profile data
  const handleSave = () => {
    if (name.trim() === '') {
      alert('Please enter your name before saving.');
      return;
    }

    localStorage.setItem('name', name);
    localStorage.setItem('profileGender', gender);

    // Save address components
    localStorage.setItem('profileProvince', province);
    localStorage.setItem('profileCity', city);
    localStorage.setItem('profileBarangay', barangay);

    setSavedName(name);
    setSavedProvince(province);
    setSavedCity(city);
    setSavedBarangay(barangay);
    setSaveMessage('Changes have been saved.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const generateOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <p className="profile-subtext">Manage and protect your account</p>
      <div className="profile-content">
        <div className="left-section">
          <div className="form-group">
            <label>Username</label>
            <p className="text-readonly">
              {email ? email.split('@')[0] : 'N/A'}
            </p>
          </div>

          {/* ADDRESS SECTION */}
          <div className="form-group address-group">
            <label>Address</label>
            <input
              type="text"
              placeholder="Click to select Province / City / Barangay"
              value={province && city && barangay ? `${province} / ${city} / ${barangay}` : ''}
              readOnly
              onClick={handleAddressClick}
              style={{ cursor: 'pointer' }}
            />
          </div>
          {/* END ADDRESS SECTION */}

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <p className="text-readonly">{email || 'Not set'}</p>
          </div>

          <div className="form-group gender-group">
            <label>Gender</label>
            <div className="gender-options">
              <label>
                <input type="radio" name="gender" checked={gender === 'Male'} onChange={() => setGender('Male')} />
                <span className="radio-circle"></span> Male
              </label>
              <label>
                <input type="radio" name="gender" checked={gender === 'Female'} onChange={() => setGender('Female')} />
                <span className="radio-circle"></span> Female
              </label>
              <label>
                <input type="radio" name="gender" checked={gender === 'Other'} onChange={() => setGender('Other')} />
                <span className="radio-circle"></span> Other
              </label>
            </div>
            {gender && <p className="info-text">Selected: {gender}</p>}
          </div>

          <div className="form-group">
            <label>Date of birth</label>
            <div className="dob-select">
              <select><option value="">Day</option>{generateOptions(1, 31)}</select>
              <select><option value="">Month</option>{generateOptions(1, 12)}</select>
              <select><option value="">Year</option>{generateOptions(1950, 2024)}</select>
            </div>
          </div>

          <button className="save-btn" onClick={handleSave}>Save</button>
          {saveMessage && <p className="save-message">{saveMessage}</p>}
        </div>

        <div className="right-section">
          <div className="image-box">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" />
            ) : (
              <div className="placeholder"></div>
            )}
          </div>

          {savedName && <p className="saved-name">{savedName}</p>}
          {/* Display saved full address */}
          {savedProvince && savedCity && savedBarangay && (
            <p className="saved-address">
              {savedBarangay}, {savedCity}, {savedProvince}
            </p>
          )}

          <label htmlFor="image-upload" className="upload-btn">Select Image</label>
          <input
            type="file"
            id="image-upload"
            accept=".jpg, .jpeg, .png"
            onChange={handleImageChange}
            hidden
          />
        </div>
      </div>

      {/* ADDRESS MODAL */}
      {showAddressModal && (
        <div className="address-modal-overlay" onClick={handleCancelAddress}>
          <div className="address-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Select Address</h3>
            
            <div className="modal-form-group">
              <label>Province</label>
              <select
                value={tempProvince}
                onChange={(e) => {
                  setTempProvince(e.target.value);
                  setTempCity('');
                  setTempBarangay('');
                }}
              >
                <option value="">Select Province</option>
                {Object.keys(addressOptions).map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            <div className="modal-form-group">
              <label>City</label>
              <select
                value={tempCity}
                onChange={(e) => {
                  setTempCity(e.target.value);
                  setTempBarangay('');
                }}
                disabled={!tempProvince}
              >
                <option value="">Select City</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="modal-form-group">
              <label>Barangay</label>
              <select
                value={tempBarangay}
                onChange={(e) => setTempBarangay(e.target.value)}
                disabled={!tempCity}
              >
                <option value="">Select Barangay</option>
                {barangays.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="modal-buttons">
              <button className="modal-cancel-btn" onClick={handleCancelAddress}>Cancel</button>
              <button 
                className="modal-confirm-btn" 
                onClick={handleConfirmAddress}
                disabled={!tempProvince || !tempCity || !tempBarangay}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;