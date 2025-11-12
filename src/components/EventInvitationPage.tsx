import React, { useState, useEffect } from 'react';
import { DownloadIcon, CalendarIcon, MapPinIcon, ClockIcon, CheckCircleIcon, SparklesIcon, UsersIcon, TrophyIcon, PhoneIcon, MailIcon, QrCodeIcon } from 'lucide-react';
import { apiClient } from '../config/api';
import EventInvitationCard from './EventInvitationCard';

interface EventInvitationPageProps {
    userId?: number;
    userEmail?: string;
    userName?: string;
    onDownloadQr?: () => void;
}

const EventInvitationPage: React.FC<EventInvitationPageProps> = ({ userId, userEmail, userName }) => {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQrCode = async () => {
            setLoading(true);
            setError(null);
            try {
                // Utiliser l'endpoint pour utilisateurs normaux
                const response = await apiClient.get('/auth/my-qr-code');
                if (response.data.success) {
                    setQrCode(response.data.data.qrCode);
                }
            } catch (err: any) {
                console.error('Erreur lors de la récupération du QR code:', err);
                setError('Impossible de charger le QR code');
            } finally {
                setLoading(false);
            }
        };

        fetchQrCode();
    }, []);

    const handleDownloadQrCode = async () => {
        setLoading(true);
        try {
            // Utiliser l'endpoint pour utilisateurs normaux
            const response = await apiClient.get('/auth/my-qr-code-pdf', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            const fileName = userName 
                ? `invitation-${userName.replace(/\s+/g, '-').toLowerCase()}.pdf`
                : `invitation-${userEmail?.split('@')[0] || 'user'}.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur lors du téléchargement du QR code:', error);
            alert('Erreur lors du téléchargement du QR code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header avec logo E-Tawjihi */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                        <div className="flex items-center justify-center">
                            <img
                                src="https://cdn.e-tawjihi.ma/logo-rectantgle-simple-nobg.png"
                                alt="E-Tawjihi"
                                className="h-24 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-auto object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Header avec félicitations */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-4 sm:mb-6 shadow-lg">
                        <CheckCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Félicitations ! 🎉
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 font-medium">
                        Vous avez complété le test d'orientation avec succès
                    </p>
                    <p className="text-base sm:text-lg text-gray-600 mt-2 sm:mt-3">
                        Vous êtes invité à l'événement
                    </p>
                    
                    {/* Bouton télécharger QR Code - En haut */}
                    <div className="mt-6 sm:mt-8">
                        <button
                            onClick={handleDownloadQrCode}
                            disabled={loading || !qrCode}
                            className="inline-flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <QrCodeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Télécharger le QR Code d'Invitation</span>
                            <DownloadIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        {error && (
                            <p className="text-red-600 text-sm mt-2">{error}</p>
                        )}
                    </div>
                </div>

                {/* Carte principale de l'événement */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 sm:mb-8">
                    {/* En-tête avec gradient E-Tawjihi */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-white">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                            <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
                                Forum National de la Smart Orientation
                            </h2>
                        </div>
                        <p className="text-center text-base sm:text-lg lg:text-xl opacity-95">
                            1ʳᵉ Édition
                        </p>
                    </div>

                    {/* Contenu principal */}
                    <div className="p-4 sm:p-6 lg:p-8">
                        {/* Introduction */}
                        <div className="mb-6 sm:mb-8">
                            <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-center">
                                Nous avons le plaisir de vous inviter au premier <strong>Forum National de la Smart Orientation</strong>, 
                                un événement pionnier qui révolutionne l'approche de l'orientation scolaire au Maroc. 
                                Participez à une expérience pédagogique exceptionnelle, dans un cadre innovant où la technologie, 
                                l'immersion et l'accompagnement humain transforment l'orientation traditionnelle.
                            </p>
                        </div>

                        {/* Date et lieu */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-100">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                                <div className="flex items-center text-blue-700">
                                    <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm sm:text-base font-medium">Date</p>
                                        <p className="text-base sm:text-lg font-bold">04 décembre 2025</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-indigo-700">
                                    <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm sm:text-base font-medium">Lieu</p>
                                        <p className="text-base sm:text-lg font-bold">Hôtel Palm Plaza, Marrakech</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-sm sm:text-base text-gray-600 mt-4 font-medium">
                                Un événement d'orientation neutre, pédagogique et immersif !
                            </p>
                        </div>

                        {/* Programme */}
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                                <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                                Programme d'Événement
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                {[
                                    { time: '09h00 - 09h45', event: 'Accueil & Enregistrement' },
                                    { time: '09h45 - 11h30', event: 'Cérémonie d\'Ouverture & Échanges Médias' },
                                    { time: '11h30 - 12h15', event: 'Le Labyrinthe des métiers' },
                                    { time: '12h15 - 13h45', event: 'Orientation Groupée' },
                                    { time: '13h45 - 14h15', event: 'Pause Déjeuner & Networking' },
                                    { time: '14h15 - 15h00', event: 'Espaces Photos & Immersion VR' },
                                    { time: '15h00 - 16h00', event: 'Remerciements, Tombola & Cadeaux' }
                                ].map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-500">
                                        <span className="text-sm sm:text-base font-bold text-blue-600 mb-1 sm:mb-0 sm:mr-4 sm:w-32 flex-shrink-0">
                                            {item.time}
                                        </span>
                                        <span className="text-sm sm:text-base text-gray-700 flex-1">
                                            {item.event}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Innovation */}
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                                <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                                Innovation Révolutionnaire
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                                    <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">100%</div>
                                    <div className="text-base sm:text-lg font-bold text-gray-900 mb-2">Neutre</div>
                                    <p className="text-sm sm:text-base text-gray-600">
                                        Premier forum d'orientation sans intérêt commercial, centré uniquement sur l'accompagnement pédagogique des élèves marocains.
                                    </p>
                                </div>
                                <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 border border-indigo-200">
                                    <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">VR</div>
                                    <div className="text-base sm:text-lg font-bold text-gray-900 mb-2">Technologie Immersive</div>
                                    <p className="text-sm sm:text-base text-gray-600">
                                        Labyrinthe expérientiel, réalité virtuelle pour visites de campus, et tests d'orientation détaillés.
                                    </p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                                    <div className="flex items-center mb-2">
                                        <UsersIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2" />
                                        <div className="text-3xl sm:text-4xl font-bold text-blue-600">72</div>
                                    </div>
                                    <div className="text-base sm:text-lg font-bold text-gray-900 mb-2">Impact National</div>
                                    <p className="text-sm sm:text-base text-gray-600">
                                        72 élèves participants, modèle pilote pour expansion nationale en 2026.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Citation */}
                        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border-l-4 border-blue-500">
                            <p className="text-base sm:text-lg lg:text-xl italic text-gray-800 text-center font-medium">
                                « L'orientation du futur se vit, elle ne se raconte pas. Une approche révolutionnaire alliant immersion, technologie et accompagnement humain. »
                            </p>
                        </div>

                        {/* Organisateur */}
                        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                            <p className="text-sm sm:text-base text-gray-700 text-center">
                                Organisé par <strong className="text-blue-600">E-TAWJIHI</strong> - Acteur de référence avec 
                                <strong className="text-indigo-600"> 200 000 utilisateurs actifs</strong> et 
                                <strong className="text-blue-600"> 1 000 élèves orientés en présentiel</strong> en 2025.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="bg-white border-2 border-blue-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                            <p className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4 text-center">
                                Merci de confirmer votre présence à l'adresse suivante :
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                                <a 
                                    href="mailto:contact@e-tawjihi.ma" 
                                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <MailIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    <span className="text-sm sm:text-base">contact@e-tawjihi.ma</span>
                                </a>
                                <a 
                                    href="tel:+212655690632" 
                                    className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    <span className="text-sm sm:text-base">+212 6 55 69 06 32</span>
                                </a>
                            </div>
                        </div>

                        {/* Bouton télécharger QR Code */}
                        <div className="text-center">
                            <button
                                onClick={handleDownloadQrCode}
                                disabled={loading || !qrCode}
                                className="inline-flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <QrCodeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span>Télécharger le QR Code d'Invitation</span>
                                <DownloadIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            {error && (
                                <p className="text-red-600 text-sm mt-2">{error}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Carte d'invitation avec QR Code */}
                {qrCode && (
                    <div className="mb-6 sm:mb-8">
                        <EventInvitationCard 
                            qrCode={qrCode}
                            userName={userName}
                            userEmail={userEmail}
                        />
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-sm sm:text-base text-gray-600">
                    <p className="font-bold text-gray-800 mb-2">E-TAWJIHI - ORIENTATION IA</p>
                    <p>100% Maroc, 100% Orientation</p>
                </div>
            </div>
        </div>
    );
};

export default EventInvitationPage;

