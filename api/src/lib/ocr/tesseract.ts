import Tesseract from 'tesseract.js';
import sharp from 'sharp';

/**
 * Preprocesses an image to enhance text clarity.
 * @param filePath - Path to the image file.
 * @returns Buffer of the preprocessed image.
 */
async function preprocessImage(filePath: string): Promise<Buffer> {
    return sharp(filePath)
        .resize({ width: 1200 })             // Resize for consistent OCR input size
        .grayscale()                         // Convert to grayscale
        .threshold(110)                      // Apply binary thresholding
        .sharpen({ sigma: 1.0 })             // Apply sharpening
        .toBuffer();
}

/**
 * Extracts text from an image using Tesseract.js.
 * @param filePath - Path to the image file.
 * @returns Extracted text from the image.
 */
export const extractTextFromImage = async (filePath: string): Promise<string> => {
    try {
        const preprocessedImageBuffer = await preprocessImage(filePath);

        // Run OCR with Tesseract
        const { data: { text } } = await Tesseract.recognize(preprocessedImageBuffer, 'eng', {
            logger: m => console.log(`Progress: ${Math.round(m.progress * 100)}%`)
        });

        return text;
    } catch (error) {
        console.error('Error processing the image:', error);
        throw error;
    }
}