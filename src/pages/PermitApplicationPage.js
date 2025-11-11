import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PermitApplicationPage.css';

// --- CUT PERMIT FORM ---
function CutPermitForm({ formData, handleChange }) {
  const QUEZON_MUNICIPALITIES = [
    "Agdangan", "Alabat", "Atimonan", "Buenavista", "Burdeos", "Calauag",
    "Candelaria", "Catanauan", "Dolores", "General Luna", "General Nakar",
    "Guinayangan", "Gumaca", "Infanta", "Jomalig", "Lopez", "Lucban",
    "Lucena City", "Macalelon", "Mauban", "Mulanay", "Padre Burgos",
    "Pagbilao", "Panukulan", "Patnanungan", "Perez", "Pitogo", "Plaridel",
    "Polillo", "Quezon", "Real", "Sampaloc", "San Andres", "San Antonio",
    "San Francisco", "San Narciso", "Sariaya", "Tagkawayan", "Tayabas",
    "Tiaong", "Unisan"
  ];

  return (
    <>
      <div className="single-row">
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Name of Agriculturist *</label>
        <input
          type="text"
          name="nameOfAgriculturist"
          value={formData.nameOfAgriculturist || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Province (Tree Location) *</label>
        <input
          type="text"
          name="province"
          value="Quezon"
          readOnly
          className="readonly-field"
        />
      </div>
      <div className="single-row">
        <label>City or Municipality (Tree Location) *</label>
        <select
          name="cityOrMunicipality"
          value={formData.cityOrMunicipality || ''}
          onChange={handleChange}
        >
          <option value="">-- Select City/Municipality --</option>
          {QUEZON_MUNICIPALITIES.map((muni) => (
            <option key={muni} value={muni}>
              {muni}
            </option>
          ))}
        </select>
      </div>
      <div className="single-row">
        <label>Barangay *</label>
        <input
          type="text"
          name="brgy"
          value={formData.brgy || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Application Number *</label>
        <input
          type="text"
          name="applicationNumber"
          value={formData.applicationNumber || ''}
          onChange={handleChange}
        />
      </div>
      <div className="single-row">
        <label>Date of Filing *</label>
        <input
          type="date"
          name="dateOfFiling"
          value={formData.dateOfFiling || ''}
          onChange={handleChange}
        />
      </div>
      <div className="single-row">
        <label>Permit to Cut No. *</label>
        <input
          type="text"
          name="permitToCutNo"
          value={formData.permitToCutNo || ''}
          onChange={handleChange}
        />
      </div>
      <div className="single-row">
        <label>TCT No.</label>
        <input
          type="text"
          name="tctNo"
          value={formData.tctNo || ''}
          onChange={handleChange}
        />
      </div>
      <div className="single-row">
        <label>TDN No.</label>
        <input
          type="text"
          name="tdnNo"
          value={formData.tdnNo || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Date Issued *</label>
        <input
          type="date"
          name="dateIssued"
          value={formData.dateIssued || ''}
          onChange={handleChange}
        />
      </div>
      <div className="single-row">
        <label>Issued To *</label>
        <input
          type="text"
          name="issuedTo"
          value={formData.issuedTo || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Province of the Applicant *</label>
        <input
          type="text"
          name="applicantProvince"
          value="Quezon"
          readOnly
          className="readonly-field"
        />
      </div>
      <div className="single-row">
        <label>City or Municipality of the Applicant *</label>
        <select
          name="applicantCityOrMunicipality"
          value={formData.applicantCityOrMunicipality || ''}
          onChange={handleChange}
        >
          <option value="">-- Select City/Municipality --</option>
          {QUEZON_MUNICIPALITIES.map((muni) => (
            <option key={muni} value={muni}>
              {muni}
            </option>
          ))}
        </select>
      </div>

      <div className="single-row">
        <label>Number of Trees Being Applied for Cutting *</label>
        <input
          type="number"
          name="numberOfTreesApplied"
          value={formData.numberOfTreesApplied || ''}
          onChange={handleChange}
          min="1"
        />
      </div>
      <div className="single-row">
        <label>Number of Approved Trees for Cutting</label>
        <input
          type="number"
          name="numberOfApprovedTrees"
          value={formData.numberOfApprovedTrees || ''}
          onChange={handleChange}
          min="0"
        />
      </div>
      <div className="single-row">
        <label>Number of Seedlings Planted</label>
        <input
          type="number"
          name="numberOfSeedlingsPlanted"
          value={formData.numberOfSeedlingsPlanted || ''}
          onChange={handleChange}
          min="0"
        />
      </div>
      <div className="single-row">
        <label>Number of Seedling Replacements</label>
        <input
          type="number"
          name="numberOfSeedlingReplacements"
          value={formData.numberOfSeedlingReplacements || ''}
          onChange={handleChange}
          min="0"
        />
      </div>

      <div className="single-row">
        <label>Ground Cutting (Yes/No)</label>
        <input
          type="text"
          name="groundCutting"
          value={formData.groundCutting || ''}
          placeholder="e.g., Yes or No"
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>If Land Conversion, Input Conversion Order No. (else leave blank)</label>
        <input
          type="text"
          name="conversionOrderNo"
          value={formData.conversionOrderNo || ''}
          onChange={handleChange}
        />
      </div>
      <div className="single-row">
        <label>
          If Land Conversion, Input Date (YYYY-MM-DD). If not applicable, type <code>0</code>
        </label>
        <input
          type="text"
          name="landConversionDate"
          value={formData.landConversionDate || ''}
          placeholder="e.g., 2025-10-01 or 0"
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Est. Volume (in bd.ft.) per Tree</label>
        <input
          type="number"
          name="estimatedVolumePerTree"
          value={formData.estimatedVolumePerTree || ''}
          onChange={handleChange}
          step="0.01"
          min="0"
        />
      </div>
      <div className="single-row">
        <label>Official Receipt Number *</label>
        <input
          type="text"
          name="officialReceiptNumber"
          value={formData.officialReceiptNumber || ''}
          onChange={handleChange}
        />
      </div>
      <div className="single-row">
        <label>Date of the Receipt *</label>
        <input
          type="date"
          name="receiptDate"
          value={formData.receiptDate || ''}
          onChange={handleChange}
        />
      </div>
    </>
  );
}

// --- TRANSPORT PERMIT FORM ---
function TransportPermitForm({ formData, handleChange }) {
  const QUEZON_MUNICIPALITIES = [
    "Agdangan", "Alabat", "Atimonan", "Buenavista", "Burdeos", "Calauag",
    "Candelaria", "Catanauan", "Dolores", "General Luna", "General Nakar",
    "Guinayangan", "Gumaca", "Infanta", "Jomalig", "Lopez", "Lucban",
    "Lucena City", "Macalelon", "Mauban", "Mulanay", "Padre Burgos",
    "Pagbilao", "Panukulan", "Patnanungan", "Perez", "Pitogo", "Plaridel",
    "Polillo", "Quezon", "Real", "Sampaloc", "San Andres", "San Antonio",
    "San Francisco", "San Narciso", "Sariaya", "Tagkawayan", "Tayabas",
    "Tiaong", "Unisan"
  ];

  return (
    <>
      <div className="single-row">
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Applicant Name *</label>
        <input
          type="text"
          name="applicantName"
          value={formData.applicantName || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Registration Certificate No. *</label>
        <input
          type="text"
          name="registrationCertificateNo"
          value={formData.registrationCertificateNo || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Province *</label>
        <input
          type="text"
          name="province"
          value="Quezon"
          readOnly
          className="readonly-field"
        />
      </div>

      <div className="single-row">
        <label>Address of Applicant *</label>
        <input
          type="text"
          name="addressOfApplicant"
          value={formData.addressOfApplicant || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Transport Permit No. *</label>
        <input
          type="text"
          name="transportPermitNo"
          value={formData.transportPermitNo || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Registration Certificate Date *</label>
        <input
          type="date"
          name="registrationCertificateDate"
          value={formData.registrationCertificateDate || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Date Issued *</label>
        <input
          type="date"
          name="dateIssued"
          value={formData.dateIssued || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>PTC No.</label>
        <input
          type="text"
          name="ptcNo"
          value={formData.ptcNo || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>PCA Registration of Consignee (Name/Business Name) *</label>
        <input
          type="text"
          name="pcaConsigneeName"
          value={formData.pcaConsigneeName || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>PCA Registration of Consignee Destination *</label>
        <input
          type="text"
          name="pcaConsigneeDestination"
          value={formData.pcaConsigneeDestination || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Vehicle *</label>
        <input
          type="text"
          name="vehicle"
          value={formData.vehicle || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Registered Plate Number *</label>
        <input
          type="text"
          name="registeredPlateNumber"
          value={formData.registeredPlateNumber || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Authorized Driver *</label>
        <input
          type="text"
          name="authorizedDriver"
          value={formData.authorizedDriver || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Municipality/City (Origin) *</label>
        <select
          name="municipalityOrigin"
          value={formData.municipalityOrigin || ''}
          onChange={handleChange}
        >
          <option value="">-- Select Municipality/City --</option>
          {QUEZON_MUNICIPALITIES.map((muni) => (
            <option key={muni} value={muni}>
              {muni}
            </option>
          ))}
        </select>
      </div>

      <div className="single-row">
        <label>Barangay (Origin) *</label>
        <input
          type="text"
          name="brgyOrigin"
          value={formData.brgyOrigin || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Destination *</label>
        <input
          type="text"
          name="destination"
          value={formData.destination || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Volume *</label>
        <input
          type="number"
          name="volume"
          value={formData.volume || ''}
          onChange={handleChange}
          min="0"
          step="0.01"
        />
      </div>

      <div className="single-row">
        <label>Period of Effectivity (Start) *</label>
        <input
          type="date"
          name="effectivityStart"
          value={formData.effectivityStart || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Period of Effectivity (End) *</label>
        <input
          type="date"
          name="effectivityEnd"
          value={formData.effectivityEnd || ''}
          onChange={handleChange}
        />
      </div>

      <div className="single-row">
        <label>Official Receipt No. *</label>
        <input
          type="text"
          name="officialReceiptNo"
          value={formData.officialReceiptNo || ''}
          onChange={handleChange}
        />
      </div>
    </>
  );
}

// --- MAIN COMPONENT ---
function PermitApplicationPage() {
  const navigate = useNavigate();

  const [permitType, setPermitType] = useState('');
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files: inputFiles } = e.target;
    if (type === 'file') {
      setFiles((prev) => ({ ...prev, [name]: inputFiles[0] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePermitTypeSelect = (type) => {
    setPermitType(type);
    setStep(1);
  };

  const validateStep = () => {
    setErrorMessage('');
    if (step === 1) {
      if (permitType === 'transport') {
        const requiredFields = [
          'email',
          'applicantName',
          'registrationCertificateNo',
          'addressOfApplicant',
          'transportPermitNo',
          'registrationCertificateDate',
          'dateIssued',
          'pcaConsigneeName',
          'pcaConsigneeDestination',
          'vehicle',
          'registeredPlateNumber',
          'authorizedDriver',
          'municipalityOrigin',
          'brgyOrigin',
          'destination',
          'volume',
          'effectivityStart',
          'effectivityEnd',
          'officialReceiptNo'
        ];

        for (const field of requiredFields) {
          if (!formData[field]?.toString().trim()) {
            const label = field
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());
            return `${label} is required.`;
          }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          return 'Valid Email is required.';
        }

        if (new Date(formData.effectivityEnd) < new Date(formData.effectivityStart)) {
          return 'Period of Effectivity End must be on or after Start date.';
        }

        if (parseFloat(formData.volume) <= 0) {
          return 'Volume must be greater than zero.';
        }
      } else if (permitType === 'cut') {
        const requiredFields = [
          'email',
          'nameOfAgriculturist',
          'cityOrMunicipality',
          'brgy',
          'applicationNumber',
          'dateOfFiling',
          'permitToCutNo',
          'dateIssued',
          'issuedTo',
          'applicantCityOrMunicipality',
          'numberOfTreesApplied',
          'officialReceiptNumber',
          'receiptDate'
        ];

        for (const field of requiredFields) {
          if (!formData[field]?.toString().trim()) {
            const label = field
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());
            return `${label} is required.`;
          }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          return 'Valid Email is required.';
        }

        const numTrees = Number(formData.numberOfTreesApplied);
        if (isNaN(numTrees) || numTrees <= 0) {
          return 'Number of Trees Being Applied for Cutting must be a positive number.';
        }

        const convDate = formData.landConversionDate?.trim();
        if (convDate && convDate !== '0') {
          const parsed = new Date(convDate);
          if (isNaN(parsed.getTime()) || convDate.length !== 10) {
            return 'Land Conversion Date must be a valid date (YYYY-MM-DD) or "0".';
          }
        }
      }
    } else if (step === 2) {
      if (!files.supportingDoc) return 'Please upload a supporting document.';
      if (!files.idCopy) return 'Please upload a valid ID copy.';
    }
    return null;
  };

  const goToNext = () => {
    const error = validateStep();
    if (error) {
      setErrorMessage(error);
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const goToPrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateStep();
    if (error) {
      setErrorMessage(error);
      return;
    }

    const submissionData = new FormData();
    submissionData.append('permitType', permitType);
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, value);
    });
    Object.entries(files).forEach(([key, file]) => {
      submissionData.append(key, file);
    });

    try {
      const res = await fetch('http://localhost:5000/apply-permit', {
        method: 'POST',
        body: submissionData,
      });

      if (res.ok) {
        setShowSuccess(true);
        // ✅ DO NOT auto-redirect — wait for user to click Close
      } else {
        const data = await res.json();
        setErrorMessage(data.message || 'Submission failed.');
      }
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
    }
  };

  const renderContent = () => {
    if (step === 0) {
      return (
        <div className="permit-type-selection">
          <h3>Select Permit Type</h3>
          <div className="type-buttons">
            <button
              type="button"
              className="type-btn"
              onClick={() => handlePermitTypeSelect('transport')}
            >
              Permit to Transport
            </button>
            <button
              type="button"
              className="type-btn"
              onClick={() => handlePermitTypeSelect('cut')}
            >
              Permit to Cut
            </button>
          </div>
        </div>
      );
    }

    if (step === 1) {
      return (
        <>
          <h3>{permitType === 'transport' ? 'Permit to Transport' : 'Permit to Cut'}</h3>
          {permitType === 'transport' && (
            <TransportPermitForm formData={formData} handleChange={handleChange} />
          )}
          {permitType === 'cut' && (
            <CutPermitForm formData={formData} handleChange={handleChange} />
          )}
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <h3>Upload Documents</h3>
          <div className="single-row">
            <label>Supporting Document (e.g., Land Ownership, Authorization) *</label>
            <input type="file" name="supportingDoc" onChange={handleChange} />
          </div>
          <div className="single-row">
            <label>Valid ID Copy (e.g., Passport, Driver’s License) *</label>
            <input type="file" name="idCopy" onChange={handleChange} />
          </div>
        </>
      );
    }
  };

  return (
    <div className="permit-application-container">
      <h2>Permit Application</h2>
      <p className="note">
        Select the type of permit you wish to apply for. All fields marked with * are required.
      </p>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {renderContent()}

        {errorMessage && <p className="error">{errorMessage}</p>}

        <div className="button-container">
          {step > 0 && (
            <button type="button" className="btn-back" onClick={goToPrev}>
              Back
            </button>
          )}
          {step < 2 ? (
            <button type="button" className="btn-next" onClick={goToNext}>
              Next
            </button>
          ) : (
            <button type="submit" className="btn-submit">
              Submit Application
            </button>
          )}
        </div>
      </form>

      {showSuccess && (
        <div className="success-popup">
          <div className="success-icon">
            <span>✅</span>
          </div>
          <h2>Permit Application Submitted!</h2>
          <p>Your application is under review. You will be notified via email.</p>
          <button
            onClick={() => {
              setShowSuccess(false);
              navigate(-1); // 👈 Go back to previous page
              // If you prefer to go to homepage, use: navigate('/');
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default PermitApplicationPage;