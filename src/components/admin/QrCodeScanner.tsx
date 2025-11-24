import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { XIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { scanQrCode, type QrScanResponse } from '../../config/api';
import { getRiasecColors, type RiasecType } from '../../utils/riasecColors';

interface QrCodeScannerProps {
    onClose: () => void;
    onScan: (qrCode: string) => void;
    onUserScanned: (user: any) => void;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onClose, onScan, onUserScanned }) => {
    const [scanning, setScanning] = useState(false);
    const [scannedData, setScannedData] = useState<QrScanResponse['data'] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isProcessingRef = useRef(false);
    const lastScannedQrRef = useRef<string | null>(null);
    const lastScanTimeRef = useRef<number>(0);
    const scannerId = 'qr-reader';
    const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fonction pour jouer un son de succès
    const playSuccessSound = () => {
        try {
            // Créer un contexte audio
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Fréquence de succès (trois tons montants: Do-Mi-Sol)
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // Do
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // Mi
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // Sol

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Impossible de jouer le son:', error);
        }
    };

    // Fonction pour vibrer le téléphone
    const vibratePhone = () => {
        try {
            // Vibration: 200ms, pause 100ms, vibration 200ms
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
        } catch (error) {
            console.log('Vibration non disponible:', error);
        }
    };

    useEffect(() => {
        startScanning();
        return () => {
            // Nettoyer les timeouts
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
            stopScanning();
        };
    }, []);

    const startScanning = async () => {
        // Éviter de démarrer si déjà en cours ou en traitement
        if (scanning || isProcessingRef.current || scannerRef.current) {
            return;
        }

        try {
            setScanning(true);
            setError(null);
            
            const html5QrCode = new Html5Qrcode(scannerId);
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                async (decodedText) => {
                    // Éviter les scans multiples du même QR code
                    const now = Date.now();
                    const timeSinceLastScan = now - lastScanTimeRef.current;
                    
                    // Si c'est le même QR code et qu'on l'a scanné il y a moins de 3 secondes, ignorer
                    if (decodedText === lastScannedQrRef.current && timeSinceLastScan < 3000) {
                        return;
                    }

                    // Si on est déjà en train de traiter un scan, ignorer
                    if (isProcessingRef.current) {
                        return;
                    }

                    // Arrêter le scanner immédiatement pour éviter les scans multiples
                    try {
                        if (scannerRef.current) {
                            await scannerRef.current.stop();
                        }
                    } catch (err) {
                        // Ignorer les erreurs d'arrêt
                    }

                    // Marquer comme en traitement
                    isProcessingRef.current = true;
                    lastScannedQrRef.current = decodedText;
                    lastScanTimeRef.current = now;

                    // Traiter le scan
                    await handleScan(decodedText);
                },
                (errorMessage) => {
                    // Erreur de scan (normal, continue à scanner)
                }
            );
        } catch (err: any) {
            console.error('Erreur lors du démarrage du scanner:', err);
            setError('Impossible de démarrer le scanner. Vérifiez les permissions de la caméra.');
            setScanning(false);
            scannerRef.current = null;
        }
    };

    const stopScanning = async () => {
        // Nettoyer les timeouts
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }

        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                // Ignorer les erreurs d'arrêt (peut être déjà arrêté)
            }
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const handleScan = async (qrCode: string) => {
        setLoading(true);
        setError(null);

        try {
            // Appeler l'API pour scanner le QR code
            const response = await scanQrCode(qrCode);

            if (response.success) {
                // Jouer le son de succès et vibrer
                playSuccessSound();
                vibratePhone();
                
                setScannedData(response.data);
                onScan(qrCode);
                onUserScanned(response.data.user);
                
                // Redémarrer le scanner après 3 secondes
                restartTimeoutRef.current = setTimeout(() => {
                    setScannedData(null);
                    isProcessingRef.current = false;
                    startScanning();
                }, 3000);
            } else {
                setError('QR code invalide ou utilisateur non trouvé');
                // Redémarrer le scanner après 2 secondes
                restartTimeoutRef.current = setTimeout(() => {
                    isProcessingRef.current = false;
                    startScanning();
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Erreur lors du scan du QR code');
            // Redémarrer le scanner après 2 secondes
            restartTimeoutRef.current = setTimeout(() => {
                isProcessingRef.current = false;
                startScanning();
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const dominantColors = scannedData?.test.dominantProfile 
        ? getRiasecColors(scannedData.test.dominantProfile as RiasecType)
        : null;

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                <div className="relative mx-auto p-3 sm:p-4 lg:p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Scanner QR Code</h3>
                        <button
                            onClick={async () => {
                                await stopScanning();
                                onClose();
                            }}
                            className="text-gray-400 hover:text-gray-500 p-1"
                        >
                            <XIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    </div>

                    {/* Zone de scan */}
                    <div className="mb-3 sm:mb-4">
                        <div id={scannerId} className="w-full rounded-lg overflow-hidden bg-gray-100" style={{ minHeight: '250px' }}></div>
                    </div>

                {/* Message d'état */}
                {scanning && !loading && !scannedData && (
                    <div className="text-center py-4">
                        <p className="text-gray-600">Pointez la caméra vers le QR code</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Traitement...</p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center space-x-2">
                        <AlertCircleIcon className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Informations utilisateur scanné */}
                {scannedData && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <CheckCircleIcon className="h-6 w-6 text-green-600 mt-1" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-green-900 mb-2">Utilisateur scanné avec succès</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium">Code:</span>{' '}
                                        <span className="font-mono font-semibold text-blue-600">
                                            {scannedData.user.userCode || `ET-${String(scannedData.user.id).padStart(4, '0')}`}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Nom:</span>{' '}
                                        {scannedData.user.firstName} {scannedData.user.lastName}
                                    </div>
                                    <div>
                                        <span className="font-medium">Email:</span> {scannedData.user.email}
                                    </div>
                                    <div>
                                        <span className="font-medium">Test complété:</span>{' '}
                                        {scannedData.test.isCompleted ? (
                                            <span className="text-green-600">Oui</span>
                                        ) : (
                                            <span className="text-yellow-600">Non</span>
                                        )}
                                    </div>
                                    {scannedData.test.hasReport && (
                                        <div>
                                            <span className="font-medium">Rapport disponible:</span>{' '}
                                            <span className="text-green-600">Oui</span>
                                        </div>
                                    )}
                                    {dominantColors && (
                                        <div className="flex items-center space-x-2 mt-2">
                                            <span className="font-medium">Profil dominant:</span>
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                style={{ backgroundColor: dominantColors.color }}
                                            >
                                                {dominantColors.letter}
                                            </div>
                                            <span className="text-sm">{dominantColors.name.fr}</span>
                                        </div>
                                    )}
                                    <div className="mt-2 pt-2 border-t border-green-200">
                                        <span className="font-medium text-green-700">Présence mise à jour: Présent</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={async () => {
                            await stopScanning();
                            onClose();
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QrCodeScanner;

