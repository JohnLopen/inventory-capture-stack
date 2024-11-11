package com.devion.pubplacement.id_scanner

import android.app.AlertDialog
import android.content.Context
import android.graphics.Bitmap
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import java.io.File
import java.io.IOException

class MrzUtil(
    private val context: Context,
) {
    private var mainExecutor = ContextCompat.getMainExecutor(context)

//    fun processBitmap(bitmap: InputImage, callback: (String) -> Unit): String? {
//        try {
////            val cropped = calculateCutoutRect(bitmap)
////            BitmapHelper.saveInputImageToGallery(context, bitmap)
//
//            scanMRZ(bitmap) {
//                callback(it)
//            }
//        } catch (e: Exception) {
//            println(e.message ?: "An unknown error occurred.")
//        }
//        return null
//    }

    private fun removeNonPrintableChars(input: String): String {
        return input.replace("\\s".toRegex(), "")
            .replace(" ", "")
    }

    fun processImage(image: InputImage, callback: (String) -> Unit) {
        try {
            // Initialize the text recognizer
            val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

            // Process the image
            recognizer.process(image)
                .addOnSuccessListener { result ->
                    // Extract the recognized text
                    val sb = StringBuilder()
                    // Track the number of MRZ lines extracted
                    var lineCount = 0
                    val mrzLines = mutableListOf<String>()
                    for (block in result.textBlocks) {
                        for (line in block.lines) {
                            println("\n\nchecking\n")
//                            println("orig line.text: ${line.text}")
                            val text = removeNonPrintableChars(line.text.trim())
//                            println("\ntrimmed line.text: $text")
                            // Check if the line matches the TD1 or TD3 format
                            when (text.length) {
                                30 -> {
                                    // TD1 format line
                                    mrzLines.add(text)
                                    lineCount++
                                }
                                44 -> {
                                    // TD3 format line
                                    mrzLines.add(text)
                                    lineCount++
                                }
                            }
                        }
                    }
                    // Validate the number of lines to determine if the MRZ is valid
                    println("Final line count: $lineCount")
                    if (lineCount in 2..3) {
                        mrzLines.forEach { sb.append(it).append("\n") }
                    }
                    callback(sb.toString().trim())
                }
                .addOnFailureListener { e ->
                    // Handle any errors
                    println("MRZ Scan Error:" + e.message)
                    callback("")
                }
        } catch (e: Exception) {
            println("MRZ Scan Error:" + e.message)
            callback("")
        }
    }

    private fun extractMRZ(input: String): String {
        return try {
            val lines = input.split("\n")
            val mrzLength = lines.last().length
            val mrzLines = lines.takeLastWhile { it.length == mrzLength }
            mrzLines.joinToString("\n")
        } catch (e: Exception) {
            showErrorDialog("MRZ Extraction Error", e.message ?: "An unknown error occurred.")
            ""
        }
    }

    private fun getFileFromAssets(context: Context, fileName: String = "ocrb.traineddata"): File {
        return try {
            val directory = File(context.cacheDir, "tessdata/")
            directory.mkdir()
            File(directory, fileName)
                .also { file ->
                    file.outputStream().use { cache ->
                        context.assets.open(fileName).use { stream ->
                            stream.copyTo(cache)
                        }
                    }
                }
        } catch (e: IOException) {
            showErrorDialog("File Error", e.message ?: "An error occurred while accessing assets.")
            throw e
        }
    }

    fun calculateCutoutRect(bitmap: Bitmap, cropToMRZ: Boolean = true): Bitmap {
        return try {
            val documentFrameRatio = 1.42 // Passport's size (ISO/IEC 7810 ID-3) is 125mm × 88mm
            val width: Double
            val height: Double

            if (bitmap.height > bitmap.width) {
                width = bitmap.width * 0.9 // Fill 90% of the width
                height = width / documentFrameRatio
            } else {
                height = bitmap.height * 0.75 // Fill 75% of the height
                width = height * documentFrameRatio
            }

            val mrzZoneOffset = if (cropToMRZ) height * 0.58 else 0.toDouble()
            val topOffset = (bitmap.height - height) / 2 + mrzZoneOffset
            val leftOffset = (bitmap.width - width) / 2

            Bitmap.createBitmap(bitmap, leftOffset.toInt(), topOffset.toInt(), width.toInt(), (height - mrzZoneOffset).toInt())
        } catch (e: Exception) {
            showErrorDialog("Cutout Error", e.message ?: "An unknown error occurred.")
            throw e
        }
    }

    private fun showErrorDialog(title: String, message: String) {
        mainExecutor.execute {
            AlertDialog.Builder(context)
                .setTitle(title)
                .setMessage(message)
                .setPositiveButton("OK", null)
                .show()
        }
    }
}
