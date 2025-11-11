import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './Allpermit.css';

const AllPermits = () => {
  const [permits, setPermits] = useState([]);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch permits
  const fetchPermits = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/permits');
      setPermits(res.data);
    } catch (error) {
      console.error('Failed to fetch permits:', error);
      alert('Failed to load permits. Please check the console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
  }, []);

  // Filter & sort
  const filteredPermits = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = permits.filter((permit) => {
      return (
        (permit.permitType && permit.permitType.toLowerCase().includes(query)) ||
        (permit.applicationNumber && permit.applicationNumber.toLowerCase().includes(query)) ||
        (permit.transportPermitNo && permit.transportPermitNo.toLowerCase().includes(query)) ||
        (permit.registrationCertificateNo && permit.registrationCertificateNo.toLowerCase().includes(query)) ||
        (permit.issuedTo && permit.issuedTo.toLowerCase().includes(query)) ||
        (permit.applicantName && permit.applicantName.toLowerCase().includes(query)) ||
        (permit.status && permit.status.toLowerCase().includes(query)) ||
        (permit.permitToCutNo && permit.permitToCutNo.toLowerCase().includes(query)) ||
        (permit.email && permit.email.toLowerCase().includes(query))
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = a.dateOfFiling || a.dateIssued ? new Date(a.dateOfFiling || a.dateIssued) : new Date(0);
      const dateB = b.dateOfFiling || b.dateIssued ? new Date(b.dateOfFiling || b.dateIssued) : new Date(0);
      return dateB - dateA; // Newest first
    });
  }, [permits, searchQuery]);

  // Status styling
  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return 'status-badge approved';
      case 'rejected':
        return 'status-badge rejected';
      default:
        return 'status-badge pending';
    }
  };

  // Display label for permit type
  const getPermitTypeLabel = (type) => {
    if (type === 'cut') return 'Permit to Cut';
    if (type === 'transport') return 'Permit to Transport';
    return 'Unknown';
  };

  // Get reference number
  const getReferenceNumber = (permit) => {
    if (permit.permitType === 'cut') {
      return permit.applicationNumber || 'N/A';
    } else {
      return permit.transportPermitNo || permit.registrationCertificateNo || 'N/A';
    }
  };

  // Helper Component: Detail Row
  const DetailRow = ({ label, value }) => (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );

  return (
    <div className="admin-permits-container">
      <div className="admin-header">
        <h1>All Permit Applications</h1>
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search by reference, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading permits...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="permits-table-wrapper">
          {filteredPermits.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3h20v18H2z" />
                <path d="M8 12h8" />
                <path d="M8 16h4" />
              </svg>
              <h3>No permits found</h3>
              <p>Try adjusting your search or submit a new application.</p>
            </div>
          ) : (
            <table className="permits-table">
              <thead>
                <tr>
                  <th>Permit Type</th>
                  <th>Reference No.</th>
                  <th>Applicant / Issued To</th>
                  <th>Date Filed</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPermits.map((permit) => (
                  <tr key={permit._id}>
                    <td>
                      <span className="permit-type-tag">
                        {getPermitTypeLabel(permit.permitType)}
                      </span>
                    </td>
                    <td>{getReferenceNumber(permit)}</td>
                    <td>{permit.issuedTo || permit.applicantName || '—'}</td>
                    <td>
                      {permit.dateOfFiling
                        ? new Date(permit.dateOfFiling).toLocaleDateString()
                        : permit.dateIssued
                        ? new Date(permit.dateIssued).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <span className={getStatusClass(permit.status)}>
                        {permit.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn view"
                        onClick={() => setSelectedPermit(permit)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODERN MODAL */}
      {selectedPermit && (
        <div className="modern-modal-overlay" onClick={() => setSelectedPermit(null)}>
          <div className="modern-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <h2>Permit Application Details</h2>
              <button
                className="modern-modal-close"
                onClick={() => setSelectedPermit(null)}
              >
                ✕
              </button>
            </div>

            <div className="modern-modal-body">
              {/* Basic Info */}
              <div className="modal-card">
                <h3>Basic Information</h3>
                <div className="modal-grid">
                  <DetailRow label="Permit Type" value={getPermitTypeLabel(selectedPermit.permitType)} />
                  <DetailRow label="Email" value={selectedPermit.email || '—'} />
                  <DetailRow 
                    label="Status" 
                    value={
                      <span className={`status-badge ${selectedPermit.status?.toLowerCase() || 'pending'}`}>
                        {selectedPermit.status || 'Pending'}
                      </span>
                    } 
                  />
                  <DetailRow 
                    label="Date Filed" 
                    value={
                      selectedPermit.dateOfFiling
                        ? new Date(selectedPermit.dateOfFiling).toLocaleDateString()
                        : selectedPermit.dateIssued
                        ? new Date(selectedPermit.dateIssued).toLocaleDateString()
                        : '—'
                    } 
                  />
                </div>
              </div>

              {/* Cut Permit Details */}
              {selectedPermit.permitType === 'cut' && (
                <div className="modal-card">
                  <h3>Permit to Cut Details</h3>
                  <div className="modal-grid">
                    <DetailRow label="Application Number" value={selectedPermit.applicationNumber || '—'} />
                    <DetailRow label="Name of Agriculturist" value={selectedPermit.nameOfAgriculturist || '—'} />
                    <DetailRow 
                      label="Tree Location" 
                      value={`${selectedPermit.cityOrMunicipality || '—'}, ${selectedPermit.brgy || '—'}, Quezon`} 
                    />
                    <DetailRow label="Permit to Cut No." value={selectedPermit.permitToCutNo || '—'} />
                    <DetailRow label="TCT No." value={selectedPermit.tctNo || '—'} />
                    <DetailRow label="TDN No." value={selectedPermit.tdnNo || '—'} />
                    <DetailRow 
                      label="Date Issued" 
                      value={
                        selectedPermit.dateIssued
                          ? new Date(selectedPermit.dateIssued).toLocaleDateString()
                          : '—'
                      } 
                    />
                    <DetailRow label="Issued To" value={selectedPermit.issuedTo || '—'} />
                    <DetailRow 
                      label="Applicant Municipality" 
                      value={selectedPermit.applicantCityOrMunicipality || '—'} 
                    />
                    <DetailRow label="Trees Applied For" value={selectedPermit.numberOfTreesApplied || '—'} />
                    <DetailRow label="Approved Trees" value={selectedPermit.numberOfApprovedTrees || '—'} />
                    <DetailRow label="Seedlings Planted" value={selectedPermit.numberOfSeedlingsPlanted || '—'} />
                    <DetailRow 
                      label="Seedling Replacements" 
                      value={selectedPermit.numberOfSeedlingReplacements || '—'} 
                    />
                    <DetailRow label="Ground Cutting" value={selectedPermit.groundCutting || '—'} />
                    <DetailRow label="Conversion Order No." value={selectedPermit.conversionOrderNo || '—'} />
                    <DetailRow label="Land Conversion Date" value={selectedPermit.landConversionDate || '—'} />
                    <DetailRow 
                      label="Est. Volume per Tree (bd.ft.)" 
                      value={selectedPermit.estimatedVolumePerTree || '—'} 
                    />
                    <DetailRow label="Official Receipt No." value={selectedPermit.officialReceiptNumber || '—'} />
                    <DetailRow 
                      label="Receipt Date" 
                      value={
                        selectedPermit.receiptDate
                          ? new Date(selectedPermit.receiptDate).toLocaleDateString()
                          : '—'
                      } 
                    />
                  </div>
                </div>
              )}

              {/* Transport Permit Details */}
              {selectedPermit.permitType === 'transport' && (
                <div className="modal-card">
                  <h3>Permit to Transport Details</h3>
                  <div className="modal-grid">
                    <DetailRow label="Applicant Name" value={selectedPermit.applicantName || '—'} />
                    <DetailRow 
                      label="Registration Certificate No." 
                      value={selectedPermit.registrationCertificateNo || '—'} 
                    />
                    <DetailRow label="Address of Applicant" value={selectedPermit.addressOfApplicant || '—'} />
                    <DetailRow label="Transport Permit No." value={selectedPermit.transportPermitNo || '—'} />
                    <DetailRow 
                      label="Registration Certificate Date" 
                      value={
                        selectedPermit.registrationCertificateDate
                          ? new Date(selectedPermit.registrationCertificateDate).toLocaleDateString()
                          : '—'
                      } 
                    />
                    <DetailRow 
                      label="Date Issued" 
                      value={
                        selectedPermit.dateIssued
                          ? new Date(selectedPermit.dateIssued).toLocaleDateString()
                          : '—'
                      } 
                    />
                    <DetailRow label="PTC No." value={selectedPermit.ptcNo || '—'} />
                    <DetailRow label="PCA Consignee Name" value={selectedPermit.pcaConsigneeName || '—'} />
                    <DetailRow 
                      label="PCA Consignee Destination" 
                      value={selectedPermit.pcaConsigneeDestination || '—'} 
                    />
                    <DetailRow label="Vehicle" value={selectedPermit.vehicle || '—'} />
                    <DetailRow label="Plate Number" value={selectedPermit.registeredPlateNumber || '—'} />
                    <DetailRow label="Authorized Driver" value={selectedPermit.authorizedDriver || '—'} />
                    <DetailRow label="Origin Municipality" value={selectedPermit.municipalityOrigin || '—'} />
                    <DetailRow label="Origin Barangay" value={selectedPermit.brgyOrigin || '—'} />
                    <DetailRow label="Destination" value={selectedPermit.destination || '—'} />
                    <DetailRow label="Volume" value={selectedPermit.volume || '—'} />
                    <DetailRow 
                      label="Effectivity Start" 
                      value={
                        selectedPermit.effectivityStart
                          ? new Date(selectedPermit.effectivityStart).toLocaleDateString()
                          : '—'
                      } 
                    />
                    <DetailRow 
                      label="Effectivity End" 
                      value={
                        selectedPermit.effectivityEnd
                          ? new Date(selectedPermit.effectivityEnd).toLocaleDateString()
                          : '—'
                      } 
                    />
                    <DetailRow label="Official Receipt No." value={selectedPermit.officialReceiptNo || '—'} />
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="modal-card">
                <h3>Uploaded Documents</h3>
                <div className="modal-grid">
                  <div className="document-item">
                    <label>Supporting Document</label>
                    {selectedPermit.supportingDoc ? (
                      <a
                        href={`http://localhost:5000/uploads/${selectedPermit.supportingDoc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="document-link"
                      >
                        📄 View Supporting Document
                      </a>
                    ) : (
                      <span className="no-file">Not uploaded</span>
                    )}
                  </div>
                  <div className="document-item">
                    <label>Valid ID Copy</label>
                    {selectedPermit.idCopy ? (
                      <a
                        href={`http://localhost:5000/uploads/${selectedPermit.idCopy}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="document-link"
                      >
                        📄 View ID Copy
                      </a>
                    ) : (
                      <span className="no-file">Not uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modern-modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedPermit(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPermits;