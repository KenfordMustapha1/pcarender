// models/Registration.js
const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  applicationType: {
    type: String,
    required: true,
  },
  previousPcaRegistrationNumber: {
    type: String,
    required: false
  },
  previousOfficialReceiptNumber: { 
    type: String,
    required: false
  },
  dateFiling: {
    type: Date,
    required: true,
  },
  dateRegistration: {
    type: Date,
    required: true,
  },
  natureofbusiness: {
    type: String,
    required: true,
  },
  pcaNumberActivity: {
    type: String,
    required: true,
  },
  farmersormanufacturers: {
    type: String,
    required: true,
  },
  fundsource: {
    type: String,
    required: true,
  },
  market: {
    type: String,
    required: true,
  },
  businesstructure: {
    type: String,
    required: true,
  },
  registeredbusinessname: {
    type: String,
    required: true,
  },
  companywebsite: {
    type: String,
    required: false,   
    validate: {
      validator: function(v) {
        if (!v) return true;  
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  companyemailaddress: {
    type: String,
    required: true,
  },
  officeaddress: {
    type: String,
    required: true,
  },
  telno1: {
    type: String,
    required: true,
  },
  plantaddress: {
    type: String,
    required: true,
  },
  telono2: {
    type: String,
    required: true,
  },
  // LOCATION FIELDS
  province: {
    type: String,
    required: true,
    default: 'Quezon' // Since your map focuses on Quezon
  },
  municipality: {
    type: String,
    required: true
  },
  barangay: {
    type: String,
    required: true
  },
  // Coordinates will be automatically populated from location
  coordinates: {
    type: {
      type: String, // Don't delete this, it's required by GeoJSON
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  // Optional: User can still provide specific coordinates if known
  specificCoordinates: {
    type: String,  // or whatever type you use
    required: false,
    validate: {
      validator: function(v) {
        if (!v) return true;  // if empty or undefined, skip validation (optional field)
        // simple regex to validate lat,long format
        return /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(v);
      },
      message: props => `${props.value} is not a valid coordinate!`
    }
  },
  // NEW FIELD: Land Area
  landArea: {
    type: Number,
    required: false,
    min: 0,
    set: function(val) {
      // Round to 2 decimal places for consistency
      return Math.round(val * 100) / 100;
    }
  },
  // NEW FIELD: Tools and Equipment (for certificate)
  toolsAndEquipment: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500 // Optional: Limit length
  },
  // END NEW FIELD
  contactperson: {
    type: String,
    required: true,
  },
  contactnumber: {
    type: String,
    required: true,
  },
  emailaddress: {
    type: String,
    required: true,
  },
  totalnumberofemployees: {
    type: String,
    required: true,
  },
  regular: {
    type: String,
    required: true,
  },
  nonregularorjoborder: {
    type: String,
    required: true,
  },
  seniorcitizen: {
    type: String,
    required: true,
  },
  pwd: {
    type: String,
    required: true,
  },
  ips: {
    type: String,
    required: true,
  },
  yearestablished: {
    type: String,
    required: true,
  },
  tinno: {
    type: String,
    required: true,
  },
  vatno: {
    type: String,
    required: true,
  },
  authorizedcapitalphp: {
    type: String,
    required: true,
  },
  totalcapitalizationphp: {
    type: String,
    required: true,
  },
  workingcapitalphp: {
    type: String,
    required: true,
  },
  ownership: {
    type: String,
    required: true,
  },
  fiscalornonfiscal: {
    type: String,
    required: true,
  },
  validityperiod: {
    type: String,
    required: true,
  },
  registrationnumber: {
    type: String,
    required: true,
  },
  validityexpirydate: {
    type: String,
    required: true,
  },
  status: { 
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  notarizedpca: {
    type: String, 
    required: false
  },
  dti: {
    type: String, 
    required: false
  },
  municipalpermitlicense: {
    type: String, 
    required: false
  }

}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);