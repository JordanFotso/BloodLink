const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize, Medecin, Donneur, Demande } = require('../src/models');
const demandeRoutes = require('../src/routes/demandeRoutes');
const config = require('../src/config/config.json')['test'];

// L'application de test doit simuler la vraie structure
const app = express();
app.use(express.json());
// Le middleware `protect` est déjà dans `demandeRoutes`, donc on l'utilise directement
app.use('/api/demandes', demandeRoutes);

describe('Demande API Integration Tests', () => {
  let medecin, donneur, medecinToken, donneurToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    medecin = await Medecin.create({
      nom: 'Dr. Test',
      email: 'medecin.demande@test.com',
      mot_de_passe: hashedPassword,
    });

    donneur = await Donneur.create({
        nom: 'Donneur Test Demande',
        email: 'donneur.demande@test.com',
        mot_de_passe: hashedPassword,
        groupe_sanguin: 'A-',
        localisation: 'Testburg'
    });

    medecinToken = jwt.sign({ id: medecin.id, role: 'medecin' }, config.jwt_secret, { expiresIn: '1h' });
    donneurToken = jwt.sign({ id: donneur.id, role: 'donneur' }, config.jwt_secret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/demandes', () => {
    it('devrait créer une nouvelle demande pour un médecin authentifié', async () => {
      const nouvelleDemande = { groupe_sanguin: 'O+', quantite: 3, urgence: 'Moyenne', statut: 'En attente' };
      
      const res = await request(app)
        .post('/api/demandes')
        .set('Authorization', `Bearer ${medecinToken}`)
        .send(nouvelleDemande);

      expect(res.statusCode).toEqual(201);
      expect(res.body.groupe_sanguin).toBe(nouvelleDemande.groupe_sanguin);
      expect(res.body.id_medecin).toBe(medecin.id);
    });

    it('devrait refuser la création pour un donneur (rôle non autorisé)', async () => {
        const nouvelleDemande = { groupe_sanguin: 'B+', quantite: 1, urgence: 'Basse', statut: 'En attente' };
        
        const res = await request(app)
          .post('/api/demandes')
          .set('Authorization', `Bearer ${donneurToken}`)
          .send(nouvelleDemande);
  
        expect(res.statusCode).toEqual(403);
      });

    it('devrait refuser la création si le token est manquant', async () => {
        const nouvelleDemande = { groupe_sanguin: 'AB+', quantite: 5, urgence: 'Haute', statut: 'En attente' };
        
        const res = await request(app)
          .post('/api/demandes')
          .send(nouvelleDemande);
  
        expect(res.statusCode).toEqual(401);
      });
  });

  describe('GET /api/demandes', () => {
    it('devrait retourner toutes les demandes pour un utilisateur authentifié', async () => {
      // Créer une demande pour s'assurer que la liste n'est pas vide
      await Demande.create({ id_medecin: medecin.id, groupe_sanguin: 'A+', quantite: 1, urgence: 'Haute', statut: 'En attente' });

      const res = await request(app)
        .get('/api/demandes')
        .set('Authorization', `Bearer ${donneurToken}`); // Un donneur peut voir les demandes

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

});