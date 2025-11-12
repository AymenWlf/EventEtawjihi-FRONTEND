import React from 'react';
import { ArrowRightIcon, CheckCircleIcon, HomeIcon, SaveIcon } from 'lucide-react';

interface TestResultSummaryProps {
    testType: string;
    testData: any;
    language: 'fr' | 'ar';
    onContinue: () => void;
    onReturnToMain?: () => void; // Nouvelle prop pour retourner à la page principale
}

const TestResultSummary: React.FC<TestResultSummaryProps> = ({
    testType,
    testData,
    language,
    onContinue,
    onReturnToMain
}) => {
    const t = {
        fr: {
            completed: "Test complété avec succès !",
            continue: "Continuer le test",
            returnToMain: "Retourner à la page principale",
            progressSaved: "Votre progression est sauvegardée",
            progressNote: "Vous pouvez soit continuer le test maintenant soit le continuer plus tard. Votre progression sera sauvegardée à chaque étape.",
            riasecTitle: "Résultats du test RIASEC",
            riasecDesc: "Votre profil d'intérêts professionnels",
            personalityTitle: "Résultats du test de personnalité",
            personalityDesc: "Votre profil de personnalité",
            aptitudeTitle: "Résultats du test d'aptitudes",
            aptitudeDesc: "Vos forces cognitives",
            interestsTitle: "Résultats du test d'intérêts académiques",
            interestsDesc: "Vos domaines d'études préférés",
            careerTitle: "Résultats de compatibilité professionnelle",
            careerDesc: "Les métiers qui vous correspondent",
            constraintsTitle: "Résultats des contraintes",
            constraintsDesc: "Vos priorités et limitations",
            languageTitle: "Résultats des compétences linguistiques",
            languageDesc: "Vos aptitudes en langues"
        },
        ar: {
            completed: "تم إكمال الاختبار بنجاح!",
            continue: "متابعة الاختبار",
            returnToMain: "العودة إلى الصفحة الرئيسية",
            progressSaved: "تم حفظ تقدمك",
            progressNote: "يمكنك إما متابعة الاختبار الآن أو متابعته لاحقاً. سيتم حفظ تقدمك في كل خطوة.",
            riasecTitle: "نتائج اختبار RIASEC",
            riasecDesc: "ملفك للاهتمامات المهنية",
            personalityTitle: "نتائج اختبار الشخصية",
            personalityDesc: "ملف شخصيتك",
            aptitudeTitle: "نتائج اختبار القدرات",
            aptitudeDesc: "قوتك المعرفية",
            interestsTitle: "نتائج اختبار الاهتمامات الأكاديمية",
            interestsDesc: "مجالات الدراسة المفضلة لديك",
            careerTitle: "نتائج التوافق المهني",
            careerDesc: "المهن التي تناسبك",
            constraintsTitle: "نتائج القيود",
            constraintsDesc: "أولوياتك وقيودك",
            languageTitle: "نتائج المهارات اللغوية",
            languageDesc: "قدراتك اللغوية"
        }
    };

    // Déterminer le titre et la description en fonction du type de test
    const getTestInfo = () => {
        const titles = {
            riasec: { title: t[language].riasecTitle, desc: t[language].riasecDesc },
            personality: { title: t[language].personalityTitle, desc: t[language].personalityDesc },
            aptitude: { title: t[language].aptitudeTitle, desc: t[language].aptitudeDesc },
            interests: { title: t[language].interestsTitle, desc: t[language].interestsDesc },
            careerCompatibility: { title: t[language].careerTitle, desc: t[language].careerDesc },
            constraints: { title: t[language].constraintsTitle, desc: t[language].constraintsDesc },
            languageSkills: { title: t[language].languageTitle, desc: t[language].languageDesc }
        };

        return titles[testType as keyof typeof titles] || {
            title: testType,
            desc: ""
        };
    };

    const { title, desc } = getTestInfo();

    // Fonction pour générer le contenu spécifique à chaque type de test
    const renderTestSpecificContent = () => {
        switch (testType) {
            case 'riasec':
                return renderRiasecResults();
            case 'personality':
                return renderPersonalityResults();
            case 'aptitude':
                return renderAptitudeResults();
            case 'interests':
                return renderInterestsResults();
            case 'careerCompatibility':
                return renderCareerResults();
            case 'constraints':
                return renderConstraintsResults();
            case 'languageSkills':
                return renderLanguageResults();
            default:
                return <p>Résultats disponibles dans le rapport final.</p>;
        }
    };

    // Fonctions de rendu spécifiques pour chaque test
    const renderRiasecResults = () => {
        if (!testData?.scores) return null;

        const sortedScores = Object.entries(testData.scores)
            .sort(([, a], [, b]) => (b as number) - (a as number));

        return (
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">
                    {language === 'fr' ? 'Vos traits dominants' : 'سماتك المهيمنة'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {sortedScores.map(([category, score], index) => (
                        <div
                            key={category}
                            className={`p-4 rounded-lg ${index < 2 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}
                        >
                            <div className="font-bold text-lg">
                                {(testData.categoryNames || {})[category] || category}
                            </div>
                            <div className="text-2xl font-bold mt-1">
                                {score}/100
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div
                                    className={`h-2.5 rounded-full ${index < 2 ? 'bg-blue-600' : 'bg-gray-400'}`}
                                    style={{ width: `${score}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Remplacez la fonction renderPersonalityResults() existante par celle-ci
    const renderPersonalityResults = () => {
        if (!testData?.scores) return null;

        const sortedScores = Object.entries(testData.scores)
            .sort(([, a], [, b]) => (b as number) - (a as number));

        // Récupérer le style d'apprentissage
        const learningStyle = testData.learningStyle;
        const learningStyleResponse = testData.learningStyleResponse || {};
        const learningStyleLabel = learningStyleResponse.styleLabel || "";
        const learningStyleDesc = learningStyleResponse.styleDescription || "";

        return (
            <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-700">
                    {language === 'fr' ? 'Vos traits de personnalité dominants' : 'سمات شخصيتك المهيمنة'}
                </h3>

                {/* Graphique des traits de personnalité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedScores.map(([trait, score], index) => (
                        <div
                            key={trait}
                            className={`p-4 rounded-lg ${index < 3 ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <div className="font-bold text-lg">
                                {trait}
                            </div>
                            <div className="text-2xl font-bold mt-1">
                                {score}/100
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div
                                    className={`h-2.5 rounded-full ${index < 3 ? 'bg-purple-600' : 'bg-gray-400'}`}
                                    style={{ width: `${score}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Style d'apprentissage */}
                {learningStyle && (
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-700 mb-3">
                            {language === 'fr' ? 'Votre style d\'apprentissage préféré' : 'أسلوب التعلم المفضل لديك'}
                        </h3>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="font-bold text-gray-900 text-lg">
                                {learningStyleLabel || learningStyle}
                            </div>
                            {learningStyleDesc && (
                                <p className="text-gray-600 mt-1">
                                    {learningStyleDesc}
                                </p>
                            )}
                        </div>

                        <p className="text-sm text-gray-500 mt-2">
                            {language === 'fr'
                                ? 'Comprendre votre style d\'apprentissage vous aide à adopter des méthodes d\'étude plus efficaces.'
                                : 'فهم أسلوب التعلم الخاص بك يساعدك على اعتماد طرق دراسة أكثر فعالية.'
                            }
                        </p>
                    </div>
                )}

                {/* Statistiques globales */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">
                                {language === 'fr' ? 'Questions répondues' : 'الأسئلة المجابة'}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                                {testData.totalResponses || 0}/{testData.totalQuestions || 0}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">
                                {language === 'fr' ? 'Temps moyen de réponse' : 'متوسط وقت الاستجابة'}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                                {testData.avgResponseTime ? `${(testData.avgResponseTime / 1000).toFixed(1)}s` : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderAptitudeResults = () => {
        // Logique pour afficher les résultats d'aptitude
        return <p>Détails d'aptitude disponibles dans le rapport final.</p>;
    };

    // Remplacer la fonction renderInterestsResults existante par celle-ci

    const renderInterestsResults = () => {
        if (!testData?.categoryScores) return null;

        const categoryScores = testData.categoryScores;
        const categoryNames = Object.keys(categoryScores);

        // Obtenir les catégories triées par score d'intérêt
        const sortedByInterest = categoryNames
            .sort((a, b) => categoryScores[b].interest - categoryScores[a].interest);

        // Top domaines individuels
        const topInterests = testData.topInterests || [];
        const topMotivations = testData.topMotivations || [];

        // Style d'apprentissage et statistiques comportementales
        const behavioralAnalysis = testData.behavioralAnalysis || {};

        return (
            <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-700">
                    {language === 'fr' ? 'Vos catégories préférées' : 'فئاتك المفضلة'}
                </h3>

                {/* Graphique des catégories par intérêt et motivation */}
                <div className="space-y-5">
                    {sortedByInterest.slice(0, 4).map(category => (
                        <div key={category} className="bg-white rounded-lg p-4 border border-green-100">
                            <div className="font-bold text-gray-900 mb-2">{category}</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">
                                        {language === 'fr' ? 'Intérêt' : 'الاهتمام'}
                                    </div>
                                    <div className="flex items-center">
                                        <div className="text-xl font-bold text-blue-600 mr-2">
                                            {categoryScores[category].interest}%
                                        </div>
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="h-2.5 rounded-full bg-blue-600"
                                                    style={{ width: `${categoryScores[category].interest}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">
                                        {language === 'fr' ? 'Motivation' : 'التحفيز'}
                                    </div>
                                    <div className="flex items-center">
                                        <div className="text-xl font-bold text-green-600 mr-2">
                                            {categoryScores[category].motivation}%
                                        </div>
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="h-2.5 rounded-full bg-green-600"
                                                    style={{ width: `${categoryScores[category].motivation}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Top domaines spécifiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Top domaines d'intérêt */}
                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-3">
                            {language === 'fr' ? 'Domaines avec plus d\'intérêt' : 'المجالات ذات الاهتمام الأكبر'}
                        </h4>
                        <ul className="space-y-2">
                            {topInterests.slice(0, 5).map((item, index) => (
                                <li key={index} className="flex items-center justify-between">
                                    <span className="text-gray-700">{item.field}</span>
                                    <span className="font-medium text-blue-700">{item.score}/5</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Top domaines de motivation */}
                    <div className="bg-green-50 rounded-lg p-5 border border-green-100">
                        <h4 className="font-medium text-green-800 mb-3">
                            {language === 'fr' ? 'Domaines avec plus de motivation' : 'المجالات ذات التحفيز الأكبر'}
                        </h4>
                        <ul className="space-y-2">
                            {topMotivations.slice(0, 5).map((item, index) => (
                                <li key={index} className="flex items-center justify-between">
                                    <span className="text-gray-700">{item.field}</span>
                                    <span className="font-medium text-green-700">{item.score}/5</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Analyse comportementale */}
                {behavioralAnalysis.mostInterestedCategory && (
                    <div className="mt-6 bg-yellow-50 p-5 rounded-lg border border-yellow-100">
                        <h4 className="font-medium text-yellow-800 mb-2">
                            {language === 'fr' ? 'Analyse de vos préférences' : 'تحليل تفضيلاتك'}
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-700">
                                    {language === 'fr'
                                        ? 'Catégorie avec le plus d\'intérêt: '
                                        : 'الفئة ذات الاهتمام الأكبر: '}
                                </span>
                                <span className="font-medium text-gray-900">
                                    {behavioralAnalysis.mostInterestedCategory.category}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-700">
                                    {language === 'fr'
                                        ? 'Catégorie avec le plus de motivation: '
                                        : 'الفئة ذات التحفيز الأكبر: '}
                                </span>
                                <span className="font-medium text-gray-900">
                                    {behavioralAnalysis.mostMotivatedCategory.category}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-700">
                                    {language === 'fr'
                                        ? 'Taux de volonté d\'effort: '
                                        : 'معدل الاستعداد للجهد: '}
                                </span>
                                <span className="font-medium text-gray-900">
                                    {behavioralAnalysis.effortWillingnessRate}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistiques globales */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">
                                {language === 'fr' ? 'Domaines évalués' : 'المجالات المقيمة'}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                                {testData.session?.totalQuestions
                                    ? Math.round(testData.session.totalQuestions / 3)
                                    : Object.keys(testData.fieldInterests || {}).length}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">
                                {language === 'fr' ? 'Temps moyen de réponse' : 'متوسط وقت الاستجابة'}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                                {testData.avgResponseTime ? `${(testData.avgResponseTime / 1000).toFixed(1)}s` : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Remplacer la fonction renderCareerResults existante par celle-ci
    const renderCareerResults = () => {
        if (!testData?.sectorScores) return null;

        // Obtenir les secteurs triés par score d'attraction
        const sortedSectors = Object.entries(testData.sectorScores)
            .sort(([, a], [, b]) => (b as number) - (a as number));

        // Top métiers
        const topCareers = testData.topCareers || [];

        // Préférences de travail
        const workPreferences = testData.workPreferences || {};

        // Analyse comportementale
        const behavioralAnalysis = testData.behavioralAnalysis || {};

        // Traduction des préférences
        const preferenceLabels = {
            fr: {
                workStyle: {
                    label: "Type de travail préféré",
                    independent: "Travail indépendant",
                    public: "Fonction publique",
                    private: "Entreprise privée",
                    ngo: "ONG / Associatif"
                },
                priority: {
                    label: "Priorité principale",
                    stability: "Stabilité de l'emploi",
                    salary: "Salaire élevé",
                    passion: "Passion pour le métier",
                    prestige: "Prestige social"
                },
                sector: {
                    label: "Secteur préféré",
                    public: "Secteur public uniquement",
                    private: "Secteur privé uniquement",
                    mixed: "Les deux secteurs"
                }
            },
            ar: {
                workStyle: {
                    label: "نوع العمل المفضل",
                    independent: "عمل مستقل",
                    public: "وظيفة عمومية",
                    private: "شركة خاصة",
                    ngo: "منظمة غير حكومية / جمعوية"
                },
                priority: {
                    label: "الأولوية الرئيسية",
                    stability: "استقرار الوظيفة",
                    salary: "راتب عالي",
                    passion: "شغف بالمهنة",
                    prestige: "مكانة اجتماعية"
                },
                sector: {
                    label: "القطاع المفضل",
                    public: "القطاع العام فقط",
                    private: "القطاع الخاص فقط",
                    mixed: "القطاعان معاً"
                }
            }
        };

        // Fonction pour traduire les préférences
        const translatePreference = (category: string, value: string) => {
            return preferenceLabels[language]?.[category as keyof typeof preferenceLabels[typeof language]]?.[value as keyof (typeof preferenceLabels[typeof language])[keyof typeof preferenceLabels[typeof language]]] || value;
        };

        return (
            <div className="space-y-6">
                {/* Préférences de travail */}
                <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                        {language === 'fr' ? 'Vos préférences de carrière' : 'تفضيلاتك المهنية'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(workPreferences).map(([key, value]) => (
                            <div key={key} className="bg-white p-3 rounded-lg border border-indigo-100">
                                <div className="text-sm text-gray-500">
                                    {preferenceLabels[language]?.[key as keyof typeof preferenceLabels[typeof language]]?.label || key}
                                </div>
                                <div className="font-medium text-gray-900 mt-1">
                                    {translatePreference(key, value as string)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top secteurs */}
                <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3">
                        {language === 'fr' ? 'Secteurs qui vous correspondent le plus' : 'القطاعات التي تناسبك أكثر'}
                    </h3>

                    <div className="space-y-3">
                        {sortedSectors.slice(0, 5).map(([sector, score], index) => (
                            <div
                                key={sector}
                                className={`bg-white rounded-lg p-4 border ${index < 3 ? 'border-blue-200' : 'border-gray-200'}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-medium text-gray-900">{sector}</div>
                                    <div className={`text-lg font-bold ${index < 3 ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {score}%
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${index < 3 ? 'bg-blue-500' : 'bg-gray-400'}`}
                                        style={{ width: `${score}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top métiers */}
                {topCareers.length > 0 && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-3">
                            {language === 'fr' ? 'Métiers qui vous attirent et vous semblent accessibles' : 'المهن التي تجذبك وتبدو متاحة لك'}
                        </h3>

                        <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                            <ul className="space-y-2 divide-y divide-blue-100">
                                {topCareers.slice(0, 8).map((career, index) => (
                                    <li key={index} className="py-2 flex items-center">
                                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium text-sm mr-3">
                                            {index + 1}
                                        </div>
                                        <span className="text-gray-800">{career}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Analyse comportementale */}
                {behavioralAnalysis && (
                    <div className="mt-6 bg-amber-50 p-5 rounded-lg border border-amber-100">
                        <h4 className="font-medium text-amber-800 mb-3">
                            {language === 'fr' ? 'Analyse de vos réponses' : 'تحليل إجاباتك'}
                        </h4>

                        <div className="grid grid-cols-2 gap-4">

                            {behavioralAnalysis.careerAmbition !== undefined && (
                                <div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'fr' ? 'Niveau d\'ambition' : 'مستوى الطموح'}
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {behavioralAnalysis.careerAmbition}%
                                    </div>
                                </div>
                            )}

                            {behavioralAnalysis.realismRate !== undefined && (
                                <div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'fr' ? 'Taux de réalisme' : 'معدل الواقعية'}
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {behavioralAnalysis.realismRate}%
                                    </div>
                                </div>
                            )}
                        </div>

                        {behavioralAnalysis.preferredSector && (
                            <div className="mt-4 pt-4 border-t border-amber-200">
                                <div className="text-sm text-gray-600">
                                    {language === 'fr' ? 'Secteur préféré' : 'القطاع المفضل'}
                                </div>
                                <div className="font-medium text-gray-900 mt-1">
                                    {behavioralAnalysis.preferredSector.sector}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Statistiques globales */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">
                                {language === 'fr' ? 'Métiers évalués' : 'المهن المقيمة'}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                                {Object.keys(testData.careerAttractions || {}).length}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">
                                {language === 'fr' ? 'Secteurs explorés' : 'القطاعات المستكشفة'}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                                {Object.keys(testData.sectorScores || {}).length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderConstraintsResults = () => {
        console.log("Données de contraintes reçues :", testData);

        // Extraire les données pertinentes de manière flexible
        const data = testData.stepData.constraints;

        // Récupérer les données principales
        const mobilityProfile = data.mobilityProfile || {};
        const budgetProfile = data.budgetProfile || {};
        const educationProfile = data.educationProfile || {};
        const topPriorities = data.topPriorities || [];
        const behavioralAnalysis = data.behavioralAnalysis || {};

        // Créer les objets de contraintes basés sur les profils
        const mobilityData = {
            city: mobilityProfile.geographic || '',
            country: mobilityProfile.studyAbroad || '',
            international: mobilityProfile.international || ''
        };

        const budgetData = {
            annualBudget: budgetProfile.budgetLevel || '',
            scholarshipEligible: budgetProfile.scholarshipStatus || '',
            familySupport: budgetProfile.familySupport || ''
        };

        const educationData = {
            maxLevel: educationProfile.ambitionLevel || '',
            preferredDuration: educationProfile.timeCommitment || '',
            studyMode: educationProfile.studyStyle || ''
        };

        // Extraire les priorités à partir de topPriorities
        const priorities = topPriorities.reduce((acc, item) => {
            acc[item.priority] = item.score;
            return acc;
        }, {} as Record<string, number>);

        // Traduction des options
        const constraintLabels = {
            fr: {
                mobility: {
                    title: "Mobilité géographique",
                    city: {
                        label: "Changer de ville",
                        stayInCity: "Rester dans ma ville",
                        stayInRegion: "Dans ma région",
                        stayInCountry: "Partout au Maroc"
                    },
                    country: {
                        label: "Étudier à l'étranger",
                        onlyMorocco: "Uniquement au Maroc",
                        onlyFrance: "France uniquement",
                        europe: "Europe",
                        anywhere: "Partout dans le monde"
                    },
                    international: {
                        label: "Carrière internationale",
                        careerMorocco: "Carrière au Maroc",
                        maybe: "Pourquoi pas",
                        yesInternational: "Carrière internationale"
                    }
                },
                budget: {
                    title: "Contraintes financières",
                    annualBudget: {
                        label: "Budget annuel disponible",
                        budgetLow: "Moins de 20 000 MAD",
                        budgetMedium: "20 000 - 50 000 MAD",
                        budgetHigh: "50 000 - 100 000 MAD",
                        budgetVeryHigh: "Plus de 100 000 MAD"
                    },
                    scholarshipEligible: {
                        label: "Éligible aux bourses",
                        yes: "Oui",
                        no: "Non",
                        unsure: "Pas sûr(e)"
                    },
                    familySupport: {
                        label: "Soutien familial",
                        supportFull: "Soutien financier complet",
                        supportPartial: "Soutien partiel",
                        supportMoral: "Soutien moral uniquement",
                        supportNone: "Autonomie complète"
                    }
                },
                education: {
                    title: "Préférences d'études",
                    maxLevel: {
                        label: "Niveau maximum souhaité",
                        bacPlus2: "Bac+2 (DUT, BTS)",
                        bacPlus3: "Bac+3 (Licence)",
                        bacPlus5: "Bac+5 (Master, Ingénieur)",
                        bacPlus8: "Bac+8+ (Doctorat)"
                    },
                    preferredDuration: {
                        label: "Durée d'études préférée",
                        durationShort: "Courte (2-3 ans)",
                        durationMedium: "Moyenne (4-5 ans)",
                        durationLong: "Longue (6+ ans)"
                    },
                    studyMode: {
                        label: "Mode d'études",
                        fullTime: "Temps plein uniquement",
                        partTime: "Temps partiel possible",
                        alternance: "Alternance préférée",
                        distance: "Formation à distance"
                    }
                },
                priorities: {
                    title: "Priorités de carrière",
                    salary: "Salaire élevé",
                    stability: "Stabilité de l'emploi",
                    passion: "Passion pour le métier",
                    prestige: "Prestige social",
                    workLife: "Équilibre vie-travail"
                },
                profiles: {
                    ambitious_international: "Profil ambitieux international",
                    local_budget_conscious: "Profil local conscient du budget",
                    academically_ambitious: "Profil académiquement ambitieux",
                    internationally_minded: "Profil à orientation internationale",
                    financially_flexible: "Profil financièrement flexible",
                    balanced_profile: "Profil équilibré"
                }
            },
            ar: {
                mobility: {
                    title: "الحركية الجغرافية",
                    city: {
                        label: "تغيير المدينة",
                        stayInCity: "البقاء في مدينتي",
                        stayInRegion: "في منطقتي",
                        stayInCountry: "في أي مكان في المغرب"
                    },
                    country: {
                        label: "الدراسة في الخارج",
                        onlyMorocco: "في المغرب فقط",
                        onlyFrance: "فرنسا فقط",
                        europe: "أوروبا",
                        anywhere: "في أي مكان في العالم"
                    },
                    international: {
                        label: "مهنة دولية",
                        careerMorocco: "مهنة في المغرب",
                        maybe: "لِمَ لا",
                        yesInternational: "مهنة دولية"
                    }
                },
                budget: {
                    title: "القيود المالية",
                    annualBudget: {
                        label: "الميزانية السنوية المتاحة",
                        budgetLow: "أقل من 20,000 درهم",
                        budgetMedium: "20,000 - 50,000 درهم",
                        budgetHigh: "50,000 - 100,000 درهم",
                        budgetVeryHigh: "أكثر من 100,000 درهم"
                    },
                    scholarshipEligible: {
                        label: "مؤهل للمنح الدراسية",
                        yes: "نعم",
                        no: "لا",
                        unsure: "غير متأكد"
                    },
                    familySupport: {
                        label: "الدعم الأسري",
                        supportFull: "دعم مالي كامل",
                        supportPartial: "دعم جزئي",
                        supportMoral: "دعم معنوي فقط",
                        supportNone: "استقلالية كاملة"
                    }
                },
                education: {
                    title: "تفضيلات الدراسة",
                    maxLevel: {
                        label: "المستوى الأقصى المرغوب",
                        bacPlus2: "باك+2 (دبلوم تقني)",
                        bacPlus3: "باك+3 (إجازة)",
                        bacPlus5: "باك+5 (ماستر، مهندس)",
                        bacPlus8: "باك+8+ (دكتوراه)"
                    },
                    preferredDuration: {
                        label: "مدة الدراسة المفضلة",
                        durationShort: "قصيرة (2-3 سنوات)",
                        durationMedium: "متوسطة (4-5 سنوات)",
                        durationLong: "طويلة (6+ سنوات)"
                    },
                    studyMode: {
                        label: "نمط الدراسة",
                        fullTime: "وقت كامل فقط",
                        partTime: "وقت جزئي ممكن",
                        alternance: "تناوب مفضل",
                        distance: "تكوين عن بُعد"
                    }
                },
                priorities: {
                    title: "أولويات المهنة",
                    salary: "راتب عالي",
                    stability: "استقرار الوظيفة",
                    passion: "شغف بالمهنة",
                    prestige: "مكانة اجتماعية",
                    workLife: "توازن بين العمل والحياة"
                },
                profiles: {
                    ambitious_international: "ملف طموح دولي",
                    local_budget_conscious: "ملف محلي مدرك للميزانية",
                    academically_ambitious: "ملف طموح أكاديمياً",
                    internationally_minded: "ملف ذو توجه دولي",
                    financially_flexible: "ملف مرن مالياً",
                    balanced_profile: "ملف متوازن"
                }
            }
        };

        // Fonction helper pour obtenir les labels traduits
        const getLabel = (category: string, field: string, value: string) => {
            return constraintLabels[language]?.[category]?.[field]?.[value] || value;
        };

        return (
            <div className="space-y-6">
                {/* Résumé du profil */}
                {behavioralAnalysis.constraintProfile && (
                    <div className="bg-amber-50 rounded-lg p-5 border border-amber-200">
                        <h3 className="font-medium text-gray-900 mb-3">
                            {language === 'fr' ? 'Votre profil global' : 'ملفك الشامل'}
                        </h3>
                        <div className="text-xl font-bold text-amber-800 mb-2">
                            {constraintLabels[language]?.profiles?.[behavioralAnalysis.constraintProfile] || behavioralAnalysis.constraintProfile}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                                <div className="text-sm text-gray-600">
                                    {language === 'fr' ? 'Flexibilité géographique' : 'المرونة الجغرافية'}
                                </div>
                                <div className="flex items-center mt-1">
                                    <div className="text-lg font-bold text-gray-900 mr-2">
                                        {mobilityProfile.flexibilityScore}%
                                    </div>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-blue-600"
                                                style={{ width: `${mobilityProfile.flexibilityScore}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-600">
                                    {language === 'fr' ? 'Autonomie financière' : 'الاستقلالية المالية'}
                                </div>
                                <div className="flex items-center mt-1">
                                    <div className="text-lg font-bold text-gray-900 mr-2">
                                        {budgetProfile.financialAutonomy}%
                                    </div>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-green-600"
                                                style={{ width: `${budgetProfile.financialAutonomy}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-600">
                                    {language === 'fr' ? 'Ambition académique' : 'الطموح الأكاديمي'}
                                </div>
                                <div className="flex items-center mt-1">
                                    <div className="text-lg font-bold text-gray-900 mr-2">
                                        {educationProfile.academicAmbition}%
                                    </div>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-purple-600"
                                                style={{ width: `${educationProfile.academicAmbition}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobilité */}
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                    <h3 className="font-medium text-gray-900 mb-4">
                        {constraintLabels[language]?.mobility?.title || "Mobilité géographique"}
                    </h3>

                    <div className="space-y-4">
                        {Object.entries(mobilityData).map(([field, value]) => (
                            <div key={field} className="flex items-center justify-between">
                                <div className="text-gray-700">
                                    {constraintLabels[language]?.mobility?.[field]?.label || field}
                                </div>
                                <div className="font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
                                    {getLabel('mobility', field, value as string)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Budget */}
                <div className="bg-green-50 rounded-lg p-5 border border-green-100">
                    <h3 className="font-medium text-gray-900 mb-4">
                        {constraintLabels[language]?.budget?.title || "Contraintes financières"}
                    </h3>

                    <div className="space-y-4">
                        {Object.entries(budgetData).map(([field, value]) => (
                            <div key={field} className="flex items-center justify-between">
                                <div className="text-gray-700">
                                    {constraintLabels[language]?.budget?.[field]?.label || field}
                                </div>
                                <div className="font-medium bg-green-100 text-green-800 px-3 py-1 rounded-lg">
                                    {getLabel('budget', field, value as string)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Éducation */}
                <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                    <h3 className="font-medium text-gray-900 mb-4">
                        {constraintLabels[language]?.education?.title || "Préférences d'études"}
                    </h3>

                    <div className="space-y-4">
                        {Object.entries(educationData).map(([field, value]) => (
                            <div key={field} className="flex items-center justify-between">
                                <div className="text-gray-700">
                                    {constraintLabels[language]?.education?.[field]?.label || field}
                                </div>
                                <div className="font-medium bg-purple-100 text-purple-800 px-3 py-1 rounded-lg">
                                    {getLabel('education', field, value as string)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Priorités */}
                {Object.keys(priorities).length > 0 && (
                    <div>
                        <h3 className="font-medium text-gray-900 mb-4">
                            {constraintLabels[language]?.priorities?.title || "Priorités de carrière"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(priorities).map(([key, value]) => (
                                <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium text-gray-900">
                                            {constraintLabels[language]?.priorities?.[key] || key}
                                        </div>
                                        <div className="font-bold text-orange-600">
                                            {value}/5
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-orange-500"
                                            style={{ width: `${(value as number) * 20}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top priorités */}
                {topPriorities && topPriorities.length > 0 && (
                    <div className="bg-orange-50 p-5 rounded-lg border border-orange-100">
                        <h3 className="font-medium text-gray-900 mb-3">
                            {language === 'fr' ? 'Vos principales priorités' : 'أولوياتك الرئيسية'}
                        </h3>

                        <div className="space-y-3">
                            {topPriorities.map((priority, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 font-medium text-sm mr-3">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-gray-900 font-medium">
                                            {constraintLabels[language]?.priorities?.[priority.priority] || priority.priority}
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold text-orange-600">
                                        {priority.score}/5
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Statistiques globales */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">
                                {language === 'fr' ? 'Contraintes définies' : 'القيود المحددة'}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                                {Object.keys(mobilityData).length + Object.keys(budgetData).length + Object.keys(educationData).length}/9
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">
                                {language === 'fr' ? 'Priorités évaluées' : 'الأولويات المقيمة'}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                                {Object.keys(priorities).length}/5
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Remplacer la fonction renderLanguageResults existante

    const renderLanguageResults = () => {
        if (!testData?.overallScores) return null;

        // Récupérer les données principales
        const overallScores = testData.overallScores || {};
        const languageSkills = testData.languageSkills || {};
        const preferences = testData.preferences || {};
        const certificates = testData.certificates || {};
        const behavioralAnalysis = testData.behavioralAnalysis || {};
        const languageStrengths = testData.languageStrengths || [];
        const skillBalanceAnalysis = testData.skillBalanceAnalysis || [];

        // Traduction des compétences
        const skillLabels = {
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

        // Traduction des préférences
        const preferenceLabels = {
            fr: {
                preferredTeachingLanguage: "Langue d'enseignement préférée",
                comfortableStudyingIn: "Langues d'étude confortables",
                willingToImprove: "Langues à améliorer",
                ar: "Arabe",
                fr: "Français",
                en: "Anglais",
                mixed: "Bilingue (Arabe/Français)"
            },
            ar: {
                preferredTeachingLanguage: "لغة التدريس المفضلة",
                comfortableStudyingIn: "لغات الدراسة المريحة",
                willingToImprove: "اللغات المراد تحسينها",
                ar: "العربية",
                fr: "الفرنسية",
                en: "الإنجليزية",
                mixed: "ثنائية اللغة (عربية/فرنسية)"
            }
        };

        // Fonction pour obtenir le nom complet de la langue
        const getLanguageName = (code: string) => {
            const languageNames = {
                fr: {
                    ar: "Arabe",
                    fr: "Français",
                    en: "Anglais",
                    es: "Espagnol",
                    de: "Allemand",
                    it: "Italien",
                    zh: "Chinois",
                    ja: "Japonais",
                    pt: "Portugais",
                    ru: "Russe",
                    mixed: "Bilingue"
                },
                ar: {
                    ar: "العربية",
                    fr: "الفرنسية",
                    en: "الإنجليزية",
                    es: "الإسبانية",
                    de: "الألمانية",
                    it: "الإيطالية",
                    zh: "الصينية",
                    ja: "اليابانية",
                    pt: "البرتغالية",
                    ru: "الروسية",
                    mixed: "ثنائية اللغة"
                }
            };

            return languageNames[language][code] || code;
        };

        // Obtenir les langues triées par score
        const sortedLanguages = Object.entries(overallScores)
            .sort(([, a], [, b]) => (b as number) - (a as number));

        return (
            <div className="space-y-6">
                {/* Top langues maîtrisées */}
                <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3">
                        {language === 'fr' ? 'Vos compétences linguistiques' : 'مهاراتك اللغوية'}
                    </h3>

                    <div className="space-y-4">
                        {sortedLanguages.map(([langCode, score], index) => (
                            <div key={langCode} className={`rounded-lg p-4 ${index < 2 ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold text-gray-900 text-lg">{getLanguageName(langCode)}</div>
                                    <div className={`font-bold text-xl ${index < 2 ? 'text-indigo-600' : 'text-gray-600'}`}>
                                        {score}%
                                    </div>
                                </div>

                                {/* Compétences individuelles pour cette langue */}
                                {languageSkills[langCode] && (
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        {Object.entries(languageSkills[langCode]).map(([skill, level]) => (
                                            <div key={skill} className="bg-white rounded-md p-2 border border-gray-200">
                                                <div className="text-sm text-gray-500">
                                                    {skillLabels[language][skill]}
                                                </div>
                                                <div className="font-medium text-gray-900">
                                                    {level}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Certificat pour cette langue si disponible */}
                                {certificates[langCode]?.hasCertificate && (
                                    <div className="mt-3 bg-green-50 rounded-md p-2 border border-green-200">
                                        <div className="text-sm font-medium text-green-800">
                                            {language === 'fr' ? 'Certificat' : 'شهادة'}: {certificates[langCode].certificateName}
                                        </div>
                                        {certificates[langCode].score && certificates[langCode].total && (
                                            <div className="text-xs text-green-700">
                                                {certificates[langCode].score}/{certificates[langCode].total}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Préférences linguistiques */}
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                    <h3 className="font-medium text-gray-900 mb-4">
                        {language === 'fr' ? 'Préférences linguistiques' : 'التفضيلات اللغوية'}
                    </h3>

                    <div className="space-y-4">
                        {/* Langue d'enseignement préférée */}
                        <div className="flex justify-between items-center">
                            <div className="text-gray-700">
                                {preferenceLabels[language].preferredTeachingLanguage}
                            </div>
                            <div className="font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
                                {getLanguageName(preferences.preferredTeachingLanguage)}
                            </div>
                        </div>

                        {/* Langues d'étude confortables */}
                        <div>
                            <div className="text-gray-700 mb-2">
                                {preferenceLabels[language].comfortableStudyingIn}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {preferences.comfortableStudyingIn.map(lang => (
                                    <span key={lang} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm">
                                        {getLanguageName(lang)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Langues à améliorer */}
                        <div>
                            <div className="text-gray-700 mb-2">
                                {preferenceLabels[language].willingToImprove}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {preferences.willingToImprove.map(lang => (
                                    <span key={lang} className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm">
                                        {getLanguageName(lang)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analyse comportementale */}
                {behavioralAnalysis && (
                    <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                        <h3 className="font-medium text-amber-800 mb-4">
                            {language === 'fr' ? 'Analyse de votre profil linguistique' : 'تحليل ملفك اللغوي'}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {behavioralAnalysis.languageConfidence && (
                                <div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'fr' ? 'Confiance linguistique' : 'الثقة اللغوية'}
                                    </div>
                                    <div className="font-medium text-gray-900">
                                        {behavioralAnalysis.languageConfidence === 'high'
                                            ? (language === 'fr' ? 'Élevée' : 'عالية')
                                            : behavioralAnalysis.languageConfidence === 'moderate'
                                                ? (language === 'fr' ? 'Modérée' : 'متوسطة')
                                                : (language === 'fr' ? 'En développement' : 'قيد التطوير')}
                                    </div>
                                </div>
                            )}

                            {behavioralAnalysis.adaptabilityScore !== undefined && (
                                <div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'fr' ? 'Adaptabilité' : 'القدرة على التكيف'}
                                    </div>
                                    <div className="font-medium text-gray-900">
                                        {behavioralAnalysis.adaptabilityScore}%
                                    </div>
                                </div>
                            )}

                            {behavioralAnalysis.growthMindset !== undefined && (
                                <div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'fr' ? 'Mentalité de croissance' : 'عقلية النمو'}
                                    </div>
                                    <div className="font-medium text-gray-900">
                                        {behavioralAnalysis.growthMindset}%
                                    </div>
                                </div>
                            )}

                            {behavioralAnalysis.languageDiversityIndex !== undefined && (
                                <div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'fr' ? 'Diversité linguistique' : 'التنوع اللغوي'}
                                    </div>
                                    <div className="font-medium text-gray-900">
                                        {behavioralAnalysis.languageDiversityIndex}%
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Auto-évaluation */}
                        {behavioralAnalysis.selfAssessmentPattern && (
                            <div className="mt-4 pt-4 border-t border-amber-200">
                                <div className="text-sm text-gray-600">
                                    {language === 'fr' ? 'Modèle d\'auto-évaluation' : 'نمط التقييم الذاتي'}
                                </div>
                                <div className="font-medium text-gray-900 mt-1">
                                    {behavioralAnalysis.selfAssessmentPattern === 'quick_confident'
                                        ? (language === 'fr' ? 'Rapide et confiant' : 'سريع وواثق')
                                        : behavioralAnalysis.selfAssessmentPattern === 'very_reflective'
                                            ? (language === 'fr' ? 'Très réfléchi' : 'متأمل جداً')
                                            : (language === 'fr' ? 'Réfléchi' : 'متأمل')}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Forces et faiblesses */}
                {skillBalanceAnalysis.length > 0 && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-3">
                            {language === 'fr' ? 'Forces et opportunités' : 'نقاط القوة والفرص'}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {skillBalanceAnalysis.map((analysis, index) => (
                                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="font-medium text-gray-900 mb-2">
                                        {getLanguageName(analysis.language)}
                                    </div>

                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-gray-600">
                                            {language === 'fr' ? 'Point fort' : 'نقطة قوة'}:
                                        </span>
                                        <span className="text-green-600 font-medium">
                                            {skillLabels[language][analysis.strongestSkill.skill]}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">
                                            {language === 'fr' ? 'Opportunité' : 'فرصة للتحسين'}:
                                        </span>
                                        <span className="text-amber-600 font-medium">
                                            {skillLabels[language][analysis.weakestSkill.skill]}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Statistiques globales */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">
                                {language === 'fr' ? 'Langues maîtrisées' : 'اللغات المتقنة'}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                                {sortedLanguages.length}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">
                                {language === 'fr' ? 'Certificats obtenus' : 'الشهادات المحصل عليها'}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                                {Object.values(certificates).filter(cert => cert.hasCertificate).length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`space-y-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>

            <div className="text-center">

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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t[language].completed}</h2>
            </div>

            {/* Remarque sur la sauvegarde de progression */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <SaveIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                            {t[language].progressSaved}
                        </h3>
                        <p className="text-green-700 leading-relaxed">
                            {t[language].progressNote}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{desc}</p>

                <div className="border-t border-blue-200 pt-6 mt-2">
                    {renderTestSpecificContent()}
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Bouton Continuer */}
                <button
                    onClick={onContinue}
                    className={`inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform hover:scale-105 ${language === 'ar' ? 'flex-row-reverse' : ''
                        }`}
                >
                    <ArrowRightIcon className={`w-5 h-5 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
                    <span>{t[language].continue}</span>
                </button>

                {/* Bouton Retourner à la page principale */}
                {onReturnToMain && (
                    <button
                        onClick={onReturnToMain}
                        className={`inline-flex items-center justify-center px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200 border border-gray-300 ${language === 'ar' ? 'flex-row-reverse' : ''
                            }`}
                    >
                        <HomeIcon className={`w-5 h-5 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
                        <span>{t[language].returnToMain}</span>
                    </button>
                )}
            </div>

            {/* Note informative supplémentaire */}
            <div className="text-center">
                <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    {language === 'fr'
                        ? "Vos réponses sont automatiquement sauvegardées. Vous pouvez fermer cette fenêtre et revenir à tout moment pour reprendre votre test là où vous l'avez laissé."
                        : "يتم حفظ إجاباتك تلقائياً. يمكنك إغلاق هذه النافذة والعودة في أي وقت لاستكمال اختبارك من حيث توقفت."
                    }
                </p>
            </div>
        </div>
    );
};

export default TestResultSummary;