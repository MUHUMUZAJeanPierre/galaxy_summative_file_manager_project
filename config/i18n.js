const i18n = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');

i18n
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'es', 'fr', 'ar'],
        preload: ['en', 'es', 'fr', 'ar'],
        ns: ['translation'],
        defaultNS: 'translation',
        backend: {
            loadPath: path.join(__dirname, '../locale/{{lng}}/{{ns}}.json'),
        },
        detection: {
            order: ['querystring', 'cookie', 'header'],
            caches: ['cookie'],
        },
        debug: true,
    });

module.exports = i18n;