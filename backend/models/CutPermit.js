// models/CutPermit.js
const mongoose = require('mongoose');

const cutPermitSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address']
  },
  nameOfAgriculturist: { type: String, required: true },
  province: { type: String, default: 'Quezon' },
  cityOrMunicipality: {
    type: String,
    required: true,
    enum: [
      "Agdangan", "Alabat", "Atimonan", "Buenavista", "Burdeos", "Calauag",
      "Candelaria", "Catanauan", "Dolores", "General Luna", "General Nakar",
      "Guinayangan", "Gumaca", "Infanta", "Jomalig", "Lopez", "Lucban",
      "Lucena City", "Macalelon", "Mauban", "Mulanay", "Padre Burgos",
      "Pagbilao", "Panukulan", "Patnanungan", "Perez", "Pitogo", "Plaridel",
      "Polillo", "Quezon", "Real", "Sampaloc", "San Andres", "San Antonio",
      "San Francisco", "San Narciso", "Sariaya", "Tagkawayan", "Tayabas",
      "Tiaong", "Unisan"
    ]
  },
  brgy: { type: String, required: true },
  applicationNumber: { type: String, required: true, unique: true },
  dateOfFiling: { type: Date, required: true },
  permitToCutNo: { type: String, required: true },
  tctNo: String,
  tdnNo: String,
  dateIssued: { type: Date, required: true },
  issuedTo: { type: String, required: true },
  applicantProvince: { type: String, default: 'Quezon' },
  applicantCityOrMunicipality: {
    type: String,
    required: true,
    enum: [
      "Agdangan", "Alabat", "Atimonan", "Buenavista", "Burdeos", "Calauag",
      "Candelaria", "Catanauan", "Dolores", "General Luna", "General Nakar",
      "Guinayangan", "Gumaca", "Infanta", "Jomalig", "Lopez", "Lucban",
      "Lucena City", "Macalelon", "Mauban", "Mulanay", "Padre Burgos",
      "Pagbilao", "Panukulan", "Patnanungan", "Perez", "Pitogo", "Plaridel",
      "Polillo", "Quezon", "Real", "Sampaloc", "San Andres", "San Antonio",
      "San Francisco", "San Narciso", "Sariaya", "Tagkawayan", "Tayabas",
      "Tiaong", "Unisan"
    ]
  },
  numberOfTreesApplied: { type: Number, required: true, min: 1 },
  numberOfApprovedTrees: { type: Number, min: 0 },
  numberOfSeedlingsPlanted: { type: Number, min: 0 },
  numberOfSeedlingReplacements: { type: Number, min: 0 },
  groundCutting: { type: String, enum: ['Yes', 'No'] },
  conversionOrderNo: String,
  landConversionDate: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        if (v === '0') return true;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(v)) return false;
        const d = new Date(v);
        return d.toISOString().slice(0, 10) === v;
      },
      message: 'Must be "0" or valid YYYY-MM-DD'
    }
  },
  estimatedVolumePerTree: { type: Number, min: 0 },
  officialReceiptNumber: { type: String, required: true },  
  receiptDate: { type: Date, required: true },
  supportingDoc: { type: String, required: true },
  idCopy: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  permitType: { type: String, default: 'cut' }
}, { timestamps: true });

module.exports = mongoose.model('CutPermit', cutPermitSchema);