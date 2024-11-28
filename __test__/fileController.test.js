const File = require("../models/fileModel");
const {
    createFile,
    deleteFile,
    readFileById,
} = require("../controllers/fileController");

const { validateFile } = require("../utils/fileValidation");
const { checkIfFileExists } = require("../utils/fileUtils");
const { deleteFileFromSystem } = require("../utils/fileSystemUtils");

jest.mock("../models/fileModel");
jest.mock("../utils/fileValidation");
jest.mock("../utils/fileUtils");
jest.mock("../utils/fileSystemUtils");

describe("fileController", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createFile", () => {
        it("should return 400 if no file is uploaded", async () => {
            const req = { body: {}, file: null };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            await createFile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ error: "No file uploaded" });
        });

        it("should return 400 if fileName is missing", async () => {
            const req = { body: {}, file: {} };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            validateFile.mockReturnValue({ fileName: null });

            await createFile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ error: "fileName is required" });
        });

        it("should return 409 if a file with the same name exists", async () => {
            const req = {
                body: { fileName: "testFile" },
                file: { path: "path/to/file" }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            validateFile.mockReturnValue({ fileName: "testFile" });
            checkIfFileExists.mockResolvedValue(true);

            await createFile(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.send).toHaveBeenCalledWith({
                error: "A file with the same name already exists"
            });
        });

        it("should create and save the file if validation passes", async () => {
            const req = {
                body: { fileName: "testFile" },
                file: { path: "path/to/file" }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            // Mock the validation
            validateFile.mockReturnValue({ fileName: "testFile" });

            // Mock file existence check
            checkIfFileExists.mockResolvedValue(false);

            // Create a mock file instance that mimics Mongoose document
            const savedFile = {
                _id: "file123",
                fileName: "testFile",
                filePath: "path/to/file",
                createdAt: new Date(),
                save: jest.fn().mockResolvedValue(this)
            };

            // Mock the File constructor
            File.mockImplementation(() => ({
                ...savedFile,
                save: jest.fn().mockResolvedValue(savedFile)
            }));

            await createFile(req, res);

            // Verify File was instantiated with correct arguments
            expect(File).toHaveBeenCalledWith({
                fileName: "testFile",
                filePath: "path/to/file"
            });

            // Verify response
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({
                message: "File uploaded successfully",
                file: expect.objectContaining({
                    fileName: "testFile",
                    filePath: "path/to/file"
                })
            });
        });
    });

    describe("deleteFile", () => {
        it("should return 400 if id is missing", async () => {
            const req = { params: {} };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            await deleteFile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ error: "id is required" });
        });

        it("should return 404 if file metadata is not found", async () => {
            const req = { params: { id: "file123" } };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            File.findById.mockResolvedValue(null);

            await deleteFile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ error: "File metadata not found" });
        });

        it("should delete the file metadata and file from the system", async () => {
            const req = { params: { id: "file123" } };
            const res = {
                send: jest.fn()
            };

            const mockFile = {
                _id: "file123",
                filePath: "path/to/file",
                deleteOne: jest.fn().mockResolvedValue({})
            };

            File.findById.mockResolvedValue(mockFile);
            deleteFileFromSystem.mockResolvedValue();

            await deleteFile(req, res);

            expect(deleteFileFromSystem).toHaveBeenCalledWith("path/to/file");
            expect(mockFile.deleteOne).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith({
                file: mockFile,
                message: "File deleted successfully"
            });
        });
    });

    describe("readFileById", () => {
        it("should return 400 if id is missing", async () => {
            const req = { params: {} };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            await readFileById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ error: "ID is required" });
        });

        it("should return 404 if file is not found", async () => {
            const req = { params: { id: "file123" } };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            File.findById.mockResolvedValue(null);

            await readFileById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ error: "File not found" });
        });

        it("should return file metadata if file is found", async () => {
            const req = { params: { id: "file123" } };
            const res = {
                send: jest.fn()
            };

            const mockFile = { _id: "file123", fileName: "testFile", filePath: "path/to/file" };
            File.findById.mockResolvedValue(mockFile);

            await readFileById(req, res);

            expect(res.send).toHaveBeenCalledWith({
                message: "File retrieved by id successfully",
                file: mockFile
            });
        });
    });
});