import React, { useState, useEffect } from 'react';
import { UserIcon, BookOpenIcon, BrainIcon } from 'lucide-react';
import { useTranslation } from './utils/translations';
import { User, UserTestData } from './types/user.tsx';
import PersonalInfoForm from './components/PersonalInfoForm';
import RiasecTest from './components/RiasecTest';
import PersonalityTest from './components/PersonalityTest';
import InterestsTest from './components/InterestsTest';
import CareerCompatibilityTestQuick from './components/CareerCompatibilityTestQuick';
import ConstraintsTest from './components/ConstraintsTest';
import LanguageTest from './components/LanguageTest';
import OrientationReportQuick from './components/OrientationReportQuick';
import EventInvitationPage from './components/EventInvitationPage';
import { apiClient } from './config/api';
import ProgressBar from './components/ProgressBar';
import WelcomeScreenQuick from './components/WelcomeScreenQuick';
import { calculateCompositeRiasec } from './utils/riasecCompositeCalculator';

function AppContentQuick() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<Partial<UserTestData>>({
    testMetadata: {
      selectedLanguage: 'fr',
      startedAt: new Date(),
      stepDurations: {},
      version: 'quick-1.0'
    }
  });
  const [showReport, setShowReport] = useState(false);
  const [language, setLanguage] = useState('fr');
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const t = useTranslation(language);

  // Récupérer les informations utilisateur
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        if (response.data.success && response.data.data) {
          const userData = response.data.data;
          setUserId(parseInt(userData.id) || null);
          setUserEmail(userData.email || '');
          setUserName(userData.name || userData.firstName || userData.email?.split('@')[0] || '');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
      }
    };
    fetchUserInfo();
  }, []);

  // Helper function pour convertir une valeur en Date si nécessaire
  const toDate = (value: any): Date => {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    return new Date();
  };

  // Helper function pour obtenir le timestamp d'une date
  const getTimestamp = (value: any): number => {
    const date = toDate(value);
    return date.getTime();
  };

  useEffect(() => {
    console.group('🔍 USER DATA UPDATE (QUICK)');
    console.log('Current Step:', currentStep);
    console.log('Step Name:', steps[currentStep]?.name || 'Report');
    console.log('User Data:', JSON.parse(JSON.stringify(userData)));
    console.log('Data Completeness:', {
      personalInfo: !!userData.personalInfo,
      riasecScores: !!userData.riasecScores,
      personalityScores: !!userData.personalityScores,
      academicInterests: !!userData.academicInterests,
      careerCompatibility: !!userData.careerCompatibility,
      constraints: !!userData.constraints,
      languageSkills: !!userData.languageSkills,
      analysis: !!userData.analysis
    });
    console.groupEnd();
  }, [userData, currentStep]);

  // Version rapide : sans test d'aptitude
  const steps = [
    { name: t.welcomeTitle, icon: UserIcon, component: WelcomeScreenQuick },
    { name: t.personalInfoTitle, icon: UserIcon, component: PersonalInfoForm },
    { name: t.riasecTestTitle, icon: BrainIcon, component: RiasecTest },
    { name: t.personalityTestTitle, icon: BrainIcon, component: PersonalityTest },
    { name: t.interestsTestTitle, icon: BookOpenIcon, component: InterestsTest },
    { name: t.careerCompatibilityTitle, icon: BrainIcon, component: CareerCompatibilityTestQuick },
    { name: t.constraintsTestTitle, icon: UserIcon, component: ConstraintsTest },
    { name: t.languageTestTitle, icon: BookOpenIcon, component: LanguageTest },
  ];

  const handleStepComplete = (stepData: any) => {
    console.group(`✅ STEP ${currentStep + 1} COMPLETED (QUICK VERSION)`);
    console.log('Step Data:', stepData);

    if (stepData.showReport === true) {
      console.log('🚀 Direct request to show report detected!');
      const essentialDataPresent =
        stepData.personalInfo &&
        stepData.riasecScores &&
        stepData.testMetadata;

      if (!essentialDataPresent) {
        console.warn('⚠️ Warning: Essential data missing in report request');
      }

      setUserData(stepData);
      setShowReport(true);
      console.groupEnd();
      return;
    }

    if (stepData.currentStepId) {
      console.log(`🎯 Navigation directe vers l'étape spécifique: ${stepData.currentStepId}`);

      const stepMapping: Record<string, number> = {
        'personalInfo': 1,
        'riasec': 2,
        'personality': 3,
        'interests': 4,
        'careerCompatibility': 5,
        'constraints': 6,
        'languageSkills': 7
      };

      const targetStepIndex = stepMapping[stepData.currentStepId];

      if (targetStepIndex !== undefined) {
        // Normaliser les données pour s'assurer que la structure est correcte
        setUserData(prev => {
          const normalizedData = {
          ...prev,
            ...stepData,
            // S'assurer que personalInfo est accessible directement
            personalInfo: stepData.personalInfo || stepData.currentStep?.personalInfo?.personalInfo || stepData.currentStep?.personalInfo || prev.personalInfo,
            // S'assurer que riasecScores est accessible directement
            riasecScores: stepData.riasecScores || stepData.currentStep?.riasec?.riasec || stepData.currentStep?.riasec || prev.riasecScores,
            // S'assurer que personalityScores est accessible directement
            personalityScores: stepData.personalityScores || stepData.currentStep?.personality?.personality || stepData.currentStep?.personality || prev.personalityScores,
            // S'assurer que academicInterests est accessible directement
            academicInterests: stepData.academicInterests || stepData.currentStep?.interests?.interests || stepData.currentStep?.interests || prev.academicInterests,
            // S'assurer que careerCompatibility est accessible directement
            careerCompatibility: stepData.careerCompatibility || 
                                stepData.currentStep?.careers || 
                                stepData.currentStep?.careerCompatibility?.careers || 
                                stepData.currentStep?.careerCompatibility || 
                                prev.careerCompatibility,
            // S'assurer que constraints est accessible directement
            constraints: stepData.constraints || 
                        stepData.currentStep?.constraints?.constraints || 
                        stepData.currentStep?.constraints || 
                        prev.constraints,
            // S'assurer que languageSkills est accessible directement
            languageSkills: stepData.languageSkills || 
                           stepData.currentStep?.languages || 
                           stepData.currentStep?.languageSkills?.languages || 
                           stepData.currentStep?.languageSkills || 
                           prev.languageSkills,
            // S'assurer que currentStep est présent
            currentStep: stepData.currentStep || prev.currentStep || {}
          };
          console.log(`✅ Navigation réussie. Nouvelle étape: ${steps[targetStepIndex]?.name}`);
          console.log('📊 Données normalisées:', normalizedData);
          console.log('📊 personalInfo normalisé:', normalizedData.personalInfo);
          console.log('📊 riasecScores normalisé:', normalizedData.riasecScores);
          console.log('📊 personalityScores normalisé:', normalizedData.personalityScores);
          console.log('📊 academicInterests normalisé:', normalizedData.academicInterests);
          console.log('📊 careerCompatibility normalisé:', normalizedData.careerCompatibility);
          console.log('📊 constraints normalisé:', normalizedData.constraints);
          console.log('📊 languageSkills normalisé:', normalizedData.languageSkills);
          return normalizedData;
        });
        setCurrentStep(targetStepIndex);
        console.groupEnd();
        return;
      } else {
        console.warn(`⚠️ Étape demandée non trouvée: ${stepData.currentStepId}`);
      }
    }

    const stepKeys = [
      'welcome',
      'personalInfo',
      'riasecScores',
      'personalityScores',
      'academicInterests',
      'careerCompatibility',
      'constraints',
      'languageSkills'
    ];

    const testTypes = [
      'welcome',
      'personalInfo',
      'riasec',
      'personality',
      'interests',
      'careerCompatibility',
      'constraints',
      'languageSkills'
    ];

    const stepStartTime = Date.now();
    const stepEndTime = Date.now();

    console.group(`✅ STEP ${currentStep + 1} COMPLETED OR DATA RECEIVED`);
    console.log('Step Data:', stepData);
    console.log('Previous User Data:', JSON.parse(JSON.stringify(userData)));

    if (stepData.showReport === true) {
      console.log('🚀 Direct request to show report detected!');
      setUserData(stepData);
      setShowReport(true);
      console.groupEnd();
      return;
    }

    setUserData(prev => {
      const newData = { ...prev, ...stepData };

      // Normaliser les données pour s'assurer que personalInfo est accessible
      if (stepData.personalInfo) {
        newData.personalInfo = stepData.personalInfo;
      }
      if (stepData.currentStep?.personalInfo) {
        newData.personalInfo = stepData.currentStep.personalInfo.personalInfo || stepData.currentStep.personalInfo;
        newData.currentStep = { ...newData.currentStep, ...stepData.currentStep };
      }
      
      // Normaliser les données RIASEC
      if (stepData.riasecScores) {
        newData.riasecScores = stepData.riasecScores;
      }
      if (stepData.currentStep?.riasec) {
        newData.riasecScores = stepData.currentStep.riasec.riasec || stepData.currentStep.riasec;
        newData.currentStep = { ...newData.currentStep, ...stepData.currentStep };
      }
      
      // Normaliser les données de personnalité
      if (stepData.personalityScores) {
        newData.personalityScores = stepData.personalityScores;
      }
      if (stepData.currentStep?.personality) {
        newData.personalityScores = stepData.currentStep.personality.personality || stepData.currentStep.personality;
        newData.currentStep = { ...newData.currentStep, ...stepData.currentStep };
      }
      
      // Normaliser les données d'intérêts académiques
      if (stepData.academicInterests) {
        newData.academicInterests = stepData.academicInterests;
      }
      if (stepData.currentStep?.interests) {
        newData.academicInterests = stepData.currentStep.interests.interests || stepData.currentStep.interests;
        newData.currentStep = { ...newData.currentStep, ...stepData.currentStep };
      }
      
      // Normaliser les données de compatibilité de carrière
      if (stepData.careerCompatibility) {
        newData.careerCompatibility = stepData.careerCompatibility;
      }
      // Vérifier aussi currentStep.careers (ancienne structure) et currentStep.careerCompatibility (nouvelle structure)
      if (stepData.currentStep?.careers) {
        // Ancienne structure : careers est directement dans currentStep
        newData.careerCompatibility = stepData.currentStep.careers;
        newData.currentStep = { ...newData.currentStep, ...stepData.currentStep };
      }
      if (stepData.currentStep?.careerCompatibility) {
        // Nouvelle structure : careerCompatibility contient les données
        newData.careerCompatibility = stepData.currentStep.careerCompatibility.careers || stepData.currentStep.careerCompatibility;
        newData.currentStep = { ...newData.currentStep, ...stepData.currentStep };
      }
      
      // Normaliser les données de contraintes
      if (stepData.constraints) {
        newData.constraints = stepData.constraints;
      }
      if (stepData.currentStep?.constraints) {
        newData.constraints = stepData.currentStep.constraints.constraints || stepData.currentStep.constraints;
        newData.currentStep = { ...newData.currentStep, ...stepData.currentStep };
      }
      
      // Normaliser les données de compétences linguistiques
      if (stepData.languageSkills) {
        newData.languageSkills = stepData.languageSkills;
      }
      // Vérifier aussi currentStep.languages (structure directe du backend)
      if (stepData.currentStep?.languages) {
        newData.languageSkills = stepData.currentStep.languages;
        newData.currentStep = { ...newData.currentStep, ...stepData.currentStep };
      }
      if (stepData.currentStep?.languageSkills) {
        newData.languageSkills = stepData.currentStep.languageSkills.languages || stepData.currentStep.languageSkills;
        newData.currentStep = { ...newData.currentStep, ...stepData.currentStep };
      }

      if (stepKeys[currentStep]) {
        const sessionData = {
          ...stepData,
          session: {
            testType: stepKeys[currentStep],
            startedAt: prev.testMetadata?.startedAt || new Date(),
            completedAt: new Date(stepEndTime),
            duration: stepEndTime - (getTimestamp(prev.testMetadata?.startedAt) || stepStartTime),
            language: language as 'fr' | 'ar',
            totalQuestions: stepData.totalQuestions || 0,
            questions: stepData.detailedResponses || stepData.questions || []
          }
        };

        (newData as any)[stepKeys[currentStep]] = sessionData;
        console.log(`✅ Added ${stepKeys[currentStep]} with detailed session to userData`);
      }

      if (newData.testMetadata) {
        newData.testMetadata.stepDurations[stepKeys[currentStep]] = stepEndTime - stepStartTime;
        console.log(`⏱️ Step duration recorded: ${newData.testMetadata.stepDurations[stepKeys[currentStep]]}ms`);
      }

      if (currentStep === steps.length - 1) {
        if (newData.testMetadata) {
          newData.testMetadata.completedAt = new Date();
          newData.testMetadata.totalDuration = Date.now() - (getTimestamp(newData.testMetadata.startedAt) || Date.now());
          console.log('🏁 Test completed! Total duration:', newData.testMetadata.totalDuration);

          console.group('📊 FINAL STATISTICS (QUICK)');
          const totalQuestions = Object.values(newData)
            .filter(section => section && typeof section === 'object' && 'session' in section)
            .reduce((total, section: any) => total + (section.session?.totalQuestions || 0), 0);

          console.log(`Total Questions Answered: ${totalQuestions}`);
          console.groupEnd();
        }
      }

      console.log('New User Data:', JSON.parse(JSON.stringify(newData)));
      console.groupEnd();
      return newData;
    });

    // Passer directement à l'étape suivante sans afficher le mini rapport
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('🧮 Generating analysis...');
      generateAnalysis();
      setShowReport(true);
    }

    console.groupEnd();
  };

  const generateAnalysis = () => {
    console.group('🧮 ANALYSIS GENERATION (QUICK)');
    console.log('Generating analysis based on collected data...');

    setUserData(prev => {
      // Calculer le type RIASEC composite basé sur tous les tests
      const compositeRiasec = calculateCompositeRiasec(prev);
      
      const analysis = {
        dominantRiasecProfile: getDominantRiasecProfile(prev.riasecScores),
        personalityType: getDominantPersonalityType(prev.personalityScores),
        learningProfile: prev.personalityScores?.learningStyle || 'mixed',
        academicCompatibility: calculateAcademicCompatibility(prev),
        careerCompatibility: calculateCareerCompatibility(prev),
        recommendedPath: getRecommendedPath(prev),
        confidenceLevel: calculateConfidenceLevel(prev),
        recommendations: generateRecommendations(prev),
        compositeRiasec: compositeRiasec // Ajouter le résultat du calcul composite
      };

      console.log('Generated Analysis:', analysis);
      console.log('Composite RIASEC:', compositeRiasec);
      console.groupEnd();

      return {
        ...prev,
        analysis
      };
    });
  };

  const getDominantRiasecProfile = (riasecScores: any): string => {
    if (!riasecScores?.scores) {
      console.warn('⚠️ No RIASEC scores available');
      return 'Non déterminé';
    }

    const sortedScores = Object.entries(riasecScores.scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 2);

    const profile = sortedScores.map(([key]) => key).join('-');
    console.log('🎯 Dominant RIASEC Profile:', profile, sortedScores);
    return profile;
  };

  const getDominantPersonalityType = (personalityScores: any): string => {
    if (!personalityScores?.scores) {
      console.warn('⚠️ No personality scores available');
      return 'Non déterminé';
    }

    const dominant = Object.entries(personalityScores.scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];

    const type = dominant ? dominant[0] : 'Non déterminé';
    console.log('🧠 Dominant Personality Type:', type, dominant);
    return type;
  };

  const calculateAcademicCompatibility = (userData: any): Record<string, number> => {
    console.log('📚 Calculating academic compatibility...');
    return {};
  };

  const calculateCareerCompatibility = (userData: any): Record<string, number> => {
    console.log('💼 Calculating career compatibility...');
    return {};
  };

  const getRecommendedPath = (userData: any): 'academic' | 'professional' | 'entrepreneurial' => {
    console.log('🛤️ Determining recommended path...');
    return 'academic';
  };

  const calculateConfidenceLevel = (userData: any): number => {
    console.log('📊 Calculating confidence level...');
    const level = 80; // Légèrement réduit car version rapide
    console.log('Confidence Level:', level);
    return level;
  };

  const generateRecommendations = (userData: any): any => {
    console.log('💡 Generating recommendations...');
    return {
      domains: [],
      careers: [],
      institutions: [],
      developmentPlan: {
        shortTerm: [],
        mediumTerm: [],
        longTerm: []
      }
    };
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      console.log(`⬅️ Going back from step ${currentStep + 1} to ${currentStep}`);
      setCurrentStep(currentStep - 1);
    }
  };

  if (showReport) {
    return (
      <EventInvitationPage
        userId={userId || undefined}
        userEmail={userEmail}
        userName={userName}
      />
    );
  }

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-none sm:max-w-6xl mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {currentStep > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
              <div className={`flex items-center space-x-3 ${language === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {React.createElement(steps[currentStep].icon, { className: "w-6 h-6" })}
                <h1 className="text-2xl font-bold">{steps[currentStep].name}</h1>
              </div>
              <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="p-8">
              <CurrentComponent
                onComplete={handleStepComplete}
                onPrevious={handlePrevStep}
                canGoBack={currentStep > 1}
                onLanguageChange={setLanguage}
                userData={userData}
                language={language}
              />
          </div>
        </div>
      </div>
    </div>
  );
}

// Export directement AppContentQuick comme AppQuick
// AuthGuard et ErrorBoundary sont gérés dans App.tsx
export default AppContentQuick;




