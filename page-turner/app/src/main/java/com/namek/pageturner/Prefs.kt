package com.namek.pageturner

import android.content.Context

object Prefs {

    /** 本の向きごとに「次へ／戻る」で送るキー。 */
    enum class Direction(val label: String, val next: Byte, val prev: Byte) {
        RTL("右開き（漫画）", HidKeyboard.KEY_LEFT, HidKeyboard.KEY_RIGHT),
        LTR("左開き", HidKeyboard.KEY_RIGHT, HidKeyboard.KEY_LEFT),
        PAGE("PageDown/Up", HidKeyboard.KEY_PAGE_DOWN, HidKeyboard.KEY_PAGE_UP),
    }

    private const val FILE = "page_turner"
    private const val KEY_DIRECTION = "direction"
    private const val KEY_LAST_DEVICE = "last_device"
    private const val KEY_DIM_SCREEN = "dim_screen"

    private fun sp(ctx: Context) = ctx.getSharedPreferences(FILE, Context.MODE_PRIVATE)

    fun direction(ctx: Context): Direction =
        runCatching { Direction.valueOf(sp(ctx).getString(KEY_DIRECTION, null)!!) }
            .getOrDefault(Direction.RTL)

    fun cycleDirection(ctx: Context): Direction {
        val all = Direction.entries
        val next = all[(direction(ctx).ordinal + 1) % all.size]
        sp(ctx).edit().putString(KEY_DIRECTION, next.name).apply()
        return next
    }

    fun lastDevice(ctx: Context): String? = sp(ctx).getString(KEY_LAST_DEVICE, null)

    fun setLastDevice(ctx: Context, address: String) =
        sp(ctx).edit().putString(KEY_LAST_DEVICE, address).apply()

    /** 接続中は画面を暗く常時点灯させる（消灯中は端末によって音量ボタンが拾えないため）。 */
    fun dimScreen(ctx: Context): Boolean = sp(ctx).getBoolean(KEY_DIM_SCREEN, true)

    fun toggleDimScreen(ctx: Context): Boolean {
        val v = !dimScreen(ctx)
        sp(ctx).edit().putBoolean(KEY_DIM_SCREEN, v).apply()
        return v
    }
}
