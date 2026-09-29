const express = require("express");

const {
  deviceVoice,
  deviceInteraction
} = require("../controllers/device.controller");

const router = express.Router();


// =====================================================
// PING
// =====================================================

router.get("/ping", (req, res) => {

  res.status(200).json({

    success: true,

    device: "KYROS-ESP32",

    message:
      "KYROS backend connection successful",

    serverTime:
      new Date().toISOString()
  });
});


// =====================================================
// HEARTBEAT
// =====================================================

router.post(
  "/heartbeat",
  (req, res) => {

    const {
      deviceId,
      firmware,
      wifiSignal
    } = req.body;


    console.log("");
    console.log(
      "================================="
    );

    console.log(
      "       KYROS DEVICE HEARTBEAT"
    );

    console.log(
      "================================="
    );

    console.log(
      "Device ID:",
      deviceId || "Unknown"
    );

    console.log(
      "Firmware:",
      firmware || "Unknown"
    );

    console.log(
      "Wi-Fi Signal:",
      wifiSignal ?? "Unknown"
    );

    console.log(
      "================================="
    );

    console.log("");


    res.status(200).json({

      success: true,

      device:
        deviceId || "KYROS-ESP32",

      message:
        "Heartbeat received",

      serverTime:
        new Date().toISOString()
    });
  }
);


// =====================================================
// HUG / DEVICE INTERACTION
// =====================================================

router.post(
  "/interaction",
  express.json({
    limit: "1mb"
  }),
  deviceInteraction
);


// =====================================================
// ESP32 VOICE
// Existing endpoint
// =====================================================

router.post(
  "/voice",
  express.raw({
    type: [
      "audio/wav",
      "audio/x-wav",
      "application/octet-stream"
    ],
    limit: "5mb"
  }),
  deviceVoice
);


module.exports = router;