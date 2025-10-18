import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: t('language.english'), nativeName: 'English' },
    { code: 'hi', name: t('language.hindi'), nativeName: 'हिन्दी' },
    { code: 'te', name: t('language.telugu'), nativeName: 'తెలుగు' },
    { code: 'ta', name: t('language.tamil'), nativeName: 'தமிழ்' },
    { code: 'bn', name: t('language.bengali'), nativeName: 'বাংলা' },
    { code: 'mr', name: t('language.marathi'), nativeName: 'मराठी' },
    { code: 'gu', name: t('language.gujarati'), nativeName: 'ગુજરાતી' },
    { code: 'kn', name: t('language.kannada'), nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: t('language.malayalam'), nativeName: 'മലയാളം' },
    { code: 'pa', name: t('language.punjabi'), nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: t('language.odia'), nativeName: 'ଓଡ଼ିଆ' },
    { code: 'as', name: t('language.assamese'), nativeName: 'অসমীয়া' },
    { code: 'ne', name: t('language.nepali'), nativeName: 'नेपाली' },
    { code: 'ur', name: t('language.urdu'), nativeName: 'اردو' },
    { code: 'sa', name: t('language.sanskrit'), nativeName: 'संस्कृतम्' },
    { code: 'sd', name: t('language.sindhi'), nativeName: 'سنڌي' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                {t('language.selectLanguage')}
              </div>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    i18n.language === language.code
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{language.nativeName}</span>
                    <span className="text-xs text-gray-500">{language.name}</span>
                  </div>
                  {i18n.language === language.code && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
