const request = require('supertest');
const express = require('express');
const demandeRoutes = require('../src/routes/demandeRoutes');
const { Demande, Medecin, Donneur, Notification } = require('../src/models');

// Mock the middleware to control authentication state
jest.mock('../src/middlewares/authMiddleware', () => ({
  protect: (req, res, next) => {
    if (req.headers.mock_user_id && req.headers.mock_user_role) {
      req.user = { id: parseInt(req.headers.mock_user_id, 10), nom: 'Mock User', role: req.headers.mock_user_role };
      next();
    } else {
      res.status(401).json({ message: 'Non autorisé, pas de token mocké.' });
    }
  },
  authorize: (roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Accès refusé. Rôle ${req.user.role} non autorisé.` });
    }
  },
}));

const app = express();
app.use(express.json());
app.use('/api/demandes', demandeRoutes);

// Mock the models as this is an integration test, but we still control data
jest.mock('../src/models', () => ({
  Demande: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Medecin: {
    findByPk: jest.fn(),
  },
  Donneur: {
    findByPk: jest.fn(),
  },
  Notification: {
    bulkCreate: jest.fn(),
  },
}));

describe('Demande API Integration Tests', () => {
  let medecinId, donneurId;

  beforeEach(() => {
    jest.clearAllMocks();
    medecinId = 1;
    donneurId = 2;

    // Ensure findByPk for Medecin and Donneur used by authMiddleware mock return something
    Medecin.findByPk.mockResolvedValue({ id: medecinId, nom: 'Mock Medecin', role: 'medecin' });
    Donneur.findByPk.mockResolvedValue({ id: donneurId, nom: 'Mock Donneur', role: 'donneur' });

    // Mock Demande.create for internal use if needed
    Demande.create.mockImplementation((data) => ({ id: Math.random(), ...data, Medecin: { id: medecinId, nom: 'Mock Medecin' } }));
    Demande.findAll.mockResolvedValue([]);
  });

  describe('POST /api/demandes', () => {
    it('devrait créer une nouvelle demande pour un médecin authentifié', async () => {
      const nouvelleDemande = { groupe_sanguin: 'O+', quantite: 3, urgence: 'Moyenne' };
      
      const res = await request(app)
        .post('/api/demandes')
        .set('mock_user_id', medecinId)
        .set('mock_user_role', 'medecin')
        .send(nouvelleDemande);

      expect(res.statusCode).toEqual(201);
      expect(res.body.groupe_sanguin).toBe(nouvelleDemande.groupe_sanguin);
      expect(res.body.id_medecin).toBe(medecinId);
      expect(Demande.create).toHaveBeenCalledWith(expect.objectContaining({
        ...nouvelleDemande,
        id_medecin: medecinId,
        statut: 'active', // Check default status
      }));
      expect(Notification.bulkCreate).toHaveBeenCalled();
    });

    it('devrait refuser la création pour un donneur (rôle non autorisé)', async () => {
        const nouvelleDemande = { groupe_sanguin: 'B+', quantite: 1, urgence: 'Basse' };
        
        const res = await request(app)
          .post('/api/demandes')
          .set('mock_user_id', donneurId)
          .set('mock_user_role', 'donneur')
          .send(nouvelleDemande);
  
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toBe('Accès refusé. Rôle donneur non autorisé.');
    });

    it('devrait refuser la création si le token est manquant', async () => {
        const nouvelleDemande = { groupe_sanguin: 'AB+', quantite: 5, urgence: 'Haute' };
        
        const res = await request(app)
          .post('/api/demandes')
          .send(nouvelleDemande);
  
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Non autorisé, pas de token mocké.');
    });
  });

  describe('GET /api/demandes/me', () => {
    it('devrait retourner les demandes pour le médecin authentifié', async () => {
      const doctorDemands = [
        { id: 101, id_medecin: medecinId, groupe_sanguin: 'O+', Medecin: { id: medecinId, nom: 'Mock Medecin' } },
        { id: 102, id_medecin: medecinId, groupe_sanguin: 'A-', Medecin: { id: medecinId, nom: 'Mock Medecin' } },
      ];
      Demande.findAll.mockResolvedValue(doctorDemands);

      const res = await request(app)
        .get('/api/demandes/me')
        .set('mock_user_id', medecinId)
        .set('mock_user_role', 'medecin');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(doctorDemands);
      expect(Demande.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { id_medecin: medecinId },
        include: [{ model: Medecin }],
        order: [['id', 'DESC']]
      }));
    });

    it('devrait retourner 403 si l\'utilisateur n\'est pas un médecin', async () => {
      const res = await request(app)
        .get('/api/demandes/me')
        .set('mock_user_id', donneurId)
        .set('mock_user_role', 'donneur');

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toBe('Accès refusé. Seuls les médecins peuvent voir leurs propres demandes.');
    });

    it('devrait retourner 401 si le token est manquant', async () => {
      const res = await request(app)
        .get('/api/demandes/me');

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Non autorisé, pas de token mocké.');
    });
  });

  describe('GET /api/demandes', () => {
    it('devrait retourner toutes les demandes pour un utilisateur authentifié', async () => {
      const allDemands = [
        { id: 201, id_medecin: medecinId, groupe_sanguin: 'A+' },
        { id: 202, id_medecin: medecinId + 1, groupe_sanguin: 'B+' },
      ];
      Demande.findAll.mockResolvedValue(allDemands);

      const res = await request(app)
        .get('/api/demandes')
        .set('mock_user_id', donneurId)
        .set('mock_user_role', 'donneur'); // Un donneur peut voir les demandes

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(allDemands);
      expect(Demande.findAll).toHaveBeenCalledWith({ include: [{ model: Medecin }] });
    });

    it('devrait retourner 401 si le token est manquant', async () => {
      const res = await request(app)
        .get('/api/demandes');
          
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Non autorisé, pas de token mocké.');
    });
  });
});
