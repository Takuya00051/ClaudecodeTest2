package com.namek.pageturner

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.VolumeProvider
import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.os.Build
import android.os.IBinder

/**
 * Bluetooth接続を保持し、アプリが裏にいても音量ボタンを拾うための常駐サービス。
 * MediaSession をリモート再生扱いにすると、音量ボタンが端末音量ではなくこのセッションに届く。
 */
class PageTurnService : Service() {

    private var session: MediaSession? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startInForeground()
        HidKeyboard.start(this)
        session = createVolumeSession()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
        }
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        session?.release()
        session = null
        HidKeyboard.stop()
        super.onDestroy()
    }

    private fun createVolumeSession(): MediaSession {
        val volume = object : VolumeProvider(VOLUME_CONTROL_RELATIVE, 100, 50) {
            override fun onAdjustVolume(direction: Int) {
                when {
                    direction > 0 -> PageTurner.next(this@PageTurnService)
                    direction < 0 -> PageTurner.prev(this@PageTurnService)
                }
            }
        }
        return MediaSession(this, "PageTurner").apply {
            setPlaybackToRemote(volume)
            setPlaybackState(
                PlaybackState.Builder()
                    .setState(PlaybackState.STATE_PLAYING, 0, 1f)
                    .build(),
            )
            isActive = true
        }
    }

    private fun startInForeground() {
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "ページめくり", NotificationManager.IMPORTANCE_LOW),
        )
        val open = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE,
        )
        val stop = PendingIntent.getService(
            this, 1, Intent(this, PageTurnService::class.java).setAction(ACTION_STOP),
            PendingIntent.FLAG_IMMUTABLE,
        )
        val notification = Notification.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_page)
            .setContentTitle("Page Turner 動作中")
            .setContentText("音量＋で次へ ／ 音量−で戻る")
            .setContentIntent(open)
            .addAction(Notification.Action.Builder(null, "終了", stop).build())
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    companion object {
        const val ACTION_STOP = "com.namek.pageturner.STOP"
        private const val CHANNEL_ID = "page_turner"
        private const val NOTIFICATION_ID = 1
    }
}
