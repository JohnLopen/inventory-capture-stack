"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageDimensions = exports.rotateImageInPlace = void 0;
const node_path_1 = __importDefault(require("node:path"));
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
/**
 * Rotates an image by 90 degrees clockwise or counterclockwise and overwrites the original file.
 * @param imagePath - Path to the image to be rotated.
 * @param clockwise - Whether to rotate the image clockwise. If false, rotates counterclockwise.
 */
const rotateImageInPlace = async (imagePath, clockwise = true) => {
    try {
        const angle = clockwise ? 90 : -90;
        // Create a temporary file path for the rotated image
        const tempPath = node_path_1.default.join(node_path_1.default.dirname(imagePath), `temp_${node_path_1.default.basename(imagePath)}`);
        // Rotate and save to the temporary file
        await (0, sharp_1.default)(imagePath)
            .rotate(angle)
            .toFile(tempPath);
        // Overwrite the original file with the temporary file
        fs_1.default.renameSync(tempPath, imagePath);
        console.log(`Image rotated ${clockwise ? "clockwise" : "counterclockwise"} and saved to the same file.`);
    }
    catch (error) {
        console.error("Error rotating image:", error);
    }
};
exports.rotateImageInPlace = rotateImageInPlace;
/**
 * Get the image dimension (width, height)
 * @param imagePath
 * @returns
 */
const getImageDimensions = async (imagePath) => {
    try {
        const { width, height } = await (0, sharp_1.default)(imagePath).metadata();
        console.log(`Width: ${width}, Height: ${height}`);
        return { width, height };
    }
    catch (err) {
        console.error('Error reading image dimensions:', err);
    }
};
exports.getImageDimensions = getImageDimensions;
