/**
 * Calculateur de type RIASEC composite basé sur tous les tests
 * Combine les scores RIASEC directs avec les inférences des autres tests
 */

import { personalityRiasecMapping } from '../components/PersonalityTest';
import { interestsRiasecMapping, getFieldRiasecMapping } from '../components/InterestsTest';
import { getCareerRiasecMapping, getCareerSectorRiasecMapping } from '../components/CareerCompatibilityTestQuick';
import { constraintsRiasecMapping, getPriorityRiasecMapping } from '../components/ConstraintsTest';
import type { RiasecType } from './riasecColors';

// Poids par test dans le calcul composite
const TEST_WEIGHTS = {
  riasec: 0.40,        // Test RIASEC direct: 40%
  personality: 0.25,   // Test Personnalité: 25%
  interests: 0.20,     // Test Intérêts: 20%
  careers: 0.10,       // Test Compatibilité Carrières: 10%
  constraints: 0.05    // Test Contraintes: 5%
};

// Mode de normalisation: 
// - 'relative' (défaut): Les scores somment à 100% au total (distribution relative)
// - 'absolute': Les scores peuvent atteindre 100% individuellement (basé sur l'intensité absolue)
const NORMALIZATION_MODE: 'relative' | 'absolute' = 'relative';

export interface CompositeRiasecResult {
  dominantType: RiasecType;
  scores: Record<RiasecType, number>;
  confidence: number;
  breakdown: {
    riasec: Record<RiasecType, number>;
    personality: Record<RiasecType, number>;
    interests: Record<RiasecType, number>;
    careers: Record<RiasecType, number>;
    constraints: Record<RiasecType, number>;
  };
}

/**
 * Normalise un score RIASEC (0-100)
 */
const normalizeRiasecScore = (score: number): number => {
  return Math.max(0, Math.min(100, score));
};

/**
 * Calcule les scores RIASEC à partir du test de personnalité
 * NOUVELLE MÉTHODE : Utilise les questions enrichies si disponibles pour un calcul plus précis
 */
const calculatePersonalityRiasec = (personalityScores: any): Record<RiasecType, number> => {
  const riasecScores: Record<RiasecType, number> = {
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
  };

  const contributionsByType: Record<RiasecType, number> = {
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
  };

  // PRIORITÉ 1: Utiliser les questions enrichies si disponibles (méthode la plus précise)
  if (personalityScores?.enrichedQuestions && Array.isArray(personalityScores.enrichedQuestions) && personalityScores.enrichedQuestions.length > 0) {
    console.log(`  ✅ Utilisation des questions enrichies pour le calcul RIASEC (${personalityScores.enrichedQuestions.length} questions)`);
    
    // Grouper les questions par trait et calculer les scores
    const traitScores: Record<string, { total: number; count: number }> = {};
    
    personalityScores.enrichedQuestions.forEach((question: any) => {
      if (question.trait && question.userAnswer !== undefined) {
        if (!traitScores[question.trait]) {
          traitScores[question.trait] = { total: 0, count: 0 };
        }
        traitScores[question.trait].total += question.userAnswer;
        traitScores[question.trait].count += 1;
      }
    });
    
    // Calculer les scores RIASEC à partir des scores de traits
    Object.entries(traitScores).forEach(([trait, data]) => {
      const traitScore = data.count > 0 ? Math.round((data.total / data.count) * 20) : 0;
      if (traitScore <= 0) return;

      let mapping: Record<string, number>;
      if (personalityScores.traitRiasecWeights && personalityScores.traitRiasecWeights[trait]) {
        mapping = personalityScores.traitRiasecWeights[trait];
      } else {
        mapping = personalityRiasecMapping[trait];
        if (!mapping) return;
      }

      Object.entries(mapping).forEach(([riasecType, weight]) => {
        const contribution = traitScore * (weight as number);
        riasecScores[riasecType as RiasecType] += contribution;
        contributionsByType[riasecType as RiasecType] += contribution;
      });
    });
  }
  // PRIORITÉ 2: Utiliser les scores de traits avec les poids RIASEC (méthode classique)
  else if (personalityScores?.scores) {
    console.log(`  ⚠️ Questions enrichies non disponibles, utilisation des scores de traits`);
    const traits = personalityScores.scores;

    // Pour chaque trait de personnalité
    Object.entries(traits).forEach(([trait, score]) => {
      if (typeof score !== 'number' || score <= 0) return;

      // Utiliser les poids RIASEC stockés si disponibles, sinon utiliser le mapping
      let mapping: Record<string, number>;
      if (personalityScores.traitRiasecWeights && personalityScores.traitRiasecWeights[trait]) {
        mapping = personalityScores.traitRiasecWeights[trait];
        console.log(`  ✅ Utilisation des poids RIASEC stockés pour le trait ${trait}`);
      } else {
        mapping = personalityRiasecMapping[trait];
        if (!mapping) {
          console.warn(`  ⚠️ Mapping RIASEC non trouvé pour le trait: ${trait}`);
          return;
        }
      }

      // Calcul : score × weight
      Object.entries(mapping).forEach(([riasecType, weight]) => {
        const contribution = score * (weight as number);
        riasecScores[riasecType as RiasecType] += contribution;
        contributionsByType[riasecType as RiasecType] += contribution;
      });
    });
  } else {
    console.warn('⚠️ calculatePersonalityRiasec: Aucune donnée disponible (ni enrichedQuestions ni scores)');
    return riasecScores;
  }

  // Normaliser les scores pour qu'ils somment à 100%
  // Utiliser la même méthode que pour les carrières
  const totalContributions = Object.values(contributionsByType).reduce((sum, val) => sum + val, 0);
  
  if (totalContributions > 0) {
    // Normalisation simple : distribution relative des contributions
    Object.keys(riasecScores).forEach(key => {
      const type = key as RiasecType;
      riasecScores[type] = normalizeRiasecScore(
        (contributionsByType[type] / totalContributions) * 100
      );
    });
    
    console.log(`  ✅ Normalisation personnalité: totalContributions=${totalContributions.toFixed(2)}, scores normalisés (somme=100%):`, riasecScores);
  } else {
    console.warn('⚠️ calculatePersonalityRiasec: totalContributions est 0, aucun score calculé');
  }

  return riasecScores;
};

/**
 * Calcule les scores RIASEC à partir du test d'intérêts académiques
 */
const calculateInterestsRiasec = (academicInterests: any): Record<RiasecType, number> => {
  const riasecScores: Record<RiasecType, number> = {
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
  };

  if (!academicInterests) {
    console.warn('⚠️ calculateInterestsRiasec: academicInterests est null/undefined');
    return riasecScores;
  }

  // Gérer différentes structures de fieldInterests
  let fieldInterests = null;
  let fieldMotivations = null;
  
  if (academicInterests.fieldInterests) {
    fieldInterests = academicInterests.fieldInterests;
    // Vérifier aussi si fieldMotivations existe séparément
    if (academicInterests.fieldMotivations) {
      fieldMotivations = academicInterests.fieldMotivations;
    }
  } else if (academicInterests.interests?.fieldInterests) {
    fieldInterests = academicInterests.interests.fieldInterests;
    if (academicInterests.interests.fieldMotivations) {
      fieldMotivations = academicInterests.interests.fieldMotivations;
    }
  }

  if (!fieldInterests) {
    console.warn('⚠️ calculateInterestsRiasec: fieldInterests non trouvé dans:', academicInterests);
    return riasecScores;
  }

  const contributionsByType: Record<RiasecType, number> = {
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
  };

  // Pour chaque domaine académique
  Object.entries(fieldInterests).forEach(([fieldName, interestData]: [string, any]) => {
    let interestLevel = 0;
    let motivationLevel = 0;
    let combinedScore = 0;

    // Gérer différents formats possibles:
    // 1. Format simple: { "Mathématiques": 3 } (valeur numérique directe)
    // 2. Format détaillé: { "Mathématiques": { interestLevel: 3, motivationLevel: 4 } }
    // 3. Format avec fieldMotivations séparé: fieldInterests = { "Mathématiques": 3 }, fieldMotivations = { "Mathématiques": 4 }
    if (typeof interestData === 'number') {
      // Format simple: utiliser la valeur directement comme interestLevel
      interestLevel = interestData;
      // Si fieldMotivations existe séparément, l'utiliser, sinon utiliser la même valeur
      if (fieldMotivations && typeof fieldMotivations[fieldName] === 'number') {
        motivationLevel = fieldMotivations[fieldName];
      } else {
        motivationLevel = interestData; // Utiliser la même valeur pour motivation
      }
      combinedScore = (interestLevel + motivationLevel) / 2;
    } else if (interestData && typeof interestData === 'object') {
      // Format détaillé
      interestLevel = interestData.interestLevel || 0;
      motivationLevel = interestData.motivationLevel || 0;
      // Si motivationLevel n'est pas dans l'objet mais fieldMotivations existe, l'utiliser
      if (motivationLevel === 0 && fieldMotivations && typeof fieldMotivations[fieldName] === 'number') {
        motivationLevel = fieldMotivations[fieldName];
      }
      combinedScore = (interestLevel + motivationLevel) / 2;
    } else {
      return; // Ignorer les valeurs invalides
    }

    if (combinedScore <= 0) return;

    // Trouver la catégorie du domaine
    const category = findFieldCategory(fieldName);
    const mapping = getFieldRiasecMapping(fieldName, category);

    // Les poids doivent sommer à 1.0 pour chaque domaine
    const sumWeights = Object.values(mapping).reduce((sum, w) => sum + w, 0);

    // Appliquer le mapping avec le score combiné
    // Contribution brute = combinedScore × weight
    Object.entries(mapping).forEach(([riasecType, weight]) => {
      const contribution = combinedScore * weight;
      riasecScores[riasecType as RiasecType] += contribution;
      contributionsByType[riasecType as RiasecType] += contribution;
      console.log(`  📊 ${fieldName} (intérêt: ${interestLevel}, motivation: ${motivationLevel}, combiné: ${combinedScore.toFixed(2)}) → ${riasecType}: +${contribution.toFixed(2)} (weight: ${weight})`);
    });
  });

  // Normaliser les scores pour qu'ils somment à 100%
  // On normalise en fonction de la somme totale des contributions
  const totalContributions = Object.values(contributionsByType).reduce((sum, val) => sum + val, 0);
  
  if (totalContributions > 0) {
    // Normaliser pour que la somme soit 100
    Object.keys(riasecScores).forEach(key => {
      const type = key as RiasecType;
      riasecScores[type] = normalizeRiasecScore(
        (contributionsByType[type] / totalContributions) * 100
      );
    });
    console.log(`  ✅ Normalisation interests: scores normalisés:`, riasecScores);
  } else {
    console.warn('⚠️ calculateInterestsRiasec: totalContributions est 0, aucun score calculé');
  }

  return riasecScores;
};

/**
 * Trouve la catégorie d'un domaine académique
 */
const findFieldCategory = (fieldName: string): string => {
  // Mapping simplifié basé sur les noms de domaines
  const fieldCategories: Record<string, string> = {
    'Mathématiques': 'Sciences',
    'Physique': 'Sciences',
    'Chimie': 'Sciences',
    'Biologie': 'Sciences',
    'Informatique': 'Sciences',
    'Ingénierie': 'Sciences',
    'Médecine': 'Santé',
    'Pharmacie': 'Santé',
    'Dentaire': 'Santé',
    'Psychologie': 'Sciences humaines',
    'Sociologie': 'Sciences humaines',
    'Histoire': 'Sciences humaines',
    'Géographie': 'Sciences humaines',
    'Philosophie': 'Sciences humaines',
    'Littérature française': 'Langues et littérature',
    'Littérature arabe': 'Langues et littérature',
    'Langues étrangères': 'Langues et littérature',
    'Économie': 'Commerce et gestion',
    'Gestion': 'Commerce et gestion',
    'Comptabilité': 'Commerce et gestion',
    'Marketing': 'Commerce et gestion',
    'Droit': 'Juridique',
    'Sciences politiques': 'Juridique',
    'Arts plastiques': 'Arts',
    'Musique': 'Arts',
    'Design': 'Arts',
    'Architecture': 'Arts'
  };

  return fieldCategories[fieldName] || 'Sciences';
};

/**
 * Calcule les scores RIASEC à partir du test de compatibilité carrières
 */
const calculateCareersRiasec = (careerCompatibility: any): Record<RiasecType, number> => {
  const riasecScores: Record<RiasecType, number> = {
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
  };

  if (!careerCompatibility) {
    console.warn('⚠️ calculateCareersRiasec: careerCompatibility est null/undefined');
    return riasecScores;
  }

  // Gérer différentes structures de careerAttractions
  let careerAttractions = null;
  
  // Priorité 1: careerAttractions direct
  if (careerCompatibility.careerAttractions) {
    careerAttractions = careerCompatibility.careerAttractions;
  } 
  // Priorité 2: dans careers.careerAttractions
  else if (careerCompatibility.careers?.careerAttractions) {
    careerAttractions = careerCompatibility.careers.careerAttractions;
  }
  // Priorité 3: dans careerCompatibility.careerCompatibility.careerAttractions
  else if (careerCompatibility.careerCompatibility?.careerAttractions) {
    careerAttractions = careerCompatibility.careerCompatibility.careerAttractions;
  }
  // Priorité 4: utiliser enrichedCareerData si disponible
  else if (careerCompatibility.enrichedCareerData) {
    // Convertir enrichedCareerData en format careerAttractions
    careerAttractions = {};
    Object.entries(careerCompatibility.enrichedCareerData).forEach(([careerName, data]: [string, any]) => {
      if (data.attractionLevel !== undefined) {
        careerAttractions[careerName] = {
          attractionLevel: data.attractionLevel,
          accessibilityPerceived: data.accessibilityPerceived,
          sector: data.sector,
          // Inclure les poids RIASEC stockés si disponibles
          riasecWeights: data.riasecWeights || null
        };
      }
    });
    console.log('✅ Utilisation de enrichedCareerData pour careerAttractions');
  }
  // Priorité 5: utiliser careersEvaluated si disponible
  else if (careerCompatibility.careersEvaluated && Array.isArray(careerCompatibility.careersEvaluated)) {
    careerAttractions = {};
    careerCompatibility.careersEvaluated.forEach((career: any) => {
      if (career.attractionLevel !== undefined) {
        careerAttractions[career.name] = {
          attractionLevel: career.attractionLevel,
          accessibilityPerceived: career.accessibilityPerceived,
          sector: career.sector,
          // Inclure les poids RIASEC stockés si disponibles
          riasecWeights: career.riasecWeights || null
        };
      }
    });
    console.log('✅ Utilisation de careersEvaluated pour careerAttractions');
  }

  if (!careerAttractions || Object.keys(careerAttractions).length === 0) {
    console.warn('⚠️ calculateCareersRiasec: careerAttractions non trouvé dans:', careerCompatibility);
    return riasecScores;
  }
  
  console.log(`✅ ${Object.keys(careerAttractions).length} carrières trouvées pour le calcul RIASEC`);

  let totalWeightedContribution = 0;
  const contributionsByType: Record<RiasecType, number> = {
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
  };

  // Compter le nombre total de carrières pour la normalisation
  const totalCareersCount = Object.keys(careerAttractions).length;
  let careersWithPositiveAttraction = 0;

  // Pour chaque carrière
  Object.entries(careerAttractions).forEach(([careerName, attractionData]: [string, any]) => {
    let attractionLevel = 0;
    let storedRiasecWeights: Record<string, number> | null = null;

    // Gérer différents formats possibles:
    // 1. Format simple: { "Médecin": 4 } (valeur numérique directe)
    // 2. Format détaillé: { "Médecin": { attractionLevel: 4, riasecWeights: {...} } }
    if (typeof attractionData === 'number') {
      // Format simple: utiliser la valeur directement
      attractionLevel = attractionData;
    } else if (attractionData && typeof attractionData === 'object') {
      // Format détaillé
      attractionLevel = attractionData.attractionLevel || 0;
      // Récupérer les poids RIASEC stockés si disponibles
      if (attractionData.riasecWeights) {
        storedRiasecWeights = attractionData.riasecWeights;
      }
    } else {
      // Valeur invalide, considérer comme 0
      attractionLevel = 0;
    }

    // Compter les carrières avec attraction positive
    if (attractionLevel > 0) {
      careersWithPositiveAttraction++;
    }

    // Si attractionLevel <= 0, on ne contribue pas aux scores RIASEC
    // mais on compte quand même la carrière pour la normalisation
    if (attractionLevel <= 0) {
      console.log(`  ⚪ ${careerName} (attraction: ${attractionLevel}) → ignorée`);
      return;
    }

    // Utiliser les poids RIASEC stockés si disponibles, sinon les calculer
    let mapping: Record<string, number>;
    if (storedRiasecWeights) {
      // Utiliser les poids RIASEC stockés (priorité)
      mapping = storedRiasecWeights;
      console.log(`  ✅ Utilisation des poids RIASEC stockés pour ${careerName}`);
    } else {
      // Calculer les poids RIASEC (fallback)
      const sector = findCareerSector(careerName);
      mapping = getCareerRiasecMapping(careerName, sector);
      console.log(`  ⚠️ Poids RIASEC non stockés pour ${careerName}, utilisation du mapping calculé`);
    }

    // Calcul : attractionLevel × weight
    Object.entries(mapping).forEach(([riasecType, weight]) => {
      const contribution = attractionLevel * (weight as number);
      riasecScores[riasecType as RiasecType] += contribution;
      contributionsByType[riasecType as RiasecType] += contribution;
    });
  });
  
  console.log(`  📈 Statistiques: ${careersWithPositiveAttraction}/${totalCareersCount} carrières avec attraction > 0`);

  // NOUVELLE MÉTHODE DE NORMALISATION SIMPLIFIÉE
  // Normaliser directement par rapport à la somme totale des contributions
  // Cela reflète la vraie distribution des préférences selon les mappings RIASEC
  const totalContributions = Object.values(contributionsByType).reduce((sum, val) => sum + val, 0);
  
  if (totalContributions > 0) {
    // Normalisation simple : distribution relative des contributions
    // Chaque type RIASEC reçoit un pourcentage proportionnel à sa contribution totale
    Object.keys(riasecScores).forEach(key => {
      const type = key as RiasecType;
      riasecScores[type] = normalizeRiasecScore(
        (contributionsByType[type] / totalContributions) * 100
      );
    });
    
    console.log(`  ✅ Normalisation: scores normalisés (somme=100%):`, riasecScores);
  } else {
    console.warn('⚠️ calculateCareersRiasec: totalContributions est 0, aucun score calculé');
  }

  return riasecScores;
};

/**
 * Trouve le secteur d'une carrière (pour fallback si mapping individuel non trouvé)
 */
const findCareerSector = (careerName: string): string => {
  // Mapping simplifié basé sur les noms de carrières
  const careerSectors: Record<string, string> = {
    // Santé
    'Médecin généraliste': 'Santé',
    'Infirmier': 'Santé',
    'Pharmacien': 'Santé',
    'طبيب عام': 'Santé',
    'ممرض': 'Santé',
    'صيدلي': 'Santé',
    
    // Technologie
    'Ingénieur informatique': 'Technologie',
    'Développeur web': 'Technologie',
    'Architecte': 'Technologie',
    'مهندس معلوماتية': 'Technologie',
    'مطور مواقع': 'Technologie',
    'مهندس معماري': 'Technologie',
    
    // Éducation
    'Enseignant secondaire': 'Éducation',
    'Professeur universitaire': 'Éducation',
    'معلم ثانوي': 'Éducation',
    'أستاذ جامعي': 'Éducation',
    
    // Finance
    'Expert-comptable': 'Finance',
    'Analyste financier': 'Finance',
    'محاسب خبير': 'Finance',
    'محلل مالي': 'Finance',
    
    // Juridique
    'Avocat d\'affaires': 'Juridique',
    'Juriste d\'entreprise': 'Juridique',
    'محامي أعمال': 'Juridique',
    'مستشار قانوني': 'Juridique',
    
    // Arts et Créatif
    'Designer graphique': 'Arts et Créatif',
    'Photographe': 'Arts et Créatif',
    'مصمم جرافيك': 'Arts et Créatif',
    'مصور': 'Arts et Créatif',
    
    // Communication et Médias
    'Journaliste': 'Communication et Médias',
    'Rédacteur web': 'Communication et Médias',
    'صحفي': 'Communication et Médias',
    'محرر ويب': 'Communication et Médias',
    
    // Commerce et Vente
    'Commercial B2B': 'Commerce et Vente',
    'Responsable commercial': 'Commerce et Vente',
    'مندوب مبيعات شركات': 'Commerce et Vente',
    'مسؤول تجاري': 'Commerce et Vente',
    
    // Marketing
    'Responsable marketing': 'Marketing',
    'Digital marketer': 'Marketing',
    'مسؤول تسويق': 'Marketing',
    'مسوق رقمي': 'Marketing',
    
    // Ressources Humaines
    'Responsable RH': 'Ressources Humaines',
    'Recruteur': 'Ressources Humaines',
    'مسؤول موارد بشرية': 'Ressources Humaines',
    'مختص توظيف': 'Ressources Humaines',
    
    // Transport et Logistique
    'Pilote de ligne': 'Transport et Logistique',
    'Logisticien': 'Transport et Logistique',
    'طيار مدني': 'Transport et Logistique',
    'مختص لوجستيك': 'Transport et Logistique',
    
    // Hôtellerie et Restauration
    'Chef cuisinier': 'Hôtellerie et Restauration',
    'Directeur d\'hôtel': 'Hôtellerie et Restauration',
    'طباخ محترف': 'Hôtellerie et Restauration',
    'مدير فندق': 'Hôtellerie et Restauration',
    
    // Services Publics
    'Administrateur civil': 'Services Publics',
    'Policier': 'Services Publics',
    'إداري مدني': 'Services Publics',
    'شرطي': 'Services Publics',
    
    // Entrepreneuriat
    'Chef d\'entreprise': 'Entrepreneuriat',
    'رائد أعمال': 'Entrepreneuriat',
    
    // Conseil
    'Consultant IT': 'Conseil',
    'استشاري تقني': 'Conseil',
    
    // Recherche
    'Chercheur scientifique': 'Recherche',
    'Ingénieur R&D': 'Recherche',
    'باحث علمي': 'Recherche',
    'مهندس بحث وتطوير': 'Recherche',
    
    // Langues
    'Traducteur': 'Langues',
    'Interprète': 'Langues',
    'مترجم': 'Langues',
    'مترجم فوري': 'Langues',
    
    // Social
    'Travailleur social': 'Social',
    'Psychologue': 'Social',
    'أخصائي اجتماعي': 'Social',
    'طبيب نفسي': 'Social',
    
    // Agriculture
    'Ingénieur agronome': 'Agriculture',
    'مهندس فلاحي': 'Agriculture',
    
    // Environnement
    'Consultant environnement': 'Environnement',
    'استشاري بيئي': 'Environnement'
  };

  return careerSectors[careerName] || 'Technologie';
};

/**
 * Calcule les scores RIASEC à partir du test de contraintes
 */
const calculateConstraintsRiasec = (constraints: any): Record<RiasecType, number> => {
  const riasecScores: Record<RiasecType, number> = {
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
  };

  if (!constraints?.priorities) {
    console.warn('⚠️ calculateConstraintsRiasec: priorities non trouvé dans:', constraints);
    return riasecScores;
  }

  const priorities = constraints.priorities;
  const contributionsByType: Record<RiasecType, number> = {
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
  };

  // Pour chaque priorité
  Object.entries(priorities).forEach(([priority, value]: [string, any]) => {
    if (typeof value !== 'number' || value <= 0) return;

    const mapping = getPriorityRiasecMapping(priority);
    
    // Calculer la contribution pondérée pour cette priorité
    // Les poids doivent sommer à 1.0 pour chaque priorité
    const sumWeights = Object.values(mapping).reduce((sum, w) => sum + w, 0);

    // Appliquer le mapping avec la valeur de priorité
    // Contribution brute = value × weight
    Object.entries(mapping).forEach(([riasecType, weight]) => {
      const contribution = value * weight;
      riasecScores[riasecType as RiasecType] += contribution;
      contributionsByType[riasecType as RiasecType] += contribution;
      console.log(`  📊 ${priority} (valeur: ${value}) → ${riasecType}: +${contribution.toFixed(2)} (weight: ${weight})`);
    });
  });

  // Normaliser les scores pour qu'ils somment à 100%
  // On normalise en fonction de la somme totale des contributions
  const totalContributions = Object.values(contributionsByType).reduce((sum, val) => sum + val, 0);
  
  if (totalContributions > 0) {
    // Normaliser pour que la somme soit 100
    Object.keys(riasecScores).forEach(key => {
      const type = key as RiasecType;
      riasecScores[type] = normalizeRiasecScore(
        (contributionsByType[type] / totalContributions) * 100
      );
    });
    console.log(`  ✅ Normalisation constraints: scores normalisés:`, riasecScores);
  } else {
    console.warn('⚠️ calculateConstraintsRiasec: totalContributions est 0, aucun score calculé');
  }

  return riasecScores;
};

/**
 * Calcule le type RIASEC composite basé sur tous les tests
 */
/**
 * Extrait les données d'intérêts académiques depuis différentes structures
 */
const extractAcademicInterests = (userData: any): any => {
  console.log('🔍 extractAcademicInterests - Checking data structure...');
  
  // Priorité 1: userData.academicInterests (niveau racine)
  if (userData?.academicInterests) {
    console.log('✅ Found academicInterests at root level');
    // Si c'est directement l'objet avec fieldInterests
    if (userData.academicInterests.fieldInterests) {
      const count = Object.keys(userData.academicInterests.fieldInterests).length;
      console.log(`✅ Found fieldInterests in academicInterests (${count} fields)`);
      return userData.academicInterests;
    }
    // Si c'est dans interests.fieldInterests
    if (userData.academicInterests.interests?.fieldInterests) {
      const count = Object.keys(userData.academicInterests.interests.fieldInterests).length;
      console.log(`✅ Found fieldInterests in academicInterests.interests (${count} fields)`);
      return userData.academicInterests.interests;
    }
    console.log('⚠️ academicInterests found but no fieldInterests');
    return userData.academicInterests;
  }
  
  // Priorité 2: userData.currentStep.interests (nouvelle structure avec données enrichies)
  if (userData?.currentStep?.interests) {
    console.log('✅ Found interests in currentStep');
    // Vérifier si c'est la nouvelle structure avec interests.academicInterests
    if (userData.currentStep.interests.academicInterests) {
      const data = userData.currentStep.interests.academicInterests;
      if (data.fieldInterests || data.enrichedInterestsData || data.fieldsEvaluated) {
        const count = Object.keys(data.fieldInterests || data.enrichedInterestsData || {}).length;
        console.log(`✅ Found academicInterests in currentStep.interests (${count} fields)`);
        return data;
      }
    }
    // Vérifier si c'est dans interests.interests
    if (userData.currentStep.interests.interests) {
      const interestsData = userData.currentStep.interests.interests;
      if (interestsData.fieldInterests) {
        const count = Object.keys(interestsData.fieldInterests).length;
        console.log(`✅ Found fieldInterests in currentStep.interests.interests (${count} fields)`);
        return interestsData;
      }
      // Vérifier si enrichedInterestsData ou fieldsEvaluated sont disponibles
      if (interestsData.enrichedInterestsData || interestsData.fieldsEvaluated) {
        // Convertir enrichedInterestsData ou fieldsEvaluated en format fieldInterests
        const fieldInterests: Record<string, any> = {};
        const fieldMotivations: Record<string, number> = {};
        
        if (interestsData.enrichedInterestsData) {
          Object.entries(interestsData.enrichedInterestsData).forEach(([fieldName, data]: [string, any]) => {
            if (data.interestLevel !== undefined) {
              fieldInterests[fieldName] = {
                interestLevel: data.interestLevel,
                motivationLevel: data.motivationLevel || 0
              };
              if (data.motivationLevel !== undefined) {
                fieldMotivations[fieldName] = data.motivationLevel;
              }
            }
          });
        } else if (interestsData.fieldsEvaluated && Array.isArray(interestsData.fieldsEvaluated)) {
          interestsData.fieldsEvaluated.forEach((field: any) => {
            if (field.interestLevel !== undefined) {
              fieldInterests[field.name] = {
                interestLevel: field.interestLevel,
                motivationLevel: field.motivationLevel || 0
              };
              if (field.motivationLevel !== undefined) {
                fieldMotivations[field.name] = field.motivationLevel;
              }
            }
          });
        }
        
        if (Object.keys(fieldInterests).length > 0) {
          const count = Object.keys(fieldInterests).length;
          console.log(`✅ Converted enrichedInterestsData/fieldsEvaluated to fieldInterests (${count} fields)`);
          return {
            fieldInterests,
            fieldMotivations: Object.keys(fieldMotivations).length > 0 ? fieldMotivations : undefined
          };
        }
      }
    }
    // Vérifier si fieldInterests est directement dans interests
    if (userData.currentStep.interests.fieldInterests) {
      const count = Object.keys(userData.currentStep.interests.fieldInterests).length;
      console.log(`✅ Found fieldInterests in currentStep.interests (${count} fields)`);
      return userData.currentStep.interests;
    }
  }
  
  console.warn('⚠️ extractAcademicInterests: No data found');
  return null;
};

/**
 * Extrait les données de contraintes depuis différentes structures
 */
const extractConstraints = (userData: any): any => {
  console.log('🔍 extractConstraints - Checking data structure...');
  
  // Priorité 1: userData.constraints (niveau racine)
  if (userData?.constraints) {
    console.log('✅ Found constraints at root level');
    if (userData.constraints.priorities) {
      const count = Object.keys(userData.constraints.priorities).length;
      console.log(`✅ Found priorities in constraints (${count} priorities)`);
      return userData.constraints;
    }
    console.log('⚠️ constraints found but no priorities');
    return userData.constraints;
  }
  
  // Priorité 2: userData.currentStep.constraints (nouvelle structure avec données enrichies)
  if (userData?.currentStep?.constraints) {
    console.log('✅ Found constraints in currentStep');
    // Vérifier si c'est la nouvelle structure avec constraints.constraintsData
    if (userData.currentStep.constraints.constraintsData) {
      const data = userData.currentStep.constraints.constraintsData;
      if (data.priorities || data.enrichedConstraintsData || data.prioritiesEvaluated) {
        const count = Object.keys(data.priorities || data.enrichedConstraintsData?.priorities || {}).length;
        console.log(`✅ Found constraintsData in currentStep.constraints (${count} priorities)`);
        return data;
      }
    }
    // Vérifier si c'est dans constraints.constraints
    if (userData.currentStep.constraints.constraints) {
      const constraintsData = userData.currentStep.constraints.constraints;
      if (constraintsData.priorities) {
        const count = Object.keys(constraintsData.priorities).length;
        console.log(`✅ Found priorities in currentStep.constraints.constraints (${count} priorities)`);
        return constraintsData;
      }
      // Vérifier si enrichedConstraintsData ou prioritiesEvaluated sont disponibles
      if (constraintsData.enrichedConstraintsData || constraintsData.prioritiesEvaluated) {
        // Utiliser enrichedConstraintsData si disponible
        if (constraintsData.enrichedConstraintsData?.priorities) {
          const count = Object.keys(constraintsData.enrichedConstraintsData.priorities).length;
          console.log(`✅ Found priorities in enrichedConstraintsData (${count} priorities)`);
          return constraintsData.enrichedConstraintsData;
        }
        // Convertir prioritiesEvaluated en format priorities
        if (constraintsData.prioritiesEvaluated && Array.isArray(constraintsData.prioritiesEvaluated)) {
          const priorities: Record<string, number> = {};
          constraintsData.prioritiesEvaluated.forEach((item: any) => {
            if (item.priority && typeof item.value === 'number') {
              priorities[item.priority] = item.value;
            }
          });
          if (Object.keys(priorities).length > 0) {
            const count = Object.keys(priorities).length;
            console.log(`✅ Converted prioritiesEvaluated to priorities (${count} priorities)`);
            return { priorities };
          }
        }
      }
    }
    // Vérifier si priorities est directement dans constraints
    if (userData.currentStep.constraints.priorities) {
      const count = Object.keys(userData.currentStep.constraints.priorities).length;
      console.log(`✅ Found priorities in currentStep.constraints (${count} priorities)`);
      return userData.currentStep.constraints;
    }
  }
  
  console.warn('⚠️ extractConstraints: No data found');
  return null;
};

/**
 * Extrait les données de compatibilité de carrière depuis différentes structures
 */
const extractCareerCompatibility = (userData: any): any => {
  console.log('🔍 extractCareerCompatibility - Checking data structure...');
  
  // Priorité 1: userData.careerCompatibility (niveau racine)
  if (userData?.careerCompatibility) {
    console.log('✅ Found careerCompatibility at root level');
    // Si c'est directement l'objet avec careerAttractions
    if (userData.careerCompatibility.careerAttractions) {
      const count = Object.keys(userData.careerCompatibility.careerAttractions).length;
      console.log(`✅ Found careerAttractions in careerCompatibility (${count} careers)`);
      return userData.careerCompatibility;
    }
    // Si c'est dans careers.careerAttractions
    if (userData.careerCompatibility.careers?.careerAttractions) {
      const count = Object.keys(userData.careerCompatibility.careers.careerAttractions).length;
      console.log(`✅ Found careerAttractions in careerCompatibility.careers (${count} careers)`);
      return userData.careerCompatibility.careers;
    }
    console.log('⚠️ careerCompatibility found but no careerAttractions');
    return userData.careerCompatibility;
  }
  
  // Priorité 2: userData.currentStep.careerCompatibility (nouvelle structure avec données enrichies)
  if (userData?.currentStep?.careerCompatibility) {
    console.log('✅ Found careerCompatibility in currentStep');
    // Vérifier si c'est la nouvelle structure avec careerCompatibility.careerCompatibility
    if (userData.currentStep.careerCompatibility.careerCompatibility) {
      const data = userData.currentStep.careerCompatibility.careerCompatibility;
      if (data.careerAttractions || data.enrichedCareerData || data.careersEvaluated) {
        const count = Object.keys(data.careerAttractions || data.enrichedCareerData || {}).length;
        console.log(`✅ Found careerCompatibility.careerCompatibility (${count} careers)`);
        return data;
      }
    }
    // Vérifier si careerAttractions est directement dans careerCompatibility
    if (userData.currentStep.careerCompatibility.careerAttractions) {
      const count = Object.keys(userData.currentStep.careerCompatibility.careerAttractions).length;
      console.log(`✅ Found careerAttractions in currentStep.careerCompatibility (${count} careers)`);
      return userData.currentStep.careerCompatibility;
    }
  }
  
  // Priorité 3: userData.currentStep.careerCompatibility.careers
  if (userData?.currentStep?.careerCompatibility?.careers) {
    console.log('✅ Found careers in currentStep.careerCompatibility.careers');
    if (userData.currentStep.careerCompatibility.careers.careerAttractions) {
      const count = Object.keys(userData.currentStep.careerCompatibility.careers.careerAttractions).length;
      console.log(`✅ Found careerAttractions in currentStep.careerCompatibility.careers (${count} careers)`);
      return userData.currentStep.careerCompatibility.careers;
    }
  }
  
  // Priorité 4: userData.currentStep.careers (structure directe du backend)
  if (userData?.currentStep?.careers) {
    console.log('✅ Found careers in currentStep.careers');
    // Vérifier si c'est un objet avec careerAttractions ou directement les données
    if (userData.currentStep.careers.careerAttractions) {
      const count = Object.keys(userData.currentStep.careers.careerAttractions).length;
      console.log(`✅ Found careerAttractions in currentStep.careers (${count} careers)`);
      return userData.currentStep.careers;
    }
    // Si c'est directement un objet avec les données complètes
    if (userData.currentStep.careers.careerCompatibility) {
      const data = userData.currentStep.careers.careerCompatibility;
      if (data.careerAttractions || data.enrichedCareerData || data.careersEvaluated) {
        const count = Object.keys(data.careerAttractions || data.enrichedCareerData || {}).length;
        console.log(`✅ Found careerCompatibility in currentStep.careers (${count} careers)`);
        return data;
      }
    }
  }
  
  console.warn('⚠️ extractCareerCompatibility: No data found');
  return null;
};

export const calculateCompositeRiasec = (userData: any): CompositeRiasecResult => {
  const riasecTypes: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  
  // Initialiser les scores composites
  const compositeScores: Record<RiasecType, number> = {
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
  };

  const breakdown = {
    riasec: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<RiasecType, number>,
    personality: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<RiasecType, number>,
    interests: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<RiasecType, number>,
    careers: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<RiasecType, number>,
    constraints: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<RiasecType, number>
  };

  // 1. Scores RIASEC directs (40%)
  if (userData.riasecScores?.scores) {
    const directScores = userData.riasecScores.scores;
    riasecTypes.forEach(type => {
      const score = normalizeRiasecScore(directScores[type] || directScores[type === 'R' ? 'Realiste' : 
        type === 'I' ? 'Investigateur' : 
        type === 'A' ? 'Artistique' : 
        type === 'S' ? 'Social' : 
        type === 'E' ? 'Entreprenant' : 'Conventionnel'] || 0);
      breakdown.riasec[type] = score;
      compositeScores[type] += score * TEST_WEIGHTS.riasec;
    });
  }

  // 2. Scores inférés du test de personnalité (25%)
  // Extraire les données de personnalité depuis différentes structures
  let personalityData = null;
  
  // Priorité 1: userData.personalityScores (racine)
  if (userData.personalityScores) {
    personalityData = userData.personalityScores;
  }
  // Priorité 2: userData.currentStep.personality.personality
  else if (userData.currentStep?.personality?.personality) {
    personalityData = userData.currentStep.personality.personality;
  }
  // Priorité 3: userData.currentStep.personality
  else if (userData.currentStep?.personality) {
    personalityData = userData.currentStep.personality;
  }
  // Priorité 4: userData.currentStep.personality.personalityData
  else if (userData.currentStep?.personality?.personalityData) {
    personalityData = userData.currentStep.personality.personalityData;
  }
  
  if (personalityData) {
    // S'assurer que les poids RIASEC sont inclus si disponibles
    if (userData.currentStep?.personality?.personalityData?.traitRiasecWeights) {
      personalityData.traitRiasecWeights = userData.currentStep.personality.personalityData.traitRiasecWeights;
    } else if (userData.currentStep?.personality?.personality?.traitRiasecWeights) {
      personalityData.traitRiasecWeights = userData.currentStep.personality.personality.traitRiasecWeights;
    } else if (userData.personalityScores?.traitRiasecWeights) {
      personalityData.traitRiasecWeights = userData.personalityScores.traitRiasecWeights;
    }
    
    // PRIORITÉ: Inclure les questions enrichies si disponibles (pour calcul plus précis)
    if (userData.currentStep?.personality?.personalityData?.enrichedQuestions) {
      personalityData.enrichedQuestions = userData.currentStep.personality.personalityData.enrichedQuestions;
      console.log(`  ✅ Questions enrichies trouvées: ${personalityData.enrichedQuestions.length} questions`);
    } else if (userData.currentStep?.personality?.personality?.enrichedQuestions) {
      personalityData.enrichedQuestions = userData.currentStep.personality.personality.enrichedQuestions;
      console.log(`  ✅ Questions enrichies trouvées dans personality: ${personalityData.enrichedQuestions.length} questions`);
    } else if (userData.personalityScores?.enrichedQuestions) {
      personalityData.enrichedQuestions = userData.personalityScores.enrichedQuestions;
      console.log(`  ✅ Questions enrichies trouvées dans personalityScores: ${personalityData.enrichedQuestions.length} questions`);
    } else if (userData.currentStep?.personality?.personality?.session?.questions) {
      // Essayer d'extraire les questions enrichies depuis session.questions
      const sessionQuestions = userData.currentStep.personality.personality.session.questions;
      const enrichedFromSession = sessionQuestions.filter((q: any) => q.trait && q.riasecWeights);
      if (enrichedFromSession.length > 0) {
        personalityData.enrichedQuestions = enrichedFromSession;
        console.log(`  ✅ Questions enrichies extraites depuis session.questions: ${enrichedFromSession.length} questions`);
      }
    }
    
    const personalityRiasec = calculatePersonalityRiasec(personalityData);
    riasecTypes.forEach(type => {
      breakdown.personality[type] = personalityRiasec[type];
      compositeScores[type] += personalityRiasec[type] * TEST_WEIGHTS.personality;
    });
  }

  // 3. Scores inférés du test d'intérêts (20%)
  const academicInterestsData = extractAcademicInterests(userData);
  if (academicInterestsData) {
    console.log('🔍 Données academicInterests extraites:', academicInterestsData);
    console.log('🔍 Structure fieldInterests:', academicInterestsData.fieldInterests);
    console.log('📋 Calcul des contributions RIASEC par domaine académique:');
    const interestsRiasec = calculateInterestsRiasec(academicInterestsData);
    console.log('📊 Scores RIASEC calculés depuis interests:', interestsRiasec);
    const hasNonZeroScores = Object.values(interestsRiasec).some(score => score > 0);
    if (!hasNonZeroScores) {
      console.warn('⚠️ calculateInterestsRiasec returned all zeros!');
    }
    riasecTypes.forEach(type => {
      breakdown.interests[type] = interestsRiasec[type];
      compositeScores[type] += interestsRiasec[type] * TEST_WEIGHTS.interests;
    });
  } else {
    console.warn('⚠️ Aucune donnée academicInterests trouvée dans userData');
  }

  // 4. Scores inférés du test de carrières (10%)
  const careerCompatibilityData = extractCareerCompatibility(userData);
  if (careerCompatibilityData) {
    console.log('🔍 Données careerCompatibility extraites:', careerCompatibilityData);
    console.log('🔍 Structure careerAttractions:', careerCompatibilityData.careerAttractions);
    console.log('📋 Calcul RIASEC par carrière:');
    const careersRiasec = calculateCareersRiasec(careerCompatibilityData);
    console.log('📊 Scores RIASEC calculés depuis careers:', careersRiasec);
    const hasNonZeroScores = Object.values(careersRiasec).some(score => score > 0);
    if (!hasNonZeroScores) {
      console.warn('⚠️ calculateCareersRiasec returned all zeros!');
    }
    riasecTypes.forEach(type => {
      breakdown.careers[type] = careersRiasec[type];
      compositeScores[type] += careersRiasec[type] * TEST_WEIGHTS.careers;
    });
  } else {
    console.warn('⚠️ Aucune donnée careerCompatibility trouvée dans userData');
  }

  // 5. Scores inférés du test de contraintes (5%)
  const constraintsData = extractConstraints(userData);
  if (constraintsData) {
    console.log('🔍 Données constraints extraites:', constraintsData);
    console.log('🔍 Structure priorities:', constraintsData.priorities);
    console.log('📋 Calcul RIASEC par priorité:');
    const constraintsRiasec = calculateConstraintsRiasec(constraintsData);
    console.log('📊 Scores RIASEC calculés depuis constraints:', constraintsRiasec);
    const hasNonZeroScores = Object.values(constraintsRiasec).some(score => score > 0);
    if (!hasNonZeroScores) {
      console.warn('⚠️ calculateConstraintsRiasec returned all zeros!');
    }
    riasecTypes.forEach(type => {
      breakdown.constraints[type] = constraintsRiasec[type];
      compositeScores[type] += constraintsRiasec[type] * TEST_WEIGHTS.constraints;
    });
  } else {
    console.warn('⚠️ Aucune donnée constraints trouvée dans userData');
  }

  // Trouver le type dominant
  let dominantType: RiasecType = 'R';
  let maxScore = compositeScores.R;

  riasecTypes.forEach(type => {
    if (compositeScores[type] > maxScore) {
      maxScore = compositeScores[type];
      dominantType = type;
    }
  });

  // Calculer le niveau de confiance (différence entre le premier et le deuxième score)
  const sortedScores = [...riasecTypes].sort((a, b) => compositeScores[b] - compositeScores[a]);
  const firstScore = compositeScores[sortedScores[0]];
  const secondScore = compositeScores[sortedScores[1]];
  const confidence = Math.min(100, Math.max(0, ((firstScore - secondScore) / firstScore) * 100));

  return {
    dominantType,
    scores: compositeScores,
    confidence: Math.round(confidence),
    breakdown
  };
};

