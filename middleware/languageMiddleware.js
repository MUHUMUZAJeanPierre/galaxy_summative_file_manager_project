// file: middleware/languageMiddleware.js
const i18next = require('i18next');

const languageMiddleware = (req, res, next) => {
    // Priority for language detection:
    // 1. Query parameter (highest priority)
    // 2. Accept-Language header
    // 3. Fallback to default (English)

    let language = req.query.lang ||
        req.acceptsLanguages(['en', 'fr', 'es', 'ar']) ||
        'en';

    // Ensure the language is supported
    const supportedLanguages = ['en', 'fr', 'es', 'ar'];
    language = supportedLanguages.includes(language) ? language : 'en';

    // Set the language for the current request
    req.i18n.changeLanguage(language);

    // Optional: Set a cookie to remember language preference
    res.cookie('lang', language, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true
    });

    next();
};

module.exports = languageMiddleware;