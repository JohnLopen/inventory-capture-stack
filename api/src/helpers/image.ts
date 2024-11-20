import path from "node:path";
import sharp from "sharp";
import fs from 'fs'

/**
 * Rotates an image by 90 degrees clockwise or counterclockwise and overwrites the original file.
 * @param imagePath - Path to the image to be rotated.
 * @param clockwise - Whether to rotate the image clockwise. If false, rotates counterclockwise.
 */
export const rotateImageInPlace = async (imagePath: string, clockwise: boolean = true): Promise<void> => {
    try {
        const angle = clockwise ? 90 : -90;

        // Create a temporary file path for the rotated image
        const tempPath = path.join(path.dirname(imagePath), `temp_${path.basename(imagePath)}`);

        // Rotate and save to the temporary file
        await sharp(imagePath)
            .rotate(angle)
            .toFile(tempPath);

        // Overwrite the original file with the temporary file
        fs.renameSync(tempPath, imagePath);

        console.log(`Image rotated ${clockwise ? "clockwise" : "counterclockwise"} and saved to the same file.`);
    } catch (error) {
        console.error("Error rotating image:", error);
    }
}

/**
 * Get the image dimension (width, height)
 * @param imagePath 
 * @returns 
 */
export const getImageDimensions = async (imagePath: string) => {
    try {
        const { width, height } = await sharp(imagePath).metadata();
        console.log(`Width: ${width}, Height: ${height}`);
        return { width, height };
    } catch (err) {
        console.error('Error reading image dimensions:', err);
    }
};
