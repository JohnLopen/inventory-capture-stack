package com.devion.pubplacement.id_scanner

import com.devion.pubplacement.id_scanner.camerax.CameraXHandler
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {

    private var handler: CameraXHandler? = null
    private var method: MethodChannel? = null
    private var event: EventChannel? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        handler = CameraXHandler(this, flutterEngine.renderer)

        method = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "yanshouwang.dev/camerax/method")
        event = EventChannel(flutterEngine.dartExecutor.binaryMessenger, "yanshouwang.dev/camerax/event")

        method?.setMethodCallHandler(handler)
        event?.setStreamHandler(handler)
    }

    override fun onDestroy() {
        super.onDestroy()
        method?.setMethodCallHandler(null)
        event?.setStreamHandler(null)
        handler = null
    }
}
