package com.namek.pageturner

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothHidDevice
import android.bluetooth.BluetoothHidDeviceAppSdpSettings
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.Executors

/**
 * スマホを「Bluetoothキーボード」としてPCに見せ、キー入力を送る。
 * 権限チェックは呼び出し側（MainActivity）で済ませている前提。
 */
@SuppressLint("MissingPermission")
object HidKeyboard {

    enum class State { OFF, REGISTERING, READY, CONNECTING, CONNECTED }

    data class Status(
        val state: State,
        val device: BluetoothDevice? = null,
        val message: String? = null,
    )

    // HID Usage ID（キーボード）
    const val KEY_RIGHT: Byte = 0x4F
    const val KEY_LEFT: Byte = 0x50
    const val KEY_PAGE_DOWN: Byte = 0x4E
    const val KEY_PAGE_UP: Byte = 0x4B

    private const val REPORT_ID = 1

    /** 標準的なブートキーボード（修飾キー1byte + 予約1byte + キー6byte）。 */
    private val DESCRIPTOR = bytes(
        0x05, 0x01,       // Usage Page (Generic Desktop)
        0x09, 0x06,       // Usage (Keyboard)
        0xA1, 0x01,       // Collection (Application)
        0x85, REPORT_ID,  //   Report ID
        0x05, 0x07,       //   Usage Page (Key Codes)
        0x19, 0xE0,       //   Usage Minimum (Left Control)
        0x29, 0xE7,       //   Usage Maximum (Right GUI)
        0x15, 0x00,       //   Logical Minimum (0)
        0x25, 0x01,       //   Logical Maximum (1)
        0x75, 0x01,       //   Report Size (1)
        0x95, 0x08,       //   Report Count (8)
        0x81, 0x02,       //   Input (Data, Variable, Absolute) ; 修飾キー
        0x95, 0x01,       //   Report Count (1)
        0x75, 0x08,       //   Report Size (8)
        0x81, 0x01,       //   Input (Constant) ; 予約
        0x95, 0x06,       //   Report Count (6)
        0x75, 0x08,       //   Report Size (8)
        0x15, 0x00,       //   Logical Minimum (0)
        0x25, 0x65,       //   Logical Maximum (101)
        0x05, 0x07,       //   Usage Page (Key Codes)
        0x19, 0x00,       //   Usage Minimum (0)
        0x29, 0x65,       //   Usage Maximum (101)
        0x81, 0x00,       //   Input (Data, Array) ; キー
        0xC0,             // End Collection
    )

    private val _status = MutableStateFlow(Status(State.OFF))
    val status: StateFlow<Status> = _status.asStateFlow()

    val isConnected: Boolean get() = host != null

    private val executor = Executors.newSingleThreadExecutor()
    private var adapter: BluetoothAdapter? = null
    @Volatile private var hid: BluetoothHidDevice? = null
    @Volatile private var registered = false
    @Volatile private var host: BluetoothDevice? = null
    @Volatile private var pendingTarget: BluetoothDevice? = null
    @Volatile private var starting = false

    fun start(context: Context) {
        if (hid != null || starting) return
        val a = context.getSystemService(BluetoothManager::class.java)?.adapter
        if (a == null) {
            _status.value = Status(State.OFF, message = "この端末はBluetoothに対応していません")
            return
        }
        adapter = a
        starting = true
        _status.value = Status(State.REGISTERING)
        if (!a.getProfileProxy(context.applicationContext, serviceListener, BluetoothProfile.HID_DEVICE)) {
            starting = false
            _status.value = Status(State.OFF, message = "Bluetoothキーボード機能を起動できませんでした")
        }
    }

    fun stop() {
        val h = hid
        host?.let { d -> runCatching { h?.disconnect(d) } }
        if (registered) runCatching { h?.unregisterApp() }
        if (h != null) runCatching { adapter?.closeProfileProxy(BluetoothProfile.HID_DEVICE, h) }
        hid = null
        registered = false
        host = null
        pendingTarget = null
        starting = false
        _status.value = Status(State.OFF)
    }

    fun connect(context: Context, device: BluetoothDevice) {
        if (host?.address == device.address) return
        val h = hid
        if (h == null || !registered) {
            // 登録完了後に onAppStatusChanged で接続する
            pendingTarget = device
            start(context)
            return
        }
        _status.value = Status(State.CONNECTING, device)
        if (!h.connect(device)) {
            _status.value = Status(State.READY, message = "接続を開始できませんでした")
        }
    }

    fun disconnect() {
        val d = host ?: return
        hid?.disconnect(d)
    }

    /** キーを1回押して離す。未接続なら false。 */
    fun sendKey(usage: Byte): Boolean {
        val h = hid ?: return false
        val d = host ?: return false
        executor.execute {
            h.sendReport(d, REPORT_ID, byteArrayOf(0, 0, usage, 0, 0, 0, 0, 0))
            h.sendReport(d, REPORT_ID, ByteArray(8))
        }
        return true
    }

    private val serviceListener = object : BluetoothProfile.ServiceListener {
        override fun onServiceConnected(profile: Int, proxy: BluetoothProfile) {
            val h = proxy as BluetoothHidDevice
            hid = h
            starting = false
            val sdp = BluetoothHidDeviceAppSdpSettings(
                "Page Turner",
                "Kindle page turner",
                "PageTurner",
                BluetoothHidDevice.SUBCLASS1_KEYBOARD,
                DESCRIPTOR,
            )
            if (!h.registerApp(sdp, null, null, executor, hidCallback)) {
                _status.value = Status(
                    State.OFF,
                    message = "キーボード登録に失敗しました。他のBluetoothキーボード系アプリを終了してください",
                )
            }
        }

        override fun onServiceDisconnected(profile: Int) {
            hid = null
            registered = false
            host = null
            starting = false
            _status.value = Status(State.OFF, message = "Bluetoothが切れました")
        }
    }

    private val hidCallback = object : BluetoothHidDevice.Callback() {
        override fun onAppStatusChanged(pluggedDevice: BluetoothDevice?, registered: Boolean) {
            this@HidKeyboard.registered = registered
            if (!registered) {
                host = null
                _status.value = Status(State.OFF)
                return
            }
            if (_status.value.state != State.CONNECTED) _status.value = Status(State.READY)
            val target = pendingTarget ?: pluggedDevice
            pendingTarget = null
            if (target != null && host == null) {
                _status.value = Status(State.CONNECTING, target)
                hid?.connect(target)
            }
        }

        override fun onConnectionStateChanged(device: BluetoothDevice, state: Int) {
            when (state) {
                BluetoothProfile.STATE_CONNECTED -> {
                    host = device
                    _status.value = Status(State.CONNECTED, device)
                }
                BluetoothProfile.STATE_CONNECTING -> {
                    if (host == null) _status.value = Status(State.CONNECTING, device)
                }
                BluetoothProfile.STATE_DISCONNECTED -> {
                    if (host != null && host?.address != device.address) return
                    val wasConnecting = _status.value.state == State.CONNECTING
                    host = null
                    _status.value = Status(
                        State.READY,
                        message = if (wasConnecting) {
                            "接続できませんでした。PCのBluetoothがONか確認してください"
                        } else {
                            "切断されました"
                        },
                    )
                }
            }
        }
    }

    private fun bytes(vararg v: Int) = ByteArray(v.size) { v[it].toByte() }
}
