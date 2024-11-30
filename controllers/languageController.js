// file: controllers/languageController.js
const switchLanguage = (req, res) => {
    const { language } = req.body;

    // List of supported languages
    const supportedLanguages = ['en', 'fr', 'es', 'ar'];

    // Validate language
    if (!supportedLanguages.includes(language)) {
        return res.status(400).json({
            message: 'Invalid language selected',
            supportedLanguages: supportedLanguages
        });
    }

    // Change language
    req.i18n.changeLanguage(language);

    // Set language cookie
    res.cookie('lang', language, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true
    });

    res.json({
        message: 'Language switched successfully',
        currentLanguage: language
    });
};

module.exports = { switchLanguage };