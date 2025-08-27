// context/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const LanguageContext = createContext();

// Translations
const translations = {
    en: {
        settings: "Settings",
        appearance: "Appearance",
        preferences: "Preferences",
        data: "Data",
        darkMode: "Dark Mode",
        fontSize: "Font Size",
        notifications: "Notifications",
        language: "Language",
        clearCache: "Clear Cache",
        resetSettings: "Reset Settings",
        chooseFontSize: "Choose Font Size",
        selectLanguage: "Select Language",
        cacheCleared: "Cache cleared successfully",
        settingsReset: "Settings restored to default",
        enabled: "Enabled",
        disabled: "Disabled",
        notificationsOn: "Notifications turned on",
        notificationsOff: "Notifications turned off",
        fontSizeSet: "Font size set to",
        languageSet: "Language set to",
        appVersion: "Learn A Word App v1.0.0",
        builtWithLove: "Built with ❤️ for language learners",
    },
    hi: {
        settings: "सेटिंग्स",
        appearance: "रूप",
        preferences: "वरीयताएं",
        data: "डेटा",
        darkMode: "डार्क मोड",
        fontSize: "फ़ॉन्ट आकार",
        notifications: "सूचनाएं",
        language: "भाषा",
        clearCache: "कैशे साफ़ करें",
        resetSettings: "सेटिंग्स रीसेट करें",
        chooseFontSize: "फ़ॉन्ट आकार चुनें",
        selectLanguage: "भाषा चुनें",
        cacheCleared: "कैशे सफलतापूर्वक साफ़ हो गया",
        settingsReset: "सेटिंग्स डिफ़ॉल्ट पर वापस आ गईं",
        enabled: "सक्षम",
        disabled: "अक्षम",
        notificationsOn: "सूचनाएं चालू हो गईं",
        notificationsOff: "सूचनाएं बंद हो गईं",
        fontSizeSet: "फ़ॉन्ट आकार सेट किया गया",
        languageSet: "भाषा सेट की गई",
        appVersion: "लर्न अ वर्ड ऐप v1.0.0",
        builtWithLove: "भाषा सीखने वालों के लिए ❤️ के साथ बनाया गया",
    },
    te: {
        settings: "సెట్టింగ్స్",
        appearance: "రూపు",
        preferences: "ప్రాధాన్యతలు",
        data: "డేటా",
        darkMode: "డార్క్ మోడ్",
        fontSize: "ఫాంట్ పరిమాణం",
        notifications: "నోటిఫికేషన్లు",
        language: "భాష",
        clearCache: "క్యాచ్ తొలగించు",
        resetSettings: "సెట్టింగ్లను రీసెట్ చేయి",
        chooseFontSize: "ఫాంట్ పరిమాణాన్ని ఎంచుకోండి",
        selectLanguage: "భాషను ఎంచుకోండి",
        cacheCleared: "క్యాచ్ విజయవంతంగా తొలగించబడింది",
        settingsReset: "సెట్టింగ్లు డిఫాల్ట్‌కు మార్చబడ్డాయి",
        enabled: "సక్రియం",
        disabled: "నిలిపివేయబడింది",
        notificationsOn: "నోటిఫికేషన్లు ఆన్ చేయబడ్డాయి",
        notificationsOff: "నోటిఫికేషన్లు ఆఫ్ చేయబడ్డాయి",
        fontSizeSet: "ఫాంట్ పరిమాణం సెట్ చేయబడింది",
        languageSet: "భాష సెట్ చేయబడింది",
        appVersion: "లెర్న్ ఎ వర్డ్ యాప్ v1.0.0",
        builtWithLove: "భాషా అభ్యాసకుల కోసం ❤️ తో నిర్మించబడింది",
    },
    es: {
        settings: "Configuración",
        appearance: "Apariencia",
        preferences: "Preferencias",
        data: "Datos",
        darkMode: "Modo oscuro",
        fontSize: "Tamaño de fuente",
        notifications: "Notificaciones",
        language: "Idioma",
        clearCache: "Borrar caché",
        resetSettings: "Restablecer configuración",
        chooseFontSize: "Elegir tamaño de fuente",
        selectLanguage: "Seleccionar idioma",
        cacheCleared: "Caché borrado exitosamente",
        settingsReset: "Configuración restablecida a los valores predeterminados",
        enabled: "Habilitado",
        disabled: "Deshabilitado",
        notificationsOn: "Notificaciones activadas",
        notificationsOff: "Notificaciones desactivadas",
        fontSizeSet: "Tamaño de fuente establecido en",
        languageSet: "Idioma establecido en",
        appVersion: "Learn A Word App v1.0.0",
        builtWithLove: "Construido con ❤️ para estudiantes de idiomas",
    },
    fr: {
        settings: "Paramètres",
        appearance: "Apparence",
        preferences: "Préférences",
        data: "Données",
        darkMode: "Mode sombre",
        fontSize: "Taille de police",
        notifications: "Notifications",
        language: "Langue",
        clearCache: "Effacer le cache",
        resetSettings: "Réinitialiser les paramètres",
        chooseFontSize: "Choisir la taille de police",
        selectLanguage: "Sélectionner la langue",
        cacheCleared: "Cache effacé avec succès",
        settingsReset: "Paramètres restaurés aux valeurs par défaut",
        enabled: "Activé",
        disabled: "Désactivé",
        notificationsOn: "Notifications activées",
        notificationsOff: "Notifications désactivées",
        fontSizeSet: "Taille de police définie sur",
        languageSet: "Langue définie sur",
        appVersion: "Learn A Word App v1.0.0",
        builtWithLove: "Construit avec ❤️ pour les apprenants de langues",
    },
};

const i18n = new I18n(translations);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState("en");

    useEffect(() => {
        const loadLanguage = async () => {
            const stored = await AsyncStorage.getItem("language");
            if (stored) {
                setLanguage(stored);
                i18n.locale = stored;
            } else {
                // Set default language based on device locale
                const deviceLanguage = Localization.locale.split('-')[0];
                if (translations[deviceLanguage]) {
                    setLanguage(deviceLanguage);
                    i18n.locale = deviceLanguage;
                } else {
                    setLanguage("en");
                    i18n.locale = "en";
                }
            }
        };
        loadLanguage();
    }, []);

    const changeLanguage = async (lang) => {
        setLanguage(lang);
        i18n.locale = lang;
        await AsyncStorage.setItem("language", lang);
    };

    const translate = (key, options = {}) => {
        return i18n.t(key, options);
    };

    return (
        <LanguageContext.Provider
            value={{ language, changeLanguage, translate }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);