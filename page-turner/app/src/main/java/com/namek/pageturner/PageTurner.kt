package com.namek.pageturner

import android.content.Context
import android.os.VibrationEffect
import android.os.VibratorManager
import android.os.Build
import android.os.Vibrator
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow

/** 「次へ／戻る」の実行と、ノールック用の振動フィードバック。 */
object PageTurner {

    /** true = 次へ, false = 戻る（画面のフラッシュ表示用） */
    private val _events = MutableSharedFlow<Boolean>(extraBufferCapacity = 8)
    val events: SharedFlow<Boolean> = _events

    fun next(ctx: Context) = turn(ctx, forward = true)

    fun prev(ctx: Context) = turn(ctx, forward = false)

    private fun turn(ctx: Context, forward: Boolean) {
        val dir = Prefs.direction(ctx)
        val ok = HidKeyboard.sendKey(if (forward) dir.next else dir.prev)
        when {
            !ok -> vibrate(ctx, VibrationEffect.createOneShot(400, VibrationEffect.DEFAULT_AMPLITUDE))
            // 次へ = 短く1回、戻る = 短く2回
            forward -> vibrate(ctx, VibrationEffect.createOneShot(30, VibrationEffect.DEFAULT_AMPLITUDE))
            else -> vibrate(ctx, VibrationEffect.createWaveform(longArrayOf(0, 30, 90, 30), -1))
        }
        if (ok) _events.tryEmit(forward)
    }

    private fun vibrate(ctx: Context, effect: VibrationEffect) {
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            ctx.getSystemService(VibratorManager::class.java)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            ctx.getSystemService(Vibrator::class.java)
        }
        vibrator?.vibrate(effect)
    }
}
