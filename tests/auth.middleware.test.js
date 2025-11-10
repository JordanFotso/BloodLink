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

// Ajout de la route de signup à l'app de test
const authRoutes = require('../src/routes/authRoutes');
app.use('/api/auth', authRoutes);

describe('Auth Endpoints', () => {
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

  describe('POST /api/auth/signup', () => {
    it('devrait inscrire un nouveau médecin et retourner un message de succès', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Nouveau Medecin',
          email: 'nouveau.medecin@test.com',
          password: 'newpassword123',
          role: 'medecin'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Inscription réussie. Veuillez vous connecter.');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('nouveau.medecin@test.com');
    });

    it('devrait inscrire un nouveau donneur et retourner un message de succès', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send({
            name: 'Nouveau Donneur',
            email: 'nouveau.donneur@test.com',
            password: 'newpassword123',
            role: 'donneur',
            groupe_sanguin: 'AB+',
            localisation: 'Neocity'
          });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Inscription réussie. Veuillez vous connecter.');
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe('nouveau.donneur@test.com');
      });

    it('devrait retourner une erreur 400 si l\'email existe déjà', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send({
            name: 'Autre Medecin',
            email: 'medecin@test.com', // Email déjà utilisé
            password: 'password123',
            role: 'medecin'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Un utilisateur avec cet email existe déjà.');
    });

    it('devrait retourner une erreur 400 si un champ est manquant', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send({
            name: 'Incomplet',
            email: 'incomplet@test.com',
            // Mot de passe manquant
            role: 'medecin'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Nom, email, mot de passe et rôle sont requis.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur et retourner un token et les infos utilisateur', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'medecin@test.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('medecin@test.com');
      expect(res.body.user.role).toBe('medecin');
    });

    it('devrait retourner 401 pour un email ou mot de passe incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'medecin@test.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Email ou mot de passe incorrect.');
    });

    it('devrait retourner 400 si des champs sont manquants', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'medecin@test.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email et mot de passe sont requis.');
    });
  });


  describe('Auth Middleware', () => {
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
