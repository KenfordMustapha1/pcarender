// models/TransportPermit.js
const mongoose = require('mongoose');

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

const transportPermitSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address']
  },
  applicantName: { type: String, required: true },
  registrationCertificateNo: { type: String, required: true, unique: true },
  province: { type: String, default: 'Quezon' },
  addressOfApplicant: { type: String, required: true },
  transportPermitNo: { type: String, required: true, unique: true },
  registrationCertificateDate: { type: Date, required: true },
  dateIssued: { type: Date, required: true },
  ptcNo: String, // Optional reference to Permit to Cut
  pcaConsigneeName: { type: String, required: true },
  pcaConsigneeDestination: { type: String, required: true },
  vehicle: { type: String, required: true },
  registeredPlateNumber: { type: String, required: true },
  authorizedDriver: { type: String, required: true },
  municipalityOrigin: {
    type: String,
    required: true,
    enum: QUEZON_MUNICIPALITIES
  },
  brgyOrigin: { type: String, required: true },
  destination: { type: String, required: true },
  volume: {
    type: Number,
    required: true,
    min: 0.01,
    validate: {
      validator: v => v > 0,
      message: 'Volume must be greater than zero'
    }
  },
  effectivityStart: { type: Date, required: true },
  effectivityEnd: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v >= this.effectivityStart;
      },
      message: 'Effectivity End must be on or after Effectivity Start'
    }
  },
  officialReceiptNo: { type: String, required: true },
  supportingDoc: { type: String, required: true }, // e.g., file path
  idCopy: { type: String, required: true },       // e.g., file path
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  permitType: { type: String, default: 'transport' }
}, { timestamps: true });

module.exports = mongoose.model('TransportPermit', transportPermitSchema);