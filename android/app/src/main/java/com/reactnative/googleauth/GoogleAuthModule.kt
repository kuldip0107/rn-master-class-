package com.reactnative.googleauth

import android.accounts.AccountManager
import android.app.Activity
import android.content.Intent
import android.os.Build
import android.provider.ContactsContract
import android.util.Log
import com.facebook.react.bridge.*
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException

class GoogleAuthModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val NAME = "NativeGoogleAuth"
        private const val RC_GOOGLE_SIGN_IN = 9001
        private const val RC_ACCOUNT_CHOOSER = 9002
        private const val TAG = "NativeGoogleAuth"
    }

    private var pendingPromise: Promise? = null
    private var googleSignInClient: GoogleSignInClient? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = NAME

    private fun getClient(activity: Activity): GoogleSignInClient {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestProfile()
            .build()
        return GoogleSignIn.getClient(activity, gso)
    }

    @ReactMethod
    fun signIn(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is not available")
            return
        }

        // Cancel previous pending promise if any
        pendingPromise?.reject("CANCELLED", "Subsequent sign in initiated")
        pendingPromise = promise

        try {
            val client = getClient(activity)
            googleSignInClient = client

            // Sign out first to always present account chooser palette
            client.signOut().addOnCompleteListener {
                try {
                    val signInIntent = client.signInIntent
                    activity.startActivityForResult(signInIntent, RC_GOOGLE_SIGN_IN)
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to launch GoogleSignIn intent, falling back to AccountManager", e)
                    launchAccountChooser(activity)
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error initializing GoogleSignInClient, falling back to AccountManager", e)
            launchAccountChooser(activity)
        }
    }

    private fun launchAccountChooser(activity: Activity) {
        try {
            val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                AccountManager.newChooseAccountIntent(
                    null,
                    null,
                    arrayOf("com.google"),
                    null,
                    null,
                    null,
                    null
                )
            } else {
                @Suppress("DEPRECATION")
                AccountManager.newChooseAccountIntent(
                    null,
                    null,
                    arrayOf("com.google"),
                    false,
                    null,
                    null,
                    null,
                    null
                )
            }
            activity.startActivityForResult(intent, RC_ACCOUNT_CHOOSER)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch system AccountChooser", e)
            pendingPromise?.reject("ACCOUNT_CHOOSER_ERROR", e.message, e)
            pendingPromise = null
        }
    }

    @ReactMethod
    fun signOut(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.resolve(true)
            return
        }
        try {
            val client = getClient(activity)
            client.signOut().addOnCompleteListener {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun getCurrentUser(promise: Promise) {
        try {
            val account = GoogleSignIn.getLastSignedInAccount(reactContext)
            if (account != null) {
                val map = Arguments.createMap().apply {
                    putString("email", account.email)
                    putString("name", account.displayName ?: account.email?.substringBefore('@'))
                    putString("givenName", account.givenName)
                    putString("familyName", account.familyName)
                    putString("id", account.id)
                    putString("photoUrl", account.photoUrl?.toString())
                }
                promise.resolve(map)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.resolve(null)
        }
    }

    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        val promise = pendingPromise ?: return

        if (requestCode == RC_GOOGLE_SIGN_IN) {
            if (resultCode == Activity.RESULT_CANCELED) {
                promise.reject("SIGN_IN_CANCELLED", "User cancelled Google sign-in")
                pendingPromise = null
                return
            }

            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account: GoogleSignInAccount = task.getResult(ApiException::class.java)
                val map = Arguments.createMap().apply {
                    putString("email", account.email)
                    val resolvedName = account.displayName
                        ?: account.givenName
                        ?: account.email?.substringBefore('@')
                        ?: "Google User"
                    putString("name", resolvedName)
                    putString("givenName", account.givenName)
                    putString("familyName", account.familyName)
                    putString("id", account.id)
                    putString("photoUrl", account.photoUrl?.toString())
                    putString("idToken", account.idToken)
                    putString("source", "google_play_services")
                }
                pendingPromise = null
                promise.resolve(map)
            } catch (e: ApiException) {
                Log.w(TAG, "Google Play Services SignIn returned ApiException code ${e.statusCode}. Falling back to AccountManager chooser.", e)
                // Fall back to AccountManager so user still gets device account picker dialog!
                launchAccountChooser(activity)
            }
            return
        }

        if (requestCode == RC_ACCOUNT_CHOOSER) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                val accountName = data.getStringExtra(AccountManager.KEY_ACCOUNT_NAME)
                if (!accountName.isNullOrEmpty()) {
                    val resolvedName = resolveDisplayNameForAccount(accountName)
                    val photoUrl = resolvePhotoForAccount(accountName)
                    val map = Arguments.createMap().apply {
                        putString("email", accountName)
                        putString("name", resolvedName)
                        putString("photoUrl", photoUrl)
                        putString("id", accountName)
                        putString("source", "device_account_manager")
                    }
                    pendingPromise = null
                    promise.resolve(map)
                } else {
                    pendingPromise = null
                    promise.reject("NO_ACCOUNT_SELECTED", "No account was selected")
                }
            } else {
                pendingPromise = null
                promise.reject("SIGN_IN_CANCELLED", "User cancelled account selection")
            }
        }
    }

    private fun resolveDisplayNameForAccount(email: String): String {
        try {
            val cursor = reactContext.contentResolver.query(
                ContactsContract.Profile.CONTENT_URI,
                arrayOf(ContactsContract.Profile.DISPLAY_NAME),
                null,
                null,
                null
            )
            cursor?.use {
                if (it.moveToFirst()) {
                    val col = it.getColumnIndex(ContactsContract.Profile.DISPLAY_NAME)
                    if (col != -1) {
                        val name = it.getString(col)
                        if (!name.isNullOrBlank()) return name
                    }
                }
            }
        } catch (_: Exception) {}

        // Format clean name from email local part (e.g. kuldip.bharda or kuldipbharda0)
        val localPart = email.substringBefore('@')
        val words = localPart.split(Regex("[._\\d]+")).filter { it.isNotBlank() }
        return if (words.isNotEmpty()) {
            words.joinToString(" ") { it.replaceFirstChar(Char::uppercase) }
        } else {
            localPart.replaceFirstChar(Char::uppercase)
        }
    }

    private fun resolvePhotoForAccount(email: String): String? {
        try {
            val cursor = reactContext.contentResolver.query(
                ContactsContract.Profile.CONTENT_URI,
                arrayOf(ContactsContract.Profile.PHOTO_URI),
                null,
                null,
                null
            )
            cursor?.use {
                if (it.moveToFirst()) {
                    val col = it.getColumnIndex(ContactsContract.Profile.PHOTO_URI)
                    if (col != -1) {
                        val photoUri = it.getString(col)
                        if (!photoUri.isNullOrBlank()) return photoUri
                    }
                }
            }
        } catch (_: Exception) {}
        return null
    }

    override fun onNewIntent(intent: Intent) {}
}
