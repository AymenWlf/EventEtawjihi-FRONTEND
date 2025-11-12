import React, { useState } from 'react';
import { MailIcon, LockIcon, Loader2Icon, EyeIcon, EyeOffIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  language?: 'fr' | 'ar';
  isLoading?: boolean;
  error?: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, language = 'fr', isLoading = false, error = null }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const translations = {
    fr: {
      welcome: 'Bienvenue dans le système d\'orientation',
      forum: 'À l\'occasion de la 1ère édition du forum de la SMART ORIENTATION au Maroc',
      title: 'Connexion',
      subtitle: 'Connectez-vous pour accéder au test d\'orientation',
      emailLabel: 'Adresse email',
      emailPlaceholder: 'votre.email@exemple.com',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Entrez votre mot de passe',
      loginButton: 'Se connecter',
      loading: 'Connexion en cours...',
      emailRequired: 'L\'adresse email est requise',
      passwordRequired: 'Le mot de passe est requis',
      invalidEmail: 'Veuillez entrer une adresse email valide'
    },
    ar: {
      welcome: 'مرحباً بك في نظام التوجيه',
      forum: 'بمناسبة الطبعة الأولى من منتدى التوجيه الذكي في المغرب',
      title: 'تسجيل الدخول',
      subtitle: 'قم بتسجيل الدخول للوصول إلى اختبار التوجيه',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'بريدك.الإلكتروني@مثال.com',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      loginButton: 'تسجيل الدخول',
      loading: 'جاري تسجيل الدخول...',
      emailRequired: 'البريد الإلكتروني مطلوب',
      passwordRequired: 'كلمة المرور مطلوبة',
      invalidEmail: 'يرجى إدخال عنوان بريد إلكتروني صحيح'
    }
  };

  const t = translations[language];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!email.trim()) {
      setLocalError(t.emailRequired);
      return;
    }

    if (!validateEmail(email)) {
      setLocalError(t.invalidEmail);
      return;
    }

    if (!password.trim()) {
      setLocalError(t.passwordRequired);
      return;
    }

    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      // L'erreur sera gérée par le composant parent
      console.error('Erreur de connexion:', err);
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl">
        {/* Logo and Welcome Section */}
        <div className="text-center mb-8">
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
          
          {/* Welcome Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            {t.welcome}
          </h1>
          <p className="text-lg text-indigo-600 font-semibold mb-2">
            {t.forum}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 rounded-full p-2">
                <LockIcon className="w-6 h-6" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-1">{t.title}</h2>
            <p className="text-blue-100 text-sm">{t.subtitle}</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                  <span className="text-red-500">⚠</span>
                  <span>{displayError}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    disabled={isLoading}
                    className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      language === 'ar' ? 'text-right' : 'text-left'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    disabled={isLoading}
                    className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      language === 'ar' ? 'text-right' : 'text-left'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="w-5 h-5 animate-spin" />
                    <span>{t.loading}</span>
                  </>
                ) : (
                  <span>{t.loginButton}</span>
                )}
              </button>
            </form>

            {/* Info Note */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {language === 'ar' 
                  ? 'هذه صفحة تسجيل دخول تجريبية - الوظيفة الكاملة قادمة قريباً'
                  : 'Page de connexion de test - Fonctionnalité complète à venir'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

