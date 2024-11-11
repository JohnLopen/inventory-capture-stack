package com.devion.pubplacement.id_scanner.camerax

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.pm.PackageManager
import android.graphics.ImageFormat
import android.os.Environment
import android.view.Surface
import androidx.annotation.IntDef
import androidx.annotation.NonNull
import androidx.camera.core.AspectRatio
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.ImageCapture.Builder
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.mlkit.vision.MlKitAnalyzer
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.net.toUri
import androidx.lifecycle.LifecycleOwner
import com.devion.pubplacement.id_scanner.FrameAnalyzer
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.PluginRegistry
import io.flutter.view.TextureRegistry
import java.io.File
import java.text.SimpleDateFormat
import java.util.Locale

class CameraXHandler(private val activity: Activity, private val textureRegistry: TextureRegistry) :
    MethodChannel.MethodCallHandler, EventChannel.StreamHandler, PluginRegistry.RequestPermissionsResultListener {
    companion object {
        private const val REQUEST_CODE = 19930430
    }

    private var sink: EventChannel.EventSink? = null
    private var listener: PluginRegistry.RequestPermissionsResultListener? = null

    private var cameraProvider: ProcessCameraProvider? = null
    private var camera: Camera? = null
    private var textureEntry: TextureRegistry.SurfaceTextureEntry? = null
    private var imageCapture: ImageCapture? = null

    @AnalyzeMode
    private var analyzeMode: Int = AnalyzeMode.NONE

    override fun onMethodCall(@NonNull call: MethodCall, @NonNull result: MethodChannel.Result) {
        when (call.method) {
            "state" -> stateNative(result)
            "request" -> requestNative(result)
            "start" -> startNative(call, result)
            "torch" -> torchNative(call, result)
            "analyze" -> analyzeNative(call, result)
            "stop" -> stopNative(result)
            "capture" -> startCapture(result)
            else -> result.notImplemented()
        }
    }

    override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
        this.sink = events
    }

    override fun onCancel(arguments: Any?) {
        sink = null
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ): Boolean {
        return listener?.onRequestPermissionsResult(requestCode, permissions, grantResults) ?: false
    }

    private fun stateNative(result: MethodChannel.Result) {
        // Can't get exact denied or not_determined state without request. Just return not_determined when state isn't authorized
        val state =
            if (ContextCompat.checkSelfPermission(
                    activity,
                    Manifest.permission.CAMERA
                ) == PackageManager.PERMISSION_GRANTED
            ) 1
            else 0
        result.success(state)
    }

    private fun requestNative(result: MethodChannel.Result) {
        listener = PluginRegistry.RequestPermissionsResultListener { requestCode, _, grantResults ->
            if (requestCode != REQUEST_CODE) {
                false
            } else {
                val authorized = grantResults[0] == PackageManager.PERMISSION_GRANTED
                result.success(authorized)
                listener = null
                true
            }
        }
        val permissions = arrayOf(Manifest.permission.CAMERA)
        ActivityCompat.requestPermissions(activity, permissions, REQUEST_CODE)
    }

    @SuppressLint("RestrictedApi")
    private fun startNative(call: MethodCall, result: MethodChannel.Result) {
        // Initialize ImageCapture along with other use cases
        imageCapture = Builder()
            .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
            .build()

        val facingIndex = call.argument<Int>("facingIndex")
        val docType = call.argument<Int>("docType")

        val future = ProcessCameraProvider.getInstance(activity)
        val executor = ContextCompat.getMainExecutor(activity)
        future.addListener({
            cameraProvider = future.get()
            textureEntry = textureRegistry.createSurfaceTexture()
            val textureId = textureEntry!!.id()
            // Preview
            val surfaceProvider = Preview.SurfaceProvider { request ->
                val resolution = request.resolution
                val texture = textureEntry!!.surfaceTexture()
                texture.setDefaultBufferSize(resolution.width, resolution.height)
                val surface = Surface(texture)
                request.provideSurface(surface, executor) { }
            }
            val preview = Preview.Builder().build().apply { setSurfaceProvider(surfaceProvider) }

            // Initialize imageCapture here
            imageCapture = Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY)
                .setTargetAspectRatio(AspectRatio.RATIO_4_3)
                .setTargetRotation(activity.windowManager.defaultDisplay.rotation)
                .setBufferFormat(ImageFormat.YV12) // Explicitly set JPEG format
                .build()

            // Analyzer
            val analyzer: ImageAnalysis.Analyzer
            if(docType == 1) {
                println("Processing image for license id")
                val options = BarcodeScannerOptions.Builder()
                    .setBarcodeFormats(
                        Barcode.FORMAT_PDF417)
                    .build()
                val barcodeScanner = BarcodeScanning.getClient(options)
                val detectors = listOf(barcodeScanner)

                analyzer = MlKitAnalyzer(detectors, ImageAnalysis.COORDINATE_SYSTEM_ORIGINAL, executor) {
                    val barcodes = it.getValue(barcodeScanner)
                    if (barcodes.isNullOrEmpty()) {
                        return@MlKitAnalyzer
                    }

                    if (barcodes.isNotEmpty()) {
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
            }
            else {
                // Custom FrameAnalyzer for Mrz
                analyzer = FrameAnalyzer(sink)
                analyzer.context = activity
                if (docType != null) {
                    analyzer.docType = docType
                }
            }

            val analysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build().apply { setAnalyzer(executor, analyzer) }

            // Bind to lifecycle.
            val owner = activity as LifecycleOwner
            val selector =
                if (facingIndex == 0) CameraSelector.DEFAULT_FRONT_CAMERA
                else CameraSelector.DEFAULT_BACK_CAMERA
//            camera = cameraProvider!!.bindToLifecycle(owner, selector, preview, analysis)
            camera = cameraProvider!!.bindToLifecycle(owner, selector, preview, analysis, imageCapture)
            camera!!.cameraInfo.torchState.observe(owner) { state ->
                // TorchState.OFF = 0; TorchState.ON = 1
                val event = mapOf("name" to "torchState", "data" to state)
                sink?.success(event)
            }
            // TODO: seems there's not a better way to get the final resolution
            @SuppressLint("RestrictedApi")
            val resolution = preview.attachedSurfaceResolution!!
            val portrait = camera!!.cameraInfo.sensorRotationDegrees % 180 == 0
            val width = resolution.width.toDouble()
            val height = resolution.height.toDouble()
            val size = if (portrait) mapOf("width" to width, "height" to height) else mapOf(
                "width" to height,
                "height" to width
            )
            val answer = mapOf("textureId" to textureId, "size" to size, "torchable" to camera!!.torchable)
            result.success(answer)
        }, executor)
    }

    private fun torchNative(call: MethodCall, result: MethodChannel.Result) {
        val state = call.arguments == 1
        camera!!.cameraControl.enableTorch(state)
        result.success(null)
    }

    private fun analyzeNative(call: MethodCall, result: MethodChannel.Result) {
        analyzeMode = call.arguments as Int
        result.success(null)
    }

    private fun stopNative(result: MethodChannel.Result) {
        try {
            val owner = activity as LifecycleOwner
            camera!!.cameraInfo.torchState.removeObservers(owner)
            cameraProvider!!.unbindAll()
            textureEntry!!.release()
        }
        catch (_: Exception) {

        }

        analyzeMode = AnalyzeMode.NONE
        camera = null
        textureEntry = null
        cameraProvider = null

        result.success(null)
    }

    private fun startCapture(result: MethodChannel.Result) {
        if (imageCapture == null) {
            print("ImageCapture use case is not set up")
            result.error("UNAVAILABLE", "ImageCapture use case is not set up", null)
            return
        }

        // Create a file to save the image
        val outputDirectory = activity.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        print("outputDirectory: $outputDirectory")
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(System.currentTimeMillis())
        val photoFile = File(outputDirectory, "IMG_$timestamp.jpg")

        // Create output options object which contains the file + metadata
        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        // Set up image capture listener, which is triggered after photo has been taken
        imageCapture!!.takePicture(
            outputOptions,
            ContextCompat.getMainExecutor(activity),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(outputFileResults: ImageCapture.OutputFileResults) {
                    print("Image saved: $outputDirectory/${photoFile.toUri()}")
                    result.success("Image captured successfully")
                }

                override fun onError(exception: ImageCaptureException) {
                    print("Photo capture failed: ${exception.message}")
                    result.error("CAPTURE_FAILED", "Photo capture failed: ${exception.message}", null)
                }
            }
        )
    }

}

@IntDef(AnalyzeMode.NONE, AnalyzeMode.BARCODE)
@Target(AnnotationTarget.FIELD)
@Retention(AnnotationRetention.SOURCE)
annotation class AnalyzeMode {
    companion object {
        const val NONE = 0
        const val BARCODE = 1
    }
}
