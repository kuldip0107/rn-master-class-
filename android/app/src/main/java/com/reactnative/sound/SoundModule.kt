package com.reactnative.sound

import android.content.Context
import android.media.AudioManager
import android.media.RingtoneManager
import android.media.ToneGenerator
import android.os.Build
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SoundModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "SoundModule"
    }

    private val audioManager: AudioManager by lazy {
        reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    }

    private var toneGenerator: ToneGenerator? = null

    init {
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 80)
        } catch (e: Exception) {
            toneGenerator = null
        }
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun playClick() {
        try {
            audioManager.playSoundEffect(AudioManager.FX_KEY_CLICK)
        } catch (e: Exception) {
            toneGenerator?.startTone(ToneGenerator.TONE_PROP_BEEP, 35)
        }
    }

    @ReactMethod
    fun playSuccess() {
        try {
            toneGenerator?.startTone(ToneGenerator.TONE_PROP_ACK, 120)
        } catch (e: Exception) {
            playNotification()
        }
    }

    @ReactMethod
    fun playError() {
        try {
            toneGenerator?.startTone(ToneGenerator.TONE_PROP_NACK, 180)
        } catch (e: Exception) {}
    }

    @ReactMethod
    fun playChime() {
        try {
            toneGenerator?.startTone(ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD, 160)
        } catch (e: Exception) {
            playNotification()
        }
    }

    @ReactMethod
    fun playNotification() {
        try {
            val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            val ringtone = RingtoneManager.getRingtone(reactContext, uri)
            ringtone?.play()
        } catch (e: Exception) {}
    }

    @ReactMethod
    fun isAvailable(promise: Promise) {
        promise.resolve(true)
    }
}
