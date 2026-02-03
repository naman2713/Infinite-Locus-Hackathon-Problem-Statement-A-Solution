const mongoose = require('mongoose');
const documentVersionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
});
const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  versions: [documentVersionSchema],
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
documentSchema.methods.addVersion = function (content, userId) {
  this.versions.push({ content: this.content, editedBy: userId });
  if (this.versions.length > 50) {
    this.versions = this.versions.slice(-50);
  }
};
module.exports = mongoose.model('Document', documentSchema);