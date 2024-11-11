package com.devion.pubplacement.id_scanner

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.camera.core.ImageProxy
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.io.OutputStream
import java.nio.ByteBuffer
import java.util.UUID

class BitmapHelper {
    companion object {
        fun imageProxyToBitmap(image: ImageProxy): Bitmap {
            val buffer: ByteBuffer = image.planes[0].buffer
            val bytes = ByteArray(buffer.remaining())
            buffer.get(bytes)

            val yuvImage = YuvImage(
                bytes,
                ImageFormat.NV21,
                image.width,
                image.height,
                null
            )

            val outputStream = ByteArrayOutputStream()
            yuvImage.compressToJpeg(
                Rect(0, 0, image.width, image.height),
                100,
                outputStream
            )
            val jpegData = outputStream.toByteArray()
            return BitmapFactory.decodeByteArray(jpegData, 0, jpegData.size)
        }

        fun saveImageToGallery(context: Context, bitmap: Bitmap): Boolean {
            val randomTitle = UUID.randomUUID().toString() + ".jpg"

            return try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    // Android 10 (API level 29) and higher
                    val contentValues = ContentValues().apply {
                        put(MediaStore.Images.Media.DISPLAY_NAME, randomTitle)
                        put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
                        put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/MyApp")
                    }
                    val resolver = context.contentResolver
                    val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)

                    uri?.let {
                        val outputStream: OutputStream? = resolver.openOutputStream(it)
                        outputStream?.use { stream ->
                            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, stream)
                        }
                        true
                    } ?: false
                } else {
                    // For Android 9 (Pie) and lower
                    val directory = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
                    val file = java.io.File(directory, randomTitle)
                    val outputStream = file.outputStream()
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
                    outputStream.flush()
                    outputStream.close()
                    true
                }
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }

        fun saveBitmapToGallery(context: Context, bitmap: Bitmap): Boolean {
            // Generate a random title using UUID
            val randomTitle = UUID.randomUUID().toString() + ".jpg"

            val values = ContentValues().apply {
                put(MediaStore.Images.Media.DISPLAY_NAME, randomTitle)
                put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
                put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES)
            }

            val uri =
                context.contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
            uri?.let {
                context.contentResolver.openOutputStream(uri).use { outputStream ->
                    outputStream?.let { stream ->
                        bitmap.compress(Bitmap.CompressFormat.JPEG, 100, stream)
                        stream.flush()
                        return true
                    }
                }
            }
            return false
        }

        fun bitmapToJpegBytes(bitmap: Bitmap): ByteArray? {
            val outputStream = ByteArrayOutputStream()
            try {
                // Compress the bitmap to JPEG format
                bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
                // Write the compressed image to file
                return outputStream.toByteArray()
            } catch (e: IOException) {
                e.printStackTrace()
            } finally {
                try {
                    outputStream.close()
                } catch (e: IOException) {
                    e.printStackTrace()
                }
            }
            return null
        }
    }
}