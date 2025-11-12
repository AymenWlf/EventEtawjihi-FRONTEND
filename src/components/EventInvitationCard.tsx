import React, { useEffect, useState } from 'react';
import { CalendarIcon, MapPinIcon, QrCodeIcon, SparklesIcon } from 'lucide-react';

interface EventInvitationCardProps {
    qrCode: string;
    userName?: string;
    userEmail?: string;
}

const EventInvitationCard: React.FC<EventInvitationCardProps> = ({ qrCode, userName, userEmail }) => {
    const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

    useEffect(() => {
        // Générer l'image du QR code à partir du texte
        const generateQrCodeImage = async () => {
            try {
                // Utiliser une API de génération de QR code ou une bibliothèque
                // Pour l'instant, on va utiliser qrcode.js ou une API en ligne
                // Utiliser une taille plus grande pour faciliter le scan
                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrCode)}&margin=2`;
                setQrCodeImage(qrCodeUrl);
            } catch (error) {
                console.error('Erreur lors de la génération du QR code:', error);
            }
        };

        generateQrCodeImage();
    }, [qrCode]);

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-200 print:shadow-none print:border-0">
            {/* Logo E-Tawjihi en haut */}
            <div className="text-center pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="flex items-center justify-center">
                    <img
                        src="https://cdn.e-tawjihi.ma/logo-rectantgle-simple-nobg.png"
                        alt="E-Tawjihi"
                        className="h-16 sm:h-20 md:h-24 w-auto object-contain"
                    />
                </div>
            </div>

            {/* En-tête avec gradient E-Tawjihi */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-white print:bg-blue-600 print:py-6">
                <div className="flex items-center justify-center mb-2">
                    <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 print:hidden" />
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center">
                        Carte d'Invitation
                    </h2>
                </div>
                <p className="text-center text-sm sm:text-base opacity-95">
                    Forum National de la Smart Orientation - 1ʳᵉ Édition
                </p>
            </div>

            {/* Contenu */}
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Informations de l'invité */}
                <div className="mb-6 sm:mb-8 text-center">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {userName || userEmail?.split('@')[0] || 'Invité'}
                    </h3>
                    {userEmail && (
                        <p className="text-sm sm:text-base text-gray-600">{userEmail}</p>
                    )}
                </div>

                {/* Date et lieu */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-center text-blue-700">
                            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0" />
                            <div className="text-left">
                                <p className="text-xs sm:text-sm font-medium">Date</p>
                                <p className="text-base sm:text-lg font-bold">04 décembre 2025</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center text-indigo-700">
                            <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0" />
                            <div className="text-left">
                                <p className="text-xs sm:text-sm font-medium">Lieu</p>
                                <p className="text-base sm:text-lg font-bold">Hôtel Palm Plaza, Marrakech</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR Code - Large pour le scan */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 mb-4 sm:mb-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center mb-4">
                            <QrCodeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mr-2" />
                            <p className="text-sm sm:text-base font-bold text-gray-700">
                                QR Code d'Invitation
                            </p>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Présentez ce QR code lors de l'enregistrement
                        </p>
                        {qrCodeImage ? (
                            <div className="flex justify-center">
                                <div className="bg-white p-4 sm:p-6 rounded-lg border-4 border-gray-300 shadow-lg">
                                    <img 
                                        src={qrCodeImage} 
                                        alt="QR Code d'invitation" 
                                        className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 border-4 border-gray-200 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <div className="text-center">
                                        <QrCodeIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500">Chargement du QR code...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-4 font-medium">
                            Code: {qrCode.substring(0, 20)}...
                        </p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-yellow-800 text-center font-medium">
                        ⚠️ Ce QR code est <strong>obligatoire</strong> pour le check-in à l'événement. 
                        Veuillez le télécharger et le présenter à votre arrivée.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                    <strong className="text-gray-800">E-TAWJIHI</strong> - ORIENTATION IA | 100% Maroc, 100% Orientation
                </p>
            </div>
        </div>
    );
};

export default EventInvitationCard;

