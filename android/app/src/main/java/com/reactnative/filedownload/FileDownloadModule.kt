package com.reactnative.filedownload

import android.app.DownloadManager
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream

class FileDownloadModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "NativeFileDownloader"
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun saveToDownloads(sourceFilePath: String, customFileName: String, promise: Promise) {
        try {
            val sourceFile = File(sourceFilePath)
            if (!sourceFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "Source file does not exist at $sourceFilePath")
                return
            }

            val finalFileName = if (customFileName.endsWith(".pdf", ignoreCase = true)) {
                customFileName
            } else {
                "$customFileName.pdf"
            }

            var savedPath = ""
            var contentUri: Uri? = null

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10+ (API 29+): MediaStore.Downloads scoped storage
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, finalFileName)
                    put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }

                val resolver = reactContext.contentResolver
                val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                    ?: throw Exception("Failed to create MediaStore entry in Downloads")

                resolver.openOutputStream(uri)?.use { outputStream ->
                    FileInputStream(sourceFile).use { inputStream ->
                        inputStream.copyTo(outputStream)
                    }
                }

                contentValues.clear()
                contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
                resolver.update(uri, contentValues, null, null)

                contentUri = uri
                savedPath = "${Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)}/$finalFileName"
            } else {
                // Android 9 and lower: Public Downloads directory
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                if (!downloadsDir.exists()) {
                    downloadsDir.mkdirs()
                }
                val destFile = File(downloadsDir, finalFileName)
                FileInputStream(sourceFile).use { input ->
                    FileOutputStream(destFile).use { output ->
                        input.copyTo(output)
                    }
                }
                savedPath = destFile.absolutePath

                android.media.MediaScannerConnection.scanFile(
                    reactContext,
                    arrayOf(destFile.absolutePath),
                    arrayOf("application/pdf"),
                    null
                )
            }

            // Register with DownloadManager so user sees download completion status
            try {
                val dm = reactContext.getSystemService(Context.DOWNLOAD_SERVICE) as? DownloadManager
                dm?.addCompletedDownload(
                    finalFileName,
                    "Certificate of Completion",
                    true,
                    "application/pdf",
                    savedPath,
                    sourceFile.length(),
                    true
                )
            } catch (_: Exception) {}

            val result = Arguments.createMap().apply {
                putBoolean("success", true)
                putString("filePath", savedPath)
                putString("fileName", finalFileName)
                putString("sourcePath", sourceFile.absolutePath)
                if (contentUri != null) {
                    putString("uri", contentUri.toString())
                }
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("SAVE_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun openFile(filePath: String, promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current Activity is not available")
            return
        }

        try {
            val file = File(filePath)
            val uri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                FileProvider.getUriForFile(
                    reactContext,
                    "${reactContext.packageName}.provider",
                    file
                )
            } else {
                Uri.fromFile(file)
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/pdf")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            activity.startActivity(Intent.createChooser(intent, "Open Certificate PDF"))
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("OPEN_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun shareFile(filePath: String, promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current Activity is not available")
            return
        }

        try {
            val file = File(filePath)
            val uri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                FileProvider.getUriForFile(
                    reactContext,
                    "${reactContext.packageName}.provider",
                    file
                )
            } else {
                Uri.fromFile(file)
            }

            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            activity.startActivity(Intent.createChooser(intent, "Share Certificate PDF"))
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SHARE_FAILED", e.message, e)
        }
    }
}
