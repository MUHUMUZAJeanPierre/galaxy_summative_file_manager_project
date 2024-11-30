const { switchLanguage } = require('../controllers/languageController');

describe('switchLanguage', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            i18n: {
                changeLanguage: jest.fn(),
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };
    });

    it('should return 400 if the language is unsupported', () => {
        req.body.language = 'de'; // Unsupported language

        switchLanguage(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Invalid language selected',
            supportedLanguages: ['en', 'fr', 'es', 'ar'],
        });
    });

    it('should switch language, set cookie, and return success message', () => {
        req.body.language = 'fr'; // Supported language

        switchLanguage(req, res);

        expect(req.i18n.changeLanguage).toHaveBeenCalledWith('fr');
        expect(res.cookie).toHaveBeenCalledWith('lang', 'fr', {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        });
        expect(res.json).toHaveBeenCalledWith({
            message: 'Language switched successfully',
            currentLanguage: 'fr',
        });
    });
});
