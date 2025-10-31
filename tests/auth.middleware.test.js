const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize, Medecin, Donneur } = require('../src/models');
const { protect, authorize } = require('../src/middlewares/authMiddleware');
const config = require('../src/config/config.json')['test'];

// Création d'une app Express de test
const app = express();
app.use(express.json());

// Route de test protégée
app.get('/api/test/medecin-only', protect, authorize('medecin'), (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

app.get('/api/test/donneur-only', protect, authorize('donneur'), (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

app.get('/api/test/any-user', protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

describe('Auth Middleware', () => {
  let medecin, donneur, medecinToken, donneurToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    medecin = await Medecin.create({
      nom: 'Dr. Test',
      email: 'medecin@test.com',
      mot_de_passe: hashedPassword,
    });

    donneur = await Donneur.create({
      nom: 'Donneur Test',
      email: 'donneur@test.com',
      mot_de_passe: hashedPassword,
      groupe_sanguin: 'O+',
      localisation: 'Testville'
    });

    medecinToken = jwt.sign({ id: medecin.id, role: 'medecin' }, config.jwt_secret, { expiresIn: '1h' });
    donneurToken = jwt.sign({ id: donneur.id, role: 'donneur' }, config.jwt_secret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('protect middleware', () => {
    it('devrait autoriser l\'accès avec un token valide', async () => {
      const res = await request(app)
        .get('/api/test/any-user')
        .set('Authorization', `Bearer ${medecinToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.id).toBe(medecin.id);
    });

    it('devrait retourner 401 si aucun token n\'est fourni', async () => {
      const res = await request(app).get('/api/test/any-user');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Non autorisé, pas de token.');
    });

    it('devrait retourner 401 pour un token invalide (mauvais secret)', async () => {
      const invalidToken = jwt.sign({ id: medecin.id, role: 'medecin' }, 'faux-secret', { expiresIn: '1h' });
      const res = await request(app)
        .get('/api/test/any-user')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Non autorisé, token invalide.');
    });

    it('devrait retourner 401 si le token ne correspond à aucun utilisateur', async () => {
      const nonExistentUserToken = jwt.sign({ id: 999, role: 'medecin' }, config.jwt_secret, { expiresIn: '1h' });
      const res = await request(app)
        .get('/api/test/any-user')
        .set('Authorization', `Bearer ${nonExistentUserToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Utilisateur non trouvé.');
    });
  });

  describe('authorize middleware', () => {
    it('devrait autoriser un médecin à accéder à une route pour médecin', async () => {
      const res = await request(app)
        .get('/api/test/medecin-only')
        .set('Authorization', `Bearer ${medecinToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.id).toBe(medecin.id);
    });

    it('devrait refuser l\'accès à un donneur sur une route pour médecin', async () => {
      const res = await request(app)
        .get('/api/test/medecin-only')
        .set('Authorization', `Bearer ${donneurToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Accès refusé');
    });

    it('devrait autoriser un donneur à accéder à une route pour donneur', async () => {
        const res = await request(app)
          .get('/api/test/donneur-only')
          .set('Authorization', `Bearer ${donneurToken}`);
  
        expect(res.statusCode).toBe(200);
        expect(res.body.user.id).toBe(donneur.id);
      });

    it('devrait refuser l\'accès à un médecin sur une route pour donneur', async () => {
        const res = await request(app)
          .get('/api/test/donneur-only')
          .set('Authorization', `Bearer ${medecinToken}`);
  
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain('Accès refusé');
      });
  });
});
