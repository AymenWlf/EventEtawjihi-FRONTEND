import React, { useState, useEffect } from 'react';
// Ajouter ces imports en haut du fichier
import { ArrowRightIcon, ClockIcon, FileTextIcon, BrainIcon, GlobeIcon, Loader2Icon, RefreshCwIcon, PlayCircleIcon } from 'lucide-react';
import {
  UserIcon, HeartIcon, BarChartIcon, GraduationCapIcon, LightbulbIcon,
  LanguagesIcon, MapPinIcon, CheckCircleIcon, LockIcon
} from 'lucide-react';
import axios from 'axios'; // Assurez-vous d'avoir axios installé
import { getAuthToken, isTokenValid, getUserFromToken, setAuthToken } from '../utils/auth';  // Ces fonctions devraient être implémentées dans un fichier utilitaire
import { API_BASE_URL } from '../config/api'; // Importer l'URL de l'API depuis le fichier config/api.ts

interface WelcomeScreenQuickProps {
  onComplete: (data: any) => void;
  language: string;
  onLanguageChange?: (language: string) => void; // Rendre optionnel avec fallback
}

// Ajouter après les objets de traduction, avant le composant WelcomeScreen
// Définition des étapes du test d'orientation (Version Rapide - sans aptitude)
const testSteps = [
  {
    id: 'personalInfo',
    icon: UserIcon,
    colorClass: 'bg-blue-500',
    orderIndex: 0
  },
  {
    id: 'riasec',
    icon: HeartIcon,
    colorClass: 'bg-purple-500',
    orderIndex: 1
  },
  {
    id: 'personality',
    icon: BrainIcon,
    colorClass: 'bg-green-500',
    orderIndex: 2
  },
  {
    id: 'interests',
    icon: LightbulbIcon,
    colorClass: 'bg-indigo-500',
    orderIndex: 3
  },
  {
    id: 'careerCompatibility',
    icon: GraduationCapIcon,
    colorClass: 'bg-blue-500',
    orderIndex: 4
  },
  {
    id: 'constraints',
    icon: MapPinIcon,
    colorClass: 'bg-rose-500',
    orderIndex: 5
  },
  {
    id: 'languageSkills',
    icon: LanguagesIcon,
    colorClass: 'bg-teal-500',
    orderIndex: 6
  }
];


// Définition des champs académiques pour le calcul de la progression
const academicFields = {
  fr: [
    { name: 'Mathématiques', category: 'Sciences' },
    { name: 'Physique', category: 'Sciences' },
    { name: 'Chimie', category: 'Sciences' },
    { name: 'Biologie', category: 'Sciences' },
    { name: 'Informatique', category: 'Sciences' },
    { name: 'Ingénierie', category: 'Sciences' },
    { name: 'Médecine', category: 'Santé' },
    { name: 'Pharmacie', category: 'Santé' },
    { name: 'Dentaire', category: 'Santé' },
    { name: 'Psychologie', category: 'Sciences humaines' },
    { name: 'Sociologie', category: 'Sciences humaines' },
    { name: 'Histoire', category: 'Sciences humaines' },
    { name: 'Géographie', category: 'Sciences humaines' },
    { name: 'Philosophie', category: 'Sciences humaines' },
    { name: 'Littérature française', category: 'Langues et littérature' },
    { name: 'Littérature arabe', category: 'Langues et littérature' },
    { name: 'Langues étrangères', category: 'Langues et littérature' },
    { name: 'Économie', category: 'Commerce et gestion' },
    { name: 'Gestion', category: 'Commerce et gestion' },
    { name: 'Comptabilité', category: 'Commerce et gestion' },
    { name: 'Marketing', category: 'Commerce et gestion' },
    { name: 'Droit', category: 'Juridique' },
    { name: 'Sciences politiques', category: 'Juridique' },
    { name: 'Arts plastiques', category: 'Arts' },
    { name: 'Musique', category: 'Arts' },
    { name: 'Design', category: 'Arts' },
    { name: 'Architecture', category: 'Arts' }
  ],
  ar: [
    { name: 'الرياضيات', category: 'العلوم' },
    { name: 'الفيزياء', category: 'العلوم' },
    { name: 'الكيمياء', category: 'العلوم' },
    { name: 'علم الأحياء', category: 'العلوم' },
    { name: 'المعلوماتية', category: 'العلوم' },
    { name: 'الهندسة', category: 'العلوم' },
    { name: 'الطب', category: 'الصحة' },
    { name: 'الصيدلة', category: 'الصحة' },
    { name: 'طب الأسنان', category: 'الصحة' },
    { name: 'علم النفس', category: 'العلوم الإنسانية' },
    { name: 'علم الاجتماع', category: 'العلوم الإنسانية' },
    { name: 'التاريخ', category: 'العلوم الإنسانية' },
    { name: 'الجغرافيا', category: 'العلوم الإنسانية' },
    { name: 'الفلسفة', category: 'العلوم الإنسانية' },
    { name: 'الأدب الفرنسي', category: 'اللغات والأدب' },
    { name: 'الأدب العربي', category: 'اللغات والأدب' },
    { name: 'اللغات الأجنبية', category: 'اللغات والأدب' },
    { name: 'الاقتصاد', category: 'التجارة والتسيير' },
    { name: 'التسيير', category: 'التجارة والتسيير' },
    { name: 'المحاسبة', category: 'التجارة والتسيير' },
    { name: 'التسويق', category: 'التجارة والتسيير' },
    { name: 'القانون', category: 'القانوني' },
    { name: 'العلوم السياسية', category: 'القانوني' },
    { name: 'الفنون التشكيلية', category: 'الفنون' },
    { name: 'الموسيقى', category: 'الفنون' },
    { name: 'التصميم', category: 'الفنون' },
    { name: 'الهندسة المعمارية', category: 'الفنون' }
  ]
};

const translations = {
  fr: {
    testInProgress: "Vous avez un test en cours",
    testProgress: "Progression du test",
    testStartedOn: "Commencé le",
    continueTest: "Continuer le test",
    restartTest: "Recommencer à zéro",
    lastActivity: "Dernière activité",
    completedSections: "Sections complétées",
    welcomeTitle: "Bienvenue dans votre Orientation Personnalisée",
    welcomeSubtitle: "Découvrez votre profil unique et explorez les formations et métiers qui vous correspondent vraiment",
    scientificTests: "Tests scientifiques",
    scientificTestsDesc: "Évaluations basées sur des méthodes psychométriques reconnues",
    completeAnalysis: "Analyse complète",
    completeAnalysisDesc: "Profil RIASEC, personnalité et intérêts académiques (Version Rapide)",
    detailedReport: "Rapport détaillé",
    detailedReportDesc: "Recommandations personnalisées d'études et de carrières",
    estimatedTime: "Durée estimée : 18-28 minutes (Version Rapide)",
    estimatedTimeDesc: "Version optimisée sans test d'aptitude pour des résultats rapides",
    whatYouDiscover: "Ce que vous allez découvrir :",
    riasecProfile: "Votre profil RIASEC (Réaliste, Investigateur, Artistique, Social, Entreprenant, Conventionnel)",
    aptitudesPerformances: "Vos intérêts académiques et motivations",
    recommendedDomains: "Les domaines d'études qui vous correspondent",
    careersOpportunities: "Les métiers et opportunités de carrière adaptés à votre profil",
    startTest: "Commencer le test",
    freeConfidentialScientific: "Gratuit • Confidentiel • Scientifique",
    chooseLanguage: "Choisir la langue du test",
    languagePreference: "Langue préférée pour passer le test",
    french: "Français",
    arabic: "العربية",
    selectLanguage: "Sélectionnez votre langue",
    stepTimeline: "Étapes du test",
    personalInfo: "Informations personnelles",
    riasec: "Profil RIASEC",
    personality: "Personnalité",
    interests: "Intérêts académiques",
    careerCompatibility: "Compatibilité professionnelle",
    constraints: "Contraintes",
    languageSkills: "Compétences linguistiques",
    completed: "Complété",
    current: "En cours",
    locked: "Verrouillé",
    clickToStart: "Cliquer pour commencer",
    languageRequired: "Choisir langue d'abord",
    selectLanguageFirst: "Veuillez d'abord choisir la langue du test pour commencer",
    chooseLanguageButton: "Choisir langue",
  },
  ar: {
    testInProgress: "لديك اختبار قيد التقدم",
    testProgress: "تقدم الاختبار",
    testStartedOn: "بدأ في",
    continueTest: "متابعة الاختبار",
    restartTest: "إعادة البدء من الصفر",
    lastActivity: "آخر نشاط",
    completedSections: "الأقسام المكتملة",
    welcomeTitle: "مرحباً بك في توجيهك الشخصي",
    welcomeSubtitle: "اكتشف ملفك الفريد واستكشف التكوينات والمهن التي تناسبك حقاً",
    scientificTests: "اختبارات علمية",
    scientificTestsDesc: "تقييمات مبنية على أساليب نفسية معترف بها",
    completeAnalysis: "تحليل شامل",
    completeAnalysisDesc: "ملف RIASEC، الشخصية والاهتمامات الأكاديمية (نسخة سريعة)",
    detailedReport: "تقرير مفصل",
    detailedReportDesc: "توصيات شخصية للدراسات والمهن",
    estimatedTime: "المدة المقدرة: 18-28 دقيقة (نسخة سريعة)",
    estimatedTimeDesc: "نسخة محسّنة بدون اختبار القدرات للحصول على نتائج سريعة",
    whatYouDiscover: "ما ستكتشفه:",
    riasecProfile: "ملفك الشخصي RIASEC (واقعي، باحث، فني، اجتماعي، مقاول، تقليدي)",
    aptitudesPerformances: "اهتماماتك الأكاديمية ودوافعك",
    recommendedDomains: "مجالات الدراسة التي تناسبك",
    careersOpportunities: "المهن وفرص المهنة المناسبة لملفك الشخصي",
    startTest: "بدء الاختبار",
    freeConfidentialScientific: "مجاني • سري • علمي",
    chooseLanguage: "اختر لغة الاختبار",
    languagePreference: "اللغة المفضلة لإجراء الاختبار",
    french: "Français",
    arabic: "العربية",
    selectLanguage: "اختر لغتك",
    stepTimeline: "مراحل الاختبار",
    personalInfo: "المعلومات الشخصية",
    riasec: "ملف RIASEC",
    personality: "الشخصية",
    interests: "الاهتمامات الأكاديمية",
    careerCompatibility: "التوافق المهني",
    constraints: "القيود",
    languageSkills: "المهارات اللغوية",
    completed: "مكتمل",
    current: "قيد التقدم",
    locked: "مقفل",
    clickToStart: "انقر للبدء",
    languageRequired: "اختر لغة أولاً",
    selectLanguageFirst: "يرجى اختيار لغة الاختبار أولاً للبدء",
    chooseLanguageButton: "اختر لغة",
  }
};

const WelcomeScreenQuick: React.FC<WelcomeScreenQuickProps> = ({
  onComplete,
  language = 'fr', // Valeur par défaut
  onLanguageChange
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [isLoading, setIsLoading] = useState(false); // État pour gérer le chargement
  const [error, setError] = useState<string | null>(null); // État pour gérer les erreurs
  const t = translations[currentLanguage as 'fr' | 'ar'] || translations.fr;
  const [testStatus, setTestStatus] = useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [stepStatuses, setStepStatuses] = useState<Record<string, 'completed' | 'current' | 'locked'>>({});
  const [animationTargetStep, setAnimationTargetStep] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Récupérer le token d'authentification
  const token = getAuthToken(); // Récupère le token depuis localStorage
  console.log('Token récupéré:', token);

  // Ajouter avant la fonction handleRestartTest
  const showRestartConfirmation = () => {
    setShowConfirmModal(true);
  };

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
    setCurrentLanguage(lang);

    if (onLanguageChange && typeof onLanguageChange === 'function') {
      onLanguageChange(lang);
    }
  };

  // Remplacer la fonction getStepStatus actuelle par cette version améliorée
  const getStepStatus = (stepId: string, testData: any, completedSteps: string[]) => {
    // Si l'étape est explicitement marquée comme complétée
    if (completedSteps.includes(stepId)) {
      return 'completed';
    }

    // Vérifier si l'étape est complétée mais pas dans completedSteps
    switch (stepId) {
      case 'riasec':
        if (testData?.currentStep?.riasec?.riasec) {
          return 'completed';
        }
        break;
      case 'personality':
        if (testData?.currentStep?.personality?.personality) {
          return 'completed';
        }
        break;
      // Test d'aptitude supprimé dans la version rapide
      case 'interests':
        if (testData?.currentStep?.interests &&
          ((testData.currentStep.interests.isCompleted) ||
            (testData.currentStep.interests.completedAt) ||
            (testData.currentStep.interests.interests &&
              testData.currentStep.interests.interests.completedAt))) {
          return 'completed';
        }
        break;
      case 'careerCompatibility':
        if (testData?.currentStep?.careerCompatibility &&
          ((testData.currentStep.careerCompatibility.isCompleted) ||
            (testData.currentStep.careerCompatibility.completedAt) ||
            (testData.currentStep.careerCompatibility.careers &&
              testData.currentStep.careerCompatibility.careers.completedAt))) {
          return 'completed';
        }
        break;
      case 'constraints':
        if (testData?.currentStep?.constraints &&
          ((testData.currentStep.constraints.isCompleted) ||
            (testData.currentStep.constraints.completedAt) ||
            (testData.currentStep.constraints.constraints &&
              testData.currentStep.constraints.constraints.completedAt))) {
          return 'completed';
        }
        break;
      case 'languageSkills':
        if (testData?.currentStep?.languageSkills &&
          ((testData.currentStep.languageSkills.isCompleted) ||
            (testData.currentStep.languageSkills.completedAt) ||
            (testData.currentStep.languageSkills.languages &&
              testData.currentStep.languageSkills.languages.completedAt))) {
          return 'completed';
        }
        break;
    }

    // Vérifier si l'étape est en cours (partiellement complétée)
    switch (stepId) {
      case 'personalInfo': {
        const personalInfoData = testData?.currentStep?.personalInfo?.personalInfo || testData?.currentStep?.personalInfo;
        if (personalInfoData) {
          // Vérifier si les champs essentiels sont remplis
          const essentialFields = ['firstName', 'lastName', 'age', 'studyLevel', 'bacType'];
          const allEssentialFieldsFilled = essentialFields.every(field => !!personalInfoData[field]);
          return allEssentialFieldsFilled ? 'completed' : 'current';
        }
        break;
      }
      case 'riasec': {
        const riasecData = testData?.currentStep?.riasec?.riasec || testData?.currentStep?.riasec;
        if (riasecData && riasecData.scores) {
          return 'completed';
        }
        if (riasecData) {
          return 'current';
        }
        break;
      }
      case 'personality': {
        const personalityData = testData?.currentStep?.personality?.personality || testData?.currentStep?.personality;
        if (personalityData && personalityData.scores) {
          return 'completed';
        }
        if (personalityData) {
          return 'current';
        }
        break;
      }
      // Test d'aptitude supprimé dans la version rapide
      case 'interests': {
        const interestsData = testData?.currentStep?.interests?.interests || testData?.currentStep?.interests;
        if (interestsData?.fieldInterests && Object.keys(interestsData.fieldInterests).length > 0) {
          return 'current';
        }
        break;
      }
      case 'careerCompatibility': {
        const careerData = testData?.currentStep?.careerCompatibility?.careers || testData?.currentStep?.careerCompatibility;
        if (careerData?.careerAttractions && Object.keys(careerData.careerAttractions).length > 0) {
          return 'current';
        }
        break;
      }
      case 'constraints': {
        const constraintsData = testData?.currentStep?.constraints?.constraints || testData?.currentStep?.constraints;
        if (constraintsData) {
          let fieldsCompleted = 0;

          // Vérifier si des champs ont été remplis
          if (constraintsData.mobility) {
            fieldsCompleted += Object.values(constraintsData.mobility).filter(Boolean).length;
          }
          if (constraintsData.budget) {
            fieldsCompleted += Object.values(constraintsData.budget).filter(Boolean).length;
          }
          if (constraintsData.education) {
            fieldsCompleted += Object.values(constraintsData.education).filter(Boolean).length;
          }
          if (constraintsData.priorities) {
            fieldsCompleted += Object.values(constraintsData.priorities)
              .filter(value => typeof value === 'number' && value > 1).length;
          }

          if (fieldsCompleted > 0) {
            return 'current';
          }
        }
        break;
      }
      case 'languageSkills': {
        const languageData = testData?.currentStep?.languageSkills?.languages || testData?.currentStep?.languageSkills;
        if (languageData && (
          (languageData.selectedLanguages && languageData.selectedLanguages.length > 0) ||
          (languageData.languageSkills && Object.keys(languageData.languageSkills).length > 0) ||
          (languageData.certificates && Object.keys(languageData.certificates).length > 0) ||
          (languageData.preferences && Object.values(languageData.preferences).some(Boolean))
        )) {
          return 'current';
        }
        break;
      }
    }

    // Vérifier si l'étape est accessible (les étapes précédentes sont complétées)
    // La logique est simplifiée ici pour la séquence linéaire
    const index = testSteps.findIndex(step => step.id === stepId);
    if (index === 0) {
      return 'current'; // La première étape est toujours accessible
    }

    const previousStep = testSteps[index - 1];
    const previousStepStatus = getStepStatus(previousStep.id, testData, completedSteps);

    if (previousStepStatus === 'completed') {
      return 'current';
    }

    return 'locked';
  };

  // Fonction pour formater une date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(currentLanguage === 'ar' ? 'ar-MA' : 'fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!token;
  // Ajouter cette fonction après handleRestartTest


  const handleViewReport = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // Récupérer les données complètes du test
      const response = await axios.get(`${API_BASE_URL}/orientation-test/my-test`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.group('📊 Generating Orientation Report');
        console.log('Récupération des données pour le rapport complet:', response.data);

        // Extraire les données du test
        const testData = response.data.data;

        // Restructurer les données pour qu'elles correspondent exactement à la structure
        // attendue par OrientationReport
        const formattedData = {
          // Données de base nécessaires pour le rapport
          personalInfo: testData.currentStep.personalInfo?.personalInfo || testData.currentStep.personalInfo || {},
          riasecScores: testData.currentStep.riasec?.riasec || testData.currentStep.riasec || {},
          personalityScores: testData.currentStep.personality?.personality || testData.currentStep.personality || {},
          // aptitudeScores supprimé dans la version rapide
          academicInterests: testData.currentStep.interests?.interests || testData.currentStep.interests || {},
          careerCompatibility: testData.currentStep.careerCompatibility?.careers || testData.currentStep.careerCompatibility || {},
          constraints: testData.currentStep.constraints?.constraints || testData.currentStep.constraints || {},
                languageSkills: (() => {
                  // Fonction helper pour extraire les données de compétences linguistiques
                  const extract = (data: any) => {
                    if (data?.currentStep?.languageSkills?.languages) {
                      return data.currentStep.languageSkills.languages;
                    }
                    if (data?.currentStep?.languageSkills) {
                      if (data.currentStep.languageSkills.selectedLanguages || 
                          data.currentStep.languageSkills.languageSkills ||
                          data.currentStep.languageSkills.certificates ||
                          data.currentStep.languageSkills.preferences) {
                        return data.currentStep.languageSkills;
                      }
                      if (data.currentStep.languageSkills.languages) {
                        return data.currentStep.languageSkills.languages;
                      }
                      return data.currentStep.languageSkills;
                    }
                    if (data?.languageSkills) {
                      if (data.languageSkills.selectedLanguages || 
                          data.languageSkills.languageSkills ||
                          data.languageSkills.certificates ||
                          data.languageSkills.preferences) {
                        return data.languageSkills;
                      }
                      if (data.languageSkills.languages) {
                        return data.languageSkills.languages;
                      }
                      return data.languageSkills;
                    }
                    return {};
                  };
                  return extract(testData) || {};
                })(),

          // Métadonnées du test
          testMetadata: {
            selectedLanguage: testStatus.language || selectedLanguage,
            completedAt: new Date().toISOString(),
            isCompleted: true,
            totalDuration: testData.totalDuration || 0,
            version: "1.0",
            startedAt: testData.metadata?.startedAt
          },

          // Indicateur pour App.tsx
          showReport: true,

          // Identifiant de session
          uuid: response.data.uuid
        };

        console.log('Données structurées pour le rapport:', formattedData);
        console.log('Redirection vers le rapport d\'orientation...');
        console.groupEnd();

        // Passer les données structurées au parent
        onComplete(formattedData);
      } else {
        setError(response.data.message || (currentLanguage === 'ar'
          ? 'حدث خطأ أثناء استرجاع تقرير التوجيه'
          : 'Une erreur est survenue lors de la récupération du rapport d\'orientation'));
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du rapport', err);
      // Gestion des erreurs existante...
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier le statut du test à la connexion
  useEffect(() => {

    const checkTestStatus = async () => {
      if (!isAuthenticated) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/orientation-test/my-test`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.hasTest) {
          const testData = response.data.data;
          const isCompleted = testData.isCompleted || false;

          console.log('📊 Données du test chargées:', testData);

          // Récupérer les étapes complétées depuis metadata.stepDurations
          const stepDurations = testData.testMetadata?.stepDurations || {};
          const completedSteps = Object.keys(stepDurations).filter(step => stepDurations[step] > 0);
          
          // Ajouter aussi les étapes qui ont des données dans currentStep
          const currentStepData = testData.currentStep || {};
          const stepsWithData = [];
          
          // Vérifier personalInfo - plusieurs structures possibles
          // Structure 1: currentStep.personalInfo.personalInfo (données imbriquées)
          // Structure 2: currentStep.personalInfo (données directes)
          // Structure 3: stepDurations.personalInfo > 0 (marqué comme complété)
          if (currentStepData.personalInfo) {
            let personalInfoData = null;
            
            // Essayer d'extraire les données depuis différentes structures
            if (currentStepData.personalInfo.personalInfo) {
              personalInfoData = currentStepData.personalInfo.personalInfo;
            } else if (typeof currentStepData.personalInfo === 'object') {
              personalInfoData = currentStepData.personalInfo;
            }
            
            // Vérifier si les champs essentiels sont remplis
            if (personalInfoData && (
              personalInfoData.firstName || 
              personalInfoData.lastName || 
              personalInfoData.age || 
              personalInfoData.phoneNumber ||
              personalInfoData.studyLevel ||
              personalInfoData.bacType
            )) {
              if (!stepsWithData.includes('personalInfo')) {
                stepsWithData.push('personalInfo');
                console.log('✅ personalInfo détecté comme complété avec données:', personalInfoData);
              }
            }
          }
          
          // Vérifier aussi si personalInfo est dans stepDurations (même si durée = 0, c'est marqué)
          if (stepDurations.hasOwnProperty('personalInfo')) {
            if (!stepsWithData.includes('personalInfo')) {
              stepsWithData.push('personalInfo');
              console.log('✅ personalInfo détecté comme complété via stepDurations (présent dans metadata)');
            }
          }
          
          if (currentStepData.riasec) stepsWithData.push('riasec');
          if (currentStepData.personality) stepsWithData.push('personality');
          if (currentStepData.interests) stepsWithData.push('interests');
          if (currentStepData.careerCompatibility) stepsWithData.push('careerCompatibility');
          if (currentStepData.constraints) stepsWithData.push('constraints');
          if (currentStepData.languageSkills) stepsWithData.push('languageSkills');
          
          // Fusionner les deux listes
          const allCompletedSteps = [...new Set([...completedSteps, ...stepsWithData])];
          console.log('📊 Étapes complétées détectées:', {
            completedSteps,
            stepsWithData,
            allCompletedSteps
          });

          // Déterminer l'étape courante
          const currentStepId = testData.currentStepId || testData.testMetadata?.currentStep || 'welcome';

          // Calculer le statut de chaque étape
          const calculatedStepStatuses: Record<string, 'completed' | 'current' | 'locked'> = {};
          testSteps.forEach((step, index) => {
            // Si l'étape est complétée, elle est toujours "completed" (vert)
            if (allCompletedSteps.includes(step.id)) {
              calculatedStepStatuses[step.id] = 'completed';
            } 
            // Si c'est l'étape courante, elle est "current"
            else if (step.id === currentStepId) {
              calculatedStepStatuses[step.id] = 'current';
            }
            // Si c'est la première étape et qu'aucune n'est complétée, elle est "current"
            else if (index === 0 && !allCompletedSteps.length) {
              calculatedStepStatuses[step.id] = 'current';
            }
            // Si l'étape précédente est complétée, cette étape est accessible ("current")
            else if (index > 0 && allCompletedSteps.includes(testSteps[index - 1].id)) {
              calculatedStepStatuses[step.id] = 'current';
            }
            // Si toutes les étapes précédentes sont complétées, cette étape est accessible
            else if (index > 0) {
              const allPreviousCompleted = testSteps.slice(0, index).every(prevStep => 
                allCompletedSteps.includes(prevStep.id)
              );
              if (allPreviousCompleted) {
                calculatedStepStatuses[step.id] = 'current';
              } else {
                calculatedStepStatuses[step.id] = 'locked';
              }
            }
            // Sinon, l'étape est verrouillée
            else {
              calculatedStepStatuses[step.id] = 'locked';
            }
          });

          setStepStatuses(calculatedStepStatuses);
          console.log('✅ Statuts des étapes calculés:', calculatedStepStatuses);

          // Calculer le nombre total d'étapes complétées en incluant les sous-étapes
          let completedSectionsCount = allCompletedSteps.length;

          // Vérifier si des étapes supplémentaires sont complétées mais pas incluses dans allCompletedSteps
          // (Cette logique est maintenant gérée par la détection automatique ci-dessus)

          // Test d'aptitude supprimé dans la version rapide

          // Vérifier si le test d'intérêts est complété
          if (currentStepData.interests) {
            console.log("Données d'intérêts trouvées:", currentStepData.interests);

            // Vérifier si le test d'intérêts est explicitement marqué comme complété
            const interestsData = currentStepData.interests.interests || currentStepData.interests;
            if (
              (currentStepData.interests.isCompleted) ||
              (currentStepData.interests.completedAt) ||
              (interestsData && interestsData.completedAt)
            ) {
              if (!allCompletedSteps.includes('interests')) {
                completedSectionsCount++;
                console.log("Test d'intérêts considéré comme complété ✅");
              }
            } else if (!allCompletedSteps.includes('interests') && interestsData) {
              // Vérifier si le test est partiellement complété
              // interestsData déjà défini ci-dessus

              // Calculer le pourcentage de complétion en fonction des réponses
              if (interestsData.fieldInterests && Object.keys(interestsData.fieldInterests).length > 0) {
                const selectedLang = testData.testMetadata?.selectedLanguage || testData.metadata?.selectedLanguage || testData.selectedLanguage || 'fr';
                const totalFields = academicFields[selectedLang] ?
                  academicFields[selectedLang].length : 27; // Nombre total de domaines académiques

                const completedFields = Object.keys(interestsData.fieldInterests).length;

                if (completedFields > 0) {
                  const interestsProgress = (completedFields / totalFields);
                  completedSectionsCount += interestsProgress;
                  console.log(`Progrès partiel du test d'intérêts: ${completedFields}/${totalFields} domaines (${interestsProgress * 100}%) 🔄`);
                }
              }
            }
          }


          // Vérifier si le test de compatibilité de carrière est complété
          if (currentStepData.careerCompatibility) {
            console.log("Données de compatibilité de carrière trouvées:", currentStepData.careerCompatibility);

            // Vérifier si le test de compatibilité de carrière est explicitement marqué comme complété
            const careerData = currentStepData.careerCompatibility.careers || currentStepData.careerCompatibility;
            if (
              (currentStepData.careerCompatibility.isCompleted) ||
              (currentStepData.careerCompatibility.completedAt) ||
              (careerData && careerData.completedAt)
            ) {
              if (!allCompletedSteps.includes('careerCompatibility')) {
                completedSectionsCount++;
                console.log("Test de compatibilité de carrière considéré comme complété ✅");
              }
            } else if (!allCompletedSteps.includes('careerCompatibility') && careerData) {
              // Vérifier si le test est partiellement complété

              // Calculer le pourcentage de complétion en fonction des réponses d'attraction
              if (careerData.careerAttractions && Object.keys(careerData.careerAttractions).length > 0) {
                const totalCareers = 40; // Version rapide : ~40 carrières au lieu de 150

                const completedCareers = Object.keys(careerData.careerAttractions).length;

                // Si au moins 10 carrières ont été évaluées, considérer une progression partielle
                if (completedCareers >= 10) {
                  const careerProgress = Math.min(1, (completedCareers / 30)); // Limiter à 100% avec 30 carrières évaluées
                  completedSectionsCount += careerProgress;
                  console.log(`Progrès partiel du test de compatibilité de carrière: ${completedCareers}/30 carrières (${careerProgress * 100}%) 🔄`);
                } else if (completedCareers > 0) {
                  // Si moins de 10 carrières évaluées, progression moindre
                  const careerProgress = (completedCareers / 30) * 0.5; // 50% de la progression normale
                  completedSectionsCount += careerProgress;
                  console.log(`Progrès minimal du test de compatibilité de carrière: ${completedCareers}/30 carrières (${careerProgress * 100}%) 🔄`);
                }
              }
            }
          }


          // Vérifier si le test de contraintes est complété
          if (currentStepData.constraints) {
            console.log("Données de contraintes trouvées:", currentStepData.constraints);

            // Vérifier si le test de contraintes est explicitement marqué comme complété
            const constraintsData = currentStepData.constraints.constraints || currentStepData.constraints;
            if (
              (currentStepData.constraints.isCompleted) ||
              (currentStepData.constraints.completedAt) ||
              (constraintsData && constraintsData.completedAt)
            ) {
              if (!allCompletedSteps.includes('constraints')) {
                completedSectionsCount++;
                console.log("Test de contraintes considéré comme complété ✅");
              }
            } else if (!allCompletedSteps.includes('constraints') && constraintsData) {
              // Vérifier si le test est partiellement complété

              // Calculer le pourcentage de complétion en fonction des réponses
              let fieldsCompleted = 0;
              let totalFields = 0;

              // Vérifier la section mobilité
              if (constraintsData.mobility) {
                totalFields += 3; // city, country, international
                fieldsCompleted += Object.values(constraintsData.mobility).filter(Boolean).length;
              }

              // Vérifier la section budget
              if (constraintsData.budget) {
                totalFields += 3; // annualBudget, scholarshipEligible, familySupport
                fieldsCompleted += Object.values(constraintsData.budget).filter(Boolean).length;
              }

              // Vérifier la section éducation
              if (constraintsData.education) {
                totalFields += 3; // maxLevel, preferredDuration, studyMode
                fieldsCompleted += Object.values(constraintsData.education).filter(Boolean).length;
              }

              // Vérifier les priorités
              if (constraintsData.priorities) {
                totalFields += 5; // salary, stability, passion, prestige, workLife
                fieldsCompleted += Object.values(constraintsData.priorities)
                  .filter(value => typeof value === 'number' && value > 1).length;
              }

              // Si au moins 3 champs ont été remplis, considérer une progression partielle
              if (fieldsCompleted >= 3) {
                const constraintsProgress = Math.min(1, (fieldsCompleted / totalFields));
                completedSectionsCount += constraintsProgress;
                console.log(`Progrès partiel du test de contraintes: ${fieldsCompleted}/${totalFields} champs (${constraintsProgress * 100}%) 🔄`);
              }
            }
          }


          // Vérifier si le test de compétences linguistiques est complété
          if (currentStepData.languageSkills) {
            console.log("Données de compétences linguistiques trouvées:", currentStepData.languageSkills);

            // Vérifier si le test de compétences linguistiques est explicitement marqué comme complété
            const languageData = currentStepData.languageSkills.languages || currentStepData.languageSkills;
            if (
              (currentStepData.languageSkills.isCompleted) ||
              (currentStepData.languageSkills.completedAt) ||
              (languageData && languageData.completedAt)
            ) {
              if (!allCompletedSteps.includes('languageSkills')) {
                completedSectionsCount++;
                console.log("Test de compétences linguistiques considéré comme complété ✅");
              }
            } else if (!allCompletedSteps.includes('languageSkills') && languageData) {
              // Vérifier si le test est partiellement complété

              // Calculer le pourcentage de complétion en fonction des réponses
              let completionScore = 0;

              // 1. Vérifier les langues sélectionnées (20% du score)
              if (languageData.selectedLanguages && languageData.selectedLanguages.length >= 2) {
                completionScore += 0.2;
              }

              // 2. Vérifier les compétences linguistiques (40% du score)
              if (languageData.languageSkills) {
                const languageCodes = languageData.selectedLanguages || [];
                const totalSkillsRequired = languageCodes.length * 4; // 4 compétences par langue
                let skillsCompleted = 0;

                Object.entries(languageData.languageSkills).forEach(([langCode, skills]) => {
                  if (langCode && typeof skills === 'object') {
                    skillsCompleted += Object.values(skills).filter(Boolean).length;
                  }
                });

                if (totalSkillsRequired > 0) {
                  const skillsProgress = Math.min(1, skillsCompleted / totalSkillsRequired);
                  completionScore += (skillsProgress * 0.4);
                }
              }

              // 3. Vérifier les certificats (10% du score)
              if (languageData.certificates) {
                let certificatesChecked = 0;

                Object.values(languageData.certificates).forEach((cert: any) => {
                  if (cert && typeof cert === 'object' && cert.hasCertificate !== undefined) {
                    certificatesChecked++;
                  }
                });

                const languageCodes = languageData.selectedLanguages || [];
                if (languageCodes.length > 0) {
                  const certProgress = Math.min(1, certificatesChecked / languageCodes.length);
                  completionScore += (certProgress * 0.1);
                }
              }

              // 4. Vérifier les préférences (30% du score)
              if (languageData.preferences) {
                const preferences = languageData.preferences;
                let preferencesCompleted = 0;

                if (preferences.preferredTeachingLanguage) preferencesCompleted++;
                if (preferences.comfortableStudyingIn && preferences.comfortableStudyingIn.length > 0) preferencesCompleted++;
                if (preferences.willingToImprove && preferences.willingToImprove.length > 0) preferencesCompleted++;

                const prefProgress = preferencesCompleted / 3;
                completionScore += (prefProgress * 0.3);
              }

              // Ajouter la part de progression pour ce test
              if (completionScore > 0) {
                completedSectionsCount += completionScore;
                console.log(`Progrès partiel du test de compétences linguistiques: ${Math.round(completionScore * 100)}% 🔄`);
              }
            }
          }

          // Calculer le pourcentage de progression avec le nouveau comptage
          const totalSteps = 7; // Nombre total d'étapes du test (version rapide sans aptitude)

          // Calculer les parties entières et décimales pour l'affichage
          const completedSectionsInt = Math.floor(completedSectionsCount);
          const hasPartialSection = completedSectionsCount > completedSectionsInt;

          // Arrondir à un chiffre après la virgule pour un affichage plus précis
          const progressPercentage = Math.round((completedSectionsCount / totalSteps) * 100);

          // Définir le statut du test
          setTestStatus({
            startedAt: testData.testMetadata?.startedAt || testData.metadata?.startedAt,
            lastActivity: testData.testMetadata?.completedAt || testData.completedAt || new Date().toISOString(),
            progressPercentage: progressPercentage,
            completedSections: completedSectionsInt,
            completedSectionsRaw: completedSectionsCount,
            hasPartialSection: hasPartialSection,
            totalSections: totalSteps,
            isCompleted: isCompleted,
            language: testData.testMetadata?.selectedLanguage || testData.metadata?.selectedLanguage || testData.selectedLanguage || language,
            currentStepId: currentStepId,
            stepDurations: stepDurations,
            testData: testData // Stocker toutes les données pour utilisation ultérieure
          });

          const testLanguage = testData.testMetadata?.selectedLanguage || testData.metadata?.selectedLanguage || testData.selectedLanguage;
          if (testLanguage && testLanguage !== currentLanguage) {
            console.log(`Adaptation automatique de la langue: ${currentLanguage} -> ${testLanguage}`);
            setSelectedLanguage(testLanguage);
            setCurrentLanguage(testLanguage);

            // Informer le composant parent du changement de langue
            if (onLanguageChange && typeof onLanguageChange === 'function') {
              onLanguageChange(testLanguage);
            }
          }

          // Si le test est déjà en cours, on peut automatiquement charger les données
          // pour que les composants enfants puissent les utiliser
          if (!isCompleted && currentStepId && currentStepId !== 'welcome') {
            console.log('📥 Test en cours détecté, préparation des données pour reprise...');
            // Les données sont déjà stockées dans testStatus.testData
            // Elles seront utilisées quand l'utilisateur clique sur "Continuer"
          }

        }
      } catch (err) {
        console.error('Erreur lors de la vérification du statut du test', err);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkTestStatus();
  }, [isAuthenticated, token, onLanguageChange, language]);

  const handleStartSpecificStep = async (stepId: string) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // Si on a déjà les données chargées dans testStatus, les utiliser directement
      if (testStatus?.testData) {
        console.log('📥 Utilisation des données déjà chargées pour naviguer vers:', stepId);
        console.log('📊 Données disponibles:', testStatus.testData);
        
        // Normaliser les données au niveau racine pour faciliter l'accès
        const testData = {
          ...testStatus.testData,
          selectedLanguage: testStatus.language || selectedLanguage,
          isCompleted: testStatus.isCompleted || false,
          currentStepId: stepId, // Indiquer l'étape ciblée
          // Normaliser les données au niveau racine
          personalInfo: testStatus.testData.personalInfo || 
                       testStatus.testData.currentStep?.personalInfo?.personalInfo || 
                       testStatus.testData.currentStep?.personalInfo || {},
          riasecScores: testStatus.testData.riasecScores || 
                       testStatus.testData.currentStep?.riasec?.riasec || 
                       testStatus.testData.currentStep?.riasec || {},
          personalityScores: testStatus.testData.personalityScores || 
                            testStatus.testData.currentStep?.personality?.personality || 
                            testStatus.testData.currentStep?.personality || {},
          academicInterests: testStatus.testData.academicInterests || 
                            testStatus.testData.currentStep?.interests?.interests || 
                            testStatus.testData.currentStep?.interests || {},
          careerCompatibility: testStatus.testData.careerCompatibility || 
                              testStatus.testData.currentStep?.careerCompatibility?.careers || 
                              testStatus.testData.currentStep?.careerCompatibility || {},
          constraints: testStatus.testData.constraints || 
                      testStatus.testData.currentStep?.constraints?.constraints || 
                      testStatus.testData.currentStep?.constraints || {},
          languageSkills: testStatus.testData.languageSkills || 
                         testStatus.testData.currentStep?.languages || 
                         testStatus.testData.currentStep?.languageSkills?.languages || 
                         testStatus.testData.currentStep?.languageSkills || {}
        };
        
        console.log("✅ Données envoyées à onComplete depuis testStatus:", testData);
        console.log("📋 personalInfo normalisé:", testData.personalInfo);
        onComplete(testData);
        setIsLoading(false);
        return;
      }

      // Sinon, récupérer depuis le backend
      console.log('📡 Récupération des données depuis le backend pour:', stepId);
      const response = await axios.get(`${API_BASE_URL}/orientation-test/resume`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log(`Redirection vers l'étape: ${stepId}`);
        console.log('📊 Données reçues du backend:', response.data);

        // Créer une version modifiée des données du test avec l'étape ciblée
        // Normaliser les données pour qu'elles soient accessibles au niveau racine
        const testData = {
          ...response.data.data,
          uuid: response.data.uuid || response.data.data.uuid,
          selectedLanguage: response.data.data.currentStep?.selectedLanguage || 
                           response.data.data.testMetadata?.selectedLanguage || 
                           response.data.data.selectedLanguage || 
                           testStatus?.language || 
                           selectedLanguage,
          isCompleted: response.data.data.isCompleted || response.data.isCompleted || false,
          currentStepId: stepId, // Indiquer l'étape ciblée
          // Normaliser les données au niveau racine pour faciliter l'accès
          personalInfo: response.data.data.personalInfo || 
                       response.data.data.currentStep?.personalInfo?.personalInfo || 
                       response.data.data.currentStep?.personalInfo || {},
          riasecScores: response.data.data.riasecScores || 
                       response.data.data.currentStep?.riasec?.riasec || 
                       response.data.data.currentStep?.riasec || {},
          personalityScores: response.data.data.personalityScores || 
                            response.data.data.currentStep?.personality?.personality || 
                            response.data.data.currentStep?.personality || {},
          academicInterests: response.data.data.academicInterests || 
                            response.data.data.currentStep?.interests?.interests || 
                            response.data.data.currentStep?.interests || {},
          careerCompatibility: response.data.data.careerCompatibility || 
                              response.data.data.currentStep?.careerCompatibility?.careers || 
                              response.data.data.currentStep?.careerCompatibility || {},
          constraints: response.data.data.constraints || 
                      response.data.data.currentStep?.constraints?.constraints || 
                      response.data.data.currentStep?.constraints || {},
          languageSkills: response.data.data.languageSkills || 
                         response.data.data.currentStep?.languages || 
                         response.data.data.currentStep?.languageSkills?.languages || 
                         response.data.data.currentStep?.languageSkills || {}
        };

        // Ajoutez un log pour vérifier les données
        console.log("✅ Données envoyées à onComplete depuis backend:", testData);
        console.log("📋 Structure currentStep:", testData.currentStep);
        console.log("📋 Structure personalInfo (normalisé):", testData.personalInfo);
        console.log("📋 Structure riasecScores (normalisé):", testData.riasecScores);
        console.log("📋 Structure personalityScores (normalisé):", testData.personalityScores);
        console.log("📋 Structure academicInterests (normalisé):", testData.academicInterests);
        console.log("📋 Structure careerCompatibility (normalisé):", testData.careerCompatibility);
        console.log("📋 Structure constraints (normalisé):", testData.constraints);
        console.log("📋 Structure languageSkills (normalisé):", testData.languageSkills);

        onComplete(testData);
      } else {
        setError(response.data.message || (currentLanguage === 'ar'
          ? 'حدث خطأ أثناء استئناف الاختبار'
          : 'Une erreur est survenue lors de la reprise du test'));
      }
    } catch (err) {
      console.error('Erreur lors de la navigation vers étape spécifique', err);
      setError(currentLanguage === 'ar'
        ? 'حدث خطأ أثناء توجيهك إلى الخطوة المحددة'
        : 'Une erreur est survenue lors de la redirection vers l\'étape sélectionnée');
    } finally {
      setIsLoading(false);
    }
  };


  // Fonctions pour récupérer des descriptions détaillées pour chaque étape
  const getStepDescriptionFr = (stepId: string) => {
    switch (stepId) {
      case 'personalInfo':
        return "Vos informations de base et votre parcours scolaire actuel pour des recommandations personnalisées.";
      case 'riasec':
        return "Évaluez vos intérêts professionnels selon les 6 types de personnalité RIASEC.";
      case 'personality':
        return "Découvrez vos traits de personnalité dominants et comment ils influencent vos choix de carrière.";
      // Test d'aptitude supprimé dans la version rapide
      case 'interests':
        return "Identifiez les domaines d'études qui vous passionnent le plus parmi de nombreuses disciplines.";
      case 'careerCompatibility':
        return "Explorez différentes carrières et évaluez votre attraction pour chacune d'entre elles.";
      case 'constraints':
        return "Précisez vos contraintes géographiques, financières et vos priorités professionnelles.";
      case 'languageSkills':
        return "Évaluez vos compétences linguistiques et leur adéquation avec différentes formations.";
      default:
        return "";
    }
  };

  const getStepDescriptionAr = (stepId: string) => {
    switch (stepId) {
      case 'personalInfo':
        return "معلوماتك الأساسية ومسارك الدراسي الحالي للحصول على توصيات مخصصة.";
      case 'riasec':
        return "قيّم اهتماماتك المهنية وفقًا لأنواع الشخصية الستة RIASEC.";
      case 'personality':
        return "اكتشف سمات شخصيتك السائدة وكيف تؤثر على خياراتك المهنية.";
      // Test d'aptitude supprimé dans la version rapide
      case 'interests':
        return "حدد مجالات الدراسة التي تثير اهتمامك أكثر من بين العديد من التخصصات.";
      case 'careerCompatibility':
        return "استكشف مهنًا مختلفة وقيّم انجذابك لكل منها.";
      case 'constraints':
        return "حدد قيودك الجغرافية والمالية وأولوياتك المهنية.";
      case 'languageSkills':
        return "قيّم مهاراتك اللغوية ومدى ملاءمتها مع مختلف الدورات التدريبية.";
      default:
        return "";
    }
  };

  // Fonction pour récupérer la durée approximative de chaque étape
  const getStepDuration = (stepId: string) => {
    switch (stepId) {
      case 'personalInfo':
        return currentLanguage === 'ar' ? "2-3 دقائق" : "2-3 minutes";
      case 'riasec':
        return currentLanguage === 'ar' ? "5-7 دقائق" : "5-7 minutes";
      case 'personality':
        return currentLanguage === 'ar' ? "3-5 دقائق" : "3-5 minutes";
      // Test d'aptitude supprimé dans la version rapide
      case 'interests':
        return currentLanguage === 'ar' ? "4-6 دقائق" : "4-6 minutes";
      case 'careerCompatibility':
        return currentLanguage === 'ar' ? "1.5-3 دقائق" : "1.5-3 minutes";
      case 'constraints':
        return currentLanguage === 'ar' ? "3-4 دقائق" : "3-4 minutes";
      case 'languageSkills':
        return currentLanguage === 'ar' ? "2-3 دقائق" : "2-3 minutes";
      default:
        return currentLanguage === 'ar' ? "3-5 دقائق" : "3-5 minutes";
    }
  };

  // Vous pouvez ajouter une vérification de l'authentification
  useEffect(() => {
    if (!isAuthenticated) {
      setError(currentLanguage === 'ar'
        ? 'يجب عليك تسجيل الدخول لبدء اختبار التوجيه'
        : 'Vous devez être connecté pour démarrer un test d\'orientation');
    }
  }, [isAuthenticated, currentLanguage]);

  const handleStartTest = async () => {
    // 🔧 MODIFICATION : Permettre de démarrer le test sans authentification pour les tests
    // Si pas d'authentification, démarrer directement le test localement
    if (!isAuthenticated) {
      console.log('🚀 Démarrage du test sans authentification (mode test)');
      setIsLoading(true);
      
      // Simuler un démarrage de test local et passer à l'étape suivante
      setTimeout(() => {
        onComplete({
          selectedLanguage,
          isCompleted: false,
          currentStepId: 'personalInfo', // Passer directement à l'étape des informations personnelles
          testMetadata: {
            selectedLanguage: selectedLanguage,
            startedAt: new Date(),
            stepDurations: {},
            version: 'quick-1.0'
          }
        });
        setIsLoading(false);
      }, 300);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/orientation-test/start`, {
        selectedLanguage: selectedLanguage
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('Test d\'orientation démarré avec succès', response.data);
        if (response.data.uuid) {
          localStorage.setItem('orientationSessionUuid', response.data.uuid);
        }
        onComplete({
          uuid: response.data.uuid,
          selectedLanguage,
          isCompleted: response.data.isCompleted,
          ...response.data.data
        });
      } else {
        setError(response.data.message || (currentLanguage === 'ar'
          ? 'حدث خطأ أثناء بدء الاختبار'
          : 'Une erreur est survenue lors du démarrage du test'));
      }
    } catch (err) {
      console.error('Erreur lors du démarrage du test d\'orientation', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('orientation_token');
          setError(currentLanguage === 'ar'
            ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى'
            : 'Session expirée, veuillez vous reconnecter');
        } else {
          setError(err.response?.data?.message || (currentLanguage === 'ar'
            ? 'خطأ في الاتصال بالخادم'
            : 'Erreur de connexion au serveur'));
        }
      } else {
        setError(currentLanguage === 'ar'
          ? 'حدث خطأ غير متوقع'
          : 'Une erreur inattendue est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleContinueTest = async () => {
    if (!testStatus || !isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // Si on a déjà les données chargées dans testStatus, les utiliser directement
      if (testStatus.testData) {
        console.log('📥 Utilisation des données déjà chargées pour reprendre le test');
        const testData = {
          ...testStatus.testData,
          selectedLanguage: testStatus.language || selectedLanguage,
          isCompleted: testStatus.isCompleted || false,
          currentStepId: testStatus.currentStepId || 'personalInfo'
        };
        onComplete(testData);
        setIsLoading(false);
        return;
      }

      // Sinon, récupérer depuis le backend
      const response = await axios.get(`${API_BASE_URL}/orientation-test/resume`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('Reprise du test d\'orientation', response.data);

        // Préparer les données à passer à onComplete
        const testData = {
          ...response.data.data,
          uuid: response.data.uuid || response.data.data.uuid,
          selectedLanguage: response.data.data.currentStep?.selectedLanguage || 
                           response.data.data.testMetadata?.selectedLanguage || 
                           response.data.data.selectedLanguage || 
                           selectedLanguage,
          isCompleted: response.data.data.isCompleted || false,
          currentStepId: response.data.data.currentStepId || testStatus?.currentStepId || 'personalInfo'
        };

        onComplete(testData);
      } else {
        setError(response.data.message || (currentLanguage === 'ar'
          ? 'حدث خطأ أثناء استئناف الاختبار'
          : 'Une erreur est survenue lors de la reprise du test'));
      }
    } catch (err) {
      console.error('Erreur lors de la reprise du test', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('orientation_token');
          setError(currentLanguage === 'ar'
            ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى'
            : 'Session expirée, veuillez vous reconnecter');
        } else {
          setError(err.response?.data?.message || (currentLanguage === 'ar'
            ? 'خطأ في الاتصال بالخادم'
            : 'Erreur de connexion au serveur'));
        }
      } else {
        setError(currentLanguage === 'ar'
          ? 'حدث خطأ غير متوقع'
          : 'Une erreur inattendue est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartTest = async () => {
    setShowConfirmModal(false);

    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // Utiliser l'endpoint reset au lieu de restart
      const response = await axios.post(`${API_BASE_URL}/orientation-test/reset`, {
        selectedLanguage: selectedLanguage
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('Test d\'orientation redémarré', response.data);
        if (response.data.uuid) {
          localStorage.setItem('orientationSessionUuid', response.data.uuid);
        }
        onComplete({
          uuid: response.data.uuid,
          selectedLanguage,
          isCompleted: false, // Le test vient d'être réinitialisé
          ...response.data.data
        });
      } else {
        setError(response.data.message || (currentLanguage === 'ar'
          ? 'حدث خطأ أثناء إعادة بدء الاختبار'
          : 'Une erreur est survenue lors du redémarrage du test'));
      }
    } catch (err) {
      console.error('Erreur lors du redémarrage du test', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('orientation_token');
          setError(currentLanguage === 'ar'
            ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى'
            : 'Session expirée, veuillez vous reconnecter');
        } else {
          setError(err.response?.data?.message || (currentLanguage === 'ar'
            ? 'خطأ في الاتصال بالخادم'
            : 'Erreur de connexion au serveur'));
        }
      } else {
        setError(currentLanguage === 'ar'
          ? 'حدث خطأ غير متوقع'
          : 'Une erreur inattendue est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter avant le return
  useEffect(() => {
    // Si une étape est complétée et que le test est en cours, définir automatiquement la prochaine étape comme cible
    if (testStatus) {
      const completedStepIndex = testSteps.findIndex(step => stepStatuses[step.id] === 'completed');
      if (completedStepIndex >= 0 && completedStepIndex < testSteps.length - 1) {
        setAnimationTargetStep(testSteps[completedStepIndex + 1].id);
      }
    } else if (selectedLanguage) {
      // Si une langue est sélectionnée mais que le test n'est pas commencé, animer la première étape
      setAnimationTargetStep('personalInfo');
    }
  }, [testStatus, stepStatuses, selectedLanguage]);

  // Afficher un indicateur de chargement pendant la vérification du statut
  if (isCheckingStatus) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2Icon className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">
          {currentLanguage === 'ar' ? 'جاري التحقق من حالة الاختبار...' : 'Vérification du statut de votre test...'}
        </p>
      </div>
    );
  }

  return (
    <div className={`text-center max-w-5xl mx-auto ${currentLanguage === 'ar' ? 'rtl' : 'ltr'}`}>

      {/* Header avec logo Educalogy */}
      <div className="text-center">
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
          {/* Logo Educalogy - Version agrandie */}
          <div className="flex items-center justify-center">
            <img
              src="https://cdn.e-tawjihi.ma/logo-rectantgle-simple-nobg.png"
              alt="Educalogy"
              className="h-32 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-auto object-contain"
            />
          </div>
        </div>
      </div>
      {/* Hero Section */}
      <div className="mb-12">

        <h1 className={`text-4xl font-bold text-gray-900 mb-4 ${currentLanguage === 'ar' ? 'text-center' : ''}`}>
          {t.welcomeTitle}
        </h1>
        <p className={`text-xl text-gray-600 leading-relaxed ${currentLanguage === 'ar' ? 'text-center' : ''}`}>
          {t.welcomeSubtitle}
        </p>
      </div>

      {/* Test en cours - Affiché seulement si un test est en cours */}
      {testStatus && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-12 border border-blue-200 shadow-md">
          <div className={`flex items-center justify-center space-x-3 mb-6 ${currentLanguage === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <PlayCircleIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">{t.testInProgress}</h2>
          </div>

          <div className="space-y-4">
            {/* Informations sur le test en cours */}
            <div className="grid grid-cols-2 gap-4 text-left mb-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t.testStartedOn}</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {testStatus.startedAt ? formatDate(testStatus.startedAt) : '-'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t.lastActivity}</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {testStatus.lastActivity ? formatDate(testStatus.lastActivity) : '-'}
                </p>
              </div>
            </div>

            {/* Progression du test */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t.testProgress}</h3>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${testStatus.progressPercentage || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 text-right">
                {testStatus.progressPercentage || 0}% {t.completedSections}: {testStatus.completedSections || 0}
                {testStatus.hasPartialSection && (
                  <span className="text-blue-600">+</span>
                )}
                /{testStatus.totalSections || 8}
                {testStatus.hasPartialSection && (
                  <span className="text-blue-600 ml-1">
                    ({currentLanguage === 'ar' ? 'جزء مكتمل' : 'section partielle'})
                  </span>
                )}
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <button
                onClick={handleContinueTest}
                disabled={isLoading}
                className={`flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <Loader2Icon className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <PlayCircleIcon className="w-5 h-5" />
                    <span>{t.continueTest}</span>
                  </>
                )}
              </button>
              <button
                onClick={showRestartConfirmation}
                disabled={isLoading}
                className={`flex items-center justify-center space-x-2 border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <RefreshCwIcon className="w-5 h-5" />
                <span>{t.restartTest}</span>
              </button>
            </div>


            {/* Bouton pour voir le rapport si test à 100% */}
            {testStatus && testStatus.progressPercentage === 100 && (
              <div className="mt-4">
                <button
                  onClick={handleViewReport}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${language === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <FileTextIcon className="w-5 h-5" />
                  <span>{currentLanguage === 'ar' ? 'الوصول إلى دعوتي' : 'Accéder à mon invitation'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedLanguage && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                {currentLanguage === 'ar'
                  ? 'يرجى اختيار لغة الاختبار أولاً للبدء في اختبار التوجيه'
                  : 'Veuillez d\'abord choisir la langue du test pour commencer votre test d\'orientation'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection - Affiché seulement si aucun test n'est en cours */}
      {!testStatus && (
        <div
          id="language-selector"
          className={`
      bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 mb-12 
      ${!selectedLanguage ?
              'border-2 border-amber-400 shadow-md animate-pulse' :
              'border border-indigo-100'}
    `}
        >
          <div className={`flex items-center justify-center space-x-3 mb-6 ${currentLanguage === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <GlobeIcon className="w-6 h-6 text-indigo-600" />
            <h2 className={`text-2xl font-bold ${!selectedLanguage ? 'text-amber-700' : 'text-gray-900'}`}>
              {t.chooseLanguage}
            </h2>
          </div>

          <p className={`text-gray-600 mb-6 ${currentLanguage === 'ar' ? 'text-center' : ''}`}>
            {t.languagePreference}
          </p>

          <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={() => handleLanguageSelect('fr')}
              className={`p-4 border-2 rounded-xl transition-all duration-300 ${selectedLanguage === 'fr'
                ? 'border-blue-500 bg-blue-100 text-blue-700 shadow-md'
                : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🇫🇷</div>
                <div className="font-semibold">{t.french}</div>
                <div className="text-sm text-gray-600">Français</div>
              </div>
            </button>

            <button
              onClick={() => handleLanguageSelect('ar')}
              className={`p-4 border-2 rounded-xl transition-all duration-300 ${selectedLanguage === 'ar'
                ? 'border-blue-500 bg-blue-100 text-blue-700 shadow-md'
                : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🇲🇦</div>
                <div className="font-semibold">{t.arabic}</div>
                <div className="text-sm text-gray-600">العربية</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Timeline des étapes - Responsive avec différents layouts */}
      <div className="mb-8 sm:mb-12">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center px-4">{t.stepTimeline}</h3>

        {/* Timeline responsive */}
        <div className="relative mx-2 sm:mx-0">
          {/* Ligne verticale pour mobile - à gauche */}
          <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          {/* Ligne verticale centrale pour desktop */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>

          <div className="space-y-6 sm:space-y-8 md:space-y-10">
            {testSteps.map((step, index) => {
              let stepStatus: 'completed' | 'current' | 'locked' = 'locked';

              if (testStatus) {
                stepStatus = stepStatuses[step.id] || 'locked';
              } else {
                if (step.id === 'personalInfo' && selectedLanguage) {
                  stepStatus = 'current';
                }
              }

              const StepIcon = step.icon;
              const isEven = index % 2 === 0;
              const isTargetStep = animationTargetStep === step.id;

              const cardBg = stepStatus === 'completed'
                ? 'bg-green-50 border-green-200'
                : stepStatus === 'current'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-gray-50 border-gray-200';

              const iconBg = stepStatus === 'completed'
                ? 'bg-green-100 text-green-600 border-green-300'
                : stepStatus === 'current'
                  ? 'bg-amber-100 text-amber-600 border-amber-300'
                  : 'bg-gray-100 text-gray-400 border-gray-300';

              const headerText = stepStatus === 'completed'
                ? 'text-green-700'
                : stepStatus === 'current'
                  ? 'text-amber-700'
                  : 'text-gray-500';

              return (
                <div key={step.id} className={`relative flex items-start md:items-center flex-row ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Point central avec icône */}
                  <div className="flex-shrink-0 z-10 mr-4 mb-0 md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:mr-0 md:mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 ${iconBg} ${stepStatus === 'locked' ? 'opacity-60' : ''} shadow-md`}>
                      {stepStatus === 'completed' ? (
                        <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                      ) : stepStatus === 'locked' ? (
                        <LockIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      ) : (
                        <StepIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                      )}
                    </div>
                  </div>

                  {/* Card de l'étape */}
                  <div className={`md:w-5/12 md:relative ${isEven ? 'md:pr-8' : 'md:pl-8 md:text-left'}`}>
                    <div className={`p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm border transition-all ${cardBg} ${isTargetStep && stepStatus === 'current' ? 'animate-pulse shadow-md' : ''} ${stepStatus === 'locked' ? 'opacity-75' : stepStatus !== 'locked' && 'hover:shadow-md'}`}>

                      <h4 className={`text-base sm:text-lg font-bold mb-2 ${headerText}`}>
                        {t[step.id as keyof typeof t]}
                      </h4>

                      <p className="text-gray-600 text-xs sm:text-sm mb-3 leading-relaxed">
                        {currentLanguage === 'ar' ?
                          getStepDescriptionAr(step.id) :
                          getStepDescriptionFr(step.id)
                        }
                      </p>

                      {/* Badge de statut et bouton */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mt-3 sm:mt-4">
                        <span className={`inline-flex items-center text-xs font-medium px-2 sm:px-3 py-1 rounded-full ${stepStatus === 'completed' ? 'bg-green-100 text-green-700' : stepStatus === 'current' ? 'bg-amber-100 text-amber-700 font-bold' : 'bg-gray-100 text-gray-500'} ${isTargetStep && 'ring-2 ring-offset-1 ring-amber-400'}`}>
                          {!selectedLanguage && step.id === 'personalInfo' ?
                            (currentLanguage === 'ar' ? 'اختر لغة أولاً' : 'Choisir langue') :
                            stepStatus === 'completed' ? t.completed :
                              stepStatus === 'current' ? (
                                <span className="flex items-center space-x-1">
                                  <span>{t.current}</span>
                                  {isTargetStep && <ArrowRightIcon className="w-3 h-3 ml-1" />}
                                </span>
                              ) :
                                t.locked}
                        </span>

                        {/* Bouton d'action */}
                        {(stepStatus !== 'locked' || (step.id === 'personalInfo' && !testStatus)) && (
                          <button
                            onClick={() => {
                              if (step.id === 'personalInfo' && !selectedLanguage) {
                                document.getElementById('language-selector')?.scrollIntoView({ behavior: 'smooth' });
                              } else if (step.id === 'personalInfo' && selectedLanguage && !testStatus) {
                                handleStartTest();
                              } else if (stepStatus === 'completed') {
                                // Permettre de revoir une étape complétée
                                handleStartSpecificStep(step.id);
                              } else if (stepStatus !== 'locked') {
                                handleStartSpecificStep(step.id);
                              }
                            }}
                            className={`w-full sm:w-auto text-xs font-medium px-3 py-1.5 sm:py-1 rounded-lg transition-all hover:scale-105 ${!selectedLanguage && step.id === 'personalInfo' ? 'bg-amber-600 text-white hover:bg-amber-700' : stepStatus === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' : stepStatus === 'current' ? 'bg-amber-600 text-white hover:bg-amber-700' : `bg-blue-600 text-white hover:bg-blue-700`} ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
                          >
                            {isLoading ? (
                              <Loader2Icon className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mx-auto" />
                            ) : (
                              <>
                                {!selectedLanguage && step.id === 'personalInfo' ?
                                  (currentLanguage === 'ar' ? 'اختر لغة' : 'Choisir langue') :
                                  stepStatus === 'completed' ?
                                    (currentLanguage === 'ar' ? 'مراجعة' : 'Revoir') :
                                    (currentLanguage === 'ar' ? 'بدء' : 'Commencer')}
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Indicateur de durée */}
                      <div className="flex items-center text-xs text-gray-500 mt-2 sm:mt-3">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        <span>{getStepDuration(step.id)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Espace vide pour desktop */}
                  <div className="md:w-5/12 hidden md:block"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <FileTextIcon className="w-10 h-10 text-blue-600 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${currentLanguage === 'ar' ? 'text-center' : ''}`}>
            {t.scientificTests}
          </h3>
          <p className={`text-gray-600 ${currentLanguage === 'ar' ? 'text-center' : ''}`}>
            {t.scientificTestsDesc}
          </p>
        </div>

        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
          <BrainIcon className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${currentLanguage === 'ar' ? 'text-center' : ''}`}>
            {t.completeAnalysis}
          </h3>
          <p className={`text-gray-600 ${currentLanguage === 'ar' ? 'text-center' : ''}`}>
            {t.completeAnalysisDesc}
          </p>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <FileTextIcon className="w-10 h-10 text-purple-600 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${currentLanguage === 'ar' ? 'text-center' : ''}`}>
            {t.detailedReport}
          </h3>
          <p className={`text-gray-600 ${currentLanguage === 'ar' ? 'text-center' : ''}`}>
            {t.detailedReportDesc}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
        <div className={`flex items-center justify-center space-x-2 mb-3 ${currentLanguage === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <ClockIcon className="w-5 h-5 text-amber-600" />
          <span className="font-medium text-amber-800">{t.estimatedTime}</span>
        </div>
        <p className={`text-amber-700 ${currentLanguage === 'ar' ? 'text-center' : ''}`}>
          {t.estimatedTimeDesc}
        </p>
      </div>

      {/* What you'll discover */}
      <div className={`bg-gray-50 rounded-xl p-6 mb-8 ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
        <h3 className={`text-lg font-semibold text-gray-900 mb-4 text-center`}>
          {t.whatYouDiscover}
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className={`flex items-start space-x-3 ${currentLanguage === 'ar' ? 'flex-row-reverse space-x-reverse text-right' : ''}`}>
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
            <span>{t.riasecProfile}</span>
          </li>
          <li className={`flex items-start space-x-3 ${currentLanguage === 'ar' ? 'flex-row-reverse space-x-reverse text-right' : ''}`}>
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
            <span>{t.aptitudesPerformances}</span>
          </li>
          <li className={`flex items-start space-x-3 ${currentLanguage === 'ar' ? 'flex-row-reverse space-x-reverse text-right' : ''}`}>
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
            <span>{t.recommendedDomains}</span>
          </li>
          <li className={`flex items-start space-x-3 ${currentLanguage === 'ar' ? 'flex-row-reverse space-x-reverse text-right' : ''}`}>
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
            <span>{t.careersOpportunities}</span>
          </li>
        </ul>
      </div>

      {/* Message si l'utilisateur n'est pas connecté */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg mb-6">
          {currentLanguage === 'ar'
            ? 'يجب عليك تسجيل الدخول لبدء اختبار التوجيه. الرجاء تسجيل الدخول أولاً.'
            : 'Vous devez vous connecter pour démarrer un test d\'orientation. Veuillez vous connecter d\'abord.'}
          <div className="mt-2">
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
            </a>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Bouton CTA - Affiché seulement si aucun test n'est en cours */}
      {!testStatus && (
        <>
          <button
            onClick={handleStartTest}
            disabled={isLoading}
            className={`inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${currentLanguage === 'ar' ? 'flex-row-reverse space-x-reverse' : ''
              } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2Icon className="w-5 h-5 animate-spin" />
                <span>{currentLanguage === 'ar' ? 'جار التحميل...' : 'Chargement...'}</span>
              </>
            ) : (
              <>
                <span>{t.startTest}</span>
                <ArrowRightIcon className={`w-5 h-5 ${currentLanguage === 'ar' ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          <p className={`text-sm text-gray-500 mt-6 ${currentLanguage === 'ar' ? 'text-center' : ''}`}>
            {t.freeConfidentialScientific}
          </p>
        </>
      )}

      {/* Modal de confirmation pour redémarrer le test */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl ${currentLanguage === 'ar' ? 'rtl' : 'ltr'}`}>
            <h3 className="text-xl font-bold text-red-600 mb-4">
              {currentLanguage === 'ar' ? 'تأكيد إعادة البدء' : 'Confirmation de redémarrage'}
            </h3>

            <p className="text-gray-700 mb-6">
              {currentLanguage === 'ar'
                ? 'سيؤدي إعادة بدء الاختبار إلى فقدان جميع تقدمك الحالي. هل أنت متأكد أنك تريد البدء من جديد؟'
                : 'Redémarrer le test effacera toute votre progression actuelle. Êtes-vous sûr de vouloir recommencer à zéro ?'}
            </p>

            <div className={`flex justify-end space-x-3 ${currentLanguage === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
              </button>

              <button
                onClick={handleRestartTest}
                className="px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700"
              >
                {currentLanguage === 'ar' ? 'نعم، إعادة البدء' : 'Oui, recommencer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreenQuick;