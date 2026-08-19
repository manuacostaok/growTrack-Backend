const mongoose = require('mongoose');

const doctorClickSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorClick', doctorClickSchema);
