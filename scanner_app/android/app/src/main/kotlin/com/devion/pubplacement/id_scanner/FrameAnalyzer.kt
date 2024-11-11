package com.devion.pubplacement.id_scanner

import android.content.Context
import androidx.annotation.OptIn
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import io.flutter.plugin.common.EventChannel

class FrameAnalyzer(private val sink: EventChannel.EventSink?) : ImageAnalysis.Analyzer {
    lateinit var context: Context
    var docType: Int = 0

    @OptIn(ExperimentalGetImage::class)
    override fun analyze(imageProxy: ImageProxy) {
        // Access the image frame
        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            // Perform custom processing on the image frame
            val inputImage = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

            if(docType == 1) {
                println("Processing image for license id")
                val options = BarcodeScannerOptions.Builder()
                    .setBarcodeFormats(
                        Barcode.FORMAT_PDF417)
                    .build()
                val barcodeScanner = BarcodeScanning.getClient(options)

                barcodeScanner.process(inputImage)
                    .addOnSuccessListener { barcodes ->
                        if (barcodes.isNotEmpty()) {
                            // Send barcodes to Flutter via EventChannel
                            for (barcode in barcodes) {
                                val barcodeData = mutableMapOf<String, Any?>().apply {
                                    put("type", barcode.valueType)
                                    put("format", barcode.format)
                                    put("rawValue", barcode.rawValue)
                                    put("rawBytes", barcode.rawBytes)
                                    put("displayValue", barcode.displayValue)

                                    when (barcode.valueType) {
                                        Barcode.TYPE_DRIVER_LICENSE -> {
                                            put("addressCity", barcode.driverLicense?.addressCity)
                                            put("addressState", barcode.driverLicense?.addressState)
                                            put("addressZip", barcode.driverLicense?.addressZip)
                                            put("addressStreet", barcode.driverLicense?.addressStreet)
                                            put("issueDate", barcode.driverLicense?.issueDate)
                                            put("birthDate", barcode.driverLicense?.birthDate)
                                            put("expiryDate", barcode.driverLicense?.expiryDate)
                                            put("gender", barcode.driverLicense?.gender)
                                            put("licenseNumber", barcode.driverLicense?.licenseNumber)
                                            put("firstName", barcode.driverLicense?.firstName)
                                            put("lastName", barcode.driverLicense?.lastName)
                                            put("country", barcode.driverLicense?.issuingCountry)
                                        }
                                    }
                                }
                                val event = mapOf("name" to "barcode", "data" to barcodeData)
                                sink?.success(event)
                            }
                        }
                    }
                    .addOnFailureListener {
                        // Handle failure
                        println("Error while scanning: ${it.message}")
                        imageProxy.close()
                    }
                    .addOnCompleteListener {
                        // Close the image after processing is done
                        imageProxy.close()
                    }
            }
            else if(docType == 2) {
                val mrzUtil = MrzUtil(context)
                val bmp = BitmapUtils.getBitmap(imageProxy)
                if (bmp != null) {
                    val cropped = mrzUtil.calculateCutoutRect(bmp)
                    val image = InputImage.fromBitmap(cropped, imageProxy.imageInfo.rotationDegrees)
                    println("Processing image for MRZ")
                    // Check for MRZ
                    mrzUtil.processImage(image) {
                        if(it.isNotEmpty()) {
                            val event = mapOf("name" to "mrz", "data" to it)
                            sink?.success(event)
                        }
                        imageProxy.close()
                    }
                }
            }
            else {
                println("doc type unsupported")
                imageProxy.close()
            }
        } else {
            // Close the image if not processed
            imageProxy.close()
        }
    }
}
