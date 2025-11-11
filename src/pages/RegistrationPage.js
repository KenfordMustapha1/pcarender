// RegistrationPage.js
import React, { useState, useEffect } from 'react';
import './RegistrationPage.css';
// Sample data for provinces, municipalities, and barangays in Quezon
const LOCATION_DATA = {
  Quezon: {
    municipalities: [
      "Lucena City",
      "Tayabas City", 
      "Calauag",
      "Unisan",
      "Sariaya",
      "Gumaca",
      "Mauban",
      "Padre Burgos",
      "Tiaong",
      "Agdangan",
      "Alabat",
      "Atimonan",
      "Buenavista",
      "Burdeos",
      "Catanauan",
      "Dolores",
      "General Luna",
      "General Nakar",
      "Guinayangan",
      "Gumaca",
      "Infanta",
      "Jomalig",
      "Lopez",
      "Magdalena",
      "Mulanay",
      "Patnanungan",
      "Perez",
      "Pitogo",
      "Plaridel",
      "Polillo",
      "Quezon",
      "Real",
      "Sampaloc",
      "San Andres",
      "San Antonio",
      "San Francisco",
      "San Narciso",
      "Tagkawayan",
      "Zambales"
    ],
    barangays: {
      "Lucena City": [
        "Almacen",
        "Banaybanay",
        "Barangay I",
        "Barangay II", 
        "Barangay III",
        "Barangay IV",
        "Barangay V",
        "Barangay VI",
        "Barangay VII",
        "Barangay VIII",
        "Barangay IX",
        "Barangay X",
        "Barangay XI",
        "Barangay XII",
        "Barangay XIII",
        "Barangay XIV",
        "Barangay XV",
        "Barangay XVI",
        "Barangay XVII",
        "Barangay XVIII",
        "Barangay XIX",
        "Barangay XX",
        "Baticulin",
        "Bitoon",
        "Bolo",
        "Burgos",
        "Caganhao",
        "Calumpang",
        "Cawayan",
        "Dampol",
        "Del Rosario",
        "Dungo",
        "Fatima",
        "Ibaba",
        "Inosloban",
        "Irawan",
        "Kalilangan",
        "Kanluran",
        "Kinabig",
        "Kinabuayan",
        "Laloma",
        "Libtong",
        "Lourdes",
        "Luzviminda",
        "Mabini",
        "Malate",
        "Manggahan",
        "Maniago",
        "Masagana",
        "Naparing",
        "Panghulo",
        "Pansol",
        "Pantaleon",
        "Paye",
        "Poblacion",
        "Rizal",
        "Salvacion",
        "San Benito",
        "San Francisco",
        "San Isidro",
        "San Jose",
        "San Miguel",
        "San Roque",
        "San Vicente",
        "Santa Cruz",
        "Santa Fe",
        "Santa Maria",
        "Santo Domingo",
        "Santo Niño",
        "Sikatuna",
        "Tabigue",
        "Tagumpay",
        "Tambac",
        "Tinapian",
        "Tumapon"
      ],
      "Tayabas City": [
        "Barangay I",
        "Barangay II",
        "Barangay III",
        "Barangay IV",
        "Barangay V",
        "Barangay VI",
        "Barangay VII",
        "Barangay VIII",
        "Barangay IX",
        "Barangay X",
        "Barangay XI",
        "Barangay XII",
        "Barangay XIII",
        "Barangay XIV",
        "Barangay XV",
        "Barangay XVI",
        "Barangay XVII",
        "Barangay XVIII",
        "Barangay XIX",
        "Barangay XX",
        "Barangay XXI",
        "Barangay XXII",
        "Barangay XXIII",
        "Barangay XXIV",
        "Barangay XXV",
        "Barangay XXVI",
        "Barangay XXVII",
        "Barangay XXVIII",
        "Barangay XXIX",
        "Barangay XXX",
        "Barangay XXXI",
        "Barangay XXXII",
        "Barangay XXXIII",
        "Barangay XXXIV",
        "Barangay XXXV",
        "Barangay XXXVI",
        "Barangay XXXVII",
        "Barangay XXXVIII",
        "Barangay XXXIX",
        "Barangay XL",
        "Barangay XLI",
        "Barangay XLII",
        "Barangay XLIII",
        "Barangay XLIV",
        "Barangay XLV",
        "Barangay XLVI",
        "Barangay XLVII",
        "Barangay XLVIII",
        "Barangay XLIX",
        "Barangay L",
        "Barangay LI",
        "Barangay LII",
        "Barangay LIII",
        "Barangay LIV",
        "Barangay LV",
        "Barangay LVI",
        "Barangay LVII",
        "Barangay LVIII",
        "Barangay LIX",
        "Barangay LX",
        "Barangay LXI",
        "Barangay LXII",
        "Barangay LXIII",
        "Barangay LXIV",
        "Barangay LXV",
        "Barangay LXVI",
        "Barangay LXVII",
        "Barangay LXVIII",
        "Barangay LXIX",
        "Barangay LXX",
        "Barangay LXXI",
        "Barangay LXXII",
        "Barangay LXXIII",
        "Barangay LXXIV",
        "Barangay LXXV",
        "Barangay LXXVI",
        "Barangay LXXVII",
        "Barangay LXXVIII",
        "Barangay LXXIX",
        "Barangay LXXX",
        "Barangay LXXXI",
        "Barangay LXXXII",
        "Barangay LXXXIII",
        "Barangay LXXXIV",
        "Barangay LXXXV",
        "Barangay LXXXVI",
        "Barangay LXXXVII",
        "Barangay LXXXVIII",
        "Barangay LXXXIX",
        "Barangay XC",
        "Barangay XCI",
        "Barangay XCII",
        "Barangay XCIII",
        "Barangay XCIV",
        "Barangay XCV",
        "Barangay XCVI",
        "Barangay XCVII",
        "Barangay XCVIII",
        "Barangay XCIX",
        "Barangay C",
        "Barangay CI",
        "Barangay CII",
        "Barangay CIII",
        "Barangay CIV",
        "Barangay CV",
        "Barangay CVI",
        "Barangay CVII",
        "Barangay CVIII",
        "Barangay CIX",
        "Barangay CX",
        "Barangay CXI",
        "Barangay CXII",
        "Barangay CXIII",
        "Barangay CXIV",
        "Barangay CXV",
        "Barangay CXVI",
        "Barangay CXVII",
        "Barangay CXVIII",
        "Barangay CXIX",
        "Barangay CXX",
        "Barangay CXXI",
        "Barangay CXXII",
        "Barangay CXXIII",
        "Barangay CXXIV",
        "Barangay CXXV",
        "Barangay CXXVI",
        "Barangay CXXVII",
        "Barangay CXXVIII",
        "Barangay CXXIX",
        "Barangay CXXX",
        "Barangay CXXXI",
        "Barangay CXXXII",
        "Barangay CXXXIII",
        "Barangay CXXXIV",
        "Barangay CXXXV",
        "Barangay CXXXVI",
        "Barangay CXXXVII",
        "Barangay CXXXVIII",
        "Barangay CXXXIX",
        "Barangay CXL",
        "Barangay CXLI",
        "Barangay CXLII",
        "Barangay CXLIII",
        "Barangay CXLIV",
        "Barangay CXLV",
        "Barangay CXLVI",
        "Barangay CXLVII",
        "Barangay CXLVIII",
        "Barangay CXLIX",
        "Barangay CL",
        "Barangay CLI",
        "Barangay CLII",
        "Barangay CLIII",
        "Barangay CLIV",
        "Barangay CLV",
        "Barangay CLVI",
        "Barangay CLVII",
        "Barangay CLVIII",
        "Barangay CLIX",
        "Barangay CLX",
        "Barangay CLXI",
        "Barangay CLXII",
        "Barangay CLXIII",
        "Barangay CLXIV",
        "Barangay CLXV",
        "Barangay CLXVI",
        "Barangay CLXVII",
        "Barangay CLXVIII",
        "Barangay CLXIX",
        "Barangay CLXX",
        "Barangay CLXXI",
        "Barangay CLXXII",
        "Barangay CLXXIII",
        "Barangay CLXXIV",
        "Barangay CLXXV",
        "Barangay CLXXVI",
        "Barangay CLXXVII",
        "Barangay CLXXVIII",
        "Barangay CLXXIX",
        "Barangay CLXXX",
        "Barangay CLXXXI",
        "Barangay CLXXXII",
        "Barangay CLXXXIII",
        "Barangay CLXXXIV",
        "Barangay CLXXXV",
        "Barangay CLXXXVI",
        "Barangay CLXXXVII",
        "Barangay CLXXXVIII",
        "Barangay CLXXXIX",
        "Barangay CXC",
        "Barangay CXCI",
        "Barangay CXCII",
        "Barangay CXCIII",
        "Barangay CXCIV",
        "Barangay CXCV",
        "Barangay CXCVI",
        "Barangay CXCVII",
        "Barangay CXCVIII",
        "Barangay CXCIX",
        "Barangay CC"
      ],
      // Add more municipalities and their barangays here
    }
  }
};
// Mock geocoding function - in a real app, you'd use a service like Google Maps API
const getCoordinatesFromLocation = async (province, municipality, barangay) => {
  // This is a mock function that returns coordinates based on location
  // In a real application, you would integrate with a geocoding API
  const baseCoords = {
    "Lucena City": { lat: 13.9379, lng: 121.6244 },
    "Tayabas City": { lat: 13.9572, lng: 121.4942 },
    "Calauag": { lat: 14.05, lng: 121.65 },
    "Unisan": { lat: 14.15, lng: 121.7 },
    "Sariaya": { lat: 13.88, lng: 121.58 },
    "Gumaca": { lat: 13.95, lng: 121.75 },
    "Mauban": { lat: 14.08, lng: 121.8 },
    "Padre Burgos": { lat: 14.12, lng: 121.85 },
    "Tiaong": { lat: 14.02, lng: 121.55 },
    "Agdangan": { lat: 14.18, lng: 121.68 },
    "Alabat": { lat: 14.25, lng: 121.75 },
    "Atimonan": { lat: 14.2, lng: 121.85 },
    "Buenavista": { lat: 14.05, lng: 121.9 },
    "Burdeos": { lat: 14.3, lng: 121.95 },
    "Catanauan": { lat: 14.15, lng: 122.0 },
    "Dolores": { lat: 14.0, lng: 121.75 },
    "General Luna": { lat: 14.1, lng: 121.9 },
    "General Nakar": { lat: 14.2, lng: 121.95 },
    "Guinayangan": { lat: 14.25, lng: 122.05 },
    "Infanta": { lat: 14.35, lng: 122.1 },
    "Jomalig": { lat: 14.4, lng: 122.15 },
    "Lopez": { lat: 13.95, lng: 121.6 },
    "Magdalena": { lat: 14.0, lng: 121.65 },
    "Mulanay": { lat: 14.1, lng: 122.0 },
    "Patnanungan": { lat: 14.2, lng: 122.0 },
    "Perez": { lat: 13.9, lng: 121.65 },
    "Pitogo": { lat: 14.15, lng: 121.85 },
    "Plaridel": { lat: 14.05, lng: 121.75 },
    "Polillo": { lat: 14.3, lng: 122.05 },
    "Quezon": { lat: 14.0, lng: 121.85 },
    "Real": { lat: 14.1, lng: 121.8 },
    "Sampaloc": { lat: 14.0, lng: 121.7 },
    "San Andres": { lat: 14.25, lng: 122.0 },
    "San Antonio": { lat: 14.05, lng: 121.9 },
    "San Francisco": { lat: 14.2, lng: 121.8 },
    "San Narciso": { lat: 14.15, lng: 121.75 },
    "Tagkawayan": { lat: 14.1, lng: 121.95 },
    "Zambales": { lat: 14.05, lng: 121.8 }
  };
  const municipalityCoords = baseCoords[municipality] || { lat: 14.15, lng: 121.5 };
  // Add some variation based on barangay for more realistic distribution
  const barangayVariation = barangay ? barangay.length % 20 : 0;
  const latVariation = (Math.random() - 0.5) * 0.05;
  const lngVariation = (Math.random() - 0.5) * 0.05;
  return {
    lat: municipalityCoords.lat + latVariation,
    lng: municipalityCoords.lng + lngVariation
  };
};
function RegistrationPage() {
  const [step, setStep] = useState(0);
  const totalSteps = 5;
  const initialFormData = {
    applicationType: '',
    previousPcaRegistrationNumber: '',
    previousOfficialReceiptNumber: '',
    dateFiling: '',
    dateRegistration: '',
    natureofbusiness: '',
    othernature: '',
    pcaNumberActivity: '',
    farmersormanufacturers: '',
    fundsource: '',
    market: '',
    businesstructure: '',
    registeredbusinessname: '',
    companywebsite: '',
    companyemailaddress: '',
    officeaddress: '',
    telno1: '',
    plantaddress: '',
    telono2: '',
    // LOCATION FIELDS
    province: 'Quezon', // Default to Quezon
    municipality: '',
    barangay: '',
    specificCoordinates: '',
    // END LOCATION FIELDS
    // NEW FIELD: Land Area
    landArea: '',
    // END NEW FIELD
    // NEW FIELD: Tools and Equipment (for certificate)
    toolsAndEquipment: '',
    // END NEW FIELD
    contactperson: '',
    contactnumber: '',
    emailaddress: '',
    totalnumberofemployees: '',
    regular: '',
    nonregularorjoborder: '',
    seniorcitizen: '',
    pwd: '',
    ips: '',
    yearestablished: '',
    tinno: '',
    vatno: '',
    authorizedcapitalphp: '',
    totalcapitalizationphp: '',
    workingcapitalphp: '',
    ownership: '',
    fiscalornonfiscal: '',
    validityperiod: '',
    registrationnumber: '',
    validityexpirydate: '',
    sameAsOffice: false,
    sameAsTelNo2: false,
  };
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);
  useEffect(() => {
    // Initialize available municipalities when component mounts
    if (LOCATION_DATA[formData.province]) {
      setAvailableMunicipalities(LOCATION_DATA[formData.province].municipalities);
    }
  }, []);
  useEffect(() => {
    // Update available barangays when municipality changes
    if (formData.province && formData.municipality && LOCATION_DATA[formData.province].barangays[formData.municipality]) {
      setAvailableBarangays(LOCATION_DATA[formData.province].barangays[formData.municipality]);
    } else {
      setAvailableBarangays([]);
    }
  }, [formData.province, formData.municipality]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'province') {
      // Reset municipality and barangay when province changes
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        municipality: '',
        barangay: '',
      }));
      setAvailableMunicipalities(LOCATION_DATA[value]?.municipalities || []);
      setAvailableBarangays([]);
    } else if (name === 'municipality') {
      // Reset barangay when municipality changes
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        barangay: '',
      }));
      setAvailableBarangays(LOCATION_DATA[formData.province]?.barangays[value] || []);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };
  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    setFiles((prev) => ({ ...prev, [name]: file }));
  };
  // Helper function to validate URL - matches backend validation exactly
  const isValidURL = (string) => {
    if (!string || string.trim() === '') return true; // Allow empty
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
  // Validation per step
  const validateCurrentStep = () => {
    let error = '';
    switch (step) {
      case 0:
        if (!formData.applicationType) error = 'Please select an Application Type.';
        else if (
          formData.applicationType === 'Renewal' &&
          (!formData.previousPcaRegistrationNumber || formData.previousPcaRegistrationNumber.length < 4 || !/^\d+$/.test(formData.previousPcaRegistrationNumber))
        )
          error = 'Previous PCA Registration Number must be a number with at least 4 digits.';
        else if (
          formData.applicationType === 'Renewal' &&
          (!formData.previousOfficialReceiptNumber || formData.previousOfficialReceiptNumber.length < 4 || !/^\d+$/.test(formData.previousOfficialReceiptNumber))
        )
          error = 'Previous Official Receipt Number must be a number with at least 4 digits.';
        else if (formData.dateFiling) {
          const filing = new Date(formData.dateFiling);
          if (isNaN(filing) || filing > new Date()) error = 'Date of filing cannot be in the future.';
        }
        else if (formData.dateRegistration && formData.dateFiling) {
          const reg = new Date(formData.dateRegistration);
          const fil = new Date(formData.dateFiling);
          if (isNaN(reg) || reg < fil) error = 'Date of registration must not be before date of filing.';
        }
        break;
      case 1:
        if (!formData.natureofbusiness) error = 'Please select Nature of Business.';
        else if (formData.natureofbusiness === 'Other' && !formData.othernature.trim())
          error = 'Please specify the nature of your business.';
        else if (!formData.pcaNumberActivity) error = 'Please select Coconut or Oil Palm activity.';
        else if (!formData.farmersormanufacturers) error = 'Please select Farmer or Manufacturer.';
        else if (!formData.fundsource) error = 'Fund Source is required.';
        else if (!formData.market) error = 'Market is required.';
        else if (!formData.businesstructure) error = 'Business Structure/Type is required.';
        break;
      case 2:
        if (formData.registeredbusinessname.trim().length < 3)
          error = 'Registered Business Name must be at least 3 characters long.';
        else if (formData.companywebsite && !isValidURL(formData.companywebsite))
          error = 'Please enter a valid Company Website URL (e.g., https://example.com  ) or leave it empty.';
        else if (!formData.companyemailaddress) error = 'Company Email Address is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyemailaddress))
          error = 'Please enter a valid Company Email Address.';
        else if (formData.officeaddress.trim().length < 10)
          error = 'Office Address must be at least 10 characters long.';
        else if (!formData.telno1 || !/^\d{7,11}$/.test(formData.telno1))
          error = 'Please enter a valid Telephone Number 1.';
        else if (!formData.sameAsOffice && (!formData.plantaddress || formData.plantaddress.trim().length < 10))
          error = 'Plant Address must be at least 10 characters long.';
        else if (
          !/^09\d{9}$/.test(formData.contactnumber) &&
          !/^9\d{9}$/.test(formData.contactnumber)
        )
          error = 'Enter a valid PH mobile number (e.g., 09171234567 or 9171234567)';
        else if (!formData.emailaddress) error = 'Email Address is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailaddress))
          error = 'Please enter a valid Email Address.';
        // Validate location fields
        else if (!formData.province) error = 'Province is required.';
        else if (!formData.municipality) error = 'Municipality is required.';
        else if (!formData.barangay) error = 'Barangay is required.';
        // Validate land area if provided
        else if (formData.landArea && (isNaN(formData.landArea) || parseFloat(formData.landArea) <= 0))
          error = 'Land Area must be a positive number.';
        // Validate tools and equipment if provided
        else if (formData.toolsAndEquipment && (formData.toolsAndEquipment.trim().length < 5))
          error = 'Tools and Equipment description must be at least 5 characters long.';
        break;
      case 3:
        const numFields = ['totalnumberofemployees', 'regular', 'nonregularorjoborder', 'seniorcitizen', 'pwd', 'ips'];
        for (let field of numFields) {
          const val = Number(formData[field]);
          if (field === 'totalnumberofemployees') {
            if (!Number.isInteger(val) || val <= 0) {
              error = 'Total Number of Employees must be a positive whole number.';
              break;
            }
          } else {
            if (!Number.isInteger(val) || val < 0) {
              error = `${field.replace(/([A-Z])/g, ' $1')} must be a non-negative whole number.`;
              break;
            }
          }
        }
        if (!error) {
          const year = Number(formData.yearestablished);
          const currentYear = new Date().getFullYear();
          if (!Number.isInteger(year) || year < 1900 || year > currentYear)
            error = `Year Established must be between 1900 and ${currentYear}.`;
        }
        break;
      case 4:
        if (!/^\d{9}$/.test(formData.tinno)) error = 'TIN Number must be exactly 9 digits.';
        else if (!/^\d{12}$/.test(formData.vatno)) error = 'VAT Number must be exactly 12 digits.';
        else if (isNaN(formData.authorizedcapitalphp) || Number(formData.authorizedcapitalphp) <= 0)
          error = 'Authorized Capital (PHP) must be a positive number.';
        else if (isNaN(formData.totalcapitalizationphp) || Number(formData.totalcapitalizationphp) <= 0)
          error = 'Total Capitalization (PHP) must be a positive number.';
        else if (isNaN(formData.workingcapitalphp) || Number(formData.workingcapitalphp) <= 0)
          error = 'Working Capital (PHP) must be a positive number.';
        else if (!['Fiscal', 'Non-Fiscal'].includes(formData.fiscalornonfiscal))
          error = 'Fiscal or Non-Fiscal field must be either "Fiscal" or "Non-Fiscal".';
        else if (!formData.ownership) error = 'Ownership is required.';
        else if (!formData.validityperiod) error = 'Please select a Validity Period.';
        break;
      case 5:
        if (!formData.registrationnumber || formData.registrationnumber.trim().length < 4)
          error = 'Registration Number is required and must be at least 4 characters.';
        else if (!formData.validityexpirydate) error = 'Validity Expiry Date is required.';
        else if (!files.notarizedpca) error = 'Please upload the Notarized PCA Application.';
        else if (!files.dti) error = 'Please upload DTI Registration.';
        else if (!files.municipalpermitlicense) error = 'Please upload Municipal Permit/License.';
        break;
      default:
        break;
    }
    setErrorMessage(error);
    return !error;
  };
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      if (step < totalSteps) setStep(step + 1);
    }
  };
  const goToPrevStep = () => {
    if (step > 0) setStep(step - 1);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) {
      return;
    }
    // Get coordinates from location
    let coordinates = null;
    if (formData.province && formData.municipality && formData.barangay) {
      const coords = await getCoordinatesFromLocation(
        formData.province,
        formData.municipality,
        formData.barangay
      );
      coordinates = coords;
    }
    const submissionData = {
      ...formData,
      plantaddress: formData.sameAsOffice ? formData.officeaddress : formData.plantaddress,
      telono2: formData.sameAsTelNo2 ? formData.telno1 : formData.telono2,
      natureofbusiness: formData.natureofbusiness === 'Other' ? formData.othernature : formData.natureofbusiness,
      // Include the coordinates in the submission
      coordinates: coordinates ? [coordinates.lng, coordinates.lat] : null,
      // Convert land area to number if provided
      landArea: formData.landArea ? parseFloat(formData.landArea) : null,
      // Convert tools and equipment to string if provided
      toolsAndEquipment: formData.toolsAndEquipment ? formData.toolsAndEquipment.trim() : null
    };
    const formDataToSend = new FormData();
    for (let key in submissionData) {
      if (key !== 'sameAsOffice' && key !== 'sameAsTelNo2' && key !== 'othernature' && key !== 'coordinates') {
        formDataToSend.append(key, submissionData[key]);
      }
    }
    // Append coordinates as a JSON string
    if (submissionData.coordinates) {
      formDataToSend.append('coordinates', JSON.stringify(submissionData.coordinates));
    }
    for (let key in files) {
      formDataToSend.append(key, files[key]);
    }
    try {
      const response = await fetch('http://localhost:5000/register-application', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        setShowSuccess(true);
        setErrorMessage('');
        setFormData(initialFormData);
        setFiles({});
        setStep(0);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Server error. Please try again later.');
    }
  };
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <h3>Application Details</h3>
            <div className="single-row">
              <label htmlFor="applicationType">Type of Application</label>
              <select
                id="applicationType"
                name="applicationType"
                value={formData.applicationType}
                onChange={handleChange}
              >
                <option value="">Select Application Type</option>
                <option value="New">New</option>
                <option value="Renewal">Renewal</option>
              </select>
            </div>
            {formData.applicationType === 'Renewal' && (
              <>
                <div className="single-row">
                  <label htmlFor="previousPcaRegistrationNumber">Previous PCA Registration No.</label>
                  <input
                    type="text"
                    id="previousPcaRegistrationNumber"
                    name="previousPcaRegistrationNumber"
                    value={formData.previousPcaRegistrationNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="single-row">
                  <label htmlFor="previousOfficialReceiptNumber">Previous Official Receipt Number</label>
                  <input
                    type="text"
                    id="previousOfficialReceiptNumber"
                    name="previousOfficialReceiptNumber"
                    value={formData.previousOfficialReceiptNumber}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
            <div className="single-row">
              <label htmlFor="dateFiling">Date of Filing</label>
              <input
                type="date"
                id="dateFiling"
                name="dateFiling"
                value={formData.dateFiling}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="dateRegistration">Date of Registration</label>
              <input
                type="date"
                id="dateRegistration"
                name="dateRegistration"
                value={formData.dateRegistration}
                onChange={handleChange}
              />
            </div>
          </>
        );
      case 1:
        return (
          <>
            <h3>Business Activity</h3>
            <div className="single-row">
              <label htmlFor="natureofbusiness">Nature of Business</label>
              <select
                id="natureofbusiness"
                name="natureofbusiness"
                value={formData.natureofbusiness}
                onChange={handleChange}
              >
                <option value="">-- Select --</option>
                <option value="Oil Miller">Oil Miller</option>
                <option value="Refiner">Refiner</option>
                <option value="Miller Refiner">Miller Refiner</option>
                <option value="Trader Wholesaler">Trader Wholesaler</option>
                <option value="Trader Retailer">Trader Retailer</option>
                <option value="Trader Consolidator">Trader Consolidator</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Toll Crusher">Toll Crusher</option>
                <option value="Lumber Dealer">Lumber Dealer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {formData.natureofbusiness === 'Other' && (
              <div className="single-row">
                <label htmlFor="othernature">Please specify other nature of business</label>
                <input
                  type="text"
                  id="othernature"
                  name="othernature"
                  value={formData.othernature}
                  onChange={handleChange}
                />
              </div>
            )}
            <div className="single-row">
              <label>Coconut or Oil Palm</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="pcaNumberActivity"
                    value="Coconut"
                    checked={formData.pcaNumberActivity === 'Coconut'}
                    onChange={handleChange}
                  />{' '}
                  Coconut
                </label>
                <label>
                  <input
                    type="radio"
                    name="pcaNumberActivity"
                    value="Oil Palm"
                    checked={formData.pcaNumberActivity === 'Oil Palm'}
                    onChange={handleChange}
                  />{' '}
                  Oil Palm
                </label>
              </div>
            </div>
            <div className="single-row">
              <label>Farmer or Manufacturer</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="farmersormanufacturers"
                    value="Farmer"
                    checked={formData.farmersormanufacturers === 'Farmer'}
                    onChange={handleChange}
                  />{' '}
                  Farmer
                </label>
                <label>
                  <input
                    type="radio"
                    name="farmersormanufacturers"
                    value="Manufacturer"
                    checked={formData.farmersormanufacturers === 'Manufacturer'}
                    onChange={handleChange}
                  />{' '}
                  Manufacturer
                </label>
              </div>
            </div>
            <div className="single-row">
              <label>Fund Source</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="fundsource"
                    value="Fully Private"
                    checked={formData.fundsource === 'Fully Private'}
                    onChange={handleChange}
                  />{' '}
                  Fully Private
                </label>
                <label>
                  <input
                    type="radio"
                    name="fundsource"
                    value="Government Assisted"
                    checked={formData.fundsource === 'Government Assisted'}
                    onChange={handleChange}
                  />{' '}
                  Government Assisted
                </label>
              </div>
            </div>
            <div className="single-row">
              <label htmlFor="market">Market</label>
              <select id="market" name="market" value={formData.market} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="Domestic">Domestic</option>
                <option value="InternationalExports">International Exports</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="single-row">
              <label htmlFor="businesstructure">Business Structure/Type</label>
              <select
                id="businesstructure"
                name="businesstructure"
                value={formData.businesstructure}
                onChange={handleChange}
              >
                <option value="">-- Select --</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Cooperative">Cooperative</option>
                <option value="Corporation">Corporation</option>
                <option value="Joint Venture/Partnership">Joint Venture/Partnership</option>
                <option value="BMBE">BMBE</option>
              </select>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h3>Contact & Address</h3>
            <div className="single-row">
              <label htmlFor="registeredbusinessname">Registered Business Name</label>
              <input
                type="text"
                id="registeredbusinessname"
                name="registeredbusinessname"
                value={formData.registeredbusinessname}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="companywebsite">Company Website</label>
              <input
                type="text"
                id="companywebsite"
                name="companywebsite"
                value={formData.companywebsite}
                onChange={handleChange}
                placeholder="https://example.com  "
              />
            </div>
            <div className="single-row">
              <label htmlFor="companyemailaddress">Company Email Address</label>
              <input
                type="text"
                id="companyemailaddress"
                name="companyemailaddress"
                value={formData.companyemailaddress}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="officeaddress">Office Address</label>
              <input
                type="text"
                id="officeaddress"
                name="officeaddress"
                value={formData.officeaddress}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="telno1">TEL.NO(S)/FAX NO(S)</label>
              <input type="text" id="telno1" name="telno1" value={formData.telno1} onChange={handleChange} />
            </div>
            <div className="single-row">
              <label htmlFor="plantaddress">Plant Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '65%' }}>
                <input
                  type="text"
                  id="plantaddress"
                  name="plantaddress"
                  value={formData.plantaddress}
                  onChange={handleChange}
                  disabled={formData.sameAsOffice}
                  style={{ flex: 1 }}
                />
                <label style={{ whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={formData.sameAsOffice}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sameAsOffice: e.target.checked,
                        plantaddress: e.target.checked ? prev.officeaddress : '',
                      }))
                    }
                  />
                  &nbsp;Same as Office
                </label>
              </div>
            </div>
            <div className="single-row">
              <label htmlFor="telono2">TEL.NO(S)/FAX NO(S)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '65%' }}>
                <input
                  type="text"
                  id="telono2"
                  name="telono2"
                  value={formData.telono2}
                  onChange={handleChange}
                  disabled={formData.sameAsTelNo2}
                  style={{ flex: 1 }}
                />
                <label style={{ whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={formData.sameAsTelNo2}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sameAsTelNo2: e.target.checked,
                        telono2: e.target.checked ? prev.telno1 : '',
                      }))
                    }
                  />
                  &nbsp;Same as Tel No. 1
                </label>
              </div>
            </div>
            {/* LOCATION FIELDS */}
            <div className="single-row">
              <label htmlFor="province">Province</label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
              >
                <option value="">Select Province</option>
                <option value="Quezon">Quezon</option>
                {/* Add more provinces if needed */}
              </select>
            </div>
            <div className="single-row">
              <label htmlFor="municipality">Municipality/City</label>
              <select
                id="municipality"
                name="municipality"
                value={formData.municipality}
                onChange={handleChange}
                required
                disabled={!formData.province}
              >
                <option value="">Select Municipality/City</option>
                {availableMunicipalities.map((muni) => (
                  <option key={muni} value={muni}>{muni}</option>
                ))}
              </select>
            </div>
            <div className="single-row">
              <label htmlFor="barangay">Barangay</label>
              <select
                id="barangay"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                required
                disabled={!formData.municipality}
              >
                <option value="">Select Barangay</option>
                {availableBarangays.map((brgy) => (
                  <option key={brgy} value={brgy}>{brgy}</option>
                ))}
              </select>
            </div>
            <div className="single-row">
              <label htmlFor="specificCoordinates">Specific Coordinates (Optional)</label>
              <input
                type="text"
                id="specificCoordinates"
                name="specificCoordinates"
                value={formData.specificCoordinates}
                onChange={handleChange}
                placeholder="e.g., 14.123456, 121.123456"
              />
              <small style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                If you know the exact coordinates, enter them in format: latitude, longitude
              </small>
            </div>
            {/* END LOCATION FIELDS */}
            {/* NEW FIELD: Land Area */}
            <div className="single-row">
              <label htmlFor="landArea">Total Land Area (Hectares)</label>
              <input
                type="number"
                id="landArea"
                name="landArea"
                value={formData.landArea}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g., 5.5"
              />
              <small style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                Enter the total land area under coconut cultivation in hectares
              </small>
            </div>
            {/* END NEW FIELD */}
            {/* NEW FIELD: Tools and Equipment */}
            <div className="single-row">
              <label htmlFor="toolsAndEquipment">Tools and Equipment</label>
              <textarea
                id="toolsAndEquipment"
                name="toolsAndEquipment"
                value={formData.toolsAndEquipment}
                onChange={handleChange}
                placeholder="List the primary tools and equipment used in your operations..."
                rows="3"
              />
              <small style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                Please provide a brief description of the main tools and equipment used in your business activity.
              </small>
            </div>
            {/* END NEW FIELD */}
            <div className="single-row">
              <label htmlFor="contactperson">Contact Person</label>
              <input
                type="text"
                id="contactperson"
                name="contactperson"
                value={formData.contactperson}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="contactnumber">Contact Number</label>
              <input
                type="text"
                id="contactnumber"
                name="contactnumber"
                value={formData.contactnumber}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="emailaddress">Email Address</label>
              <input
                type="text"
                id="emailaddress"
                name="emailaddress"
                value={formData.emailaddress}
                onChange={handleChange}
              />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h3>Workforce Distribution</h3>
            <div className="single-row">
              <label htmlFor="totalnumberofemployees">Total Number of Employees</label>
              <input
                type="text"
                id="totalnumberofemployees"
                name="totalnumberofemployees"
                value={formData.totalnumberofemployees}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="regular">Regular</label>
              <input type="text" id="regular" name="regular" value={formData.regular} onChange={handleChange} />
            </div>
            <div className="single-row">
              <label htmlFor="nonregularorjoborder">Non-Regular / Job Order</label>
              <input
                type="text"
                id="nonregularorjoborder"
                name="nonregularorjoborder"
                value={formData.nonregularorjoborder}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="seniorcitizen">Senior Citizen</label>
              <input
                type="text"
                id="seniorcitizen"
                name="seniorcitizen"
                value={formData.seniorcitizen}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="pwd">PWD</label>
              <input type="text" id="pwd" name="pwd" value={formData.pwd} onChange={handleChange} />
            </div>
            <div className="single-row">
              <label htmlFor="ips">IPs</label>
              <input type="text" id="ips" name="ips" value={formData.ips} onChange={handleChange} />
            </div>
            <div className="single-row">
              <label htmlFor="yearestablished">Year Established</label>
              <input
                type="text"
                id="yearestablished"
                name="yearestablished"
                value={formData.yearestablished}
                onChange={handleChange}
              />
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h3>Financial Information</h3>
            <div className="single-row">
              <label htmlFor="tinno">TIN No.</label>
              <input type="text" id="tinno" name="tinno" value={formData.tinno} onChange={handleChange} />
            </div>
            <div className="single-row">
              <label htmlFor="vatno">VAT No.</label>
              <input type="text" id="vatno" name="vatno" value={formData.vatno} onChange={handleChange} />
            </div>
            <div className="single-row">
              <label htmlFor="authorizedcapitalphp">Authorized Capital (PHP)</label>
              <input
                type="text"
                id="authorizedcapitalphp"
                name="authorizedcapitalphp"
                value={formData.authorizedcapitalphp}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="totalcapitalizationphp">Total Capitalization (PHP)</label>
              <input
                type="text"
                id="totalcapitalizationphp"
                name="totalcapitalizationphp"
                value={formData.totalcapitalizationphp}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="workingcapitalphp">Working Capital (PHP)</label>
              <input
                type="text"
                id="workingcapitalphp"
                name="workingcapitalphp"
                value={formData.workingcapitalphp}
                onChange={handleChange}
              />
            </div>
            <div className="single-row">
              <label htmlFor="ownership">Ownership</label>
              <input type="text" id="ownership" name="ownership" value={formData.ownership} onChange={handleChange} />
            </div>
            <div className="single-row">
              <label>Fiscal / Non-Fiscal Incentives</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="fiscalornonfiscal"
                    value="Fiscal"
                    checked={formData.fiscalornonfiscal === 'Fiscal'}
                    onChange={handleChange}
                  />{' '}
                  Fiscal
                </label>
                <label>
                  <input
                    type="radio"
                    name="fiscalornonfiscal"
                    value="Non-Fiscal"
                    checked={formData.fiscalornonfiscal === 'Non-Fiscal'}
                    onChange={handleChange}
                  />{' '}
                  Non-Fiscal
                </label>
              </div>
            </div>
            <div className="single-row">
              <label htmlFor="validityperiod">(Please Indicate Validity Period)</label>
              <select
                id="validityperiod"
                name="validityperiod"
                value={formData.validityperiod}
                onChange={handleChange}
              >
                <option value="">Select Validity Date</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h3>Uploads</h3>
            <div className="single-row">
              <label htmlFor="registrationnumber">Registration Number *</label>
              <input
                type="text"
                id="registrationnumber"
                name="registrationnumber"
                value={formData.registrationnumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="single-row">
              <label htmlFor="validityexpirydate">Validity / Expiry Date *</label>
              <select
                id="validityexpirydate"
                name="validityexpirydate"
                value={formData.validityexpirydate}
                onChange={handleChange}
                required
              >
                <option value="">Select Expiry Date</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div className="single-row">
              <label htmlFor="notarizedpca">
                Notarized PCA Application (Revised Dec 2021) *
              </label>
              <input type="file" id="notarizedpca" name="notarizedpca" onChange={handleFileChange} required />
            </div>
            <div className="single-row">
              <label htmlFor="dti">DTI Registration *</label>
              <input type="file" id="dti" name="dti" onChange={handleFileChange} required />
            </div>
            <div className="single-row">
              <label htmlFor="municipalpermitlicense">Municipal Permit/License *</label>
              <input
                type="file"
                id="municipalpermitlicense"
                name="municipalpermitlicense"
                onChange={handleFileChange}
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };
  return (
    <div className="registration-container">
      <h2>Application of Registration</h2>
      <p className="note">
        NOTE: Please print in all caps legibly and specify information if applicable. The information will be officially used by PCA and be treated with utmost confidentiality.
      </p>
      {/* Tabs Navigation — EXACTLY like your prototype */}
      <div className="step-tabs">
        <div className={`tab ${step === 0 ? 'active' : ''}`} onClick={() => step >= 0 && setStep(0)}>
          Application
        </div>
        <div className={`tab ${step === 1 ? 'active' : ''}`} onClick={() => step >= 1 && setStep(1)}>
          Business
        </div>
        <div className={`tab ${step === 2 ? 'active' : ''}`} onClick={() => step >= 2 && setStep(2)}>
          Contact
        </div>
        <div className={`tab ${step === 3 ? 'active' : ''}`} onClick={() => step >= 3 && setStep(3)}>
          Workforce
        </div>
        <div className={`tab ${step === 4 ? 'active' : ''}`} onClick={() => step >= 4 && setStep(4)}>
          Financials
        </div>
        <div className={`tab ${step === 5 ? 'active' : ''}`} onClick={() => step >= 5 && setStep(5)}>
          Uploads
        </div>
      </div>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {renderStep()}
        {errorMessage && <p className="error">{errorMessage}</p>}
        <div className="button-container">
          {step > 0 && <button type="button" className="btn-back" onClick={goToPrevStep}>
            Back
          </button>}
          {step < totalSteps ? (
            <button type="button" className="btn-next" onClick={goToNextStep}>
              Next
            </button>
          ) : (
            <button type="submit" className="btn-submit">
              Submit
            </button>
          )}
        </div>
      </form>
      {showSuccess && (
        <div className="success-popup">
          <div className="success-icon">
            <span>✅</span>
          </div>
          <h2>Registration Completed Successfully</h2>
          <p>Please check your registered email for email verification</p>
          <button onClick={() => setShowSuccess(false)}>OK</button>
        </div>
      )}
    </div>
  );
}
export default RegistrationPage;