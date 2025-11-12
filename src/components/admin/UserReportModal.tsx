import React, { useState, useEffect } from 'react';
import { XIcon, Loader2Icon } from 'lucide-react';
import { getAdminUserTestStatus, getAdminUserReport } from '../../config/api';
import OrientationReportQuick from '../OrientationReportQuick';
import { calculateCompositeRiasec } from '../../utils/riasecCompositeCalculator';

interface UserReportModalProps {
    userId: number;
    onClose: () => void;
}

const UserReportModal: React.FC<UserReportModalProps> = ({ userId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showFullReport, setShowFullReport] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // D'abord, récupérer l'état du test
                const statusResponse = await getAdminUserTestStatus(userId);
                
                if (!statusResponse.success || !statusResponse.hasTest) {
                    setError('Aucun test trouvé pour cet utilisateur');
                    setLoading(false);
                    return;
                }

                const testStatusData = statusResponse.data;
                
                // Si toutes les étapes sont complétées, récupérer le rapport complet
                // Peu importe le flag isCompleted ou l'étape actuelle
                if (testStatusData.allStepsCompleted) {
                    try {
                        const reportResponse = await getAdminUserReport(userId);
                        if (reportResponse.success) {
                            setTestData(reportResponse.data);
                            setShowFullReport(true);
                        } else {
                            // Utiliser les données du test status même si le rapport n'est pas disponible
                            // Les données sont déjà complètes dans testStatusData
                            setTestData(testStatusData);
                            setShowFullReport(true);
                        }
                    } catch (err) {
                        // Si le rapport n'est pas disponible, utiliser les données du test status
                        // Les données sont déjà complètes dans testStatusData
                        setTestData(testStatusData);
                        setShowFullReport(true);
                    }
                } else {
                    // Test non finalisé, utiliser les données du test status
                    setTestData(testStatusData);
                    setShowFullReport(false);
                }
            } catch (err: any) {
                setError(err.message || 'Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    // Fonction helper pour extraire les données de compétences linguistiques
    const extractLanguageSkillsData = (data: any) => {
        // Structure 1: currentStep.languageSkills.languages (structure imbriquée)
        if (data?.currentStep?.languageSkills?.languages) {
            return data.currentStep.languageSkills.languages;
        }
        // Structure 2: currentStep.languageSkills (données directes)
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
        // Structure 3: currentStep.languages (structure directe)
        if (data?.currentStep?.languages) {
            return data.currentStep.languages;
        }
        // Structure 4: languageSkills (au niveau racine)
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

    // Préparer les données pour PrintableReportQuick - même format que OrientationReportQuick
    const prepareUserData = () => {
        if (!testData) return null;

        // Si toutes les étapes sont complétées et qu'on a les données complètes, calculer l'analyse
        // Peu importe le flag isCompleted ou l'étape actuelle
        if (testData.allStepsCompleted && showFullReport) {
            // Normaliser les données comme dans OrientationReportQuick
            const formattedData = {
                // Données de base nécessaires pour le rapport - en accédant correctement aux sous-objets
                personalInfo: testData.currentStep?.personalInfo?.personalInfo || 
                             testData.currentStep?.personalInfo || 
                             testData.personalInfo || 
                             {},
                riasecScores: testData.currentStep?.riasec?.riasec || 
                             testData.currentStep?.riasec || 
                             testData.riasecScores || 
                             {},
                personalityScores: testData.currentStep?.personality?.personality || 
                                 testData.currentStep?.personality || 
                                 testData.personalityScores || 
                                 {},
                academicInterests: testData.currentStep?.interests?.interests || 
                                 testData.currentStep?.interests || 
                                 testData.academicInterests || 
                                 {},
                careerCompatibility: testData.currentStep?.careerCompatibility?.careers || 
                                   testData.currentStep?.careerCompatibility || 
                                   testData.careerCompatibility || 
                                   {},
                constraints: testData.currentStep?.constraints?.constraints || 
                           testData.currentStep?.constraints || 
                           testData.constraints || 
                           {},
                languageSkills: extractLanguageSkillsData(testData) || {},

                // Métadonnées du test
                testMetadata: {
                    selectedLanguage: testData.selectedLanguage || testData.testMetadata?.selectedLanguage || testData.metadata?.selectedLanguage || language,
                    completedAt: testData.testMetadata?.completedAt || testData.metadata?.completedAt || new Date(),
                    isCompleted: true,
                    totalDuration: testData.testMetadata?.totalDuration || testData.metadata?.totalDuration || testData.totalDuration || 0,
                    version: "1.0",
                    startedAt: testData.testMetadata?.startedAt || testData.metadata?.startedAt
                },

                // Identifiant de session
                uuid: testData.uuid
            };

            // Calculer le RIASEC composite
            const compositeRiasec = calculateCompositeRiasec(formattedData);
            
            // Générer l'analyse complète similaire à AppQuick
            const getDominantRiasecProfile = (riasecScores: any): string => {
                if (!riasecScores?.scores) return 'Non déterminé';
                const sortedScores = Object.entries(riasecScores.scores)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 2);
                return sortedScores.map(([key]) => key).join('-');
            };

            const getDominantPersonalityType = (personalityScores: any): string => {
                if (!personalityScores?.scores) return 'Non déterminé';
                const dominant = Object.entries(personalityScores.scores)
                    .sort(([, a], [, b]) => (b as number) - (a as number))[0];
                return dominant ? dominant[0] : 'Non déterminé';
            };
            
            return {
                ...formattedData,
                analysis: {
                    dominantRiasecProfile: getDominantRiasecProfile(formattedData.riasecScores),
                    personalityType: getDominantPersonalityType(formattedData.personalityScores),
                    learningProfile: formattedData.personalityScores?.learningStyle || 'mixed',
                    academicCompatibility: {},
                    careerCompatibility: {},
                    recommendedPath: 'academic' as const,
                    confidenceLevel: 80,
                    recommendations: {
                        domains: [],
                        careers: [],
                        institutions: [],
                        developmentPlan: {
                            shortTerm: [],
                            mediumTerm: [],
                            longTerm: []
                        }
                    },
                    compositeRiasec
                }
            };
        }

        return testData;
    };

    const userData = prepareUserData();
    const language = testData?.selectedLanguage || testData?.testMetadata?.selectedLanguage || 'fr';

    // Fonction onRestart pour OrientationReportQuick (ne fait rien dans le contexte admin)
    const handleRestart = () => {
        // Dans le contexte admin, on ne redémarre pas le test, on ferme juste le modal
        onClose();
    };

    // Si le rapport complet est disponible, afficher OrientationReportQuick en plein écran
    if (showFullReport && userData && !loading && !error) {
        return (
            <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
                <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50">
                    <button
                        onClick={onClose}
                        className="bg-white rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-gray-100 transition-colors"
                        title="Fermer"
                    >
                        <XIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                    </button>
                </div>
                <div className="px-2 sm:px-4 lg:px-6">
                    <OrientationReportQuick
                        userData={userData}
                        language={language}
                        onRestart={handleRestart}
                    />
                </div>
            </div>
        );
    }

    // Sinon, afficher le modal normal pour l'état du test
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-2 sm:top-4 mx-auto p-0 border shadow-lg rounded-md bg-white max-w-6xl w-full mb-2 sm:mb-4 m-2 sm:m-4">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
                    <h3 className="text-lg font-bold text-gray-900">
                        {showFullReport ? 'Rapport Complet' : 'État du Test'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2Icon className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-600">Chargement...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : testData ? (
                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-800">
                                    Le test n'est pas encore finalisé. Voici l'état actuel :
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Étape actuelle : {testData.currentStepId || 'Non spécifiée'}</h4>
                                <p className="text-sm text-gray-600">
                                    Étapes complétées : {testData.completedSteps?.length || 0}/7
                                </p>
                                <p className="text-sm text-gray-600">
                                    Le rapport complet sera disponible une fois toutes les étapes finalisées.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600">Aucune donnée disponible</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserReportModal;

