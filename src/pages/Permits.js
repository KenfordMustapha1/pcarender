// permit.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './Permits.css'; // Make sure your Permits.css is updated if needed for new styles
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  // useMap, // Removed unused import
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Quezon Province simple GeoJSON
const quezonGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [121.2, 14.1],
            [121.6, 14.1],
            [121.6, 14.5],
            [121.2, 14.5],
            [121.2, 14.1],
          ],
        ],
      },
      properties: {
        name: 'Quezon Province',
      },
    },
  ],
};

const Permit = () => {
  const [registrations, setRegistrations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showMap, setShowMap] = useState(false); // State to toggle map visibility
  const [statusFilter, setStatusFilter] = useState('all'); // New state for status filter
  const [applicationTypeFilter, setApplicationTypeFilter] = useState('all'); // New state for application type filter
  // const [mobileView, setMobileView] = useState('table'); // Removed unused state - eslint-disable-line no-unused-vars

  // Function to fetch registrations
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/registrations/summary');
      setRegistrations(res.data);
    } catch (error) {
      console.error('Failed to fetch registrations', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchRegistrations();
    
    // Check screen size on load
    const checkScreenSize = () => {
      // For now, just set to table view since we're not using mobileView state
      // You can add mobile logic here if needed
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch details when selectedId changes
  useEffect(() => {
    if (!selectedId) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/registrations/${selectedId}`);
        setDetails(res.data);
      } catch (error) {
        console.error('Failed to fetch registration details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [selectedId]);

  // Filter and sort data using useMemo for performance
  const sortedData = useMemo(() => {
    let filtered = registrations.filter((reg) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        reg.applicationType?.toLowerCase().includes(query) ||
        reg.registrationnumber?.toLowerCase().includes(query) ||
        reg.status?.toLowerCase().includes(query) ||
        reg.registeredbusinessname?.toLowerCase().includes(query) ||
        reg.province?.toLowerCase().includes(query) ||
        reg.municipality?.toLowerCase().includes(query) ||
        reg.barangay?.toLowerCase().includes(query) ||
        (reg.landArea?.toString().includes(query)) // Include land area in search
      );
      
      const matchesStatus = statusFilter === 'all' || reg.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = applicationTypeFilter === 'all' || reg.applicationType?.toLowerCase() === applicationTypeFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesType;
    });

    return [...filtered].sort((a, b) => {
      const dateA = a.dateRegistration ? new Date(a.dateRegistration) : new Date(0);
      const dateB = b.dateRegistration ? new Date(b.dateRegistration) : new Date(0);
      return dateB - dateA; // Descending order (newest first)
    });
  }, [registrations, searchQuery, statusFilter, applicationTypeFilter]);

  // Get unique application types for filter dropdown
  const uniqueApplicationTypes = useMemo(() => {
    const types = new Set();
    registrations.forEach(reg => {
      if (reg.applicationType) types.add(reg.applicationType);
    });
    return Array.from(types);
  }, [registrations]);

  // ✅ Updated Handle Decision - Now sends email notification and closes modal
  const handleDecision = async (decision) => {
    if (!selectedId || !details) return;
    
    // Confirm action
    const confirmMessage = `Are you sure you want to ${decision} this application for "${details.registeredbusinessname}"?\n\nAn email notification will be sent to ${details.companyemailaddress}.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      
      // Update status in database (this will trigger email sending on backend)
      await axios.patch(
        `http://localhost:5000/api/registrations/${selectedId}/status`,
        { status: decision }
      );

      // Refresh the registrations list
      await fetchRegistrations();
      
      // Update current details
      setDetails((prev) => ({ ...prev, status: decision }));

      // Show success message
      setSuccessMessage(
        `Application ${decision} successfully! Email notification has been sent to ${details.companyemailaddress}.`
      );
      setShowSuccessModal(true);

      // Auto-close success modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);

      // ✅ Close the details modal after decision
      closeDetailsModal();

    } catch (error) {
      console.error(`Failed to ${decision} registration:`, error);
      alert(
        `Failed to ${decision} the application. Please check your internet connection and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Status badge class logic
  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'accepted':
        return 'status accepted';
      case 'rejected':
        return 'status rejected';
      default:
        return 'status pending';
    }
  };

  // Function to close the details modal
  const closeDetailsModal = () => {
    setSelectedId(null);
    setDetails(null);
  };

  // Create a custom icon for markers
  const createCustomIcon = (color) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:12px; height:12px; background:${color}; border-radius:50%; border: 2px solid white;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  // Get coordinates from details
  const getCoordinates = () => {
    if (details?.coordinates && details.coordinates.coordinates) {
      // coordinates.coordinates is [lng, lat]
      return [details.coordinates.coordinates[1], details.coordinates.coordinates[0]]; // [lat, lng]
    }
    return null;
  };

  // Get approved registrations for map
  const approvedRegistrations = useMemo(() => {
    return registrations.filter(reg => reg.status === 'accepted' && reg.coordinates && reg.coordinates.coordinates);
  }, [registrations]);

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Helper to render a form field row
  const renderField = (label, value, type = 'text') => (
    <div className="detail-row">
      <label className="detail-label">{label}</label>
      {type === 'link' ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="detail-value-link">
          {value}
        </a>
      ) : (
        <div className="detail-value">{value || 'N/A'}</div>
      )}
    </div>
  );

  // Mobile card view for small screens
  const renderMobileCard = (reg) => (
    <div key={reg._id} className="mobile-card">
      <div className="card-header">
        <h3>{reg.registeredbusinessname || 'N/A'}</h3>
        <span className={getStatusClass(reg.status)}>
          {reg.status || 'Pending'}
        </span>
      </div>
      <div className="card-body">
        <div className="card-row">
          <strong>Type:</strong>
          <span>{reg.applicationType || 'N/A'}</span>
        </div>
        <div className="card-row">
          <strong>Reg No:</strong>
          <span>{reg.previousPcaRegistrationNumber || 'N/A'}</span>
        </div>
        <div className="card-row">
          <strong>Location:</strong>
          <span>{reg.province || 'N/A'}, {reg.municipality || 'N/A'}</span>
        </div>
        <div className="card-row">
          <strong>Land Area:</strong>
          <span>{reg.landArea ? `${reg.landArea} ha` : 'N/A'}</span>
        </div>
        <div className="card-row">
          <strong>Date:</strong>
          <span>
            {reg.dateRegistration
              ? formatDate(reg.dateRegistration)
              : 'N/A'}
          </span>
        </div>
      </div>
      <div className="card-footer">
        <button
          className="view-btn"
          onClick={() => setSelectedId(reg._id)}
        >
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="permit-container">
      <h1 className="permit-title">Permit Registration Summary</h1>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search registrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-options">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          <select 
            className="filter-select"
            value={applicationTypeFilter}
            onChange={(e) => setApplicationTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {uniqueApplicationTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Toggle Button */}
      <div className="map-toggle-container">
        <button 
          className="toggle-map-btn" 
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? 'Hide Map' : 'Show Map Visualization'}
        </button>
      </div>

      {/* Map Visualization */}
      {showMap && (
        <div className="map-visualization-container">
          <MapContainer center={[14.35, 121.4]} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />

            <GeoJSON data={quezonGeoJSON} style={{ color: '#444', weight: 1, fillOpacity: 0 }} />

            {/* Markers for approved registrations */}
            {approvedRegistrations.map((reg) => {
              const coords = [reg.coordinates.coordinates[1], reg.coordinates.coordinates[0]]; // [lat, lng]
              const icon = createCustomIcon('#00FF00'); // Green for approved
              return (
                <Marker
                  key={reg._id}
                  position={coords}
                  icon={icon}
                >
                  <Popup>
                    <div>
                      <strong>{reg.registeredbusinessname}</strong><br/>
                      {reg.province}, {reg.municipality}, {reg.barangay}<br/>
                      Land Area: {reg.landArea ? `${reg.landArea} ha` : 'N/A'}<br/>
                      Status: <span className={getStatusClass(reg.status)}>{reg.status}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && <p className="loading-text">Loading...</p>}

      {/* Table Section */}
      {!loading && (
        <>
          {/* Desktop/Tablet View */}
          <div className="desktop-view">
            <div className="table-wrapper">
              <h2 className="table-title">Recent Permit Applications</h2>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>
                      <div className="table-header-cell">
                        <div className="modern-icon application-icon"></div>
                        <span>Application Type</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <div className="modern-icon business-icon"></div>
                        <span>Business Name</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <div className="modern-icon registration-icon"></div>
                        <span>Previous PCA Reg. No.</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <div className="modern-icon calendar-icon"></div>
                        <span>Validity Period</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <div className="modern-icon location-icon"></div>
                        <span>Province</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <div className="modern-icon location-icon"></div>
                        <span>Municipality</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <div className="modern-icon location-icon"></div>
                        <span>Barangay</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <div className="modern-icon land-icon"></div>
                        <span>Land Area (ha)</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <div className="modern-icon calendar-icon"></div>
                        <span>Date of Registration</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <div className="modern-icon status-icon"></div>
                        <span>Status</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <div className="modern-icon detail-icon"></div>
                        <span>Details</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="no-data">No registrations found.</td>
                    </tr>
                  ) : (
                    sortedData.map((reg) => (
                      <tr key={reg._id}>
                        <td>{reg.applicationType || 'N/A'}</td>
                        <td>{reg.registeredbusinessname || 'N/A'}</td>
                        <td>{reg.previousPcaRegistrationNumber || 'N/A'}</td>
                        <td>{reg.validityperiod || 'N/A'}</td>
                        <td>{reg.province || 'N/A'}</td>
                        <td>{reg.municipality || 'N/A'}</td>
                        <td>{reg.barangay || 'N/A'}</td>
                        <td>{reg.landArea ? `${reg.landArea} ha` : 'N/A'}</td>
                        <td>
                          {reg.dateRegistration
                            ? formatDate(reg.dateRegistration)
                            : 'N/A'}
                        </td>
                        <td>
                          <span className={getStatusClass(reg.status)}>
                            {reg.status || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => setSelectedId(reg._id)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-view">
            <h2 className="table-title">Recent Permit Applications</h2>
            {sortedData.length === 0 ? (
              <div className="no-data">No registrations found.</div>
            ) : (
              sortedData.map(renderMobileCard)
            )}
          </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content" style={{ maxWidth: '90vw', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '48px', color: '#28a745', marginBottom: '20px' }}>✓</div>
            <h2 style={{ color: '#28a745', marginBottom: '15px' }}>Success!</h2>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>{successMessage}</p>
            <button 
              className="close-btn" 
              onClick={() => setShowSuccessModal(false)}
              style={{ margin: '0 auto' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal - Admin View Details - NEW DESIGN */}
      {details && (
        <div
          className="modal-overlay"
          onClick={closeDetailsModal}
        >
          <div
            className="modal-content admin-modal registration-container"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '95vw', 
              maxHeight: '90vh', 
              overflowY: 'auto',
              width: '90%'
            }}
          >
            <div style={{ padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexDirection: window.innerWidth < 768 ? 'column' : 'row', gap: '10px' }}>
                <h2 style={{ margin: 0, textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>Registration Details</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: window.innerWidth < 768 ? 'center' : 'flex-end' }}>
                  <span className={getStatusClass(details.status)} style={{ padding: '5px 10px', borderRadius: '5px', fontSize: '14px' }}>
                    {details.status || 'Pending'}
                  </span>
                  <button
                    className="close-btn"
                    onClick={closeDetailsModal}
                    style={{ padding: '5px 10px', fontSize: '14px' }}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Notification Info */}
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', borderLeft: '4px solid #007bff' }}>
                <small style={{ color: '#666' }}>
                  📧 Notification email will be sent to: <strong>{details.companyemailaddress}</strong>
                </small>
              </div>

              {/* Application Details Section */}
              <fieldset style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '15px', borderRadius: '8px' }}>
                <legend style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Application Details</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                  {renderField('Type of Application', details.applicationType)}
                  {renderField('Previous PCA Registration Number', details.previousPcaRegistrationNumber)}
                  {renderField('Previous Official Receipt Number', details.previousOfficialReceiptNumber)}
                  {renderField('Date of Filing', formatDate(details.dateFiling))}
                  {renderField('Date of Registration', formatDate(details.dateRegistration))}
                </div>
              </fieldset>

              {/* Business Activity Section */}
              <fieldset style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '15px', borderRadius: '8px' }}>
                <legend style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Business Activity</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                  {renderField('Nature of Business', details.natureofbusiness)}
                  {renderField('Coconut or Oil Palm', details.pcaNumberActivity)}
                  {renderField('Farmer or Manufacturer', details.farmersormanufacturers)}
                  {renderField('Fund Source', details.fundsource)}
                  {renderField('Market', details.market)}
                  {renderField('Business Structure', details.businesstructure)}
                </div>
              </fieldset>

              {/* Business Profile & Contact Info Section */}
              <fieldset style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '15px', borderRadius: '8px' }}>
                <legend style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Business Profile & Contact Details</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                  {renderField('Registered Business Name', details.registeredbusinessname)}
                  {renderField('Company Website', details.companywebsite, 'link')}
                  {renderField('Company Email Address', details.companyemailaddress)}
                  {renderField('Office Address', details.officeaddress)}
                  {renderField('Tel No(S)/Fax No(S)', details.telno1)}
                  {renderField('Plant Address', details.plantaddress)}
                  {renderField('Tel No(S)/Fax No(S)', details.telono2)}
                  {/* LOCATION FIELDS */}
                  {renderField('Province', details.province)}
                  {renderField('Municipality', details.municipality)}
                  {renderField('Barangay', details.barangay)}
                  {renderField('Coordinates', details.coordinates && details.coordinates.coordinates 
                      ? `${details.coordinates.coordinates[1]}, ${details.coordinates.coordinates[0]}` // lat, lng
                      : details.specificCoordinates || 'N/A')}
                  {/* END LOCATION FIELDS */}
                  {/* NEW FIELD: Land Area */}
                  {renderField('Total Land Area (Hectares)', details.landArea ? `${details.landArea} ha` : 'N/A')}
                  {/* END NEW FIELD */}
                  {/* NEW FIELD: Tools and Equipment */}
                  {renderField('Tools and Equipment', details.toolsAndEquipment || 'N/A')}
                  {/* END NEW FIELD */}
                  {renderField('Contact Person', details.contactperson)}
                  {renderField('Contact Number', details.contactnumber)}
                  {renderField('Email Address', details.emailaddress)}
                </div>
              </fieldset>

              {/* Workforce Distribution Section */}
              <fieldset style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '15px', borderRadius: '8px' }}>
                <legend style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Workforce Distribution</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                  {renderField('Total Number of Employees', details.totalnumberofemployees)}
                  {renderField('Regular', details.regular)}
                  {renderField('Non-Regular/Job Order', details.nonregularorjoborder)}
                  {renderField('Senior Citizen', details.seniorcitizen)}
                  {renderField('PWD', details.pwd)}
                  {renderField('IPs', details.ips)}
                  {renderField('Year Established', details.yearestablished)}
                </div>
              </fieldset>

              {/* Financial Information Section */}
              <fieldset style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '15px', borderRadius: '8px' }}>
                <legend style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Financial Information</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                  {renderField('TIN Number', details.tinno)}
                  {renderField('VAT Number', details.vatno)}
                  {renderField('Authorized Capital (PHP)', details.authorizedcapitalphp)}
                  {renderField('Total Capitalization (PHP)', details.totalcapitalizationphp)}
                  {renderField('Working Capital (PHP)', details.workingcapitalphp)}
                  {renderField('Ownership', details.ownership)}
                  {renderField('Fiscal / Non-Fiscal Incentives', details.fiscalornonfiscal)}
                  {renderField('Validity Period', details.validityperiod)}
                </div>
              </fieldset>

              {/* Permits / License Section */}
              <fieldset style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '15px', borderRadius: '8px' }}>
                <legend style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Permits / License</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                  {renderField('Registration Number', details.registrationnumber)}
                  {renderField('Validity / Expiry Date', details.validityexpirydate)}
                </div>
              </fieldset>

              {/* File Attachments Section */}
              <fieldset style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '15px', borderRadius: '8px' }}>
                <legend style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Uploaded Documents</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                  <div className="detail-row">
                    <label className="detail-label">Notarized PCA</label>
                    {details.notarizedpca ? (
                      <a href={`http://localhost:5000/uploads/${details.notarizedpca}`} target="_blank" rel="noopener noreferrer" className="detail-value-link">
                        View File
                      </a>
                    ) : (
                      <div className="detail-value">No file uploaded</div>
                    )}
                  </div>
                  <div className="detail-row">
                    <label className="detail-label">DTI Registration</label>
                    {details.dti ? (
                      <a href={`http://localhost:5000/uploads/${details.dti}`} target="_blank" rel="noopener noreferrer" className="detail-value-link">
                        View File
                      </a>
                    ) : (
                      <div className="detail-value">No file uploaded</div>
                    )}
                  </div>
                  <div className="detail-row">
                    <label className="detail-label">Municipal Permit/License</label>
                    {details.municipalpermitlicense ? (
                      <a href={`http://localhost:5000/uploads/${details.municipalpermitlicense}`} target="_blank" rel="noopener noreferrer" className="detail-value-link">
                        View File
                      </a>
                    ) : (
                      <div className="detail-value">No file uploaded</div>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Location Visualization on Map */}
              {details.coordinates && details.coordinates.coordinates && (
                <fieldset style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '15px', borderRadius: '8px' }}>
                  <legend style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Location Visualization</legend>
                  <div style={{ height: '300px', width: '100%', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <MapContainer 
                      center={getCoordinates()} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="© OpenStreetMap contributors"
                      />
                      <GeoJSON data={quezonGeoJSON} style={{ color: '#444', weight: 1, fillOpacity: 0 }} />
                      <Marker
                        position={getCoordinates()}
                        icon={createCustomIcon('#FF0000')} // Red for the specific location
                      >
                        <Popup>
                          <div>
                            <strong>{details.registeredbusinessname}</strong><br/>
                            {details.province}, {details.municipality}, {details.barangay}<br/>
                            Land Area: {details.landArea ? `${details.landArea} ha` : 'N/A'}
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </fieldset>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', gap: '10px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
                <button
                  className="accept-btn"
                  onClick={() => handleDecision('accepted')}
                  disabled={details.status === 'accepted' || loading}
                  style={{ 
                    padding: '10px', 
                    fontSize: '16px',
                    width: window.innerWidth < 768 ? '100%' : 'auto'
                  }}
                >
                  {loading ? 'Processing...' : '✓ Accept & Notify'}
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleDecision('rejected')}
                  disabled={details.status === 'rejected' || loading}
                  style={{ 
                    padding: '10px', 
                    fontSize: '16px',
                    width: window.innerWidth < 768 ? '100%' : 'auto'
                  }}
                >
                  {loading ? 'Processing...' : '✗ Reject & Notify'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permit;