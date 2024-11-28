const fs = require('fs');
const { deleteFileFromSystem } = require('../utils/fileSystemUtils');

// Mock the `fs` module
jest.mock('fs');

describe('deleteFileFromSystem', () => {
    const mockFilePath = '/path/to/mock/file.txt';

    afterEach(() => {
        jest.clearAllMocks(); // Clear any mock calls after each test
    });

    test('should delete the file if it exists', () => {
        // Mock `fs.existsSync` to return true and `fs.unlinkSync` to be a mock function
        fs.existsSync.mockReturnValue(true);
        fs.unlinkSync = jest.fn();

        // Call the function
        deleteFileFromSystem(mockFilePath);

        // Assertions
        expect(fs.existsSync).toHaveBeenCalledWith(mockFilePath);
        expect(fs.unlinkSync).toHaveBeenCalledWith(mockFilePath);
    });

    test('should not delete the file if it does not exist', () => {
        // Mock `fs.existsSync` to return false
        fs.existsSync.mockReturnValue(false);

        // Call the function
        deleteFileFromSystem(mockFilePath);

        // Assertions
        expect(fs.existsSync).toHaveBeenCalledWith(mockFilePath);
        expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
});
