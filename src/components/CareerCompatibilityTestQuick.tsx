import React, { useState, useEffect } from 'react';
import { ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';
import { Loader2Icon, CheckIcon } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getAuthToken } from '../utils/auth';

interface CareerCompatibilityTestQuickProps {
  onComplete: (data: any) => void;
  onPrevious: () => void;
  canGoBack: boolean;
  language: string;
  sessionData?: any; // Données de session existantes
  userData?: any; // Données utilisateur passées depuis AppQuick
}

interface CareerResponse {
  careerId: string;
  careerName: string;
  sector: string;
  difficultyLevel: string;
  attractionLevel: number | null;
  accessibilityPerceived: boolean | null;
  attractionResponseTime: number | null;
  accessibilityResponseTime: number | null;
  timestamp: Date;
  careerIndex: number;
}

interface PreferenceResponse {
  preferenceType: 'workStyle' | 'priority' | 'sector';
  selectedValue: string;
  responseTime: number;
  timestamp: Date;
}

// Version réduite : 2-3 carrières par secteur au lieu de 7
const careersQuick = {
  fr: [
    // Santé (réduit à 3)
    { name: 'Médecin généraliste', sector: 'Santé', accessibility: 'Difficile' },
    { name: 'Infirmier', sector: 'Santé', accessibility: 'Moyenne' },
    { name: 'Pharmacien', sector: 'Santé', accessibility: 'Difficile' },

    // Technologie (réduit à 3)
    { name: 'Ingénieur informatique', sector: 'Technologie', accessibility: 'Moyenne' },
    { name: 'Développeur web', sector: 'Technologie', accessibility: 'Facile' },
    { name: 'Architecte', sector: 'Technologie', accessibility: 'Moyenne' },

    // Éducation (réduit à 2)
    { name: 'Enseignant secondaire', sector: 'Éducation', accessibility: 'Moyenne' },
    { name: 'Professeur universitaire', sector: 'Éducation', accessibility: 'Difficile' },

    // Finance (réduit à 2)
    { name: 'Expert-comptable', sector: 'Finance', accessibility: 'Moyenne' },
    { name: 'Analyste financier', sector: 'Finance', accessibility: 'Moyenne' },

    // Juridique (réduit à 2)
    { name: 'Avocat d\'affaires', sector: 'Juridique', accessibility: 'Difficile' },
    { name: 'Juriste d\'entreprise', sector: 'Juridique', accessibility: 'Moyenne' },

    // Arts et Créatif (réduit à 2)
    { name: 'Designer graphique', sector: 'Arts et Créatif', accessibility: 'Moyenne' },
    { name: 'Photographe', sector: 'Arts et Créatif', accessibility: 'Variable' },

    // Communication et Médias (réduit à 2)
    { name: 'Journaliste', sector: 'Communication et Médias', accessibility: 'Difficile' },
    { name: 'Rédacteur web', sector: 'Communication et Médias', accessibility: 'Moyenne' },

    // Commerce et Vente (réduit à 2)
    { name: 'Commercial B2B', sector: 'Commerce et Vente', accessibility: 'Moyenne' },
    { name: 'Responsable commercial', sector: 'Commerce et Vente', accessibility: 'Moyenne' },

    // Marketing (réduit à 2)
    { name: 'Responsable marketing', sector: 'Marketing', accessibility: 'Moyenne' },
    { name: 'Digital marketer', sector: 'Marketing', accessibility: 'Moyenne' },

    // Ressources Humaines (réduit à 2)
    { name: 'Responsable RH', sector: 'Ressources Humaines', accessibility: 'Moyenne' },
    { name: 'Recruteur', sector: 'Ressources Humaines', accessibility: 'Moyenne' },

    // Transport et Logistique (réduit à 2)
    { name: 'Pilote de ligne', sector: 'Transport et Logistique', accessibility: 'Difficile' },
    { name: 'Logisticien', sector: 'Transport et Logistique', accessibility: 'Moyenne' },

    // Hôtellerie et Restauration (réduit à 2)
    { name: 'Chef cuisinier', sector: 'Hôtellerie et Restauration', accessibility: 'Moyenne' },
    { name: 'Directeur d\'hôtel', sector: 'Hôtellerie et Restauration', accessibility: 'Moyenne' },

    // Services Publics (réduit à 2)
    { name: 'Administrateur civil', sector: 'Services Publics', accessibility: 'Difficile' },
    { name: 'Policier', sector: 'Services Publics', accessibility: 'Moyenne' },

    // Entrepreneuriat et Conseil (réduit à 2)
    { name: 'Chef d\'entreprise', sector: 'Entrepreneuriat', accessibility: 'Variable' },
    { name: 'Consultant IT', sector: 'Conseil', accessibility: 'Moyenne' },

    // Recherche et Sciences (réduit à 2)
    { name: 'Chercheur scientifique', sector: 'Recherche', accessibility: 'Difficile' },
    { name: 'Ingénieur R&D', sector: 'Recherche', accessibility: 'Moyenne' },

    // Langues et International (réduit à 2)
    { name: 'Traducteur', sector: 'Langues', accessibility: 'Moyenne' },
    { name: 'Interprète', sector: 'Langues', accessibility: 'Moyenne' },

    // Social et Humanitaire (réduit à 2)
    { name: 'Travailleur social', sector: 'Social', accessibility: 'Moyenne' },
    { name: 'Psychologue', sector: 'Social', accessibility: 'Moyenne' },

    // Agriculture et Environnement (réduit à 2)
    { name: 'Ingénieur agronome', sector: 'Agriculture', accessibility: 'Moyenne' },
    { name: 'Consultant environnement', sector: 'Environnement', accessibility: 'Moyenne' }
  ],
  ar: [
    // الصحة (3 مهن)
    { name: 'طبيب عام', sector: 'الصحة', accessibility: 'صعب' },
    { name: 'ممرض', sector: 'الصحة', accessibility: 'متوسط' },
    { name: 'صيدلي', sector: 'الصحة', accessibility: 'صعب' },

    // التكنولوجيا (3 مهن)
    { name: 'مهندس معلوماتية', sector: 'التكنولوجيا', accessibility: 'متوسط' },
    { name: 'مطور مواقع', sector: 'التكنولوجيا', accessibility: 'سهل' },
    { name: 'مهندس معماري', sector: 'التكنولوجيا', accessibility: 'متوسط' },

    // التعليم (2 مهن)
    { name: 'معلم ثانوي', sector: 'التعليم', accessibility: 'متوسط' },
    { name: 'أستاذ جامعي', sector: 'التعليم', accessibility: 'صعب' },

    // المالية (2 مهن)
    { name: 'محاسب خبير', sector: 'المالية', accessibility: 'متوسط' },
    { name: 'محلل مالي', sector: 'المالية', accessibility: 'متوسط' },

    // القانون (2 مهن)
    { name: 'محامي أعمال', sector: 'القانون', accessibility: 'صعب' },
    { name: 'مستشار قانوني', sector: 'القانون', accessibility: 'متوسط' },

    // الفنون والإبداع (2 مهن)
    { name: 'مصمم جرافيك', sector: 'الفنون والإبداع', accessibility: 'متوسط' },
    { name: 'مصور', sector: 'الفنون والإبداع', accessibility: 'متغير' },

    // الإعلام والاتصال (2 مهن)
    { name: 'صحفي', sector: 'الإعلام والاتصال', accessibility: 'صعب' },
    { name: 'محرر ويب', sector: 'الإعلام والاتصال', accessibility: 'متوسط' },

    // التجارة والمبيعات (2 مهن)
    { name: 'مندوب مبيعات شركات', sector: 'التجارة والمبيعات', accessibility: 'متوسط' },
    { name: 'مسؤول تجاري', sector: 'التجارة والمبيعات', accessibility: 'متوسط' },

    // التسويق (2 مهن)
    { name: 'مسؤول تسويق', sector: 'التسويق', accessibility: 'متوسط' },
    { name: 'مسوق رقمي', sector: 'التسويق', accessibility: 'متوسط' },

    // الموارد البشرية (2 مهن)
    { name: 'مسؤول موارد بشرية', sector: 'الموارد البشرية', accessibility: 'متوسط' },
    { name: 'مختص توظيف', sector: 'الموارد البشرية', accessibility: 'متوسط' },

    // النقل واللوجستيك (2 مهن)
    { name: 'طيار مدني', sector: 'النقل واللوجستيك', accessibility: 'صعب' },
    { name: 'مختص لوجستيك', sector: 'النقل واللوجستيك', accessibility: 'متوسط' },

    // الفندقة والمطاعم (2 مهن)
    { name: 'طباخ محترف', sector: 'الفندقة والمطاعم', accessibility: 'متوسط' },
    { name: 'مدير فندق', sector: 'الفندقة والمطاعم', accessibility: 'متوسط' },

    // الخدمات العمومية (2 مهن)
    { name: 'إداري مدني', sector: 'الخدمات العمومية', accessibility: 'صعب' },
    { name: 'شرطي', sector: 'الخدمات العمومية', accessibility: 'متوسط' },

    // ريادة الأعمال والاستشارة (2 مهن)
    { name: 'رائد أعمال', sector: 'ريادة الأعمال', accessibility: 'متغير' },
    { name: 'استشاري تقني', sector: 'الاستشارة', accessibility: 'متوسط' },

    // البحث والعلوم (2 مهن)
    { name: 'باحث علمي', sector: 'البحث', accessibility: 'صعب' },
    { name: 'مهندس بحث وتطوير', sector: 'البحث', accessibility: 'متوسط' },

    // اللغات والدولي (2 مهن)
    { name: 'مترجم', sector: 'اللغات', accessibility: 'متوسط' },
    { name: 'مترجم فوري', sector: 'اللغات', accessibility: 'متوسط' },

    // الاجتماعي والإنساني (2 مهن)
    { name: 'أخصائي اجتماعي', sector: 'الاجتماعي', accessibility: 'متوسط' },
    { name: 'طبيب نفسي', sector: 'الاجتماعي', accessibility: 'متوسط' },

    // الفلاحة والبيئة (2 مهن)
    { name: 'مهندس فلاحي', sector: 'الفلاحة', accessibility: 'متوسط' },
    { name: 'استشاري بيئي', sector: 'البيئة', accessibility: 'متوسط' }
  ]
};

// Mapping des secteurs de carrière vers les types RIASEC avec poids (fallback)
export const careerRiasecMapping: Record<string, Record<string, number>> = {
  'Santé': {
    S: 0.5, // Social
    I: 0.3, // Investigateur
    R: 0.2  // Réaliste
  },
  'Technologie': {
    I: 0.5, // Investigateur
    R: 0.3, // Réaliste
    C: 0.2  // Conventionnel
  },
  'Éducation': {
    S: 0.6, // Social
    A: 0.2, // Artistique
    I: 0.2  // Investigateur
  },
  'Finance': {
    C: 0.5, // Conventionnel
    E: 0.3, // Entreprenant
    I: 0.2  // Investigateur
  },
  'Juridique': {
    C: 0.4, // Conventionnel
    E: 0.3, // Entreprenant
    S: 0.3  // Social
  },
  'Arts et Créatif': {
    A: 0.6, // Artistique
    E: 0.2, // Entreprenant
    I: 0.2  // Investigateur
  },
  'Communication et Médias': {
    A: 0.4, // Artistique
    S: 0.3, // Social
    E: 0.3  // Entreprenant
  },
  'Commerce et Vente': {
    E: 0.5, // Entreprenant
    S: 0.3, // Social
    C: 0.2  // Conventionnel
  },
  'Marketing': {
    E: 0.4, // Entreprenant
    A: 0.3, // Artistique
    S: 0.3  // Social
  },
  'Ressources Humaines': {
    S: 0.5, // Social
    E: 0.3, // Entreprenant
    C: 0.2  // Conventionnel
  },
  'Transport et Logistique': {
    R: 0.5, // Réaliste
    C: 0.3, // Conventionnel
    E: 0.2  // Entreprenant
  },
  'Hôtellerie et Restauration': {
    S: 0.4, // Social
    E: 0.3, // Entreprenant
    A: 0.3  // Artistique
  },
  'Services Publics': {
    C: 0.4, // Conventionnel
    S: 0.3, // Social
    R: 0.3  // Réaliste
  },
  'Entrepreneuriat': {
    E: 0.6, // Entreprenant
    A: 0.2, // Artistique
    S: 0.2  // Social
  },
  'Recherche': {
    I: 0.6, // Investigateur
    R: 0.2, // Réaliste
    C: 0.2  // Conventionnel
  },
  'Conseil': {
    I: 0.4, // Investigateur
    E: 0.3, // Entreprenant
    S: 0.3  // Social
  },
  'Langues': {
    A: 0.4, // Artistique
    S: 0.3, // Social
    I: 0.3  // Investigateur
  },
  'Social': {
    S: 0.7, // Social
    I: 0.2, // Investigateur
    A: 0.1  // Artistique
  },
  'Agriculture': {
    R: 0.5, // Réaliste
    I: 0.3, // Investigateur
    C: 0.2  // Conventionnel
  },
  'Environnement': {
    I: 0.4, // Investigateur
    R: 0.3, // Réaliste
    S: 0.3  // Social
  }
};

// Mapping RIASEC par carrière individuelle avec poids spécifiques
// Chaque carrière a un profil RIASEC unique qui affecte la contribution
export const individualCareerRiasecMapping: Record<string, Record<string, number>> = {
  // Santé
  'Médecin généraliste': { S: 0.6, I: 0.3, R: 0.1 },
  'Infirmier': { S: 0.7, R: 0.2, I: 0.1 },
  'Pharmacien': { I: 0.5, C: 0.3, S: 0.2 },
  'طبيب عام': { S: 0.6, I: 0.3, R: 0.1 },
  'ممرض': { S: 0.7, R: 0.2, I: 0.1 },
  'صيدلي': { I: 0.5, C: 0.3, S: 0.2 },
  
  // Technologie
  'Ingénieur informatique': { I: 0.5, R: 0.3, C: 0.2 },
  'Développeur web': { I: 0.4, A: 0.3, R: 0.3 },
  'Architecte': { A: 0.4, I: 0.3, R: 0.3 },
  'مهندس معلوماتية': { I: 0.5, R: 0.3, C: 0.2 },
  'مطور مواقع': { I: 0.4, A: 0.3, R: 0.3 },
  'مهندس معماري': { A: 0.4, I: 0.3, R: 0.3 },
  
  // Éducation
  'Enseignant secondaire': { S: 0.6, A: 0.2, I: 0.2 },
  'Professeur universitaire': { I: 0.5, S: 0.3, A: 0.2 },
  'معلم ثانوي': { S: 0.6, A: 0.2, I: 0.2 },
  'أستاذ جامعي': { I: 0.5, S: 0.3, A: 0.2 },
  
  // Finance
  'Expert-comptable': { C: 0.6, I: 0.2, E: 0.2 },
  'Analyste financier': { I: 0.4, C: 0.3, E: 0.3 },
  'محاسب خبير': { C: 0.6, I: 0.2, E: 0.2 },
  'محلل مالي': { I: 0.4, C: 0.3, E: 0.3 },
  
  // Juridique
  'Avocat d\'affaires': { E: 0.4, C: 0.3, S: 0.3 },
  'Juriste d\'entreprise': { C: 0.5, E: 0.3, I: 0.2 },
  'محامي أعمال': { E: 0.4, C: 0.3, S: 0.3 },
  'مستشار قانوني': { C: 0.5, E: 0.3, I: 0.2 },
  
  // Arts et Créatif
  'Designer graphique': { A: 0.6, E: 0.2, I: 0.2 },
  'Photographe': { A: 0.7, E: 0.2, I: 0.1 },
  'مصمم جرافيك': { A: 0.6, E: 0.2, I: 0.2 },
  'مصور': { A: 0.7, E: 0.2, I: 0.1 },
  
  // Communication et Médias
  'Journaliste': { A: 0.4, S: 0.3, E: 0.3 },
  'Rédacteur web': { A: 0.5, I: 0.3, S: 0.2 },
  'صحفي': { A: 0.4, S: 0.3, E: 0.3 },
  'محرر ويب': { A: 0.5, I: 0.3, S: 0.2 },
  
  // Commerce et Vente
  'Commercial B2B': { E: 0.6, S: 0.3, C: 0.1 },
  'Responsable commercial': { E: 0.5, S: 0.3, C: 0.2 },
  'مندوب مبيعات شركات': { E: 0.6, S: 0.3, C: 0.1 },
  'مسؤول تجاري': { E: 0.5, S: 0.3, C: 0.2 },
  
  // Marketing
  'Responsable marketing': { E: 0.4, A: 0.3, S: 0.3 },
  'Digital marketer': { E: 0.4, I: 0.3, A: 0.3 },
  'مسؤول تسويق': { E: 0.4, A: 0.3, S: 0.3 },
  'مسوق رقمي': { E: 0.4, I: 0.3, A: 0.3 },
  
  // Ressources Humaines
  'Responsable RH': { S: 0.5, E: 0.3, C: 0.2 },
  'Recruteur': { S: 0.6, E: 0.2, C: 0.2 },
  'مسؤول موارد بشرية': { S: 0.5, E: 0.3, C: 0.2 },
  'مختص توظيف': { S: 0.6, E: 0.2, C: 0.2 },
  
  // Transport et Logistique
  'Pilote de ligne': { R: 0.5, I: 0.3, C: 0.2 },
  'Logisticien': { C: 0.5, R: 0.3, E: 0.2 },
  'طيار مدني': { R: 0.5, I: 0.3, C: 0.2 },
  'مختص لوجستيك': { C: 0.5, R: 0.3, E: 0.2 },
  
  // Hôtellerie et Restauration
  'Chef cuisinier': { A: 0.4, R: 0.3, E: 0.3 },
  'Directeur d\'hôtel': { E: 0.5, S: 0.3, C: 0.2 },
  'طباخ محترف': { A: 0.4, R: 0.3, E: 0.3 },
  'مدير فندق': { E: 0.5, S: 0.3, C: 0.2 },
  
  // Services Publics
  'Administrateur civil': { C: 0.5, S: 0.3, R: 0.2 },
  'Policier': { R: 0.5, S: 0.3, C: 0.2 },
  'إداري مدني': { C: 0.5, S: 0.3, R: 0.2 },
  'شرطي': { R: 0.5, S: 0.3, C: 0.2 },
  
  // Entrepreneuriat
  'Chef d\'entreprise': { E: 0.7, A: 0.2, S: 0.1 },
  'رائد أعمال': { E: 0.7, A: 0.2, S: 0.1 },
  
  // Conseil
  'Consultant IT': { I: 0.4, E: 0.3, S: 0.3 },
  'استشاري تقني': { I: 0.4, E: 0.3, S: 0.3 },
  
  // Recherche
  'Chercheur scientifique': { I: 0.7, R: 0.2, C: 0.1 },
  'Ingénieur R&D': { I: 0.5, R: 0.3, E: 0.2 },
  'باحث علمي': { I: 0.7, R: 0.2, C: 0.1 },
  'مهندس بحث وتطوير': { I: 0.5, R: 0.3, E: 0.2 },
  
  // Langues
  'Traducteur': { A: 0.4, I: 0.3, S: 0.3 },
  'Interprète': { S: 0.5, A: 0.3, I: 0.2 },
  'مترجم': { A: 0.4, I: 0.3, S: 0.3 },
  'مترجم فوري': { S: 0.5, A: 0.3, I: 0.2 },
  
  // Social
  'Travailleur social': { S: 0.8, I: 0.1, A: 0.1 },
  'Psychologue': { S: 0.5, I: 0.4, A: 0.1 },
  'أخصائي اجتماعي': { S: 0.8, I: 0.1, A: 0.1 },
  'طبيب نفسي': { S: 0.5, I: 0.4, A: 0.1 },
  
  // Agriculture
  'Ingénieur agronome': { R: 0.5, I: 0.3, C: 0.2 },
  'مهندس فلاحي': { R: 0.5, I: 0.3, C: 0.2 },
  
  // Environnement
  'Consultant environnement': { I: 0.4, R: 0.3, S: 0.3 },
  'استشاري بيئي': { I: 0.4, R: 0.3, S: 0.3 }
};

// Fonction helper pour obtenir le mapping RIASEC d'une carrière spécifique
// Priorité: mapping individuel > mapping par secteur
export const getCareerRiasecMapping = (careerName: string, sector?: string): Record<string, number> => {
  // D'abord, chercher le mapping individuel de la carrière
  if (individualCareerRiasecMapping[careerName]) {
    return individualCareerRiasecMapping[careerName];
  }
  
  // Sinon, utiliser le mapping par secteur (fallback)
  if (sector && careerRiasecMapping[sector]) {
    return careerRiasecMapping[sector];
  }
  
  // Dernier recours: mapping par défaut
  return careerRiasecMapping['Technologie'];
};

// Fonction helper pour obtenir le mapping RIASEC d'un secteur (pour compatibilité)
export const getCareerSectorRiasecMapping = (sector: string): Record<string, number> => {
  return careerRiasecMapping[sector] || careerRiasecMapping['Technologie'];
};

const translations = {
  fr: {
    testTitle: "Compatibilité avec les métiers (Version Rapide)",
    testSubtitle: "Évaluez votre attirance pour les métiers essentiels",
    careerPreferences: "Préférences de carrière",
    workTypePreferred: "Type de travail préféré",
    select: "Sélectionner",
    independentWork: "Travail indépendant",
    publicService: "Fonction publique",
    privateCompany: "Entreprise privée",
    ngoAssoc: "ONG / Associatif",
    mainPriority: "Priorité principale",
    jobStability: "Stabilité de l'emploi",
    highSalary: "Salaire élevé",
    passion: "Passion pour le métier",
    socialPrestige: "Prestige social",
    preferredSector: "Secteur préféré",
    publicOnly: "Secteur public uniquement",
    privateOnly: "Secteur privé uniquement",
    bothSectors: "Les deux secteurs",
    attraction: "Attirance",
    accessibleToYou: "Vous semble accessible ?",
    yes: "Oui",
    no: "Non",
    advice: "Conseil",
    adviceText: "Évaluez au moins 5 métiers pour obtenir des recommandations pertinentes. Version rapide avec métiers essentiels.",
    previous: "Précédent",
    continue: "Continuer",
    easy: "Facile",
    medium: "Moyenne",
    difficult: "Difficile",
    veryDifficult: "Très difficile",
    variable: "Variable"
  },
  ar: {
    testTitle: "التوافق مع المهن (نسخة سريعة)",
    testSubtitle: "قيم انجذابك للمهن الأساسية",
    careerPreferences: "تفضيلات المهنة",
    workTypePreferred: "نوع العمل المفضل",
    select: "اختر",
    independentWork: "عمل مستقل",
    publicService: "وظيفة عمومية",
    privateCompany: "شركة خاصة",
    ngoAssoc: "منظمة غير حكومية / جمعوية",
    mainPriority: "الأولوية الرئيسية",
    jobStability: "استقرار الوظيفة",
    highSalary: "راتب عالي",
    passion: "شغف بالمهنة",
    socialPrestige: "مكانة اجتماعية",
    preferredSector: "القطاع المفضل",
    publicOnly: "القطاع العام فقط",
    privateOnly: "القطاع الخاص فقط",
    bothSectors: "القطاعان معاً",
    attraction: "الانجذاب (1-5)",
    accessibleToYou: "يبدو متاحاً لك؟",
    yes: "نعم",
    no: "لا",
    advice: "نصيحة",
    adviceText: "قيم على الأقل 5 مهن للحصول على توصيات مناسبة. نسخة سريعة مع المهن الأساسية.",
    previous: "السابق",
    continue: "متابعة",
    easy: "سهل",
    medium: "متوسط",
    difficult: "صعب",
    veryDifficult: "صعب جداً",
    variable: "متغير"
  }
};

const CareerCompatibilityTestQuick: React.FC<CareerCompatibilityTestQuickProps> = ({ 
  onComplete, 
  onPrevious, 
  canGoBack, 
  language = 'fr', 
  sessionData,
  userData 
}) => {
  const [attractions, setAttractions] = useState<Record<string, number>>({});
  const [accessibility, setAccessibility] = useState<Record<string, boolean>>({});
  const [workPreferences, setWorkPreferences] = useState({
    workStyle: '',
    priority: '',
    sector: ''
  });

  const [detailedResponses, setDetailedResponses] = useState<Record<string, CareerResponse>>({});
  const [preferenceResponses, setPreferenceResponses] = useState<Record<string, PreferenceResponse>>({});
  const [currentCareerStartTime, setCurrentCareerStartTime] = useState<Record<string, number>>({});
  const [sessionStartTime] = useState(Date.now());

  const currentCareers = careersQuick[language as 'fr' | 'ar'] || careersQuick.fr;
  const t = translations[language as 'fr' | 'ar'] || translations.fr;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const token = getAuthToken();
  const isAuthenticated = !!token;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        // Fonction helper pour extraire les données de compatibilité de carrière depuis différentes structures
        const extractCareerCompatibilityData = (data: any) => {
          console.log('🔍 Extraction des données CareerCompatibility depuis:', data);
          console.log('🔍 currentStep:', data?.currentStep);
          console.log('🔍 currentStep.careerCompatibility:', data?.currentStep?.careerCompatibility);
          console.log('🔍 careerCompatibility (racine):', data?.careerCompatibility);
          
          // Priorité 1: userData.careerCompatibility (au niveau racine - données normalisées)
          if (data?.careerCompatibility) {
            console.log('✅ Structure trouvée: careerCompatibility (racine)');
            // Si c'est un objet avec careers, retourner careers, sinon retourner l'objet entier
            if (data.careerCompatibility.careers) {
              return data.careerCompatibility.careers;
            }
            // Vérifier si c'est directement les données (avec careerAttractions, etc.)
            if (data.careerCompatibility.careerAttractions || 
                data.careerCompatibility.careerAccessibility) {
              return data.careerCompatibility;
            }
            return data.careerCompatibility;
          }
          
          // Priorité 2: userData.currentStep.careerCompatibility.careers (structure imbriquée avec careers)
          if (data?.currentStep?.careerCompatibility?.careers) {
            console.log('✅ Structure trouvée: currentStep.careerCompatibility.careers');
            return data.currentStep.careerCompatibility.careers;
          }
          
          // Priorité 3: userData.currentStep.careers (le backend stocke directement careers dans currentStep)
          if (data?.currentStep?.careers) {
            console.log('✅ Structure trouvée: currentStep.careers (direct)');
            return data.currentStep.careers;
          }
          
          // Priorité 4: userData.currentStep.careerCompatibility (données directes sans careers)
          if (data?.currentStep?.careerCompatibility) {
            console.log('✅ Structure trouvée: currentStep.careerCompatibility (direct)');
            // Si c'est un objet avec careers, retourner careers, sinon retourner l'objet entier
            if (data.currentStep.careerCompatibility.careers) {
              return data.currentStep.careerCompatibility.careers;
            }
            // Vérifier si c'est directement les données (avec careerAttractions, etc.)
            if (data.currentStep.careerCompatibility.careerAttractions || 
                data.currentStep.careerCompatibility.careerAccessibility) {
              return data.currentStep.careerCompatibility;
            }
            return data.currentStep.careerCompatibility;
          }
          
          console.log('❌ Aucune structure CareerCompatibility trouvée');
          return null;
        };

        // Priorité 1: Vérifier userData (passé depuis AppQuick)
        if (userData) {
          console.log('📥 Données userData reçues pour CareerCompatibility:', userData);
          const careerData = extractCareerCompatibilityData(userData);
          if (careerData) {
            console.log('✅ Données de compatibilité de carrière trouvées dans userData:', careerData);
            
            if (careerData.careerAttractions) {
              console.log("Restauration des attractions:", careerData.careerAttractions);
              // Extraire attractionLevel même si c'est un objet {attractionLevel, riasecWeights}
              const extractedAttractions: Record<string, number> = {};
              Object.entries(careerData.careerAttractions).forEach(([careerName, value]: [string, any]) => {
                if (typeof value === 'number') {
                  extractedAttractions[careerName] = value;
                } else if (value && typeof value === 'object' && value.attractionLevel !== undefined) {
                  extractedAttractions[careerName] = value.attractionLevel;
                }
              });
              setAttractions(extractedAttractions);
            }
            if (careerData.careerAccessibility) {
              console.log("Restauration des accessibilités:", careerData.careerAccessibility);
              setAccessibility(careerData.careerAccessibility);
            }
            if (careerData.workPreferences) {
              console.log("Restauration des préférences de travail:", careerData.workPreferences);
              setWorkPreferences(careerData.workPreferences);
            }
            if (careerData.detailedResponses) {
              console.log("Restauration des réponses détaillées:", careerData.detailedResponses);
              setDetailedResponses(careerData.detailedResponses);
            }
            if (careerData.preferenceResponses) {
              console.log("Restauration des réponses de préférence:", careerData.preferenceResponses);
              setPreferenceResponses(careerData.preferenceResponses);
            }
            
            setDataLoaded(true);
            setIsLoading(false);
            return;
          }
        }

        // Priorité 2: Vérifier sessionData (ancienne structure)
        if (sessionData) {
          console.log('📥 Données sessionData reçues pour CareerCompatibility:', sessionData);
          const careerData = extractCareerCompatibilityData(sessionData);
          if (careerData) {
            console.log('✅ Données de compatibilité de carrière trouvées dans sessionData:', careerData);
            
            if (careerData.careerAttractions) {
              console.log("Restauration des attractions:", careerData.careerAttractions);
              // Extraire attractionLevel même si c'est un objet {attractionLevel, riasecWeights}
              const extractedAttractions: Record<string, number> = {};
              Object.entries(careerData.careerAttractions).forEach(([careerName, value]: [string, any]) => {
                if (typeof value === 'number') {
                  extractedAttractions[careerName] = value;
                } else if (value && typeof value === 'object' && value.attractionLevel !== undefined) {
                  extractedAttractions[careerName] = value.attractionLevel;
                }
              });
              setAttractions(extractedAttractions);
            }
            if (careerData.careerAccessibility) {
              console.log("Restauration des accessibilités:", careerData.careerAccessibility);
              setAccessibility(careerData.careerAccessibility);
            }
            if (careerData.workPreferences) {
              console.log("Restauration des préférences de travail:", careerData.workPreferences);
              setWorkPreferences(careerData.workPreferences);
            }
            if (careerData.detailedResponses) {
              console.log("Restauration des réponses détaillées:", careerData.detailedResponses);
              setDetailedResponses(careerData.detailedResponses);
            }
            if (careerData.preferenceResponses) {
              console.log("Restauration des réponses de préférence:", careerData.preferenceResponses);
              setPreferenceResponses(careerData.preferenceResponses);
            }
            
            setDataLoaded(true);
            setIsLoading(false);
            return;
          }
        }

        // Priorité 3: Récupérer les données depuis l'API
        console.log("📡 Récupération des données CareerCompatibility depuis l'API");
        const response = await axios.get(`${API_BASE_URL}/orientation-test/my-test`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.hasTest) {
          console.log("Données de test récupérées avec succès:", response.data);
          const testData = response.data.data;
          const careerData = extractCareerCompatibilityData(testData);
          if (careerData) {
            console.log("✅ Données de compatibilité de carrière trouvées dans l'API:", careerData);
            
            if (careerData.careerAttractions) {
              console.log("Restauration des attractions depuis l'API:", careerData.careerAttractions);
              setAttractions(careerData.careerAttractions);
            }
            if (careerData.careerAccessibility) {
              console.log("Restauration des accessibilités depuis l'API:", careerData.careerAccessibility);
              setAccessibility(careerData.careerAccessibility);
            }
            if (careerData.workPreferences) {
              console.log("Restauration des préférences de travail depuis l'API:", careerData.workPreferences);
              setWorkPreferences(careerData.workPreferences);
            }
            if (careerData.detailedResponses) {
              console.log("Restauration des réponses détaillées depuis l'API:", careerData.detailedResponses);
              setDetailedResponses(careerData.detailedResponses);
            }
            if (careerData.preferenceResponses) {
              console.log("Restauration des réponses de préférence depuis l'API:", careerData.preferenceResponses);
              setPreferenceResponses(careerData.preferenceResponses);
            }
            setDataLoaded(true);
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données de carrière:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, token, sessionData, userData, language]);

  const submitTestData = async (completionData: any) => {
    if (!isAuthenticated) {
      setError(language === 'ar'
        ? 'يجب عليك تسجيل الدخول لإكمال الاختبار'
        : 'Vous devez être connecté pour compléter le test');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Préparer les données pour la persistance
      // S'assurer que toutes les données nécessaires pour le calcul RIASEC sont incluses
      const careerData = {
        stepName: 'careerCompatibility',
        stepData: {
          // Données complètes du test
          careers: completionData,
          // Données structurées pour faciliter l'extraction dans le calculateur RIASEC
          careerCompatibility: {
            careerAttractions: completionData.careerAttractions,
            careerAccessibility: completionData.careerAccessibility,
            workPreferences: completionData.workPreferences,
            sectorScores: completionData.sectorScores,
            enrichedCareerData: completionData.enrichedCareerData,
            careersEvaluated: completionData.careersEvaluated
          },
          timestamp: new Date().toISOString()
        },
        stepNumber: 5,
        duration: completionData.sessionDuration || 0,
        isCompleted: true
      };
      
      console.log('💾 Sauvegarde des données de compatibilité professionnelle:', {
        careerAttractions: Object.keys(completionData.careerAttractions || {}).length,
        enrichedCareerData: Object.keys(completionData.enrichedCareerData || {}).length,
        careersEvaluated: completionData.careersEvaluated?.length || 0
      });

      const response = await axios.post(
        `${API_BASE_URL}/orientation-test/save-step`,
        careerData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        onComplete({
          ...completionData,
          sessionData: response.data
        });
      } else {
        setError(response.data.message || (language === 'ar'
          ? 'حدث خطأ أثناء حفظ اختبار توافق المهن'
          : 'Une erreur est survenue lors de l\'enregistrement du test de compatibilité de carrière'));
      }
    } catch (err) {
      console.error('Erreur lors de la soumission du test de compatibilité de carrière', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('orientation_token');
          setError(language === 'ar'
            ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى'
            : 'Session expirée, veuillez vous reconnecter');
        } else {
          setError(err.response?.data?.message || (language === 'ar'
            ? 'خطأ في الاتصال بالخادم'
            : 'Erreur de connexion au serveur'));
        }
      } else {
        setError(language === 'ar'
          ? 'حدث خطأ غير متوقع'
          : 'Une erreur inattendue est survenue');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCareerResponse = (
    careerId: string,
    careerIndex: number,
    sector: string,
    difficultyLevel: string,
    updates: Partial<CareerResponse>
  ) => {
    const existingResponse = detailedResponses[careerId] || {
      careerId,
      careerName: careerId,
      sector,
      difficultyLevel,
      attractionLevel: null,
      accessibilityPerceived: null,
      attractionResponseTime: null,
      accessibilityResponseTime: null,
      timestamp: new Date(),
      careerIndex
    };

    const updatedResponse: CareerResponse = {
      ...existingResponse,
      ...updates
    };

    setDetailedResponses(prev => ({
      ...prev,
      [careerId]: updatedResponse
    }));
  };

  const handleAttractionChange = (career: string, value: number) => {
    const responseTime = Date.now() - (currentCareerStartTime[career] || Date.now());
    const careerIndex = currentCareers.findIndex(c => c.name === career);
    const careerData = currentCareers[careerIndex];

    setAttractions(prev => ({ ...prev, [career]: value }));

    updateCareerResponse(career, careerIndex, careerData.sector, careerData.accessibility, {
      attractionLevel: value,
      attractionResponseTime: responseTime,
      timestamp: new Date()
    });

    setCurrentCareerStartTime(prev => ({
      ...prev,
      [career]: Date.now()
    }));
  };

  const handleAccessibilityChange = (career: string, accessible: boolean) => {
    const responseTime = Date.now() - (currentCareerStartTime[career] || Date.now());
    const careerIndex = currentCareers.findIndex(c => c.name === career);
    const careerData = currentCareers[careerIndex];

    setAccessibility(prev => ({ ...prev, [career]: accessible }));

    updateCareerResponse(career, careerIndex, careerData.sector, careerData.accessibility, {
      accessibilityPerceived: accessible,
      accessibilityResponseTime: responseTime,
      timestamp: new Date()
    });

    setCurrentCareerStartTime(prev => ({
      ...prev,
      [career]: Date.now()
    }));
  };

  const handleWorkPreferenceChange = (key: string, value: string) => {
    setWorkPreferences(prev => ({ ...prev, [key]: value }));

    const preferenceResponse: PreferenceResponse = {
      preferenceType: key as 'workStyle' | 'priority' | 'sector',
      selectedValue: value,
      responseTime: 100,
      timestamp: new Date()
    };

    setPreferenceResponses(prev => ({
      ...prev,
      [key]: preferenceResponse
    }));
  };

  const getAccessibilityColor = (accessibility: string) => {
    switch (accessibility) {
      case 'Facile':
      case 'سهل':
        return 'bg-green-100 text-green-700';
      case 'Moyenne':
      case 'متوسط':
        return 'bg-yellow-100 text-yellow-700';
      case 'Difficile':
      case 'صعب':
        return 'bg-orange-100 text-orange-700';
      case 'Très difficile':
      case 'صعب جداً':
        return 'bg-red-100 text-red-700';
      case 'Variable':
      case 'متغير':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSubmit = () => {
    // Calculer les scores par secteur en incluant TOUTES les carrières
    const sectorScores: Record<string, { attraction: number; count: number }> = {};

    currentCareers.forEach(career => {
      // Inclure toutes les carrières, même celles avec attractionLevel = 0
      const attractionLevel = attractions[career.name] !== undefined && attractions[career.name] !== null
        ? attractions[career.name]
        : 0;
      
      if (!sectorScores[career.sector]) {
        sectorScores[career.sector] = { attraction: 0, count: 0 };
      }
      sectorScores[career.sector].attraction += attractionLevel;
      sectorScores[career.sector].count += 1;
    });

    // Calculer les scores finaux par secteur (attraction moyenne convertie en pourcentage)
    const finalSectorScores: Record<string, number> = {};
    Object.entries(sectorScores).forEach(([sector, data]) => {
      if (data.count > 0) {
        const avgAttraction = data.attraction / data.count;
        // Convertir l'attraction moyenne (0-5) en pourcentage (0-100%)
        finalSectorScores[sector] = Math.round((avgAttraction / 5) * 100);
      } else {
        finalSectorScores[sector] = 0;
      }
    });
    
    console.log('📊 Scores par secteur calculés:', finalSectorScores);

    const topCareers = currentCareers.filter(career => {
      const attraction = attractions[career.name];
      const accessible = accessibility[career.name];
      if (accessible === undefined || accessible === null) {
        return attraction >= 4;
      }
      return attraction >= 4 && accessible === true;
    });

    const responseStats = Object.values(detailedResponses);
    const allResponseTimes = responseStats.flatMap(r =>
      [r.attractionResponseTime, r.accessibilityResponseTime]
        .filter(time => time !== null) as number[]
    );

    const avgResponseTime = allResponseTimes.length > 0
      ? Math.round(allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length)
      : 0;

    const session = {
      testType: 'career_compatibility_quick',
      startedAt: new Date(sessionStartTime),
      completedAt: new Date(),
      duration: Date.now() - sessionStartTime,
      language: language as 'fr' | 'ar',
      totalQuestions: (Object.keys(detailedResponses).length * 2) + 3,
      questions: [
        ...Object.entries(preferenceResponses).map(([key, pref]) => ({
          questionId: `preference_${key}`,
          questionText: `${key === 'workStyle' ? t.workTypePreferred : key === 'priority' ? t.mainPriority : t.preferredSector}`,
          userAnswer: pref.selectedValue,
          responseTime: pref.responseTime,
          timestamp: pref.timestamp
        })),
        ...responseStats.flatMap(response => {
          const questions = [];
          // Obtenir les poids RIASEC pour cette carrière
          const career = currentCareers.find(c => c.name === response.careerName);
          const riasecWeights = career ? getCareerRiasecMapping(response.careerName, career.sector) : {};
          
          if (response.attractionLevel !== null) {
            questions.push({
              questionId: `${response.careerId}_attraction`,
              questionText: `${t.attraction} - ${response.careerName}`,
              userAnswer: response.attractionLevel,
              responseTime: response.attractionResponseTime,
              timestamp: response.timestamp,
              // STOCKER LES POIDS RIASEC dans chaque question pour utilisation dans le calcul
              riasecWeights: riasecWeights
            });
          }
          if (response.accessibilityPerceived !== null) {
            questions.push({
              questionId: `${response.careerId}_accessibility`,
              questionText: `${t.accessibleToYou} - ${response.careerName}`,
              userAnswer: response.accessibilityPerceived ? 1 : 0,
              responseTime: response.accessibilityResponseTime,
              timestamp: response.timestamp,
              // STOCKER LES POIDS RIASEC dans chaque question pour utilisation dans le calcul
              riasecWeights: riasecWeights
            });
          }
          return questions;
        })
      ]
    };

    const sectorStats = Object.entries(finalSectorScores).map(([sector, score]) => {
      const sectorResponses = responseStats.filter(r => r.sector === sector);
      return {
        sector,
        attractionScore: score,
        careersEvaluated: sectorResponses.length,
        accessibleCareersCount: sectorResponses.filter(r => r.accessibilityPerceived === true).length,
        highAttractionCount: sectorResponses.filter(r => r.attractionLevel && r.attractionLevel >= 4).length
      };
    });

    // Préparer les données enrichies pour le calcul RIASEC
    // Inclure TOUTES les carrières avec leurs scores et leurs poids RIASEC
    // C'est important pour que le calcul RIASEC soit correct et reproductible
    const enrichedCareerData: Record<string, any> = {};
    currentCareers.forEach(career => {
      // Obtenir les poids RIASEC pour cette carrière
      const riasecWeights = getCareerRiasecMapping(career.name, career.sector);
      
      // Inclure toutes les carrières, même celles avec attractionLevel = 0
      // car elles influencent aussi le calcul (elles réduisent les contributions des autres)
      enrichedCareerData[career.name] = {
        attractionLevel: attractions[career.name] !== undefined && attractions[career.name] !== null 
          ? attractions[career.name] 
          : 0, // Valeur par défaut si non rempli
        accessibilityPerceived: accessibility[career.name] !== undefined && accessibility[career.name] !== null
          ? accessibility[career.name]
          : false, // Valeur par défaut si non rempli
        sector: career.sector,
        accessibility: career.accessibility,
        // STOCKER LES POIDS RIASEC pour utilisation dans le calcul
        riasecWeights: riasecWeights
      };
    });
    
    console.log('💾 Données enrichies pour le calcul RIASEC:', {
      totalCareers: currentCareers.length,
      enrichedDataCount: Object.keys(enrichedCareerData).length,
      careersWithScores: Object.values(enrichedCareerData).filter((c: any) => c.attractionLevel > 0).length
    });

    // S'assurer que TOUTES les carrières sont dans careerAttractions
    // Même celles avec attractionLevel = 0 (pour que le calcul RIASEC soit correct)
    // STOCKER LES POIDS RIASEC avec chaque carrière
    const completeCareerAttractions: Record<string, any> = {};
    currentCareers.forEach(career => {
      const riasecWeights = getCareerRiasecMapping(career.name, career.sector);
      completeCareerAttractions[career.name] = {
        attractionLevel: attractions[career.name] !== undefined && attractions[career.name] !== null
          ? attractions[career.name]
          : 0, // Valeur par défaut si non rempli
        // STOCKER LES POIDS RIASEC pour utilisation dans le calcul
        riasecWeights: riasecWeights
      };
    });
    
    // S'assurer que TOUTES les carrières sont dans careerAccessibility
    const completeCareerAccessibility: Record<string, boolean> = {};
    currentCareers.forEach(career => {
      completeCareerAccessibility[career.name] = accessibility[career.name] !== undefined && accessibility[career.name] !== null
        ? accessibility[career.name]
        : false; // Valeur par défaut si non rempli
    });

    const completionData = {
      // Utiliser les objets complets qui incluent TOUTES les carrières
      careerAttractions: completeCareerAttractions,
      careerAccessibility: completeCareerAccessibility,
      workPreferences,
      sectorScores: finalSectorScores,
      topCareers: topCareers.map(c => c.name),
      session,
      detailedResponses,
      preferenceResponses,
      avgResponseTime,
      sessionDuration: Date.now() - sessionStartTime,
      completedAt: new Date(),
      sectorStats,
      // Données enrichies pour le calcul RIASEC
      enrichedCareerData,
      // Informations sur TOUTES les carrières évaluées (pour faciliter le calcul)
      // Inclure toutes les carrières, même celles avec attractionLevel = 0
      // STOCKER LES POIDS RIASEC pour chaque carrière
      careersEvaluated: currentCareers.map(career => {
        const riasecWeights = getCareerRiasecMapping(career.name, career.sector);
        const careerData = completeCareerAttractions[career.name];
        return {
          name: career.name,
          sector: career.sector,
          attractionLevel: typeof careerData === 'object' ? careerData.attractionLevel : careerData,
          accessibilityPerceived: completeCareerAccessibility[career.name],
          // STOCKER LES POIDS RIASEC pour utilisation dans le calcul
          riasecWeights: riasecWeights
        };
      }),
      behavioralAnalysis: {
        preferredSector: sectorStats.length > 0 ? sectorStats.reduce((max, sector) =>
          sector.attractionScore > max.attractionScore ? sector : max, sectorStats[0]) : null,
        optimismRate: 50,
        pessimismRate: 25,
        realismRate: 25,
        careerAmbition: Math.round(Object.values(attractions).reduce((sum, val) => sum + val, 0) / Math.max(1, Object.keys(attractions).length) * 20)
      }
    };

    submitTestData(completionData);
  };

  // Vérifier que TOUTES les carrières sont évaluées (attraction + accessibilité)
  const allCareersEvaluated = currentCareers.every(career => 
    attractions[career.name] !== undefined && 
    attractions[career.name] !== null &&
    accessibility[career.name] !== undefined && 
    accessibility[career.name] !== null
  );
  
  const isComplete = allCareersEvaluated &&
    Object.values(workPreferences).every(pref => pref !== '');

  const groupedCareers = currentCareers.reduce((acc, career) => {
    if (!acc[career.sector]) {
      acc[career.sector] = [];
    }
    acc[career.sector].push(career);
    return acc;
  }, {} as Record<string, typeof currentCareers>);

  // Calculer les scores par secteur en temps réel
  const calculateSectorScores = () => {
    const sectorScores: Record<string, { attraction: number; count: number; percentage: number }> = {};
    
    currentCareers.forEach(career => {
      const attractionLevel = attractions[career.name];
      if (attractionLevel !== undefined && attractionLevel !== null) {
        if (!sectorScores[career.sector]) {
          sectorScores[career.sector] = { attraction: 0, count: 0, percentage: 0 };
        }
        sectorScores[career.sector].attraction += attractionLevel;
        sectorScores[career.sector].count += 1;
      }
    });
    
    // Calculer le pourcentage pour chaque secteur (attraction moyenne sur 5, convertie en %)
    Object.keys(sectorScores).forEach(sector => {
      const data = sectorScores[sector];
      if (data.count > 0) {
        const avgAttraction = data.attraction / data.count;
        // Convertir l'attraction moyenne (0-5) en pourcentage (0-100%)
        data.percentage = Math.round((avgAttraction / 5) * 100);
      }
    });
    
    return sectorScores;
  };

  const getCompletionStats = () => {
    const totalCareers = currentCareers.length;
    const attractionCompleted = Object.keys(attractions).filter(key => 
      attractions[key] !== undefined && attractions[key] !== null
    ).length;
    const accessibilityCompleted = Object.keys(accessibility).filter(key => 
      accessibility[key] !== undefined && accessibility[key] !== null
    ).length;
    const preferencesCompleted = Object.values(workPreferences).filter(pref => pref !== '').length;
    
    // Vérifier combien de carrières sont complètement évaluées (attraction + accessibilité)
    const fullyEvaluatedCareers = currentCareers.filter(career => 
      attractions[career.name] !== undefined && 
      attractions[career.name] !== null &&
      accessibility[career.name] !== undefined && 
      accessibility[career.name] !== null
    ).length;

    return {
      totalCareers,
      attractionCompleted,
      accessibilityCompleted,
      preferencesCompleted,
      fullyEvaluatedCareers,
      avgCompletion: Math.round(((attractionCompleted + accessibilityCompleted) / (totalCareers * 2)) * 100),
      isMinimumMet: fullyEvaluatedCareers === totalCareers, // Toutes les carrières doivent être évaluées
      isComplete: fullyEvaluatedCareers === totalCareers && preferencesCompleted === 3
    };
  };

  const completionStats = getCompletionStats();
  const sectorScoresRealTime = calculateSectorScores();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2Icon className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-600">
          {language === 'ar'
            ? 'جاري تحميل اختبار توافق المهن...'
            : 'Chargement du test de compatibilité de carrière...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
        <p className="font-medium">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
        >
          {language === 'ar' ? 'حاول مرة أخرى' : 'Réessayer'}
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="text-center mb-8">
        <div className="text-center">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center">
              <img
                src="https://cdn.e-tawjihi.ma/logo-rectantgle-simple-nobg.png"
                alt="Educalogy"
                className="h-32 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-auto object-contain"
              />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t.testTitle}</h2>
        <p className="text-gray-600">{t.testSubtitle}</p>

        {dataLoaded && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mt-4">
            <div className="flex items-center space-x-2">
              <CheckIcon className="w-5 h-5" />
              <p>
                {language === 'ar'
                  ? 'تم تحميل إجاباتك السابقة. يمكنك متابعة الاختبار من حيث توقفت.'
                  : 'Vos réponses précédentes ont été chargées. Vous pouvez continuer le test là où vous vous étiez arrêté.'}
              </p>
            </div>
          </div>
        )}

        {completionStats.attractionCompleted > 0 && (
          <div className={`rounded-lg p-3 mt-4 ${completionStats.isMinimumMet ? 'bg-green-50' : 'bg-orange-50'}`}>
            <div className={`text-sm ${completionStats.isMinimumMet ? 'text-green-700' : 'text-orange-700'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar'
                ? `المهن المقيمة: ${completionStats.fullyEvaluatedCareers}/${completionStats.totalCareers} (مطلوب: جميع المهن) - التقدم: ${completionStats.avgCompletion}%`
                : `Métiers évalués: ${completionStats.fullyEvaluatedCareers}/${completionStats.totalCareers} (requis: tous) - Progression: ${completionStats.avgCompletion}%`
              }
              {!completionStats.isMinimumMet && (
                <div className="mt-1 text-xs font-semibold">
                  {language === 'ar'
                    ? '⚠️ يجب تقييم جميع المهن (الجاذبية + إمكانية الوصول)'
                    : '⚠️ Toutes les carrières doivent être évaluées (attraction + accessibilité)'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-amber-50 rounded-xl p-4">
        <p className={`text-sm text-amber-700 ${language === 'ar' ? 'text-right' : ''}`}>
          <strong>{t.advice}:</strong> {t.adviceText}
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className={`flex justify-between items-center mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <h3 className="text-lg font-semibold text-gray-900">{t.careerPreferences}</h3>
          <div className="text-sm text-blue-600">
            {completionStats.preferencesCompleted}/3
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.workTypePreferred}</label>
            <select
              value={workPreferences.workStyle}
              onChange={(e) => handleWorkPreferenceChange('workStyle', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.select}</option>
              <option value="independent">{t.independentWork}</option>
              <option value="public">{t.publicService}</option>
              <option value="private">{t.privateCompany}</option>
              <option value="ngo">{t.ngoAssoc}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.mainPriority}</label>
            <select
              value={workPreferences.priority}
              onChange={(e) => handleWorkPreferenceChange('priority', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.select}</option>
              <option value="stability">{t.jobStability}</option>
              <option value="salary">{t.highSalary}</option>
              <option value="passion">{t.passion}</option>
              <option value="prestige">{t.socialPrestige}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.preferredSector}</label>
            <select
              value={workPreferences.sector}
              onChange={(e) => handleWorkPreferenceChange('sector', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.select}</option>
              <option value="public">{t.publicOnly}</option>
              <option value="private">{t.privateOnly}</option>
              <option value="mixed">{t.bothSectors}</option>
            </select>
          </div>
        </div>
      </div>

      {Object.entries(groupedCareers).map(([sector, sectorCareers]) => {
        // Compter les carrières évaluées directement depuis attractions et accessibility
        const evaluatedCareers = sectorCareers.filter(career => 
          attractions[career.name] !== undefined && 
          attractions[career.name] !== null &&
          accessibility[career.name] !== undefined && 
          accessibility[career.name] !== null
        );
        
        const sectorCompletion = sectorCareers.length > 0
          ? Math.round((evaluatedCareers.length / sectorCareers.length) * 100)
          : 0;
        
        // Récupérer le score d'attraction moyen du secteur (en pourcentage)
        const sectorScore = sectorScoresRealTime[sector]?.percentage || 0;

        return (
          <div key={sector} className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
            <div className={`flex justify-between items-center mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-lg font-semibold text-gray-900">{sector}</h3>
              <div className="text-right">
                <div className={`text-lg font-bold ${sectorScore >= 80 ? 'text-green-600' : sectorScore >= 60 ? 'text-blue-600' : sectorScore >= 40 ? 'text-yellow-600' : 'text-gray-500'}`}>
                  {sectorScore}%
                </div>
                <div className="text-xs text-gray-500">
                  {evaluatedCareers.length}/{sectorCareers.length} {language === 'ar' ? 'مهن' : 'métiers'}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {sectorCareers.map(career => {
                const hasAttraction = attractions[career.name] !== undefined;
                const hasAccessibility = accessibility[career.name] !== undefined;
                const isComplete = hasAttraction && hasAccessibility;

                return (
                  <div key={career.name} className={`bg-white rounded-lg p-4 border transition-all ${isComplete ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}>
                    <div className={`flex items-start mb-3 ${language === 'ar' ? 'flex-row-reverse' : 'justify-between'}`}>
                      <div className={language === 'ar' ? 'text-right' : ''}>
                        <h4 className="font-medium text-gray-900">{career.name}</h4>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getAccessibilityColor(career.accessibility)}`}>
                          {career.accessibility}
                        </span>
                      </div>
                      {isComplete && (
                        <div className="text-xs text-green-600 font-medium">
                          ✓ A:{attractions[career.name]} Acc:{accessibility[career.name] ? 'Oui' : 'Non'}
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm text-gray-600 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                          {t.attraction}
                        </label>
                        <div className={`flex gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                          {[1, 2, 3, 4, 5].map(value => (
                            <button
                              key={value}
                              onClick={() => handleAttractionChange(career.name, value)}
                              className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-all ${attractions[career.name] === value
                                ? 'bg-blue-500 border-blue-500 text-white scale-110'
                                : 'border-gray-300 text-gray-600 hover:border-blue-300'
                                }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm text-gray-600 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                          {t.accessibleToYou}
                        </label>
                        <div className={`flex gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <button
                            onClick={() => handleAccessibilityChange(career.name, true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${accessibility[career.name] === true
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 text-gray-600 hover:border-green-300'
                              }`}
                          >
                            {t.yes}
                          </button>
                          <button
                            onClick={() => handleAccessibilityChange(career.name, false)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${accessibility[career.name] === false
                              ? 'bg-red-500 border-red-500 text-white'
                              : 'border-gray-300 text-gray-600 hover:border-red-300'
                              }`}
                          >
                            {t.no}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className={`flex justify-between items-center pt-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
        <button
          type="button"
          onClick={onPrevious}
          className={`inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all ${language === 'ar' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
        >
          <ArrowLeftIcon className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          <span>{t.previous}</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          className={`inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${language === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="w-4 h-4 animate-spin" />
              <span>{language === 'ar' ? 'جار الحفظ...' : 'Enregistrement...'}</span>
            </>
          ) : language === 'ar' ? (
            <>
              <ArrowLeftIcon className="w-4 h-4 rotate-180" />
              <span>{t.continue}</span>
            </>
          ) : (
            <>
              <span>{t.continue}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CareerCompatibilityTestQuick;




