const express = require('express');
const router = express.Router();

const medecinRoutes = require('./medecinRoutes');
const donneurRoutes = require('./donneurRoutes');
const banqueDeSangRoutes = require('./banqueDeSangRoutes');
const stockSangRoutes = require('./stockSangRoutes');
const demandeRoutes = require('./demandeRoutes');
const notificationRoutes = require('./notificationRoutes');

router.use('/medecins', medecinRoutes);
router.use('/donneurs', donneurRoutes);
router.use('/banquesdesang', banqueDeSangRoutes);
router.use('/stocksang', stockSangRoutes);
router.use('/demandes', demandeRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
