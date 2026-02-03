const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({}).populate('owner', 'username email').populate('lastEditedBy', 'username').sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/', [auth, body('title').trim().notEmpty().withMessage('Title is required')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, content = '' } = req.body;
    const document = new Document({ title, content, owner: req.user._id, lastEditedBy: req.user._id });
    await document.save();
    await document.populate('owner', 'username email');
    res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('owner', 'username email').populate('collaborators', 'username email').populate('lastEditedBy', 'username');
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (content !== undefined && content !== document.content && document.content) document.addVersion(document.content, req.user._id);
    if (title) document.title = title;
    if (content !== undefined) document.content = content;
    document.lastEditedBy = req.user._id;
    await document.save();
    await document.populate('owner', 'username email');
    await document.populate('lastEditedBy', 'username');
    res.json(document);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:id/versions', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('versions.editedBy', 'username email');
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json(document.versions);
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/:id/revert/:versionId', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    const version = document.versions.id(req.params.versionId);
    if (!version) return res.status(404).json({ message: 'Version not found' });
    document.addVersion(document.content, req.user._id);
    document.content = version.content;
    document.lastEditedBy = req.user._id;
    await document.save();
    await document.populate('owner', 'username email');
    await document.populate('lastEditedBy', 'username');
    res.json(document);
  } catch (error) {
    console.error('Revert version error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;