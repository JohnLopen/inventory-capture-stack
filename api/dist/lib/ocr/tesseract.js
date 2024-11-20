"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromImage = void 0;
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const sharp_1 = __importDefault(require("sharp"));
/**
 * Preprocesses an image to enhance text clarity.
 * @param filePath - Path to the image file.
 * @returns Buffer of the preprocessed image.
 */
async function preprocessImage(filePath) {
    return (0, sharp_1.default)(filePath)
        .resize({ width: 1200 }) // Resize for consistent OCR input size
        .grayscale() // Convert to grayscale
        .threshold(110) // Apply binary thresholding
        .sharpen({ sigma: 1.0 }) // Apply sharpening
        .toBuffer();
}
/**
 * Extracts text from an image using Tesseract.js.
 * @param filePath - Path to the image file.
 * @returns Extracted text from the image.
 */
const extractTextFromImage = async (filePath) => {
    try {
        const preprocessedImageBuffer = await preprocessImage(filePath);
        // Run OCR with Tesseract
        const { data: { text } } = await tesseract_js_1.default.recognize(preprocessedImageBuffer, 'eng', {
            logger: m => console.log(`Progress: ${Math.round(m.progress * 100)}%`)
        });
        return text;
    }
    catch (error) {
        console.error('Error processing the image:', error);
        throw error;
    }
};
exports.extractTextFromImage = extractTextFromImage;
