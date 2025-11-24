import React, { useState, useEffect } from 'react';
import { DownloadIcon, BriefcaseIcon, RefreshCwIcon, UserIcon, BrainIcon, GraduationCapIcon, TrendingUpIcon, ClockIcon, BarChart3Icon, MessageSquareIcon, MapPinIcon, BookOpenIcon, LanguagesIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, CalculatorIcon, Loader2Icon } from 'lucide-react';
import RadarChart from './RadarChart';
import BarChart from './BarChart';
import { useTranslation } from '../utils/translations'; // Ajout de l'import
import PrintableReportQuick from './PrintableReportQuick';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getAuthToken } from '../utils/auth';
import { calculateCompositeRiasec } from '../utils/riasecCompositeCalculator';
import { getRiasecColors, type RiasecType } from '../utils/riasecColors';


interface OrientationReportQuickProps {
  userData: any; // Les données complètes du test (version rapide)
  language: string;
  onRestart: () => void;
}

const riasecCategories = {
  fr: {
    "Réaliste": "Réaliste",
    "Investigateur": "Investigateur",
    "Artistique": "Artistique",
    "Social": "Social",
    "Entreprenant": "Entreprenant",
    "Conventionnel": "Conventionnel"
  },
  ar: {
    "Réaliste": "واقعي",
    "Realiste": "واقعي",
    "Investigateur": "استقصائي",
    "Artistique": "فني",
    "Social": "اجتماعي",
    "Entreprenant": "مبادر",
    "Conventionnel": "تقليدي"
  }
};

const languageSkillLabels = {
  fr: {
    speaking: "Expression orale",
    writing: "Expression écrite",
    reading: "Compréhension écrite",
    listening: "Compréhension orale"
  },
  ar: {
    speaking: "التعبير الشفهي",
    writing: "التعبير الكتابي",
    reading: "الفهم المكتوب",
    listening: "الفهم الشفهي"
  }
};

const languageLevelLabels = {
  fr: {
    A1: "Débutant (A1)",
    A2: "Élémentaire (A2)",
    B1: "Intermédiaire (B1)",
    B2: "Intermédiaire+ (B2)",
    C1: "Avancé (C1)",
    C2: "Maîtrise (C2)"
  },
  ar: {
    A1: "مبتدئ (A1)",
    A2: "أولي (A2)",
    B1: "متوسط (B1)",
    B2: "متوسط+ (B2)",
    C1: "متقدم (C1)",
    C2: "إتقان (C2)"
  }
};

// Ajouter ces nouvelles traductions pour les traits de personnalité
const personalityTraits = {
  fr: {
    "Ouverture": "Ouverture",
    "Organisation": "Organisation",
    "Sociabilité": "Sociabilité",
    "Gestion du stress": "Gestion du stress",
    "Leadership": "Leadership",
    "Autonomie": "Autonomie",
    "Persévérance": "Persévérance",
    "Créativité": "Créativité",
    "Adaptabilité": "Adaptabilité"
  },
  ar: {
    "Ouverture": "الانفتاح",
    "Organisation": "التنظيم",
    "Sociabilité": "الاجتماعية",
    "Gestion du stress": "إدارة التوتر",
    "Leadership": "القيادة",
    "Autonomie": "الاستقلالية",
    "Persévérance": "المثابرة",
    "Créativité": "الإبداع",
    "Adaptabilité": "التكيف"
  }
};


const learningStyles = {
  fr: [
    { value: 'visual', label: 'Visuel', description: 'Schémas, graphiques, images' },
    { value: 'auditif', label: 'Auditif', description: 'Écoute, discussions, explications orales' },
    { value: 'kinesthesique', label: 'Kinesthésique', description: 'Pratique, manipulation, expérimentation' },
    { value: 'lecture', label: 'Lecture-écriture', description: 'Textes, notes, résumés écrits' }
  ],
  ar: [
    { value: 'visual', label: 'بصري', description: 'مخططات، رسوم بيانية، صور' },
    { value: 'auditif', label: 'سمعي', description: 'استماع، نقاشات، شروحات شفهية' },
    { value: 'kinesthesique', label: 'حركي', description: 'ممارسة، تلاعب، تجريب' },
    { value: 'lecture', label: 'قراءة-كتابة', description: 'نصوص، ملاحظات، ملخصات مكتوبة' }
  ]
};

const languages = {
  fr: [
    { code: 'ar', name: 'Arabe', description: 'Arabe littéraire et dialectal' },
    { code: 'fr', name: 'Français', description: 'Français académique et professionnel' },
    { code: 'en', name: 'Anglais', description: 'Anglais international' },
    { code: 'es', name: 'Espagnol', description: 'Espagnol général' },
    { code: 'de', name: 'Allemand', description: 'Allemand standard' },
    { code: 'it', name: 'Italien', description: 'Italien standard' },
    { code: 'zh', name: 'Chinois', description: 'Mandarin standard' },
    { code: 'ja', name: 'Japonais', description: 'Japonais standard' },
    { code: 'pt', name: 'Portugais', description: 'Portugais général' },
    { code: 'ru', name: 'Russe', description: 'Russe standard' }
  ],
  ar: [
    { code: 'ar', name: 'العربية', description: 'العربية الفصحى والدارجة' },
    { code: 'fr', name: 'الفرنسية', description: 'الفرنسية الأكاديمية والمهنية' },
    { code: 'en', name: 'الإنجليزية', description: 'الإنجليزية الدولية' },
    { code: 'es', name: 'الإسبانية', description: 'الإسبانية العامة' },
    { code: 'de', name: 'الألمانية', description: 'الألمانية المعيارية' },
    { code: 'it', name: 'الإيطالية', description: 'الإيطالية المعيارية' },
    { code: 'zh', name: 'الصينية', description: 'الماندرين المعياري' },
    { code: 'ja', name: 'اليابانية', description: 'اليابانية المعيارية' },
    { code: 'pt', name: 'البرتغالية', description: 'البرتغالية العامة' },
    { code: 'ru', name: 'الروسية', description: 'الروسية المعيارية' }
  ]
};

const aptitudeTypes = {
  fr: {
    "logique": "Logique",
    "spatial": "Spatial",
    "numerique": "Numérique",
    "abstrait": "Abstrait",
    "mecanique": "Mécanique",
    "critique": "Pensée critique",
    "culture": "Culture générale",
    "etudes": "Études supérieures"
  },
  ar: {
    "logique": "منطقي",
    "spatial": "مكاني",
    "numerique": "رقمي",
    "abstrait": "مجرد",
    "mecanique": "ميكانيكي",
    "critique": "تفكير نقدي",
    "culture": "ثقافة عامة",
    "etudes": "دراسات عليا"
  }
};

const translations = {
  fr: {
    language: 'Langue',
    personalInfo: "Informations personnelles",
    academicNotes: "Notes académiques",
    testData: "Données du test",
    name: "Nom",
    age: "Âge",
    city: "Ville",
    studyLevel: "Niveau d'étude",
    bac: "Bac",
    specialties: "Spécialités",
    stream: "Filière",
    estimatedNote: "Note estimée",
    estimation: "Estimation",
    regionalExam: "Régional (1ère Bac)",
    continuousControl: "Contrôle Continu",
    nationalExam: "National",
    calculatedNotes: "Notes calculées",
    method1: "25% Régional + 25% CC + 50% National",
    method2: "50% National + 50% Régional",
    method3: "75% National + 25% Régional",
    firstYearAverage: "Moyenne Première",
    finalYearAverage: "Moyenne Terminale",
    bacAverage: "Note générale Baccalauréat",
    estimationWarning: "Notes estimées par l'étudiant, les valeurs réelles peuvent différer.",
    date: "Date",
    totalDuration: "Durée totale",
    version: "Version",
    of: "sur",
    thisTestHas: "Ce test comporte",
    questionsToSolve: "questions à résoudre en",
    minutes: "minutes",
    testSubtitle: "Définissez vos contraintes et priorités pour personnaliser les recommandations",
    geographicMobility: "Mobilité géographique",
    changeCity: "Changer de ville ?",
    studyAbroad: "Étudier à l'étranger ?",
    internationalCareer: "Carrière internationale ?",
    select: "Sélectionner",
    // Mobility options
    stayInCity: "Non, rester dans ma ville",
    stayInRegion: "Oui, dans ma région",
    stayInCountry: "Oui, partout au Maroc",
    onlyMorocco: "Non, uniquement au Maroc",
    onlyFrance: "France uniquement",
    europe: "Europe",
    anywhere: "Partout dans le monde",
    careerMorocco: "Non, carrière au Maroc",
    maybe: "Pourquoi pas",
    yesInternational: "Oui, carrière internationale",
    // Financial constraints
    financialConstraints: "Contraintes financières",
    availableBudget: "Budget annuel disponible",
    scholarshipEligible: "Éligible aux bourses ?",
    familySupport: "Soutien familial",
    budgetLow: "Moins de 20 000 MAD",
    budgetMedium: "20 000 - 50 000 MAD",
    budgetHigh: "50 000 - 100 000 MAD",
    budgetVeryHigh: "Plus de 100 000 MAD",
    yes: "Oui",
    no: "Non",
    unsure: "Pas sûr(e)",
    supportFull: "Soutien financier complet",
    supportPartial: "Soutien partiel",
    supportMoral: "Soutien moral uniquement",
    supportNone: "Autonomie complète",
    // Education preferences
    studyPreferences: "Préférences d'études",
    maxLevel: "Niveau maximum souhaité",
    preferredDuration: "Durée d'études préférée",
    studyMode: "Mode d'études",
    bacPlus2: "Bac+2 (DUT, BTS)",
    bacPlus3: "Bac+3 (Licence)",
    bacPlus5: "Bac+5 (Master, Ingénieur)",
    bacPlus8: "Bac+8+ (Doctorat)",
    durationShort: "Courte (2-3 ans)",
    durationMedium: "Moyenne (4-5 ans)",
    durationLong: "Longue (6+ ans)",
    fulltime: "Temps plein uniquement",
    fullTime: "Temps plein uniquement",
    partTime: "Temps partiel possible",
    alternance: "Alternance préférée",
    distance: "Formation à distance",
    // Career priorities
    careerPriorities: "Priorités de carrière",
    prioritiesInstruction: "Classez l'importance de chaque critère (1 = Moins important, 5 = Très important)",
    highSalary: "Salaire élevé",
    jobStability: "Stabilité de l'emploi",
    careerPassion: "Passion pour le métier",
    socialPrestige: "Prestige social",
    workLifeBalance: "Équilibre vie-travail",
    attractiveRemuneration: "Rémunération attractive",
    professionalSecurity: "Sécurité professionnelle",
    personalFulfillment: "Épanouissement personnel",
    socialRecognition: "Reconnaissance sociale",
    personalTime: "Temps pour la vie personnelle",
    previous: "Précédent",
    continue: "Continuer",
    orientationReport: "Rapport d'Orientation Complet",
    print: "Imprimer",
    newTest: "Nouveau test",
    generatedOn: "Généré le",

    // Sections principales
    executiveSummary: "Résumé Exécutif",
    testAnalytics: "Analytics du Test",
    riasecResults: "Résultats RIASEC",
    personalityResults: "Profil de Personnalité",
    aptitudeResults: "Tests d'Aptitudes",
    interestsResults: "Intérêts Académiques",
    careerResults: "Compatibilité Professionnelle",
    constraintsResults: "Contraintes et Priorités",
    languageResults: "Compétences Linguistiques",
    recommendations: "Recommandations",

    // Analytics
    testDuration: "Durée totale du test",
    totalQuestions: "Questions répondues",
    avgResponseTime: "Temps de réponse moyen",
    completionRate: "Taux de completion",

    // Statuts
    excellent: "Excellent",
    good: "Bon",
    average: "Moyen",
    needsWork: "À améliorer",

    // Profils
    profile: "Profil",
    score: "Score",
    level: "Niveau",
    strength: "Point fort",
    weakness: "Point faible",

    // Recommandations
    recommendedDomains: "Domaines recommandés",
    recommendedCareers: "Métiers suggérés",
    recommendedInstitutions: "Établissements conseillés",
    developmentPlan: "Plan de développement",

    showDetails: "Voir les détails",
    hideDetails: "Masquer les détails",

    // Nouvelles traductions
    questionsAnswers: "Questions & Réponses",
    riasecQuestions: "Questions RIASEC",
    personalityQuestions: "Questions Personnalité",
    aptitudeQuestions: "Questions Aptitudes",
    interestsQuestions: "Questions Intérêts",
    constraintsQuestions: "Questions Contraintes",
    languageQuestions: "Questions Langues",

    question: "Question",
    answer: "Réponse",
    correct: "Correct",
    incorrect: "Incorrect",
    notApplicable: "Non applicable",

    detailedAnalytics: "Analytics Détaillées",
    responsePatterns: "Patterns de Réponse",
    timeAnalysis: "Analyse Temporelle",
    accuracyRate: "Taux de Réussite",
    difficultyLevel: "Niveau de Difficulté",

    testPerformance: "Performance par Test",
    responseDistribution: "Distribution des Réponses",
    timeSpentBySection: "Temps par Section",

    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile",
    careerPreferences: "Préférences de carrière",
    workTypePreferred: "Type de travail préféré",
    independentWork: "Travail indépendant",
    publicService: "Fonction publique",
    privateCompany: "Entreprise privée",
    ngoAssoc: "ONG / Associatif",
    mainPriority: "Priorité principale",
    passion: "Passion pour le métier",
    preferredSector: "Secteur préféré",
    publicOnly: "Secteur public uniquement",
    privateOnly: "Secteur privé uniquement",
    bothSectors: "Les deux secteurs",
    attraction: "Attirance",
    accessibleToYou: "Vous semble accessible ?",
    advice: "Conseil",
    adviceText: "Évaluez au moins 10 métiers pour obtenir des recommandations pertinentes. L'accessibilité correspond à votre perception actuelle de la difficulté d'accès au métier.",
    difficult: "Difficile",
    veryDifficult: "Très difficile",
    variable: "Variable",
    testTitle: "Intérêts académiques",
    interestLevel: "Intérêt (1-5)",
    motivationLevel: "Motivation (1-5)",
    acceptableByEffort: "Acceptable par effort",
    adviceTitle: "Conseil",
    questionInstruction: "Indiquez votre niveau d'accord avec chaque affirmation (1 = Pas du tout d'accord, 5 = Tout à fait d'accord)",
    learningStyleTitle: "Style d'apprentissage préféré",
    learningStyleSubtitle: "Comment apprenez-vous le mieux ?", previousCategory: "Catégorie précédente",
    nextCategory: "Catégorie suivante",
    finishTest: "Terminer le test",
  },
  ar: {
    personalInfo: "معلومات شخصية",
    academicNotes: "النقط الدراسية",
    testData: "بيانات الاختبار",
    name: "الاسم",
    age: "العمر",
    city: "المدينة",
    studyLevel: "المستوى الدراسي",
    bac: "البكالوريا",
    specialties: "التخصصات",
    stream: "المسلك",
    estimatedNote: "النقطة المتوقعة",
    estimation: "تقدير",
    regionalExam: "الجهوي (السنة الأولى باك)",
    continuousControl: "المراقبة المستمرة",
    nationalExam: "الوطني",
    calculatedNotes: "النقط المحسوبة",
    method1: "25% جهوي + 25% مراقبة مستمرة + 50% وطني",
    method2: "50% وطني + 50% جهوي",
    method3: "75% وطني + 25% جهوي",
    firstYearAverage: "معدل السنة الأولى",
    finalYearAverage: "معدل السنة النهائية",
    bacAverage: "المعدل العام للبكالوريا",
    estimationWarning: "نقط مقدرة من طرف الطالب، قد تختلف القيم الحقيقية",
    date: "التاريخ",
    totalDuration: "المدة الإجمالية",
    version: "الإصدار",
    language: "اللغة",
    testTitle: "التوافق مع المهن",
    testSubtitle: "قيم انجذابك للمهن المختلفة",
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
    adviceText: "قيم على الأقل 10 مهن للحصول على توصيات مناسبة. إمكانية الوصول تتوافق مع تصورك الحالي لصعوبة الوصول للمهنة.",
    previous: "السابق",
    continue: "متابعة",
    easy: "سهل",
    medium: "متوسط",
    difficult: "صعب",
    veryDifficult: "صعب جداً",
    variable: "متغير",
    of: "من",
    thisTestHas: "يحتوي هذا الاختبار على",
    questionsToSolve: "أسئلة يجب حلها في",
    minutes: "دقائق",
    geographicMobility: "الحركية الجغرافية",
    changeCity: "تغيير المدينة؟",
    studyAbroad: "الدراسة في الخارج؟",
    internationalCareer: "مهنة دولية؟",
    // Mobility options
    stayInCity: "لا، البقاء في مدينتي",
    stayInRegion: "نعم، في منطقتي",
    stayInCountry: "نعم، في أي مكان في المغرب",
    onlyMorocco: "لا، في المغرب فقط",
    onlyFrance: "فرنسا فقط",
    europe: "أوروبا",
    anywhere: "في أي مكان في العالم",
    careerMorocco: "لا، مهنة في المغرب",
    maybe: "لِمَ لا",
    yesInternational: "نعم، مهنة دولية",
    // Financial constraints
    financialConstraints: "القيود المالية",
    availableBudget: "الميزانية السنوية المتاحة",
    scholarshipEligible: "مؤهل للمنح الدراسية؟",
    familySupport: "الدعم الأسري",
    budgetLow: "أقل من 20,000 درهم",
    budgetMedium: "20,000 - 50,000 درهم",
    budgetHigh: "50,000 - 100,000 درهم",
    budgetVeryHigh: "أكثر من 100,000 درهم",
    unsure: "غير متأكد",
    supportFull: "دعم مالي كامل",
    supportPartial: "دعم جزئي",
    supportMoral: "دعم معنوي فقط",
    supportNone: "استقلالية كاملة",
    // Education preferences
    studyPreferences: "تفضيلات الدراسة",
    maxLevel: "المستوى الأقصى المرغوب",
    preferredDuration: "مدة الدراسة المفضلة",
    studyMode: "نمط الدراسة",
    bacPlus2: "باك+2 (دبلوم تقني)",
    bacPlus3: "باك+3 (إجازة)",
    bacPlus5: "باك+5 (ماستر، مهندس)",
    bacPlus8: "باك+8+ (دكتوراه)",
    durationShort: "قصيرة (2-3 سنوات)",
    durationMedium: "متوسطة (4-5 سنوات)",
    durationLong: "طويلة (6+ سنوات)",
    fulltime: "وقت كامل فقط",
    fullTime: "وقت كامل فقط",
    partTime: "وقت جزئي ممكن",
    alternance: "تناوب مفضل",
    distance: "تكوين عن بُعد",
    // Career priorities
    careerPriorities: "أولويات المهنة",
    prioritiesInstruction: "صنف أهمية كل معيار (1 = أقل أهمية، 5 = مهم جداً)",
    careerPassion: "شغف بالمهنة",
    workLifeBalance: "توازن بين العمل والحياة",
    attractiveRemuneration: "أجر جذاب",
    professionalSecurity: "أمان مهني",
    personalFulfillment: "تحقق شخصي",
    socialRecognition: "اعتراف اجتماعي",
    personalTime: "وقت للحياة الشخصية",
    orientationReport: "تقرير التوجيه الشامل",
    print: "طباعة",
    newTest: "اختبار جديد",
    generatedOn: "أُنشئ في",

    executiveSummary: "الملخص التنفيذي",
    testAnalytics: "تحليلات الاختبار",
    riasecResults: "نتائج RIASEC",
    personalityResults: "الملف الشخصي للشخصية",
    aptitudeResults: "اختبارات القدرات",
    interestsResults: "الاهتمامات الأكاديمية",
    careerResults: "التوافق المهني",
    constraintsResults: "القيود والأولويات",
    languageResults: "المهارات اللغوية",
    recommendations: "التوصيات",

    testDuration: "المدة الإجمالية للاختبار",
    totalQuestions: "الأسئلة المجاب عليها",
    avgResponseTime: "متوسط وقت الاستجابة",
    completionRate: "معدل الإنجاز",

    excellent: "ممتاز",
    good: "جيد",
    average: "متوسط",
    needsWork: "يحتاج تحسين",

    profile: "الملف الشخصي",
    score: "النتيجة",
    level: "المستوى",
    strength: "نقطة قوة",
    weakness: "نقطة ضعف",

    recommendedDomains: "المجالات الموصى بها",
    recommendedCareers: "المهن المقترحة",
    recommendedInstitutions: "المؤسسات المنصوح بها",
    developmentPlan: "خطة التطوير",

    showDetails: "عرض التفاصيل",
    hideDetails: "إخفاء التفاصيل",

    // Nouvelles traductions
    questionsAnswers: "الأسئلة والإجابات",
    riasecQuestions: "أسئلة RIASEC",
    personalityQuestions: "أسئلة الشخصية",
    aptitudeQuestions: "أسئلة القدرات",
    interestsQuestions: "أسئلة الاهتمامات",
    constraintsQuestions: "أسئلة القيود",
    languageQuestions: "أسئلة اللغات",

    question: "السؤال",
    answer: "الإجابة",
    correct: "صحيح",
    incorrect: "خاطئ",
    notApplicable: "غير مطبق",

    detailedAnalytics: "التحليلات المفصلة",
    responsePatterns: "أنماط الاستجابة",
    timeAnalysis: "تحليل الوقت",
    accuracyRate: "معدل النجاح",
    difficultyLevel: "مستوى الصعوبة",

    testPerformance: "الأداء حسب الاختبار",
    responseDistribution: "توزيع الإجابات",
    timeSpentBySection: "الوقت حسب القسم",

    hard: "صعب",
    interestLevel: "الاهتمام (1-5)",
    motivationLevel: "التحفيز (1-5)",
    acceptableByEffort: "مقبول بالجهد",
    adviceTitle: "نصيحة",
    questionInstruction: "حدد مستوى موافقتك مع كل عبارة (1 = لا أوافق إطلاقاً، 5 = أوافق تماماً)",
    learningStyleTitle: "أسلوب التعلم المفضل",
    learningStyleSubtitle: "كيف تتعلم بشكل أفضل؟", previousCategory: "الفئة السابقة",
    nextCategory: "الفئة التالية",
    finishTest: "إنهاء الاختبار",
  }
};

const OrientationReportQuick: React.FC<OrientationReportQuickProps> = ({ userData, language = 'fr', onRestart }) => {
  const constraints = userData.constraints || {};
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReportData, setUserReportData] = useState<any>();
  const [isCompleted, setIsCompleted] = useState(false);

  // Récupérer le token d'authentification
  const token = getAuthToken();
  const isAuthenticated = !!token;
  const t = translations[language as 'fr' | 'ar'] || translations.fr;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Dans la partie des hooks d'état, ajoutez un nouvel état pour gérer les sections de questions/réponses pliables
  const [expandedQASections, setExpandedQASections] = useState<Record<string, boolean>>({
    riasec: false,
    personality: false,
    // aptitude supprimé dans la version rapide
    interests: false,
    careerCompatibility: false,
    constraints: false,
    languageSkills: false
  });

  // Fonction pour basculer l'état d'une section de questions/réponses
  const toggleQASection = (section: string) => {
    setExpandedQASections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  // Remplacer la fonction useEffect pour fetchuserReportData par celle-ci
  useEffect(() => {
    const fetchuserReportData = async () => {
      setIsLoading(true);
      setError(null);

      // Si userData est fourni et contient déjà les données normalisées, les utiliser directement
      if (userData && Object.keys(userData).length > 0) {
        // Vérifier si userData a déjà la structure complète attendue
        if (userData.personalInfo || userData.riasecScores || userData.careerCompatibility) {
          console.log("📊 Utilisation des données fournies en props (déjà normalisées)");
          console.log("Données userData:", userData);
          console.log("🔍 careerCompatibility dans userData:", userData.careerCompatibility);
          console.log("🔍 detailedResponses:", userData.careerCompatibility?.detailedResponses);
          console.log("🔍 careerAttractions:", userData.careerCompatibility?.careerAttractions);
          console.log("🔍 sectorStats:", userData.careerCompatibility?.sectorStats);
          
          // S'assurer que careerCompatibility est normalisé
          const normalizedUserData = {
            ...userData,
            careerCompatibility: (() => {
              // Si déjà normalisé, retourner tel quel
              if (userData.careerCompatibility?.detailedResponses || 
                  userData.careerCompatibility?.careerAttractions || 
                  userData.careerCompatibility?.sectorStats) {
                return userData.careerCompatibility;
              }
              
              // Sinon, normaliser
              let careerData = userData.careerCompatibility || {};
              if (careerData?.careers && typeof careerData.careers === 'object') {
                careerData = careerData.careers;
              }
              
              // Construire detailedResponses
              let detailedResponses: Record<string, any> = {};
              if (careerData?.enrichedCareerData) {
                Object.entries(careerData.enrichedCareerData).forEach(([careerName, data]: [string, any]) => {
                  detailedResponses[careerName] = {
                    careerName: careerName,
                    sector: data.sector,
                    difficultyLevel: data.accessibility || 'Moyenne',
                    attractionLevel: data.attractionLevel,
                    accessibilityPerceived: data.accessibilityPerceived
                  };
                });
              } else if (careerData?.careersEvaluated && Array.isArray(careerData.careersEvaluated)) {
                careerData.careersEvaluated.forEach((career: any) => {
                  detailedResponses[career.name] = {
                    careerName: career.name,
                    sector: career.sector,
                    difficultyLevel: 'Moyenne',
                    attractionLevel: career.attractionLevel,
                    accessibilityPerceived: career.accessibilityPerceived
                  };
                });
              }
              
              // Normaliser careerAttractions
              let normalizedAttractions: Record<string, number> = {};
              if (careerData?.careerAttractions && typeof careerData.careerAttractions === 'object') {
                Object.entries(careerData.careerAttractions).forEach(([careerName, value]: [string, any]) => {
                  if (typeof value === 'number') {
                    normalizedAttractions[careerName] = value;
                  } else if (value && typeof value === 'object' && value.attractionLevel !== undefined) {
                    normalizedAttractions[careerName] = value.attractionLevel;
                  }
                });
              }
              
              if (Object.keys(normalizedAttractions).length === 0 && Object.keys(detailedResponses).length > 0) {
                Object.entries(detailedResponses).forEach(([careerName, details]: [string, any]) => {
                  if (details.attractionLevel !== undefined && details.attractionLevel !== null) {
                    normalizedAttractions[careerName] = details.attractionLevel;
                  }
                });
              }
              
              // Construire sectorStats
              let sectorStats: any[] = [];
              if (careerData?.sectorScores && typeof careerData.sectorScores === 'object') {
                const sectorCounts: Record<string, number> = {};
                if (careerData?.careersEvaluated && Array.isArray(careerData.careersEvaluated)) {
                  careerData.careersEvaluated.forEach((career: any) => {
                    if (career.sector) {
                      sectorCounts[career.sector] = (sectorCounts[career.sector] || 0) + 1;
                    }
                  });
                } else if (careerData?.enrichedCareerData) {
                  Object.values(careerData.enrichedCareerData).forEach((data: any) => {
                    if (data.sector) {
                      sectorCounts[data.sector] = (sectorCounts[data.sector] || 0) + 1;
                    }
                  });
                } else if (Object.keys(detailedResponses).length > 0) {
                  Object.values(detailedResponses).forEach((details: any) => {
                    if (details.sector) {
                      sectorCounts[details.sector] = (sectorCounts[details.sector] || 0) + 1;
                    }
                  });
                }
                
                sectorStats = Object.entries(careerData.sectorScores)
                  .map(([sector, score]: [string, any]) => ({
                    sector,
                    attractionScore: typeof score === 'number' ? score : 0,
                    careersEvaluated: sectorCounts[sector] || 0
                  }))
                  .sort((a, b) => b.attractionScore - a.attractionScore);
              }
              
              // Normaliser preferenceResponses
              let preferenceResponses: Record<string, any> = {};
              if (careerData?.workPreferences) {
                preferenceResponses = {
                  workStyle: careerData.workPreferences.workStyle || '',
                  priority: careerData.workPreferences.priority || '',
                  sector: careerData.workPreferences.sector || ''
                };
              } else if (careerData?.preferenceResponses) {
                preferenceResponses = careerData.preferenceResponses;
              }
              
              return {
                ...careerData,
                careerAttractions: Object.keys(normalizedAttractions).length > 0 ? normalizedAttractions : (careerData.careerAttractions || {}),
                detailedResponses: Object.keys(detailedResponses).length > 0 ? detailedResponses : (careerData.detailedResponses || {}),
                sectorScores: careerData.sectorScores || {},
                sectorStats: sectorStats.length > 0 ? sectorStats : (careerData.sectorStats || []),
                preferenceResponses: Object.keys(preferenceResponses).length > 0 ? preferenceResponses : (careerData.preferenceResponses || {})
              };
            })()
          };
          
          console.log("✅ Données normalisées finales:", normalizedUserData);
          console.log("✅ careerCompatibility normalisé:", normalizedUserData.careerCompatibility);
          console.log("✅ detailedResponses count:", Object.keys(normalizedUserData.careerCompatibility?.detailedResponses || {}).length);
          console.log("✅ careerAttractions count:", Object.keys(normalizedUserData.careerCompatibility?.careerAttractions || {}).length);
          console.log("✅ sectorStats count:", normalizedUserData.careerCompatibility?.sectorStats?.length || 0);
          
          // Calculer le type RIASEC composite si pas déjà calculé
          let compositeRiasec = normalizedUserData.analysis?.compositeRiasec;
          if (!compositeRiasec) {
            console.log("🔄 Calcul du type RIASEC composite...");
            compositeRiasec = calculateCompositeRiasec(normalizedUserData);
            console.log("✅ Type RIASEC composite calculé:", compositeRiasec);
          }
          
          // Ajouter l'analyse avec le type composite
          normalizedUserData.analysis = {
            ...normalizedUserData.analysis,
            compositeRiasec
          };
          
          setUserReportData(normalizedUserData);
          setIsCompleted(true);
          setIsLoading(false);
          return;
        }
      }

      if (!isAuthenticated) {
        setIsLoading(false);
        setError(language === 'ar'
          ? 'يجب تسجيل الدخول لعرض التقرير'
          : 'Vous devez être connecté pour voir le rapport');
        return;
      }

      try {
        console.group('📊 Génération du rapport d\'orientation');
        console.log("Récupération des données complètes pour le rapport depuis l'API");

        const response = await axios.get(`${API_BASE_URL}/orientation-test/my-test`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fonction helper pour extraire les données de compétences linguistiques depuis différentes structures
        const extractLanguageSkillsData = (data: any) => {
            // Structure 1: currentStep.languageSkills.languages (structure imbriquée)
            if (data?.currentStep?.languageSkills?.languages) {
              return data.currentStep.languageSkills.languages;
            }
            // Structure 2: currentStep.languageSkills (données directes)
            if (data?.currentStep?.languageSkills) {
              // Vérifier si c'est directement les données (avec selectedLanguages, languageSkills, etc.)
              if (data.currentStep.languageSkills.selectedLanguages || 
                  data.currentStep.languageSkills.languageSkills ||
                  data.currentStep.languageSkills.certificates ||
                  data.currentStep.languageSkills.preferences) {
                return data.currentStep.languageSkills;
              }
              // Sinon, chercher dans languageSkills.languages
              if (data.currentStep.languageSkills.languages) {
                return data.currentStep.languageSkills.languages;
              }
              return data.currentStep.languageSkills;
            }
            // Structure 3: languageSkills (au niveau racine)
            if (data?.languageSkills) {
              // Vérifier si c'est directement les données (avec selectedLanguages, languageSkills, etc.)
              if (data.languageSkills.selectedLanguages || 
                  data.languageSkills.languageSkills ||
                  data.languageSkills.certificates ||
                  data.languageSkills.preferences) {
                return data.languageSkills;
              }
              // Sinon, chercher dans languageSkills.languages
              if (data.languageSkills.languages) {
                return data.languageSkills.languages;
              }
              return data.languageSkills;
            }
            return {};
        };

        if (response.data.success && response.data.hasTest) {
          console.log("Données de test récupérées avec succès:", response.data);

          // Extraire et restructurer les données du test pour qu'elles correspondent exactement
          // à la structure attendue par le rapport - inspiré de handleViewReport dans WelcomeScreen
          const testData = response.data.data;

          // Structure identique à celle utilisée dans WelcomeScreen.handleViewReport
          const formattedData = {
            // Données de base nécessaires pour le rapport - en accédant correctement aux sous-objets
            personalInfo: testData.currentStep.personalInfo?.personalInfo || testData.currentStep.personalInfo || userData?.personalInfo || {},
            riasecScores: testData.currentStep.riasec?.riasec || testData.currentStep.riasec || userData?.riasecScores || {},
            personalityScores: testData.currentStep.personality?.personality || testData.currentStep.personality || userData?.personalityScores || {},
            // aptitudeScores supprimé dans la version rapide
            academicInterests: testData.currentStep.interests?.interests || testData.currentStep.interests || userData?.academicInterests || {},
            careerCompatibility: (() => {
                // Si userData a des données normalisées, les utiliser en priorité
                if (userData?.careerCompatibility && typeof userData.careerCompatibility === 'object') {
                    // Vérifier si les données sont déjà normalisées (ont detailedResponses, careerAttractions, etc.)
                    if (userData.careerCompatibility.detailedResponses || userData.careerCompatibility.careerAttractions || userData.careerCompatibility.sectorStats) {
                        return userData.careerCompatibility;
                    }
                }
                
                // Sinon, normaliser les données de l'API
                let careerData = testData.currentStep.careerCompatibility?.careers || 
                                testData.currentStep.careerCompatibility || 
                                userData?.careerCompatibility || 
                                {};
                
                // Si careerData a une propriété careers, l'utiliser
                if (careerData?.careers && typeof careerData.careers === 'object') {
                    careerData = careerData.careers;
                }
                
                // Construire detailedResponses
                let detailedResponses: Record<string, any> = {};
                if (careerData?.enrichedCareerData) {
                    Object.entries(careerData.enrichedCareerData).forEach(([careerName, data]: [string, any]) => {
                        detailedResponses[careerName] = {
                            careerName: careerName,
                            sector: data.sector,
                            difficultyLevel: data.accessibility || 'Moyenne',
                            attractionLevel: data.attractionLevel,
                            accessibilityPerceived: data.accessibilityPerceived
                        };
                    });
                } else if (careerData?.careersEvaluated && Array.isArray(careerData.careersEvaluated)) {
                    careerData.careersEvaluated.forEach((career: any) => {
                        detailedResponses[career.name] = {
                            careerName: career.name,
                            sector: career.sector,
                            difficultyLevel: 'Moyenne',
                            attractionLevel: career.attractionLevel,
                            accessibilityPerceived: career.accessibilityPerceived
                        };
                    });
                }
                
                // Normaliser careerAttractions
                let normalizedAttractions: Record<string, number> = {};
                if (careerData?.careerAttractions && typeof careerData.careerAttractions === 'object') {
                    Object.entries(careerData.careerAttractions).forEach(([careerName, value]: [string, any]) => {
                        if (typeof value === 'number') {
                            normalizedAttractions[careerName] = value;
                        } else if (value && typeof value === 'object' && value.attractionLevel !== undefined) {
                            normalizedAttractions[careerName] = value.attractionLevel;
                        }
                    });
                }
                
                // Si careerAttractions est vide mais que detailedResponses existe, construire à partir de detailedResponses
                if (Object.keys(normalizedAttractions).length === 0 && Object.keys(detailedResponses).length > 0) {
                    Object.entries(detailedResponses).forEach(([careerName, details]: [string, any]) => {
                        if (details.attractionLevel !== undefined && details.attractionLevel !== null) {
                            normalizedAttractions[careerName] = details.attractionLevel;
                        }
                    });
                }
                
                // Construire sectorStats
                let sectorStats: any[] = [];
                if (careerData?.sectorScores && typeof careerData.sectorScores === 'object') {
                    const sectorCounts: Record<string, number> = {};
                    if (careerData?.careersEvaluated && Array.isArray(careerData.careersEvaluated)) {
                        careerData.careersEvaluated.forEach((career: any) => {
                            if (career.sector) {
                                sectorCounts[career.sector] = (sectorCounts[career.sector] || 0) + 1;
                            }
                        });
                    } else if (careerData?.enrichedCareerData) {
                        Object.values(careerData.enrichedCareerData).forEach((data: any) => {
                            if (data.sector) {
                                sectorCounts[data.sector] = (sectorCounts[data.sector] || 0) + 1;
                            }
                        });
                    } else if (Object.keys(detailedResponses).length > 0) {
                        Object.values(detailedResponses).forEach((details: any) => {
                            if (details.sector) {
                                sectorCounts[details.sector] = (sectorCounts[details.sector] || 0) + 1;
                            }
                        });
                    }
                    
                    sectorStats = Object.entries(careerData.sectorScores)
                        .map(([sector, score]: [string, any]) => ({
                            sector,
                            attractionScore: typeof score === 'number' ? score : 0,
                            careersEvaluated: sectorCounts[sector] || 0
                        }))
                        .sort((a, b) => b.attractionScore - a.attractionScore);
                }
                
                // Normaliser preferenceResponses
                let preferenceResponses: Record<string, any> = {};
                if (careerData?.workPreferences) {
                    preferenceResponses = {
                        workStyle: careerData.workPreferences.workStyle || '',
                        priority: careerData.workPreferences.priority || '',
                        sector: careerData.workPreferences.sector || ''
                    };
                } else if (careerData?.preferenceResponses) {
                    preferenceResponses = careerData.preferenceResponses;
                }
                
                return {
                    ...careerData,
                    careerAttractions: Object.keys(normalizedAttractions).length > 0 ? normalizedAttractions : (careerData.careerAttractions || {}),
                    detailedResponses: Object.keys(detailedResponses).length > 0 ? detailedResponses : (careerData.detailedResponses || {}),
                    sectorScores: careerData.sectorScores || {},
                    sectorStats: sectorStats.length > 0 ? sectorStats : (careerData.sectorStats || []),
                    preferenceResponses: Object.keys(preferenceResponses).length > 0 ? preferenceResponses : (careerData.preferenceResponses || {})
                };
            })(),
            constraints: testData.currentStep.constraints?.constraints || testData.currentStep.constraints || userData?.constraints || {},
            languageSkills: extractLanguageSkillsData(testData) || extractLanguageSkillsData(userData) || {},

            // Métadonnées du test
            testMetadata: {
              selectedLanguage: testData.metadata?.selectedLanguage || language,
              completedAt: new Date(),
              isCompleted: true,
              totalDuration: testData.totalDuration || 0,
              version: "1.0",
              startedAt: testData.metadata?.startedAt
            },

            // Identifiant de session
            uuid: response.data.uuid
          };

          // Afficher la structure des données pour le débogage
          console.log("Structure des données API:", {
            personalInfo: testData.currentStep.personalInfo,
            riasec: testData.currentStep.riasec,
            personality: testData.currentStep.personality,
            // aptitude supprimé dans la version rapide
            interests: testData.currentStep.interests,
            careerCompatibility: testData.currentStep.careerCompatibility,
            constraints: testData.currentStep.constraints,
            languageSkills: testData.currentStep.languageSkills
          });

          console.log("🔍 Extraction des compétences linguistiques:");
          console.log("  - testData.currentStep.languageSkills:", testData.currentStep.languageSkills);
          console.log("  - userData.languageSkills:", userData?.languageSkills);
          console.log("  - Résultat extractLanguageSkillsData(testData):", extractLanguageSkillsData(testData));
          console.log("  - Résultat extractLanguageSkillsData(userData):", extractLanguageSkillsData(userData));
          console.log("  - languageSkills final:", formattedData.languageSkills);

          console.log("Données formatées pour le rapport:", formattedData);
          console.groupEnd();

          // Calculer le type RIASEC composite
          console.log("🔄 Calcul du type RIASEC composite...");
          const compositeRiasec = calculateCompositeRiasec(formattedData);
          console.log("✅ Type RIASEC composite calculé:", compositeRiasec);
          
          // Ajouter l'analyse avec le type composite
          formattedData.analysis = {
            ...formattedData.analysis,
            compositeRiasec
          };

          // Définir les données structurées pour le rapport
          setUserReportData(formattedData);
        } else {
          // Si l'API ne renvoie pas de données, utiliser les props comme solution de secours
          if (userData && Object.keys(userData).length > 0) {
            console.warn("⚠️ L'API n'a pas retourné de données - Utilisation des données fournies en props comme fallback");
            console.log("🔍 Extraction des données depuis userData (props):", userData);
            
            // Extraire les données depuis userData avec la même fonction helper
            const fallbackData = {
              personalInfo: userData.personalInfo || userData.currentStep?.personalInfo?.personalInfo || userData.currentStep?.personalInfo || {},
              riasecScores: userData.riasecScores || userData.currentStep?.riasec?.riasec || userData.currentStep?.riasec || {},
              personalityScores: userData.personalityScores || userData.currentStep?.personality?.personality || userData.currentStep?.personality || {},
              academicInterests: userData.academicInterests || userData.currentStep?.interests?.interests || userData.currentStep?.interests || {},
              careerCompatibility: (() => {
                // Si userData a des données normalisées, les utiliser
                if (userData?.careerCompatibility && typeof userData.careerCompatibility === 'object') {
                    if (userData.careerCompatibility.detailedResponses || userData.careerCompatibility.careerAttractions || userData.careerCompatibility.sectorStats) {
                        return userData.careerCompatibility;
                    }
                }
                
                // Sinon, normaliser les données
                let careerData = userData.careerCompatibility || userData.currentStep?.careerCompatibility?.careers || userData.currentStep?.careerCompatibility || {};
                
                if (careerData?.careers && typeof careerData.careers === 'object') {
                    careerData = careerData.careers;
                }
                
                // Construire detailedResponses
                let detailedResponses: Record<string, any> = {};
                if (careerData?.enrichedCareerData) {
                    Object.entries(careerData.enrichedCareerData).forEach(([careerName, data]: [string, any]) => {
                        detailedResponses[careerName] = {
                            careerName: careerName,
                            sector: data.sector,
                            difficultyLevel: data.accessibility || 'Moyenne',
                            attractionLevel: data.attractionLevel,
                            accessibilityPerceived: data.accessibilityPerceived
                        };
                    });
                } else if (careerData?.careersEvaluated && Array.isArray(careerData.careersEvaluated)) {
                    careerData.careersEvaluated.forEach((career: any) => {
                        detailedResponses[career.name] = {
                            careerName: career.name,
                            sector: career.sector,
                            difficultyLevel: 'Moyenne',
                            attractionLevel: career.attractionLevel,
                            accessibilityPerceived: career.accessibilityPerceived
                        };
                    });
                }
                
                // Normaliser careerAttractions
                let normalizedAttractions: Record<string, number> = {};
                if (careerData?.careerAttractions && typeof careerData.careerAttractions === 'object') {
                    Object.entries(careerData.careerAttractions).forEach(([careerName, value]: [string, any]) => {
                        if (typeof value === 'number') {
                            normalizedAttractions[careerName] = value;
                        } else if (value && typeof value === 'object' && value.attractionLevel !== undefined) {
                            normalizedAttractions[careerName] = value.attractionLevel;
                        }
                    });
                }
                
                if (Object.keys(normalizedAttractions).length === 0 && Object.keys(detailedResponses).length > 0) {
                    Object.entries(detailedResponses).forEach(([careerName, details]: [string, any]) => {
                        if (details.attractionLevel !== undefined && details.attractionLevel !== null) {
                            normalizedAttractions[careerName] = details.attractionLevel;
                        }
                    });
                }
                
                // Construire sectorStats
                let sectorStats: any[] = [];
                if (careerData?.sectorScores && typeof careerData.sectorScores === 'object') {
                    const sectorCounts: Record<string, number> = {};
                    if (careerData?.careersEvaluated && Array.isArray(careerData.careersEvaluated)) {
                        careerData.careersEvaluated.forEach((career: any) => {
                            if (career.sector) {
                                sectorCounts[career.sector] = (sectorCounts[career.sector] || 0) + 1;
                            }
                        });
                    } else if (careerData?.enrichedCareerData) {
                        Object.values(careerData.enrichedCareerData).forEach((data: any) => {
                            if (data.sector) {
                                sectorCounts[data.sector] = (sectorCounts[data.sector] || 0) + 1;
                            }
                        });
                    } else if (Object.keys(detailedResponses).length > 0) {
                        Object.values(detailedResponses).forEach((details: any) => {
                            if (details.sector) {
                                sectorCounts[details.sector] = (sectorCounts[details.sector] || 0) + 1;
                            }
                        });
                    }
                    
                    sectorStats = Object.entries(careerData.sectorScores)
                        .map(([sector, score]: [string, any]) => ({
                            sector,
                            attractionScore: typeof score === 'number' ? score : 0,
                            careersEvaluated: sectorCounts[sector] || 0
                        }))
                        .sort((a, b) => b.attractionScore - a.attractionScore);
                }
                
                // Normaliser preferenceResponses
                let preferenceResponses: Record<string, any> = {};
                if (careerData?.workPreferences) {
                    preferenceResponses = {
                        workStyle: careerData.workPreferences.workStyle || '',
                        priority: careerData.workPreferences.priority || '',
                        sector: careerData.workPreferences.sector || ''
                    };
                } else if (careerData?.preferenceResponses) {
                    preferenceResponses = careerData.preferenceResponses;
                }
                
                return {
                    ...careerData,
                    careerAttractions: Object.keys(normalizedAttractions).length > 0 ? normalizedAttractions : (careerData.careerAttractions || {}),
                    detailedResponses: Object.keys(detailedResponses).length > 0 ? detailedResponses : (careerData.detailedResponses || {}),
                    sectorScores: careerData.sectorScores || {},
                    sectorStats: sectorStats.length > 0 ? sectorStats : (careerData.sectorStats || []),
                    preferenceResponses: Object.keys(preferenceResponses).length > 0 ? preferenceResponses : (careerData.preferenceResponses || {})
                };
              })(),
              constraints: userData.constraints || userData.currentStep?.constraints?.constraints || userData.currentStep?.constraints || {},
              languageSkills: extractLanguageSkillsData(userData) || {},
              testMetadata: userData.testMetadata || {
                selectedLanguage: language,
                completedAt: new Date(),
                isCompleted: true,
                version: "1.0"
              },
              uuid: userData.uuid
            };
            
            console.log("✅ Données fallback formatées:", fallbackData);
            setUserReportData(fallbackData);
          } else {
            setError(response.data.message || (language === 'ar'
              ? 'لم يتم العثور على بيانات الاختبار'
              : 'Aucune donnée de test trouvée'));
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données du rapport:", err);

        // En cas d'erreur, utiliser les props comme dernier recours
        if (userData && Object.keys(userData).length > 0) {
          console.warn("⚠️ Erreur API - Utilisation des données des props comme fallback");
          console.log("🔍 Extraction des données depuis userData (props) après erreur:", userData);
          
          // Extraire les données depuis userData avec la même fonction helper
          const fallbackData = {
            personalInfo: userData.personalInfo || userData.currentStep?.personalInfo?.personalInfo || userData.currentStep?.personalInfo || {},
            riasecScores: userData.riasecScores || userData.currentStep?.riasec?.riasec || userData.currentStep?.riasec || {},
            personalityScores: userData.personalityScores || userData.currentStep?.personality?.personality || userData.currentStep?.personality || {},
            academicInterests: userData.academicInterests || userData.currentStep?.interests?.interests || userData.currentStep?.interests || {},
            careerCompatibility: userData.careerCompatibility || userData.currentStep?.careerCompatibility?.careers || userData.currentStep?.careerCompatibility || {},
            constraints: userData.constraints || userData.currentStep?.constraints?.constraints || userData.currentStep?.constraints || {},
            languageSkills: extractLanguageSkillsData(userData) || {},
            testMetadata: userData.testMetadata || {
              selectedLanguage: language,
              completedAt: new Date(),
              isCompleted: true,
              version: "1.0"
            },
            uuid: userData.uuid
          };
          
          console.log("✅ Données fallback formatées après erreur:", fallbackData);
          setUserReportData(fallbackData);
        } else {
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
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchuserReportData();
  }, [isAuthenticated, token, language, userData]); // Inclure userData pour utiliser les données normalisées
  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}min ${seconds}s`;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString(
      language === 'ar' ? 'ar-MA' : 'fr-FR',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    );
  };

  const generateExecutiveSummary = () => {
    // Utiliser le type RIASEC composite (cohérent avec l'admin)
    let dominantRiasecName = 'Non déterminé';
    if (userReportData?.analysis?.compositeRiasec?.dominantType) {
      const dominantType = userReportData.analysis.compositeRiasec.dominantType as RiasecType;
      const colors = getRiasecColors(dominantType);
      dominantRiasecName = colors.name[language as 'fr' | 'ar'] || colors.name.fr;
    } else if (userReportData?.riasecScores?.dominantProfile) {
      // Fallback vers dominantProfile si compositeRiasec n'est pas disponible
      const riasec = Array.isArray(userReportData.riasecScores.dominantProfile) 
        ? userReportData.riasecScores.dominantProfile 
        : [userReportData.riasecScores.dominantProfile];
      dominantRiasecName = riasec.join('-');
    }
    
    const personality = userReportData.personalityScores?.dominantTraits || [];
    const topInterests = userReportData.academicInterests?.categoryStats || [];

    if (language === 'ar') {
      return `لديك ملف شخصي ${dominantRiasecName} مع سمات شخصية قوية في ${personality.slice(0, 2).join(' و ')}. اهتماماتك الأكاديمية تركز على المجالات عالية الدرجات، مع توجه نحو التخصصات التي تتطلب ${userReportData.constraints?.educationProfile?.ambitionLevel || 'مستوى عالي'} من الدراسة.`;
    }

    return `Vous présentez un profil ${dominantRiasecName} avec des traits de personnalité dominants en ${personality.slice(0, 2).join(' et ')}. Vos intérêts académiques se concentrent sur les domaines à forte compatibilité, avec une orientation vers des études de niveau ${userReportData.constraints?.educationProfile?.ambitionLevel || 'élevé'}.`;
  };

  // Fonction pour marquer le test comme complété
  const markTestAsCompleted = async () => {
    if (!isAuthenticated || !userReportData || !userReportData.uuid || isCompleted) {
      return;
    }

    try {
      console.log("Marquage du test comme complété...");
      const response = await axios.post(
        `${API_BASE_URL}/orientation-test/completed`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log("Test marqué comme complété avec succès:", response.data);
        setIsCompleted(true);
      } else {
        console.error("Erreur lors du marquage du test comme complété:", response.data.message);
      }
    } catch (err) {
      console.error("Erreur lors de la requête pour marquer le test comme complété:", err);
    }
  };

  // Déclencher la fonction de completed dès que le composant est monté
  useEffect(() => {
    markTestAsCompleted();
  }, [isAuthenticated, userReportData?.uuid]); // Se déclenche uniquement si le token ou l'UUID change

  const getRecommendations = () => {
    // Recommandations basées sur les résultats
    const recommendations = {
      domains: [
        {
          name: language === 'ar' ? 'الطب وعلوم الصحة' : 'Médecine et Sciences de la Santé',
          compatibility: 92,
          reason: language === 'ar' ? 'ملف اجتماعي قوي واهتمام بالصحة' : 'Profil social fort et intérêt pour la santé'
        },
        {
          name: language === 'ar' ? 'الهندسة والتكنولوجيا' : 'Ingénierie et Technologies',
          compatibility: 85,
          reason: language === 'ar' ? 'قدرات تحليلية واهتمام بالعلوم' : 'Capacités analytiques et intérêt scientifique'
        },
        {
          name: language === 'ar' ? 'إدارة الأعمال' : 'Management et Gestion',
          compatibility: 78,
          reason: language === 'ar' ? 'مهارات قيادية واهتمام تجاري' : 'Compétences entrepreneuriales et intérêt commercial'
        }
      ],
      careers: [
        language === 'ar' ? 'طبيب عام' : 'Médecin généraliste',
        language === 'ar' ? 'مهندس معلوماتي' : 'Ingénieur informatique',
        language === 'ar' ? 'مستشار التوجيه' : 'Conseiller d\'orientation',
        language === 'ar' ? 'مدير مشاريع' : 'Chef de projet',
        language === 'ar' ? 'باحث علمي' : 'Chercheur scientifique'
      ],
      institutions: [
        {
          name: language === 'ar' ? 'جامعة محمد الخامس - الرباط' : 'Université Mohammed V - Rabat',
          type: language === 'ar' ? 'عمومي' : 'Public',
          compatibility: 90
        },
        {
          name: language === 'ar' ? 'المدرسة الوطنية العليا للمعلوماتية' : 'ENSIAS',
          type: language === 'ar' ? 'عمومي' : 'Public',
          compatibility: 88
        },
        {
          name: language === 'ar' ? 'جامعة باريس ساكلاي' : 'Université Paris-Saclay',
          type: language === 'ar' ? 'دولي' : 'International',
          compatibility: 85
        }
      ]
    };

    return recommendations;
  };

  // Puis dans la fonction printReport :
  const printReport = () => {
    // Créer un élément iframe caché pour l'impression
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';

    document.body.appendChild(printFrame);

    // Rendu du composant PrintableReport dans l'iframe
    const printableContent = ReactDOMServer.renderToString(
      <PrintableReportQuick userData={userReportData} language={language} />
    );

    printFrame.contentDocument?.open();
    printFrame.contentDocument?.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rapport d'Orientation - ${userReportData.personalInfo?.firstName} ${userReportData.personalInfo?.lastName}</title>
        <meta charset="utf-8">
      </head>
      <body>
        ${printableContent}
      </body>
    </html>
  `);
    printFrame.contentDocument?.close();

    // Imprimer après le chargement
    printFrame.onload = () => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();

      // Supprimer l'iframe après l'impression
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    };
  };

  const recommendations = getRecommendations();

  const getTestQuestions = (testType: string) => {
    // Simulation de données de questions/réponses
    const mockQuestions = {
      riasec: [
        { id: 1, question: "Préférez-vous travailler avec vos mains?", userAnswer: "Tout à fait d'accord", correctAnswer: null, category: "Réaliste" },
        { id: 2, question: "Aimez-vous résoudre des problèmes complexes?", userAnswer: "D'accord", correctAnswer: null, category: "Investigateur" },
        { id: 3, question: "Préférez-vous créer de nouvelles choses?", userAnswer: "Neutre", correctAnswer: null, category: "Artistique" },
        { id: 4, question: "Aimez-vous aider les autres?", userAnswer: "Tout à fait d'accord", correctAnswer: null, category: "Social" },
        { id: 5, question: "Êtes-vous à l'aise en position de leader?", userAnswer: "D'accord", correctAnswer: null, category: "Entreprenant" }
      ],
      personality: [
        { id: 1, question: "Vous êtes plutôt extraverti(e)", userAnswer: "D'accord", correctAnswer: null, category: "Extraversion" },
        { id: 2, question: "Vous préférez la routine", userAnswer: "Pas d'accord", correctAnswer: null, category: "Ouverture" },
        { id: 3, question: "Vous êtes organisé(e)", userAnswer: "Tout à fait d'accord", correctAnswer: null, category: "Conscienciosité" },
        { id: 4, question: "Vous gérez bien le stress", userAnswer: "D'accord", correctAnswer: null, category: "Stabilité émotionnelle" }
      ],
      // aptitude supprimé dans la version rapide
    };

    return mockQuestions[testType as keyof typeof mockQuestions] || [];
  };

  const getTestAnalytics = (testType: string) => {
    // Simulation d'analytics détaillées par test
    const mockAnalytics = {
      riasec: {
        totalQuestions: 60,
        completedQuestions: 60,
        averageTime: 45000,
        timeByCategory: {
          "Réaliste": 8200,
          "Investigateur": 9800,
          "Artistique": 7500,
          "Social": 6900,
          "Entreprenant": 8100,
          "Conventionnel": 7300
        },
        responseDistribution: {
          "Tout à fait d'accord": 18,
          "D'accord": 22,
          "Neutre": 8,
          "Pas d'accord": 9,
          "Pas du tout d'accord": 3
        }
      },
      personality: {
        totalQuestions: 45,
        completedQuestions: 45,
        averageTime: 38000,
        timeByCategory: {
          "Extraversion": 7200,
          "Agréabilité": 6800,
          "Conscienciosité": 8100,
          "Stabilité émotionnelle": 7900,
          "Ouverture": 8000
        },
        responseDistribution: {
          "Tout à fait d'accord": 12,
          "D'accord": 18,
          "Neutre": 6,
          "Pas d'accord": 7,
          "Pas du tout d'accord": 2
        }
      },
      aptitude: {
        totalQuestions: 30,
        completedQuestions: 30,
        averageTime: 120000,
        accuracyRate: 78,
        timeByCategory: {
          "Numérique": 35000,
          "Verbal": 28000,
          "Logique": 42000,
          "Spatial": 38000
        },
        difficultyDistribution: {
          "Facile": 12,
          "Moyen": 14,
          "Difficile": 4
        }
      }
    };

    return mockAnalytics[testType as keyof typeof mockAnalytics] || {};
  };

  // Helpers pour afficher les questions/réponses et analytics
  const renderQuestions = (questions: any[], type: string) => (
    <div className="space-y-2">
      {questions.map((q, idx) => (
        <div key={q.questionId || idx} className="bg-gray-50 rounded p-3">
          <div className="font-semibold">{q.questionText}</div>
          <div className="text-sm">
            <span className="font-medium">{t.answer}:</span> {q.selectedOption || q.userAnswer}
            {q.correctOption && (
              <span className="ml-2 text-green-600">({t.correct}: {q.correctOption})</span>
            )}
            {q.responseTime && (
              <span className="ml-2 text-gray-500">⏱ {formatDuration(q.responseTime)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const getDynamicRecommendations = (userReportData: any, t: any) => {
    const recs: string[] = [];
    // RIASEC - Utiliser le type composite
    const dominantType = userReportData?.analysis?.compositeRiasec?.dominantType;
    if (dominantType === 'S' || userReportData.riasecScores?.dominantProfile?.includes('Social')) {
      recs.push("Vous excellez dans les métiers d'accompagnement, d'enseignement ou de santé.");
    }
    if (dominantType === 'I' || userReportData.riasecScores?.dominantProfile?.includes('Investigateur')) {
      recs.push("Les domaines scientifiques et d'ingénierie vous correspondent.");
    }
    // Personality
    if (userReportData.personalityScores?.dominantTraits?.includes('Organisation')) {
      recs.push("Vous êtes fait pour des postes de gestion, organisation ou management.");
    }
    if (userReportData.personalityScores?.dominantTraits?.includes('Ouverture')) {
      recs.push("Explorez des carrières créatives ou internationales.");
    }
    // Aptitudes supprimées dans la version rapide
    // Academic Interests
    if (userReportData.academicInterests?.categoryScores?.["Commerce et gestion"]?.interest > 80) {
      recs.push("Envisagez des études en commerce, gestion ou marketing.");
    }
    // Career
    if (userReportData.careerCompatibility?.sectorScores?.["Technologie"] > 70) {
      recs.push("Les métiers du numérique et de l'ingénierie sont adaptés à votre profil.");
    }
    // Constraints
    if (userReportData.constraints?.mobility?.international === "maybe") {
      recs.push("Explorez les opportunités d'études à l'étranger.");
    }
    // Langues
    if ((userReportData.languageSkills?.languageProfile?.multilingualIndex || 0) > 50) {
      recs.push("Votre profil multilingue est un atout pour les carrières internationales.");
    }
    return recs;
  };


  // Si le chargement est en cours, afficher un indicateur
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 space-y-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Loader2Icon className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-600">
          {language === 'ar'
            ? 'جاري تحميل تقرير التوجيه...'
            : 'Chargement du rapport d\'orientation...'}
        </p>
      </div>
    );
  }

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-4">
            {language === 'ar' ? 'خطأ في تحميل التقرير' : 'Erreur de chargement du rapport'}
          </h2>
          <p className="font-medium mb-6">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={onRestart}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
            >
              {language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Retour à l\'accueil'}
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (

    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 print:bg-white ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 sm:py-8 print:bg-blue-600 print:py-6">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
            <div className={language === 'ar' ? 'text-right w-full sm:w-auto' : 'w-full sm:w-auto'}>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 print:text-2xl">{t.orientationReport}</h1>
              <p className="text-blue-100 print:text-blue-200 text-xs sm:text-sm">
                {userReportData.personalInfo?.firstName} {userReportData.personalInfo?.lastName} • {t.generatedOn} {formatDate()}
              </p>
            </div>
            <div className={`flex space-x-2 sm:space-x-3 print:hidden mt-2 sm:mt-0 ${language === 'ar' ? 'flex-row-reverse space-x-reverse self-end sm:self-auto' : ''}`}>
              <button
                onClick={printReport}
                className={`flex items-center space-x-1 sm:space-x-2 bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-white/30 transition-all ${language === 'ar' ? 'flex-row-reverse space-x-reverse' : ''} text-xs sm:text-sm`}
              >
                <DownloadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{t.print}</span>
              </button>
              <button
                onClick={onRestart}
                className={`flex items-center space-x-1 sm:space-x-2 bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-white/30 transition-all ${language === 'ar' ? 'flex-row-reverse space-x-reverse' : ''} text-xs sm:text-sm`}
              >
                <RefreshCwIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{t.newTest}</span>
              </button>
            </div>
          </div>
        </div>
      </div>


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

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 print:px-0 print:py-4">
        {/* 1. Infos générales du test et personnelles */}
        <section className="bg-gradient-to-br from-blue-100 to-indigo-50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
          <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <UserIcon className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7 text-blue-600" />
            {t.orientationReport}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-8">
            <div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 flex flex-col gap-2">
              <h3 className={`font-semibold text-blue-700 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <UserIcon className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
                {t.personalInfo}
              </h3>
              <ul className="text-xs sm:text-sm md:text-base space-y-1 sm:space-y-2">
                <li className={`flex ${language === 'ar' ? 'flex-row-reverse justify-start' : ''}`}>
                  <span className={`font-medium text-gray-700 ${language === 'ar' ? 'ml-1' : 'mr-1'}`}>
                    {language === 'ar' ? `${t.name}` : `${t.name} :`}
                  </span>
                  <span className="font-bold">
                    {language === 'ar' ? `: ${userReportData.personalInfo?.firstName} ${userReportData.personalInfo?.lastName}` : `${userReportData.personalInfo?.firstName} ${userReportData.personalInfo?.lastName}`}
                  </span>
                </li>
                <li className={`flex ${language === 'ar' ? 'flex-row-reverse justify-start' : ''}`}>
                  <span className={`font-medium text-gray-700 ${language === 'ar' ? 'ml-1' : 'mr-1'}`}>
                    {language === 'ar' ? `${t.age}` : `${t.age} :`}
                  </span>
                  <span className="font-bold">
                    {language === 'ar' ? `: ${userReportData.personalInfo?.age}` : userReportData.personalInfo?.age}
                  </span>
                </li>
                <li className={`flex ${language === 'ar' ? 'flex-row-reverse justify-start' : ''}`}>
                  <span className={`font-medium text-gray-700 ${language === 'ar' ? 'ml-1' : 'mr-1'}`}>
                    {language === 'ar' ? `${t.city}` : `${t.city} :`}
                  </span>
                  <span className="font-bold">
                    {language === 'ar' ? `: ${userReportData.personalInfo?.city}` : userReportData.personalInfo?.city}
                  </span>
                </li>
                <li className={`flex ${language === 'ar' ? 'flex-row-reverse justify-start' : ''}`}>
                  <span className={`font-medium text-gray-700 ${language === 'ar' ? 'ml-1' : 'mr-1'}`}>
                    {language === 'ar' ? `${t.studyLevel}` : `${t.studyLevel} :`}
                  </span>
                  <span className="font-bold">
                    {language === 'ar' ? `: ${userReportData.personalInfo?.studyLevel}` : userReportData.personalInfo?.studyLevel}
                  </span>
                </li>

                <li className={`flex ${language === 'ar' ? 'flex-row-reverse justify-start' : ''}`}>
                  <span className={`font-medium text-gray-700 ${language === 'ar' ? 'ml-1' : 'mr-1'}`}>
                    {language === 'ar' ? `${t.bac}` : `${t.bac} :`}
                  </span>
                  <span className="font-bold">
                    {(() => {
                      if (userReportData.personalInfo?.bacType === "mission") {
                        return language === 'ar' ? ": Mission Française" : "Mission Française";
                      } else if (userReportData.personalInfo?.bacType === "marocain") {
                        return language === 'ar' ? ": بكالوريا مغربية" : "Bac Marocain";
                      } else {
                        // Fallback pour d'autres types
                        return language === 'ar'
                          ? `: ${userReportData.personalInfo?.bacType}`
                          : userReportData.personalInfo?.bacType;
                      }
                    })()}
                  </span>
                </li>
                {userReportData.personalInfo?.bacType === "mission" && (
                  <li className={`flex ${language === 'ar' ? 'flex-row-reverse justify-start' : ''}`}>
                    <span className={`font-medium text-gray-700 ${language === 'ar' ? 'ml-1' : 'mr-1'}`}>
                      {language === 'ar' ? `${t.specialties}` : `${t.specialties} :`}
                    </span>
                    <span className="font-bold">
                      {language === 'ar' ? ": " : ""}
                      {userReportData.personalInfo?.bacSpecialites?.map((spe: string) => {
                        if (spe === "math") return language === 'ar' ? "الرياضيات" : "Mathématiques";
                        if (spe === "pc") return language === 'ar' ? "الفيزياء والكيمياء" : "Physique-Chimie";
                        if (spe === "svt") return language === 'ar' ? "علوم الحياة والأرض" : "SVT";
                        if (spe === "nsi") return language === 'ar' ? "العلوم الرقمية وعلوم الكمبيوتر" : "Numérique et Sciences Informatiques";
                        if (spe === "ses") return language === 'ar' ? "العلوم الاقتصادية والاجتماعية" : "Sciences Économiques et Sociales";
                        if (spe === "hggsp") return language === 'ar' ? "التاريخ والجغرافيا والجيوسياسية والعلوم السياسية" : "Histoire-Géo, Géopolitique et Sciences Politiques";
                        if (spe === "hlp") return language === 'ar' ? "الإنسانيات والأدب والفلسفة" : "Humanités, Littérature et Philosophie";
                        if (spe === "llce") return language === 'ar' ? "اللغات والآداب والثقافات الأجنبية" : "Langues, Littératures et Cultures Étrangères";
                        if (spe === "arts") return language === 'ar' ? "الفنون" : "Arts";
                        if (spe === "technologique") return language === 'ar' ? "التكنولوجيا" : "Technologique";
                        return spe;
                      }).join(", ")}
                    </span>
                  </li>
                )}
                {userReportData.personalInfo?.bacType === "marocain" && (
                  <li className={`flex ${language === 'ar' ? 'flex-row-reverse justify-start' : ''}`}>
                    <span className={`font-medium text-gray-700 ${language === 'ar' ? 'ml-1' : 'mr-1'}`}>
                      {language === 'ar' ? `${t.stream}` : `${t.stream} :`}
                    </span>
                    <span className="font-bold">
                      {language === 'ar' ? `: ${userReportData.personalInfo?.bacFiliere}` : userReportData.personalInfo?.bacFiliere}
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Notes académiques */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 flex flex-col gap-2">
              <h3 className={`font-semibold text-emerald-700 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <CalculatorIcon className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" />
                {t.academicNotes}
                {userReportData.personalInfo?.noteAvailability === "estimation" && (
                  <span className="text-xs font-normal px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">{t.estimation}</span>
                )}
              </h3>

              {userReportData.personalInfo?.bacType === "marocain" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-xs text-gray-500 block">{t.regionalExam}</span>
                      <p className={`font-bold text-gray-900 ${language === 'ar' ? 'text-right' : ''}`}>
                        {userReportData.personalInfo?.noteAvailability === "estimation"
                          ? userReportData.personalInfo?.noteGenerale1ereBacEstimation
                          : userReportData.personalInfo?.noteGenerale1ereBac}/20
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-xs text-gray-500 block">{t.continuousControl}</span>
                      <p className={`font-bold text-gray-900 ${language === 'ar' ? 'text-right' : ''}`}>
                        {userReportData.personalInfo?.noteAvailability === "estimation"
                          ? userReportData.personalInfo?.noteControleConinuEstimation
                          : userReportData.personalInfo?.noteControleContinu}/20
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-xs text-gray-500 block">{t.nationalExam}</span>
                      <p className={`font-bold text-gray-900 ${language === 'ar' ? 'text-right' : ''}`}>
                        {userReportData.personalInfo?.noteAvailability === "estimation"
                          ? userReportData.personalInfo?.noteNationalEstimation
                          : userReportData.personalInfo?.noteNational}/20
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    <span className={`text-xs text-gray-500 font-medium block ${language === 'ar' ? 'text-right' : ''}`}>{t.calculatedNotes}:</span>
                    <div className="space-y-2 mt-2">
                      <div className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded p-2 flex ${language === 'ar' ? 'flex-row-reverse' : ''} justify-between items-center`}>
                        <div className={language === 'ar' ? 'text-right' : ''}>
                          <span className="text-xs text-emerald-700 font-medium block">{t.method1}</span>
                          <p className="text-xs text-gray-500">{language === 'ar' ? "الطريقة 1" : "Méthode 1"}</p>
                        </div>
                        <span className="font-bold text-emerald-700">
                          {userReportData.personalInfo?.noteAvailability === "estimation"
                            ? userReportData.personalInfo?.noteCalculeeMethod1Estimation
                            : userReportData.personalInfo?.noteCalculeeMethod1}/20
                        </span>
                      </div>

                      <div className={`bg-gradient-to-r from-blue-50 to-cyan-50 rounded p-2 flex ${language === 'ar' ? 'flex-row-reverse' : ''} justify-between items-center`}>
                        <div className={language === 'ar' ? 'text-right' : ''}>
                          <span className="text-xs text-blue-700 font-medium block">{t.method2}</span>
                          <p className="text-xs text-gray-500">{language === 'ar' ? "الطريقة 2" : "Méthode 2"}</p>
                        </div>
                        <span className="font-bold text-blue-700">
                          {userReportData.personalInfo?.noteAvailability === "estimation"
                            ? userReportData.personalInfo?.noteCalculeeMethod2Estimation
                            : userReportData.personalInfo?.noteCalculeeMethod2}/20
                        </span>
                      </div>

                      <div className={`bg-gradient-to-r from-purple-50 to-indigo-50 rounded p-2 flex ${language === 'ar' ? 'flex-row-reverse' : ''} justify-between items-center`}>
                        <div className={language === 'ar' ? 'text-right' : ''}>
                          <span className="text-xs text-indigo-700 font-medium block">{t.method3}</span>
                          <p className="text-xs text-gray-500">{language === 'ar' ? "الطريقة 3" : "Méthode 3"}</p>
                        </div>
                        <span className="font-bold text-indigo-700">
                          {userReportData.personalInfo?.noteAvailability === "estimation"
                            ? userReportData.personalInfo?.noteCalculeeMethod3Estimation
                            : userReportData.personalInfo?.noteCalculeeMethod3}/20
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {userReportData.personalInfo?.bacType === "mission" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {(userReportData.personalInfo?.noteGeneralePremiere || userReportData.personalInfo?.noteGeneralePremiereEstimation) && (
                      <div className="bg-gray-50 rounded p-2">
                        <span className="text-xs text-gray-500 block">{t.firstYearAverage}</span>
                        <p className={`font-bold text-gray-900 ${language === 'ar' ? 'text-right' : ''}`}>
                          {userReportData.personalInfo?.noteAvailability === "estimation"
                            ? userReportData.personalInfo?.noteGeneralePremiereEstimation
                            : userReportData.personalInfo?.noteGeneralePremiere}/20
                        </p>
                      </div>
                    )}

                    {(userReportData.personalInfo?.noteGeneraleTerminale || userReportData.personalInfo?.noteGeneraleTerminaleEstimation) && (
                      <div className="bg-gray-50 rounded p-2">
                        <span className="text-xs text-gray-500 block">{t.finalYearAverage}</span>
                        <p className={`font-bold text-gray-900 ${language === 'ar' ? 'text-right' : ''}`}>
                          {userReportData.personalInfo?.noteAvailability === "estimation"
                            ? userReportData.personalInfo?.noteGeneraleTerminaleEstimation
                            : userReportData.personalInfo?.noteGeneraleTerminale}/20
                        </p>
                      </div>
                    )}
                  </div>

                  {(userReportData.personalInfo?.noteGeneraleBac || userReportData.personalInfo?.noteGeneraleBacEstimation) && (
                    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded p-2 flex ${language === 'ar' ? 'flex-row-reverse' : ''} justify-between items-center`}>
                      <div className={language === 'ar' ? 'text-right' : ''}>
                        <span className="text-xs text-indigo-700 font-medium block">{t.bacAverage}</span>
                        {userReportData.personalInfo?.noteAvailability === "estimation" && (
                          <p className="text-xs text-gray-500">({t.estimation})</p>
                        )}
                      </div>
                      <span className="font-bold text-indigo-700">
                        {userReportData.personalInfo?.noteAvailability === "estimation"
                          ? userReportData.personalInfo?.noteGeneraleBacEstimation
                          : userReportData.personalInfo?.noteGeneraleBac}/20
                      </span>
                    </div>
                  )}
                </div>
              )}

              {userReportData.personalInfo?.noteAvailability === "estimation" && (
                <div className={`mt-2 bg-orange-50 p-2 rounded text-xs text-orange-600 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <AlertCircleIcon className="w-3 h-3" />
                  <span>{t.estimationWarning}</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 flex flex-col gap-2">
              <h3 className={`font-semibold text-indigo-700 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <ClockIcon className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-400" />
                {t.testData}
              </h3>
              <ul className="text-xs sm:text-sm md:text-base space-y-1 sm:space-y-2">
                <li className={`flex ${language === 'ar' ? 'flex-row-reverse justify-start' : ''}`}>
                  <span className={`font-medium text-gray-700 ${language === 'ar' ? 'ml-1' : 'mr-1'}`}>{t.language} : </span>
                  <span className="font-bold">
                    {
                      (() => {
                        const langCode = userReportData.testMetadata?.selectedLanguage;
                        const langObj = languages[language as 'fr' | 'ar'].find(l => l.code === langCode);
                        return langObj ? langObj.name : langCode;
                      })()
                    }
                  </span>
                </li>
                <li className={`flex ${language === 'ar' ? 'flex-row-reverse justify-start' : ''}`}>
                  <span className={`font-medium text-gray-700 ${language === 'ar' ? 'ml-1' : 'mr-1'}`}>{t.date} :</span>
                  <span className="font-bold">{formatDate()}</span>
                </li>
                <li className={`flex ${language === 'ar' ? 'flex-row-reverse justify-start' : ''}`}>
                  <span className={`font-medium text-gray-700 ${language === 'ar' ? 'ml-1' : 'mr-1'}`}>{t.version} :</span>
                  <span className="font-bold">{userReportData.testMetadata?.version}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        {/* 2. Pour chaque test, questions/réponses, durée, analytics, résultat */}

        {/* RIASEC */}
        <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
          <div className={`flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <BrainIcon className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold">{t.riasecResults}</h2>
          </div>

          {/* Bouton pour afficher/masquer les questions/réponses */}
          <button
            onClick={() => toggleQASection('riasec')}
            className={`flex items-center gap-2 w-full justify-between px-3 py-2 bg-purple-50 rounded-lg text-sm font-medium text-purple-700 mb-3 hover:bg-purple-100 transition-colors ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <span>{t.questionsAnswers}</span>
            {expandedQASections.riasec
              ? <ChevronUpIcon className="w-5 h-5" />
              : <ChevronDownIcon className="w-5 h-5" />
            }
          </button>

          {/* Contenu des questions/réponses - visible uniquement si expandedQASections.riasec est true */}
          {expandedQASections.riasec && (
            <div className="space-y-2 mb-4">
              {Object.entries(userReportData.riasecScores?.detailedResponses || {}).map(([cat, questions]: [string, any]) => (
                <React.Fragment key={cat}>
                  {questions.map((q: any) => (
                    <div key={q.questionId} className={`flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 bg-purple-50 rounded-lg p-2 sm:p-3 shadow-sm mb-2 text-xs sm:text-sm ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
                      <span className="font-bold text-purple-600 min-w-[80px] sm:min-w-[100px]">
                        {riasecCategories[language as 'fr' | 'ar'][cat as keyof typeof riasecCategories['fr']] || cat}
                      </span>
                      <span className="font-medium flex-1">{q.questionText}</span>
                      <span className={`text-gray-700 mt-1 sm:mt-0 ${language === 'ar' ? 'text-right' : ''}`}>
                        {t.answer}: <span className="font-bold">{q.userAnswer}</span>
                      </span>
                      <span className="text-gray-400 text-xs">⏱ {formatDuration(q.responseTime)}</span>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Résultats RIASEC - toujours visibles */}
          <h3 className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${language === 'ar' ? 'text-right' : ''}`}>
            {language === 'ar' ? "تصور ملف RIASEC" : "Visualisation du profil RIASEC"}
          </h3>
          <div className="my-8 sm:my-10 md:my-12 flex flex-col items-center">
            <RadarChart
              data={userReportData.riasecScores?.scores || {}}
              title={language === 'ar' ? "ملف RIASEC" : "Profil RIASEC"}
              language={language}
              translations={riasecCategories[language as 'fr' | 'ar']}
            />
          </div>
          <div className={`flex flex-wrap gap-2 mt-3 sm:mt-4 ${language === 'ar' ? 'justify-end' : ''}`}>
            {/* Utiliser le type RIASEC composite (cohérent avec l'admin) */}
            {(() => {
              // Priorité au type composite
              if (userReportData?.analysis?.compositeRiasec?.dominantType) {
                const dominantType = userReportData.analysis.compositeRiasec.dominantType as RiasecType;
                const colors = getRiasecColors(dominantType);
                const name = colors.name[language as 'fr' | 'ar'] || colors.name.fr;
                return (
                  <span key={dominantType} className="px-2 sm:px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs sm:text-sm">
                    {name}
                  </span>
                );
              }
              // Fallback vers dominantProfile si compositeRiasec n'est pas disponible
              if (userReportData.riasecScores?.dominantProfile) {
                const profiles = Array.isArray(userReportData.riasecScores.dominantProfile) 
                  ? userReportData.riasecScores.dominantProfile 
                  : [userReportData.riasecScores.dominantProfile];
                return profiles.map((p: string) => (
                  <span key={p} className="px-2 sm:px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs sm:text-sm">
                    {riasecCategories[language as 'fr' | 'ar'][p as keyof typeof riasecCategories['fr']] || p}
                  </span>
                ));
              }
              return null;
            })()}
          </div>
          <div className={`mt-2 text-xs sm:text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
            {language === 'ar' ? "متوسط الوقت لكل سؤال" : "Temps moyen par question"}:
            <span className="font-bold">{formatDuration(userReportData.riasecScores?.avgResponseTime)}</span>
          </div>
        </section>

        {/* Personnalité */}
        <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
          <div className={`flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <BrainIcon className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold">{t.personalityResults}</h2>
          </div>

          {/* Bouton pour afficher/masquer les questions/réponses */}
          <button
            onClick={() => toggleQASection('personality')}
            className={`flex items-center gap-2 w-full justify-between px-3 py-2 bg-green-50 rounded-lg text-sm font-medium text-green-700 mb-3 hover:bg-green-100 transition-colors ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <span>{t.questionsAnswers}</span>
            {expandedQASections.personality
              ? <ChevronUpIcon className="w-5 h-5" />
              : <ChevronDownIcon className="w-5 h-5" />
            }
          </button>

          {/* Contenu des questions/réponses - visible uniquement si expandedQASections.personality est true */}
          {expandedQASections.personality && (
            <div className="space-y-2 mb-4">
              {userReportData.personalityScores?.detailedResponses?.map((q: any) => (
                <div key={q.questionId} className={`flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 bg-green-50 rounded-lg p-2 sm:p-3 shadow-sm mb-2 text-xs sm:text-sm ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
                  <span className={`font-medium flex-1 ${language === 'ar' ? 'text-right' : ''}`}>{q.questionText}</span>
                  <span className={`text-gray-700 mt-1 sm:mt-0 ${language === 'ar' ? 'text-right flex flex-row-reverse' : ''}`}>
                    {t.answer}: <span className="font-bold">{q.userAnswer}</span>
                  </span>
                  <span className={`text-gray-400 text-xs ${language === 'ar' ? 'text-right' : ''}`}>⏱ {formatDuration(q.responseTime)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Résultats de personnalité - toujours visibles */}
          <h3 className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${language === 'ar' ? 'text-right' : ''}`}>
            {language === 'ar' ? "تصور ملف الشخصية" : "Visualisation du profil de personnalité"}
          </h3>

          <BarChart
            data={userReportData.personalityScores?.scores || {}}
            title={language === 'ar' ? "سمات الشخصية" : "Traits de Personnalité"}
            color="green"
            language={language}
          />

          <div className={`flex flex-wrap gap-2 mt-3 sm:mt-4 ${language === 'ar' ? 'justify-end' : ''}`}>
            {userReportData.personalityScores?.dominantTraits?.map((trait: string) => (
              <span key={trait} className="px-2 sm:px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs sm:text-sm">
                {personalityTraits[language as 'fr' | 'ar'][trait as keyof typeof personalityTraits['fr']] || trait}
              </span>
            ))}
          </div>

          <div className={`mt-3 sm:mt-4 ${language === 'ar' ? 'text-right' : ''}`}>
            <span className="text-xs sm:text-sm text-gray-500 font-semibold">
              {language === 'ar' ? "أسلوب التعلم المفضل:" : "Style d'apprentissage préféré:"}
            </span>
            <div className={`mt-1 sm:mt-2 ${language === 'ar' ? 'flex flex-row-reverse items-start' : ''}`}>
              {(() => {
                const styleValue = userReportData.personalityScores?.learningStyle;
                const styleObj = learningStyles[language as 'fr' | 'ar'].find(ls => ls.value === styleValue);
                if (styleObj) {
                  return (
                    <span className={`inline-block px-2 sm:px-3 py-1 rounded-full bg-green-50 text-green-700 font-bold text-xs sm:text-sm ${language === 'ar' ? 'ml-2' : 'mr-2'}`}>
                      {styleObj.label}
                    </span>
                  );
                }
                return <span className="text-gray-400 text-xs sm:text-sm">{styleValue ?? '-'}</span>;
              })()}
              {(() => {
                const styleValue = userReportData.personalityScores?.learningStyle;
                const styleObj = learningStyles[language as 'fr' | 'ar'].find(ls => ls.value === styleValue);
                if (styleObj) {
                  return (
                    <span className={`text-gray-600 text-xs sm:text-sm ${language === 'ar' ? 'mr-1 sm:mr-2' : 'ml-1 sm:ml-2'}`}>
                      {styleObj.description}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </section>

        {/* Section Aptitudes supprimée dans la version rapide */}

        {/* Intérêts académiques */}
        <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
          <div className={`flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <BookOpenIcon className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold">{t.interestsResults}</h2>
          </div>

          {/* Bouton pour afficher/masquer les questions/réponses */}
          <button
            onClick={() => toggleQASection('interests')}
            className={`flex items-center gap-2 w-full justify-between px-3 py-2 bg-blue-50 rounded-lg text-sm font-medium text-blue-700 mb-3 hover:bg-blue-100 transition-colors ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <span>{t.questionsAnswers}</span>
            {expandedQASections.interests
              ? <ChevronUpIcon className="w-5 h-5" />
              : <ChevronDownIcon className="w-5 h-5" />
            }
          </button>

          {/* Contenu des questions/réponses - visible uniquement si expandedQASections.interests est true */}
          {expandedQASections.interests && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
              {Object.entries(userReportData.academicInterests?.detailedResponses || {}).map(([field, responses]: [string, any]) => (
                Array.isArray(responses)
                  ? responses.map((q: any, idx: number) => (
                    <div key={field + idx} className={`bg-blue-50 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col gap-1 sm:gap-2 mb-2 text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
                        <span className="font-bold text-blue-600 text-sm sm:text-base">{field}</span>
                      </div>
                      <div className="mb-1 sm:mb-2">
                        <span className="font-semibold text-sm sm:text-base text-gray-800">{q.questionText || field}</span>
                      </div>
                      <div className={`flex flex-wrap gap-2 sm:gap-4 items-center ${language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
                        <span className="text-blue-700">
                          {language === 'ar' ? (
                            <span><span className="font-bold">{q.interestLevel}</span> :{t.interestLevel}</span>
                          ) : (
                            <span>{t.interestLevel}: <span className="font-bold">{q.interestLevel}</span></span>
                          )}
                        </span>
                        <span className="text-green-700">
                          {language === 'ar' ? (
                            <span><span className="font-bold">{q.motivationLevel}</span> :{t.motivationLevel}</span>
                          ) : (
                            <span>{t.motivationLevel}: <span className="font-bold">{q.motivationLevel}</span></span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                  : (
                    <div key={field} className={`bg-blue-50 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col gap-1 sm:gap-2 mb-2 text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
                        <span className="font-bold text-blue-600 text-sm sm:text-base">{field}</span>
                      </div>
                      <div className="mb-1 sm:mb-2">
                        <span className="font-semibold text-sm sm:text-base text-gray-800">{responses.questionText || field}</span>
                      </div>
                      <div className={`flex flex-wrap gap-2 sm:gap-4 items-center ${language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
                        <span className="text-blue-700">
                          {language === 'ar' ? (
                            <span><span className="font-bold">{responses.interestLevel}</span> :{t.interestLevel}</span>
                          ) : (
                            <span>{t.interestLevel}: <span className="font-bold">{responses.interestLevel}</span></span>
                          )}
                        </span>
                        <span className="text-green-700">
                          {language === 'ar' ? (
                            <span><span className="font-bold">{responses.motivationLevel}</span> :{t.motivationLevel}</span>
                          ) : (
                            <span>{t.motivationLevel}: <span className="font-bold">{responses.motivationLevel}</span></span>
                          )}
                        </span>
                      </div>
                    </div>
                  )
              ))}
            </div>
          )}

          {/* Section visualisation Intérêts - toujours visible */}
          <h3 className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${language === 'ar' ? 'text-right' : ''}`}>
            {language === 'ar' ? "تصور ملف الاهتمامات الأكاديمية" : "Visualisation du profil d'intérêts académiques"}
          </h3>

          {/* Vous pouvez ajouter ici une visualisation des intérêts académiques */}
          <div className="space-y-3">
            {Object.entries(userReportData.academicInterests?.categoryScores || {}).map(([category, scores]: [string, any]) => (
              <div key={category} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-gray-900">{category}</div>
                  <div className="text-lg font-bold text-blue-600">
                    {scores.interest}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${scores.interest}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-3 mb-1">
                  <div className="text-sm text-gray-600">{language === 'fr' ? 'Motivation' : 'التحفيز'}</div>
                  <div className="text-sm font-medium text-green-600">
                    {scores.motivation}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-green-500"
                    style={{ width: `${scores.motivation}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* Compatibilité de carrière */}
        <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
          <div className={`flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <BriefcaseIcon className="w-5 sm:w-6 h-5 sm:h-6 text-teal-600" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold">{t.careerResults}</h2>
          </div>

          {/* Préférences de carrière - maintenant visible tout le temps */}
          {userReportData.careerCompatibility?.preferenceResponses && (
            <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 border border-teal-100">
              <h4 className={`font-medium text-teal-700 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                {language === 'ar' ? 'تفضيلات المهنة' : 'Préférences de carrière'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(userReportData.careerCompatibility.preferenceResponses || {}).map(([key, response]: [string, any]) => {
                  // Déterminer la valeur traduite selon le type de préférence
                  let translatedValue = "";

                  if (key === 'workStyle') {
                    // Traduire les styles de travail
                    switch (response.selectedValue) {
                      case 'independent': translatedValue = language === 'ar' ? 'عمل مستقل' : 'Travail indépendant'; break;
                      case 'public': translatedValue = language === 'ar' ? 'وظيفة عمومية' : 'Fonction publique'; break;
                      case 'private': translatedValue = language === 'ar' ? 'شركة خاصة' : 'Entreprise privée'; break;
                      case 'ngo': translatedValue = language === 'ar' ? 'منظمة غير حكومية / جمعوية' : 'ONG / Associatif'; break;
                      default: translatedValue = response.selectedValue;
                    }
                  } else if (key === 'priority') {
                    // Traduire les priorités
                    switch (response.selectedValue) {
                      case 'stability': translatedValue = language === 'ar' ? 'استقرار الوظيفة' : 'Stabilité de l\'emploi'; break;
                      case 'salary': translatedValue = language === 'ar' ? 'راتب عالي' : 'Salaire élevé'; break;
                      case 'passion': translatedValue = language === 'ar' ? 'شغف بالمهنة' : 'Passion pour le métier'; break;
                      case 'prestige': translatedValue = language === 'ar' ? 'مكانة اجتماعية' : 'Prestige social'; break;
                      default: translatedValue = response.selectedValue;
                    }
                  } else if (key === 'sector') {
                    // Traduire les secteurs
                    switch (response.selectedValue) {
                      case 'public': translatedValue = language === 'ar' ? 'القطاع العام فقط' : 'Secteur public uniquement'; break;
                      case 'private': translatedValue = language === 'ar' ? 'القطاع الخاص فقط' : 'Secteur privé uniquement'; break;
                      case 'mixed': translatedValue = language === 'ar' ? 'القطاعان معاً' : 'Les deux secteurs'; break;
                      default: translatedValue = response.selectedValue;
                    }
                  }

                  return (
                    <div key={key} className={`bg-teal-50 rounded-lg p-3 shadow-sm text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-2 ${language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
                        <span className="font-bold text-teal-600 text-sm sm:text-base">
                          {key === 'workStyle'
                            ? (language === 'ar' ? 'نمط العمل' : 'Style de travail')
                            : key === 'priority'
                              ? (language === 'ar' ? 'الأولوية' : 'Priorité')
                              : key === 'sector'
                                ? (language === 'ar' ? 'القطاع' : 'Secteur')
                                : key}
                        </span>
                      </div>
                      <div className={`${language === 'ar' ? 'text-right' : ''}`}>
                        <span className="text-teal-700 font-medium">
                          {translatedValue}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bouton pour afficher/masquer les questions/réponses */}
          <button
            onClick={() => toggleQASection('careerCompatibility')}
            className={`flex items-center gap-2 w-full justify-between px-3 py-2 bg-teal-50 rounded-lg text-sm font-medium text-teal-700 mb-3 hover:bg-teal-100 transition-colors ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <span>{t.questionsAnswers}</span>
            {expandedQASections.careerCompatibility
              ? <ChevronUpIcon className="w-5 h-5" />
              : <ChevronDownIcon className="w-5 h-5" />
            }
          </button>

          {/* Contenu des questions/réponses - visible uniquement si expandedQASections.careerCompatibility est true */}
          {expandedQASections.careerCompatibility && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4">
              {/* Réponses détaillées pour les métiers */}
              <div className="bg-teal-50 rounded-lg p-3 sm:p-4 mb-3">
                <h4 className={`font-medium text-teal-700 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar' ? 'تقييمات المهن' : 'Évaluations des métiers'}
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {Object.entries(userReportData.careerCompatibility?.detailedResponses || {}).map(([career, details]: [string, any]) => (
                    <div key={career} className={`bg-white rounded-lg p-3 shadow-sm text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-2 ${language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
                        <span className="font-bold text-teal-600 text-sm sm:text-base">{career}</span>
                        <span className="text-xs text-gray-500">({details.sector})</span>
                      </div>
                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${language === 'ar' ? 'text-right' : ''}`}>
                        <div className="text-teal-700">
                          {language === 'ar' ? (
                            <><span className="float-left font-bold">{details.attractionLevel}/5</span> :{t.attraction}</>
                          ) : (
                            <>{t.attraction}: <span className="font-bold">{details.attractionLevel}/5</span></>
                          )}
                        </div>
                        <div className="text-blue-700">
                          {language === 'ar' ? (
                            <><span className="float-left font-bold">{details.accessibilityPerceived ? t.yes : t.no}</span> :{t.accessibleToYou}</>
                          ) : (
                            <>{t.accessibleToYou}: <span className="font-bold">{details.accessibilityPerceived ? t.yes : t.no}</span></>
                          )}
                        </div>
                        <div className="text-gray-600">
                          {language === 'ar' ? (
                            <><span className="float-left font-bold">{details.difficultyLevel}</span> :{language === 'ar' ? 'مستوى الصعوبة' : 'Niveau de difficulté'}</>
                          ) : (
                            <>{language === 'ar' ? 'مستوى الصعوبة' : 'Niveau de difficulté'}: <span className="font-bold">{details.difficultyLevel}</span></>
                          )}
                        </div>
                        {details.attractionResponseTime && (
                          <div className="text-gray-400 text-xs">
                            ⏱ {formatDuration(details.attractionResponseTime)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message si aucune donnée n'est disponible */}
              {!userReportData.careerCompatibility?.detailedResponses && (
                <div className="bg-teal-50 rounded-lg p-4 text-center">
                  <span className="text-teal-700 font-medium">
                    {language === 'ar'
                      ? 'لا توجد تفاصيل متاحة للأسئلة والإجابات المتعلقة بالمهن.'
                      : 'Aucun détail disponible pour les questions et réponses concernant les carrières.'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Section visualisation Carrière - toujours visible */}
          <h3 className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${language === 'ar' ? 'text-right' : ''}`}>
            {language === 'ar' ? "تصور توافق المهن" : "Visualisation de la compatibilité des carrières"}
          </h3>

          <div className="space-y-4">

            {/* Top métiers */}
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <h4 className={`font-medium text-teal-900 mb-3 ${language === 'ar' ? 'text-right' : ''}`}>
                {language === 'ar' ? 'المهن الأكثر جاذبية' : 'Métiers les plus attractifs'}
              </h4>
              <div className="space-y-2">
                {(() => {
                  // ✅ Créer une liste des métiers triés par attractivité
                  const sortedCareers = Object.entries(userReportData.careerCompatibility?.careerAttractions || {})
                    .filter(([career, attraction]) => attraction >= 3) // Filtrer les métiers avec attraction >= 3
                    .sort(([, a], [, b]) => (b as number) - (a as number)) // Trier par attraction décroissante
                    .slice(0, 8); // Prendre les 8 premiers

                  if (sortedCareers.length === 0) {
                    return (
                      <div className="text-center py-4 text-gray-500">
                        {language === 'ar'
                          ? 'لا توجد بيانات كافية عن المهن المقيمة'
                          : 'Pas assez de données sur les métiers évalués'
                        }
                      </div>
                    );
                  }

                  return sortedCareers.map(([career, attraction], index) => {
                    const careerDetails = userReportData.careerCompatibility?.detailedResponses?.[career];
                    const isAccessible = careerDetails?.accessibilityPerceived;

                    return (
                      <div key={career} className="flex items-center justify-between bg-white p-3 rounded-lg border border-teal-100">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{career}</span>
                            {/* Badge d'accessibilité si disponible */}
                            {isAccessible !== null && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${isAccessible
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {isAccessible
                                  ? (language === 'ar' ? 'متاح' : 'Accessible')
                                  : (language === 'ar' ? 'صعب' : 'Difficile')
                                }
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {careerDetails?.sector} • {careerDetails?.difficultyLevel}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Score d'attractivité */}
                          <span className="text-sm text-teal-600 px-2 py-0.5 bg-teal-50 rounded-full">
                            {attraction}/5
                          </span>
                          {/* Position dans le classement */}
                          <span className="text-xs text-gray-400 font-bold">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Message explicatif si certaines données manquent */}
              {Object.values(userReportData.careerCompatibility?.detailedResponses || {}).some((career: any) => career.accessibilityPerceived === null) && (
                <div className={`mt-3 text-xs text-orange-600 bg-orange-50 p-2 rounded ${language === 'ar' ? 'text-right' : ''}`}>
                  ⚠️ {language === 'ar'
                    ? 'بعض أسئلة إمكانية الوصول لم يتم الإجابة عليها'
                    : 'Certaines questions d\'accessibilité n\'ont pas été répondues'
                  }
                </div>
              )}
            </div>

            {/* Top secteurs */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className={`font-medium text-blue-900 mb-3 ${language === 'ar' ? 'text-right' : ''}`}>
                {language === 'ar' ? 'القطاعات الأكثر ملاءمة' : 'Secteurs les plus adaptés'}
              </h4>
              <div className="space-y-2">
                {Object.entries(userReportData.careerCompatibility?.sectorScores || {})
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 3)
                  .map(([sector, score]: [string, any], index: number) => (
                    <div key={sector} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100">
                      <span className="font-medium text-gray-800">{sector}</span>
                      <span className="text-sm text-blue-600 px-2 py-0.5 bg-blue-50 rounded-full">
                        {score}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Statistiques par secteur */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className={`font-medium text-indigo-900 mb-3 ${language === 'ar' ? 'text-right' : ''}`}>
                {language === 'ar' ? 'إحصائيات القطاع' : 'Statistiques par secteur'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userReportData.careerCompatibility?.sectorStats?.slice(0, 5).map((stat: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100">
                    <span className="font-medium text-gray-800">{stat.sector}</span>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full mb-1">
                        {stat.attractionScore}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {stat.careersEvaluated} {language === 'ar' ? 'مهن' : 'métiers'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Contraintes */}
        <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
          <div className={`flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <MapPinIcon className="w-5 sm:w-6 h-5 sm:h-6 text-red-600" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold">{t.constraintsResults}</h2>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
            {/* Mobilité */}
            <div className={`bg-red-50 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col mb-2 text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
              <span className="font-bold text-red-600 mb-2">{t.geographicMobility}</span>
              <span className="mb-1">
                {language === 'ar' ? (
                  <><span className="float-left font-bold">{t[userReportData.constraints.mobility?.city as keyof typeof t] ?? userReportData.constraints.mobility?.city ?? '-'}</span> :{t.changeCity}</>
                ) : (
                  <>{t.changeCity}: <span className="font-bold">{t[userReportData.constraints.mobility?.city as keyof typeof t] ?? userReportData.constraints.mobility?.city ?? '-'}</span></>
                )}
              </span>
              <span className="mb-1">
                {language === 'ar' ? (
                  <><span className="float-left font-bold">{t[userReportData.constraints.mobility?.country as keyof typeof t] ?? userReportData.constraints.mobility?.country ?? '-'}</span> :{t.studyAbroad}</>
                ) : (
                  <>{t.studyAbroad}: <span className="font-bold">{t[userReportData.constraints.mobility?.country as keyof typeof t] ?? userReportData.constraints.mobility?.country ?? '-'}</span></>
                )}
              </span>
              <span>
                {language === 'ar' ? (
                  <><span className="float-left font-bold">{t[userReportData.constraints.mobility?.international as keyof typeof t] ?? userReportData.constraints.mobility?.international ?? '-'}</span> :{t.internationalCareer}</>
                ) : (
                  <>{t.internationalCareer}: <span className="font-bold">{t[userReportData.constraints.mobility?.international as keyof typeof t] ?? userReportData.constraints.mobility?.international ?? '-'}</span></>
                )}
              </span>
            </div>

            {/* Budget */}
            <div className={`bg-green-50 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col mb-2 text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
              <span className="font-bold text-green-600 mb-2">{t.financialConstraints}</span>
              <span className="mb-1">
                {language === 'ar' ? (
                  <><span className="float-left font-bold">{t[userReportData.constraints.budget?.annualBudget as keyof typeof t] ?? userReportData.constraints.budget?.annualBudget ?? '-'}</span> :{t.availableBudget}</>
                ) : (
                  <>{t.availableBudget}: <span className="font-bold">{t[userReportData.constraints.budget?.annualBudget as keyof typeof t] ?? userReportData.constraints.budget?.annualBudget ?? '-'}</span></>
                )}
              </span>
              <span className="mb-1">
                {language === 'ar' ? (
                  <><span className="float-left font-bold">{t[userReportData.constraints.budget?.scholarshipEligible as keyof typeof t] ?? userReportData.constraints.budget?.scholarshipEligible ?? '-'}</span> :{t.scholarshipEligible}</>
                ) : (
                  <>{t.scholarshipEligible}: <span className="font-bold">{t[userReportData.constraints.budget?.scholarshipEligible as keyof typeof t] ?? userReportData.constraints.budget?.scholarshipEligible ?? '-'}</span></>
                )}
              </span>
              <span>
                {language === 'ar' ? (
                  <><span className="float-left font-bold">{t[userReportData.constraints.budget?.familySupport as keyof typeof t] ?? userReportData.constraints.budget?.familySupport ?? '-'}</span> :{t.familySupport}</>
                ) : (
                  <>{t.familySupport}: <span className="font-bold">{t[userReportData.constraints.budget?.familySupport as keyof typeof t] ?? userReportData.constraints.budget?.familySupport ?? '-'}</span></>
                )}
              </span>
            </div>

            {/* Education */}
            <div className={`bg-purple-50 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col mb-2 text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
              <span className="font-bold text-purple-600 mb-2">{t.studyPreferences}</span>
              <span className="mb-1">
                {language === 'ar' ? (
                  <><span className="float-left font-bold">{t[userReportData.constraints.education?.maxLevel as keyof typeof t] ?? userReportData.constraints.education?.maxLevel ?? '-'}</span> :{t.maxLevel}</>
                ) : (
                  <>{t.maxLevel}: <span className="font-bold">{t[userReportData.constraints.education?.maxLevel as keyof typeof t] ?? userReportData.constraints.education?.maxLevel ?? '-'}</span></>
                )}
              </span>
              <span className="mb-1">
                {language === 'ar' ? (
                  <><span className="float-left font-bold">{t[userReportData.constraints.education?.preferredDuration as keyof typeof t] ?? userReportData.constraints.education?.preferredDuration ?? '-'}</span> :{t.preferredDuration}</>
                ) : (
                  <>{t.preferredDuration}: <span className="font-bold">{t[userReportData.constraints.education?.preferredDuration as keyof typeof t] ?? userReportData.constraints.education?.preferredDuration ?? '-'}</span></>
                )}
              </span>
              <span>
                {language === 'ar' ? (
                  <><span className="float-left font-bold">{t[userReportData.constraints.education?.studyMode as keyof typeof t] ?? userReportData.constraints.education?.studyMode ?? '-'}</span> :{t.studyMode}</>
                ) : (
                  <>{t.studyMode}: <span className="font-bold">{t[userReportData.constraints.education?.studyMode as keyof typeof t] ?? userReportData.constraints.education?.studyMode ?? '-'}</span></>
                )}
              </span>
            </div>

            {/* Priorités */}
            <div className={`bg-orange-50 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col mb-2 text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
              <span className="font-bold text-orange-600 mb-2">{t.careerPriorities}</span>
              {[
                { key: 'salary', label: t.highSalary },
                { key: 'stability', label: t.jobStability },
                { key: 'passion', label: t.careerPassion },
                { key: 'prestige', label: t.socialPrestige },
                { key: 'workLife', label: t.workLifeBalance }
              ].map(({ key, label }) => (
                <span key={key} className="mb-1">
                  {language === 'ar' ? (
                    <><span className="float-left font-bold">{userReportData.constraints.priorities?.[key] ?? '-'}/5</span> :{label}</>
                  ) : (
                    <>{label}: <span className="font-bold">{userReportData.constraints.priorities?.[key] ?? '-'}</span>/5</>
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Compétences Linguistiques */}
        <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
          <div className={`flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <LanguagesIcon className="w-5 sm:w-6 h-5 sm:h-6 text-indigo-600" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold">{t.languageResults}</h2>
          </div>

          {/* Visualisation des compétences linguistiques - toujours visible */}
          <h3 className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${language === 'ar' ? 'text-right' : ''}`}>
            {language === 'ar' ? "تصور المهارات اللغوية" : "Visualisation des compétences linguistiques"}
          </h3>


          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {(userReportData.languageSkills?.selectedLanguages || []).map((langKey: string) => {
              const langInfo = languages[language as 'fr' | 'ar'].find(l => l.code === langKey);
              const langLabel = langInfo ? langInfo.name : (t[langKey as keyof typeof t] ?? langKey);
              const langDesc = langInfo ? langInfo.description : '';
              const skills = userReportData.languageSkills?.languageSkills?.[langKey] || {};
              const cert = userReportData.languageSkills?.certificates?.[langKey] || {};
              const overallScore = userReportData.languageSkills?.overallScores?.[langKey];
              const comfortable = userReportData.languageSkills?.preferences?.comfortableStudyingIn?.includes(langKey);
              const willingToImprove = userReportData.languageSkills?.preferences?.willingToImprove?.includes(langKey);

              // Fonctions d'aide pour la traduction
              const getTranslatedSkill = (skill: string) => {
                return languageSkillLabels[language as 'fr' | 'ar'][skill as keyof typeof languageSkillLabels['fr']] || skill;
              };

              const getTranslatedLevel = (level: string) => {
                return languageLevelLabels[language as 'fr' | 'ar'][level as keyof typeof languageLevelLabels['fr']] || level;
              };

              return (
                <div key={langKey} className="bg-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm w-full">
                  <div className={`flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <LanguagesIcon className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-700" />
                    <span className="font-bold text-indigo-700 text-sm sm:text-base md:text-lg">{langLabel}</span>
                    <span className={`${language === 'ar' ? 'mr-1 sm:mr-2' : 'ml-1 sm:ml-2'} text-xs text-gray-500`}>
                      {overallScore !== undefined ? (language === 'ar' ? `${overallScore} :النتيجة` : `Score: ${overallScore}`) : null}
                    </span>
                  </div>
                  {langDesc && (
                    <div className={`mb-2 sm:mb-4 text-xs sm:text-sm text-gray-600 ${language === 'ar' ? 'text-right' : ''}`}>{langDesc}</div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-2 sm:mb-4">

                    <div>
                      <h4 className={`font-semibold mb-1 sm:mb-2 text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
                        {language === 'ar' ? "المهارات" : "Compétences"}
                      </h4>
                      <ul className={`space-y-1 text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
                        <li className={`${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? (
                            <>
                              <span className="float-left font-bold">{getTranslatedLevel(skills.speaking) ?? '-'}</span>
                              <span className="ml-1">:{getTranslatedSkill('speaking')}</span>
                            </>
                          ) : (
                            <>{getTranslatedSkill('speaking')}: <span className="font-bold">{getTranslatedLevel(skills.speaking) ?? '-'}</span></>
                          )}
                        </li>
                        <li className={`${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? (
                            <>
                              <span className="float-left font-bold">{getTranslatedLevel(skills.writing) ?? '-'}</span>
                              <span className="ml-1">:{getTranslatedSkill('writing')}</span>
                            </>
                          ) : (
                            <>{getTranslatedSkill('writing')}: <span className="font-bold">{getTranslatedLevel(skills.writing) ?? '-'}</span></>
                          )}
                        </li>
                        <li className={`${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? (
                            <>
                              <span className="float-left font-bold">{getTranslatedLevel(skills.reading) ?? '-'}</span>
                              <span className="ml-1">:{getTranslatedSkill('reading')}</span>
                            </>
                          ) : (
                            <>{getTranslatedSkill('reading')}: <span className="font-bold">{getTranslatedLevel(skills.reading) ?? '-'}</span></>
                          )}
                        </li>
                        <li className={`${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? (
                            <>
                              <span className="float-left font-bold">{getTranslatedLevel(skills.listening) ?? '-'}</span>
                              <span className="ml-1">:{getTranslatedSkill('listening')}</span>
                            </>
                          ) : (
                            <>{getTranslatedSkill('listening')}: <span className="font-bold">{getTranslatedLevel(skills.listening) ?? '-'}</span></>
                          )}
                        </li>
                      </ul>
                    </div>

                    {/* Le reste du code reste inchangé */}
                    <div>
                      <h4 className={`font-semibold mb-1 sm:mb-2 text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
                        {language === 'ar' ? "شهادة" : "Certificat"}
                      </h4>
                      {cert.hasCertificate ? (
                        <ul className={`space-y-1 text-xs sm:text-sm ${language === 'ar' ? 'text-right' : ''}`}>
                          <li className={`${language === 'ar' ? 'text-right' : ''}`}>
                            {language === 'ar' ? (
                              <>
                                <span className="float-left font-bold">{cert.certificateName}</span>
                                <span className="ml-1">:اسم الشهادة</span>
                              </>
                            ) : (
                              <>Nom du certificat: <span className="font-bold">{cert.certificateName}</span></>
                            )}
                          </li>
                          <li className={`${language === 'ar' ? 'text-right' : ''}`}>
                            {language === 'ar' ? (
                              <>
                                <span className="float-left font-bold">{cert.score}</span>
                                <span className="ml-1">:النقطة المحصل عليها</span>
                              </>
                            ) : (
                              <>Note obtenue: <span className="font-bold">{cert.score}</span></>
                            )}
                          </li>
                          <li className={`${language === 'ar' ? 'text-right' : ''}`}>
                            {language === 'ar' ? (
                              <>
                                <span className="float-left font-bold">{cert.total}</span>
                                <span className="ml-1">:النقطة الكلية</span>
                              </>
                            ) : (
                              <>Note totale: <span className="font-bold">{cert.total}</span></>
                            )}
                          </li>
                        </ul>
                      ) : (
                        <span className={`text-gray-500 text-xs sm:text-sm ${language === 'ar' ? 'text-right block' : ''}`}>
                          {language === 'ar' ? "لا توجد شهادة" : "Pas de certificat"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`flex flex-wrap gap-2 sm:gap-4 mt-1 sm:mt-2 ${language === 'ar' ? 'justify-end' : ''}`}>
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${comfortable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} font-semibold text-xs sm:text-sm`}>
                      {language === 'ar' ? (
                        <span className="flex flex-row-reverse items-center gap-1">
                          <span>{comfortable ? t.yes : t.no}</span>
                          <span>:مرتاح للدراسة بهذه اللغة</span>
                        </span>
                      ) : (
                        <>À l'aise pour étudier: {comfortable ? t.yes : t.no}</>
                      )}
                    </span>
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${willingToImprove ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'} font-semibold text-xs sm:text-sm`}>
                      {language === 'ar' ? (
                        <span className="flex flex-row-reverse items-center gap-1">
                          <span>{willingToImprove ? t.yes : t.no}</span>
                          <span>:يرغب في التحسن</span>
                        </span>
                      ) : (
                        <>Souhaite s'améliorer: {willingToImprove ? t.yes : t.no}</>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recommandations dynamiques */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <TrendingUpIcon className="w-5 sm:w-6 h-5 sm:h-6" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold">Recommandations personnalisées</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12">
            <AlertCircleIcon className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-yellow-300 mb-3 sm:mb-4" />
            <span className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-center">Cette section est en cours de développement.</span>
            <span className="text-white/80 text-xs sm:text-sm md:text-base text-center">Les recommandations personnalisées seront bientôt disponibles.</span>
          </div>
        </section>

        {/* Footer */}
        <footer className={`text-center py-6 sm:py-8 border-t border-gray-200 print:py-4 ${language === 'ar' ? 'text-right' : ''}`}>
          <p className="text-gray-600 mb-4 print:text-sm text-xs sm:text-sm">
            Ce rapport a été généré automatiquement basé sur vos réponses aux différents tests d'orientation.
            Il est recommandé de consulter un conseiller d'orientation pour un accompagnement personnalisé.
          </p>
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all print:hidden text-xs sm:text-sm md:text-base"
          >
            {t.newTest}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default OrientationReportQuick;