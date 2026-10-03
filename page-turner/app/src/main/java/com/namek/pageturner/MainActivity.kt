package com.namek.pageturner

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothClass
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import kotlinx.coroutines.launch

@SuppressLint("MissingPermission")
class MainActivity : AppCompatActivity() {

    private lateinit var connectPanel: View
    private lateinit var readerPanel: View
    private lateinit var statusText: TextView
    private lateinit var deviceList: LinearLayout
    private lateinit var pairHelp: TextView
    private lateinit var readerTitle: TextView
    private lateinit var flashText: TextView
    private lateinit var directionButton: Button
    private lateinit var screenButton: Button

    private var autoConnectTried = false
    private var engineStarted = false

    private val adapter: BluetoothAdapter?
        get() = getSystemService(BluetoothManager::class.java)?.adapter

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
            if (hasBluetoothPermissions()) ensureBluetoothOn()
            else statusText.text = "Bluetoothの権限を許可してください（設定 > アプリ > Page Turner）"
        }

    private val enableBluetoothLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
            if (adapter?.isEnabled == true) startEngine()
            else statusText.text = "BluetoothをONにしてください"
        }

    private val discoverableLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode != RESULT_CANCELED) pairHelp.visibility = View.VISIBLE
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        connectPanel = findViewById(R.id.connectPanel)
        readerPanel = findViewById(R.id.readerPanel)
        statusText = findViewById(R.id.statusText)
        deviceList = findViewById(R.id.deviceList)
        pairHelp = findViewById(R.id.pairHelp)
        readerTitle = findViewById(R.id.readerTitle)
        flashText = findViewById(R.id.flashText)
        directionButton = findViewById(R.id.directionButton)
        screenButton = findViewById(R.id.screenButton)

        findViewById<Button>(R.id.pairButton).setOnClickListener { startPairing() }
        findViewById<Button>(R.id.quitButton).setOnClickListener { quit() }
        findViewById<Button>(R.id.disconnectButton).setOnClickListener { HidKeyboard.disconnect() }
        directionButton.setOnClickListener {
            Prefs.cycleDirection(this)
            updateReaderButtons()
        }
        screenButton.setOnClickListener {
            Prefs.toggleDimScreen(this)
            updateReaderButtons()
            applyScreenMode(reader = true)
        }

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch { HidKeyboard.status.collect { render(it) } }
                launch { PageTurner.events.collect { flash(it) } }
            }
        }

        requestPermissionsIfNeeded()
    }

    override fun onResume() {
        super.onResume()
        if (engineStarted) refreshDevices()
    }

    // ---- 音量ボタン（アプリが前面にいる時はここで受ける） ----

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        if (isVolumeKey(keyCode) && HidKeyboard.isConnected) {
            if (event.repeatCount == 0) {
                if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) PageTurner.next(this) else PageTurner.prev(this)
            }
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {
        if (isVolumeKey(keyCode) && HidKeyboard.isConnected) return true
        return super.onKeyUp(keyCode, event)
    }

    private fun isVolumeKey(keyCode: Int) =
        keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN

    // ---- 起動フロー：権限 → Bluetooth ON → サービス起動 → 前回のPCへ自動接続 ----

    private fun bluetoothPermissions(): List<String> =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            listOf(Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_ADVERTISE)
        } else {
            emptyList()
        }

    private fun hasBluetoothPermissions() = bluetoothPermissions().all {
        ContextCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestPermissionsIfNeeded() {
        val wanted = bluetoothPermissions().toMutableList()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            wanted += Manifest.permission.POST_NOTIFICATIONS
        }
        val missing = wanted.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isEmpty()) ensureBluetoothOn() else permissionLauncher.launch(missing.toTypedArray())
    }

    private fun ensureBluetoothOn() {
        val a = adapter
        when {
            a == null -> statusText.text = "この端末はBluetoothに対応していません"
            !a.isEnabled -> enableBluetoothLauncher.launch(Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE))
            else -> startEngine()
        }
    }

    private fun startEngine() {
        engineStarted = true
        ContextCompat.startForegroundService(this, Intent(this, PageTurnService::class.java))
        if (!autoConnectTried) {
            autoConnectTried = true
            lastBondedDevice()?.let { HidKeyboard.connect(this, it) }
        }
        refreshDevices()
    }

    private fun lastBondedDevice(): BluetoothDevice? {
        val address = Prefs.lastDevice(this) ?: return null
        return adapter?.bondedDevices?.firstOrNull { it.address == address }
    }

    private fun startPairing() {
        discoverableLauncher.launch(
            Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE)
                .putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, 120),
        )
        val phoneName = runCatching { adapter?.name }.getOrNull() ?: "このスマホ"
        pairHelp.text = getString(R.string.pair_help, phoneName)
        pairHelp.visibility = View.VISIBLE
    }

    private fun quit() {
        stopService(Intent(this, PageTurnService::class.java))
        finishAndRemoveTask()
    }

    // ---- 画面描画 ----

    private fun render(status: HidKeyboard.Status) {
        if (status.state == HidKeyboard.State.CONNECTED && status.device != null) {
            Prefs.setLastDevice(this, status.device.address)
            readerTitle.text = "接続中：${nameOf(status.device)}"
            updateReaderButtons()
            connectPanel.visibility = View.GONE
            readerPanel.visibility = View.VISIBLE
            pairHelp.visibility = View.GONE
            applyScreenMode(reader = true)
            return
        }

        readerPanel.visibility = View.GONE
        connectPanel.visibility = View.VISIBLE
        applyScreenMode(reader = false)
        val base = when (status.state) {
            HidKeyboard.State.OFF -> "準備中…"
            HidKeyboard.State.REGISTERING -> "準備中…"
            HidKeyboard.State.READY -> "つなぐPCをタップしてください"
            HidKeyboard.State.CONNECTING -> "${status.device?.let { nameOf(it) } ?: "PC"} に接続中…"
            HidKeyboard.State.CONNECTED -> ""
        }
        statusText.text = listOfNotNull(status.message, base).joinToString("\n")
        if (engineStarted) refreshDevices()
    }

    private fun refreshDevices() {
        deviceList.removeAllViews()
        val devices = runCatching { adapter?.bondedDevices?.toList() }.getOrNull().orEmpty()
            .sortedWith(
                compareByDescending<BluetoothDevice> { it.address == Prefs.lastDevice(this) }
                    .thenByDescending { isComputer(it) }
                    .thenBy { nameOf(it) },
            )
        if (devices.isEmpty()) {
            deviceList.addView(TextView(this).apply {
                text = "登録済みのPCがありません。下のボタンから登録してください。"
                setTextColor(getColor(R.color.text_dim))
                textSize = 15f
            })
            return
        }
        for (device in devices) {
            deviceList.addView(Button(this).apply {
                val mark = if (isComputer(device)) "PC  " else ""
                text = "$mark${nameOf(device)}"
                textSize = 20f
                isAllCaps = false
                minHeight = (72 * resources.displayMetrics.density).toInt()
                setTextColor(getColor(R.color.text))
                backgroundTintList = getColorStateList(R.color.button_bg)
                setOnClickListener { HidKeyboard.connect(this@MainActivity, device) }
            })
        }
    }

    private fun updateReaderButtons() {
        directionButton.text = "向き：${Prefs.direction(this).label}"
        screenButton.text = if (Prefs.dimScreen(this)) "画面：暗く点灯" else "画面：自動消灯"
    }

    /** 読書中は画面を最小輝度で点けっぱなしにして、音量ボタンを確実に拾う。 */
    private fun applyScreenMode(reader: Boolean) {
        val dim = reader && Prefs.dimScreen(this)
        if (dim) window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        else window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        window.attributes = window.attributes.apply {
            screenBrightness = if (dim) 0.01f else WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE
        }
    }

    private fun flash(forward: Boolean) {
        flashText.text = if (forward) "次へ" else "戻る"
        flashText.animate().cancel()
        flashText.alpha = 1f
        flashText.animate().alpha(0f).setStartDelay(250).setDuration(400).start()
    }

    private fun nameOf(device: BluetoothDevice): String =
        runCatching { device.name }.getOrNull()?.takeIf { it.isNotBlank() } ?: device.address

    private fun isComputer(device: BluetoothDevice): Boolean =
        runCatching { device.bluetoothClass?.majorDeviceClass == BluetoothClass.Device.Major.COMPUTER }
            .getOrDefault(false)
}
