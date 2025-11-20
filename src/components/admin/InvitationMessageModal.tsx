import React, { useState } from 'react';
import { XIcon, CopyIcon, MessageCircleIcon, CheckIcon } from 'lucide-react';
import type { AdminUser } from '../../types/admin';

interface InvitationMessageModalProps {
    user: AdminUser;
    onClose: () => void;
}

const InvitationMessageModal: React.FC<InvitationMessageModalProps> = ({ user, onClose }) => {
    const [copied, setCopied] = useState(false);

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
    const password = user.passwordPlain || 'NON DISPONIBLE';
    const hasPassword = !!user.passwordPlain;

    const invitationMessage = `Bonjour,

Nous avons le plaisir de vous inviter au Forum National de la Smart Orientation - 1ere Edition qui se tiendra le 04 decembre 2025 a l'Hotel Palm Plaza, Marrakech.

Voici vos identifiants pour passer le test :
Email: ${user.email}
Mot de passe: ${hasPassword ? password : '[MOT DE PASSE NON DISPONIBLE - Veuillez contacter l\'administrateur]'}

Lien de connexion : event.e-tawjihi.ma

Etapes :
1. Connectez-vous sur event.e-tawjihi.ma
2. Passez le test au complet
3. Telechargez votre QR code d'invitation obligatoire pour votre checkIN

En cas de probleme merci de nous contacter sur ce WhatsApp : wa.me/212655690632`;

    // Message formaté pour WhatsApp avec astérisques
    const whatsappMessage = `*Bonjour,*

Nous avons le plaisir de vous inviter au *Forum National de la Smart Orientation - 1ere Edition* qui se tiendra le *04 decembre 2025* a l'*Hotel Palm Plaza, Marrakech*.

Voici vos identifiants pour passer le test :
*Email:* ${user.email}
*Mot de passe:* ${hasPassword ? password : '[MOT DE PASSE NON DISPONIBLE - Veuillez contacter l\'administrateur]'}

*Lien de connexion :* event.e-tawjihi.ma

*Etapes :*
1. Connectez-vous sur event.e-tawjihi.ma
2. Passez le test au complet
3. Telechargez votre QR code d'invitation obligatoire pour votre checkIN

En cas de probleme merci de nous contacter sur ce WhatsApp : wa.me/212655690632`;

    const handleCopy = () => {
        navigator.clipboard.writeText(invitationMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenWhatsApp = () => {
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative mx-auto p-4 sm:p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Message d'Invitation</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        Message d'invitation pour <strong>{userName}</strong> ({user.email})
                    </p>
                    {!hasPassword && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-yellow-800">
                                ⚠️ <strong>Attention :</strong> Le mot de passe n'est pas disponible pour cet utilisateur. 
                                Veuillez modifier l'utilisateur et définir un nouveau mot de passe pour générer le message d'invitation complet.
                            </p>
                        </div>
                    )}
                </div>

                {/* Bloc de code avec le message */}
                <div className="mb-4">
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-700">Message d'invitation</label>
                            <button
                                onClick={handleCopy}
                                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {copied ? (
                                    <>
                                        <CheckIcon className="h-4 w-4" />
                                        <span>Copié!</span>
                                    </>
                                ) : (
                                    <>
                                        <CopyIcon className="h-4 w-4" />
                                        <span>Copier</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto max-h-96 overflow-y-auto">
                            {invitationMessage}
                        </pre>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                        onClick={handleOpenWhatsApp}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <MessageCircleIcon className="h-5 w-5" />
                        <span>Ouvrir dans WhatsApp</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvitationMessageModal;

