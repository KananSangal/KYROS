
import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";

const API_BASE = "http://localhost:5000";

export default function TalkToKyros() {

  // =====================================================
  // STATES
  // =====================================================

  const [serialSupported, setSerialSupported] = useState(false);
  const [toyConnected, setToyConnected] = useState(false);

  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [status, setStatus] = useState(
    "Connect KYROS to begin"
  );

  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");

  const [hugDetected, setHugDetected] = useState(false);

  const [messages, setMessages] = useState([]);


  // =====================================================
  // REFS
  // =====================================================

  const portRef = useRef(null);

  const readerRef = useRef(null);

  const writerRef = useRef(null);

  const mediaRecorderRef = useRef(null);

  const audioChunksRef = useRef([]);

  const audioRef = useRef(null);

  const serialBufferRef = useRef("");

  const processingHugRef = useRef(false);


  // =====================================================
  // CHECK WEB SERIAL
  // =====================================================

  useEffect(() => {

    setSerialSupported(
      "serial" in navigator
    );

  }, []);


  // =====================================================
  // SEND COMMAND TO TOY
  // =====================================================

  const sendToyCommand = async (command) => {

    try {

      const port = portRef.current;

      if (!port || !port.writable) {
        return;
      }

      const writer =
        port.writable.getWriter();

      writerRef.current = writer;

      const encoder =
        new TextEncoder();

      await writer.write(
        encoder.encode(`${command}\n`)
      );

      writer.releaseLock();

      writerRef.current = null;

    } catch (error) {

      console.error(
        "Toy command error:",
        error
      );

    }

  };


  // =====================================================
  // SERIAL READER
  // =====================================================

  const readSerialLoop = async () => {

    const port = portRef.current;

    if (!port || !port.readable) {
      return;
    }

    while (
      port.readable &&
      portRef.current === port
    ) {

      const reader =
        port.readable.getReader();

      readerRef.current = reader;

      try {

        const decoder =
          new TextDecoder();

        while (true) {

          const { value, done } =
            await reader.read();

          if (done) {
            break;
          }

          if (!value) {
            continue;
          }

          serialBufferRef.current +=
            decoder.decode(value);

          const lines =
            serialBufferRef.current.split("\n");

          serialBufferRef.current =
            lines.pop() || "";

          for (const line of lines) {

            const message =
              line.trim();

            if (!message) {
              continue;
            }

            console.log(
              "KYROS:",
              message
            );

            if (message === "HUG") {

              await handleHug();

            }

          }

        }

      } catch (error) {

        console.error(
          "Serial read error:",
          error
        );

      } finally {

        reader.releaseLock();

        readerRef.current = null;

      }

    }

  };


  // =====================================================
  // CONNECT TO ESP32
  // =====================================================

  const connectToy = async () => {

    if (!("serial" in navigator)) {

      alert(
        "Web Serial is not supported. Please use Google Chrome or Microsoft Edge."
      );

      return;

    }


    try {

      setStatus(
        "Select your ESP32 serial port..."
      );


      const port =
        await navigator.serial.requestPort();


      await port.open({
        baudRate: 115200
      });


      portRef.current = port;

      setToyConnected(true);

      setStatus(
        "KYROS connected"
      );


      await sendToyCommand(
        "IDLE"
      );


      readSerialLoop();


    } catch (error) {

      console.error(
        "Toy connection failed:",
        error
      );

      setToyConnected(false);

      setStatus(
        "Toy connection cancelled"
      );

    }

  };


  // =====================================================
  // DISCONNECT TOY
  // =====================================================

  const disconnectToy = async () => {

    try {

      const port =
        portRef.current;

      if (!port) {
        return;
      }


      if (readerRef.current) {

        try {

          await readerRef.current.cancel();

        } catch {}

      }


      await port.close();

      portRef.current = null;

      setToyConnected(false);

      setStatus(
        "Toy disconnected"
      );

    } catch (error) {

      console.error(
        "Disconnect error:",
        error
      );

    }

  };


  // =====================================================
  // HANDLE PHYSICAL HUG
  // =====================================================

  const handleHug = async () => {

    if (processingHugRef.current) {
      return;
    }

    processingHugRef.current = true;


    setHugDetected(true);

    setStatus(
      "🤗 KYROS felt your hug"
    );


    setMessages((previous) => [
      ...previous,
      {
        type: "system",
        text: "🤗 KYROS detected a hug"
      }
    ]);


    await sendToyCommand(
      "HAPPY"
    );


    await new Promise(
      (resolve) =>
        setTimeout(resolve, 700)
    );


    await sendToyCommand(
      "THINKING"
    );


    setStatus(
      "🧠 KYROS is thinking..."
    );


    try {

      const response =
        await api.post(
          "/device/interaction",
          {
            deviceId:
              "KYROS-ESP32-01",

            message:
              "The child just hugged you. Respond warmly like a friendly Indian cultural companion for a child. Give a short cheerful greeting and one interesting fact about Indian culture. Keep the response under 40 words."
          }
        );


      const data =
        response.data;


      const aiReply =
        data.reply || "";


      setReply(aiReply);


      setMessages((previous) => [
        ...previous,
        {
          type: "kyros",
          text: aiReply
        }
      ]);


      // -------------------------------------------------
      // PLAY RESPONSE
      // -------------------------------------------------

      if (data.audio?.path) {

        await playAudio(
          `${API_BASE}${data.audio.path}`
        );

      }


    } catch (error) {

      console.error(
        "Hug interaction failed:",
        error
      );


      setStatus(
        "KYROS connection error"
      );


      setMessages((previous) => [
        ...previous,
        {
          type: "error",
          text: "KYROS could not respond right now."
        }
      ]);

    }


    await sendToyCommand(
      "HAPPY"
    );


    setStatus(
      "😊 KYROS is happy"
    );


    setTimeout(() => {

      setHugDetected(false);

      sendToyCommand(
        "IDLE"
      );

      setStatus(
        "Ready"
      );

    }, 2500);


    processingHugRef.current = false;

  };


  // =====================================================
  // PLAY AUDIO
  // =====================================================

  const playAudio = async (url) => {

    return new Promise(
      (resolve) => {

        sendToyCommand(
          "SPEAKING"
        );

        setStatus(
          "🔊 KYROS is speaking..."
        );


        const audio =
          new Audio(url);

        audioRef.current =
          audio;


        audio.onended = () => {

          sendToyCommand(
            "HAPPY"
          );

          resolve();

        };


        audio.onerror = () => {

          resolve();

        };


        audio.play().catch(
          (error) => {

            console.error(
              "Audio playback error:",
              error
            );

            resolve();

          }
        );

      }
    );

  };


  // =====================================================
  // START MICROPHONE
  // =====================================================

  const startRecording = async () => {

    if (recording || processing) {
      return;
    }


    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });


      const recorder =
        new MediaRecorder(
          stream
        );


      mediaRecorderRef.current =
        recorder;

      audioChunksRef.current =
        [];


      recorder.ondataavailable =
        (event) => {

          if (
            event.data &&
            event.data.size > 0
          ) {

            audioChunksRef.current.push(
              event.data
            );

          }

        };


      recorder.onstop =
        async () => {

          stream
            .getTracks()
            .forEach(
              (track) =>
                track.stop()
            );


          const audioBlob =
            new Blob(
              audioChunksRef.current,
              {
                type:
                  recorder.mimeType ||
                  "audio/webm"
              }
            );


          await sendVoiceToKyros(
            audioBlob
          );

        };


      recorder.start();

      setRecording(true);

      setStatus(
        "🎤 Listening..."
      );


      await sendToyCommand(
        "THINKING"
      );


    } catch (error) {

      console.error(
        "Microphone error:",
        error
      );


      setStatus(
        "Microphone permission denied"
      );

    }

  };


  // =====================================================
  // STOP MICROPHONE
  // =====================================================

  const stopRecording = () => {

    const recorder =
      mediaRecorderRef.current;

    if (
      !recorder ||
      recorder.state === "inactive"
    ) {

      return;

    }


    setRecording(false);

    setProcessing(true);

    setStatus(
      "🧠 KYROS is thinking..."
    );


    recorder.stop();

  };


  // =====================================================
  // SEND VOICE TO BACKEND
  // =====================================================

  const sendVoiceToKyros = async (
    audioBlob
  ) => {

    try {

      const formData =
        new FormData();


      let extension =
        "webm";


      if (
        audioBlob.type.includes(
          "mp4"
        )
      ) {

        extension = "mp4";

      }


      formData.append(
        "audio",
        audioBlob,
        `kyros-laptop-voice.${extension}`
      );


      const response =
        await api.post(
          "/ai/voice-chat",
          formData
        );


      const data =
        response.data;


      const userTranscript =
        data.transcript || "";


      const aiReply =
        data.reply || "";


      setTranscript(
        userTranscript
      );


      setReply(
        aiReply
      );


      setMessages((previous) => [

        ...previous,

        {
          type: "user",
          text: userTranscript
        },

        {
          type: "kyros",
          text: aiReply
        }

      ]);


      // -------------------------------------------------
      // PLAY AI RESPONSE
      // -------------------------------------------------

      if (data.audio?.path) {

        await playAudio(
          `${API_BASE}${data.audio.path}`
        );

      }


      setStatus(
        "😊 KYROS is happy"
      );


      await sendToyCommand(
        "HAPPY"
      );


      setTimeout(() => {

        sendToyCommand(
          "IDLE"
        );

        setStatus(
          "Ready"
        );

      }, 1500);


    } catch (error) {

      console.error(
        "Voice chat error:",
        error
      );


      setStatus(
        "KYROS could not understand that"
      );


      await sendToyCommand(
        "SAD"
      );


      setTimeout(() => {

        sendToyCommand(
          "IDLE"
        );

      }, 1200);


    } finally {

      setProcessing(false);

    }

  };


  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {

    return () => {

      try {

        if (
          readerRef.current
        ) {

          readerRef.current.cancel();

        }

      } catch {}


      try {

        if (
          portRef.current
        ) {

          portRef.current.close();

        }

      } catch {}

    };

  }, []);


  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#f7f9fc,#eef3f8)",
        padding: "32px",
        fontFamily:
          "Inter, Arial, sans-serif",
        color: "#172033"
      }}
    >

      <div
        style={{
          maxWidth: "1150px",
          margin: "0 auto"
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "28px"
          }}
        >

          <div>

            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                letterSpacing:
                  "2px",
                color: "#64748b"
              }}
            >
              SMART CULTURAL COMPANION
            </div>

            <h1
              style={{
                margin:
                  "6px 0 0",
                fontSize: "38px"
              }}
            >
              KYROS
            </h1>

            <p
              style={{
                marginTop: "6px",
                color: "#64748b"
              }}
            >
              Physical AI companion prototype
            </p>

          </div>


          <div>

            {!toyConnected ? (

              <button
                onClick={connectToy}
                disabled={!serialSupported}
                style={{
                  padding:
                    "13px 20px",
                  borderRadius:
                    "12px",
                  border: "none",
                  background:
                    "#172033",
                  color: "white",
                  fontWeight: "700",
                  cursor:
                    "pointer"
                }}
              >
                🔌 Connect KYROS
              </button>

            ) : (

              <button
                onClick={disconnectToy}
                style={{
                  padding:
                    "13px 20px",
                  borderRadius:
                    "12px",
                  border:
                    "1px solid #cbd5e1",
                  background:
                    "white",
                  color:
                    "#172033",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer"
                }}
              >
                ● KYROS Connected
              </button>

            )}

          </div>

        </div>


        {/* MAIN */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1.35fr",
            gap: "24px"
          }}
        >

          {/* TOY STATUS */}

          <div
            style={{
              background:
                "white",
              borderRadius:
                "24px",
              padding:
                "28px",
              boxShadow:
                "0 15px 45px rgba(15,23,42,.08)"
            }}
          >

            <div
              style={{
                color:
                  "#64748b",
                fontSize:
                  "13px",
                fontWeight:
                  "700",
                textTransform:
                  "uppercase",
                letterSpacing:
                  "1px"
              }}
            >
              Physical device
            </div>


            <div
              style={{
                marginTop:
                  "25px",
                height:
                  "260px",
                borderRadius:
                  "22px",
                background:
                  "#f1f5f9",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                flexDirection:
                  "column"
              }}
            >

              <div
                style={{
                  fontSize:
                    "72px"
                }}
              >
                🧸
              </div>

              <div
                style={{
                  marginTop:
                    "15px",
                  fontSize:
                    "22px",
                  fontWeight:
                    "800"
                }}
              >
                {hugDetected
                  ? "Hug detected!"
                  : "KYROS"}
              </div>

              <div
                style={{
                  marginTop:
                    "7px",
                  color:
                    "#64748b"
                }}
              >
                {status}
              </div>

            </div>


            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap:
                  "12px",
                marginTop:
                  "18px"
              }}
            >

              <div
                style={{
                  padding:
                    "15px",
                  background:
                    "#f8fafc",
                  borderRadius:
                    "12px"
                }}
              >

                <div
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "#64748b"
                  }}
                >
                  CONNECTION
                </div>

                <strong>
                  {toyConnected
                    ? "ONLINE"
                    : "OFFLINE"}
                </strong>

              </div>


              <div
                style={{
                  padding:
                    "15px",
                  background:
                    "#f8fafc",
                  borderRadius:
                    "12px"
                }}
              >

                <div
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "#64748b"
                  }}
                >
                  SENSOR
                </div>

                <strong>
                  FSR ACTIVE
                </strong>

              </div>

            </div>

          </div>


          {/* CONVERSATION */}

          <div
            style={{
              background:
                "white",
              borderRadius:
                "24px",
              padding:
                "28px",
              boxShadow:
                "0 15px 45px rgba(15,23,42,.08)"
            }}
          >

            <div
              style={{
                color:
                  "#64748b",
                fontSize:
                  "13px",
                fontWeight:
                  "700",
                textTransform:
                  "uppercase",
                letterSpacing:
                  "1px"
              }}
            >
              Conversation
            </div>


            <div
              style={{
                minHeight:
                  "350px",
                marginTop:
                  "18px",
                background:
                  "#f8fafc",
                borderRadius:
                  "18px",
                padding:
                  "20px",
                overflowY:
                  "auto"
              }}
            >

              {messages.length === 0 ? (

                <div
                  style={{
                    height:
                      "310px",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    color:
                      "#94a3b8",
                    textAlign:
                      "center"
                  }}
                >

                  Connect KYROS and start
                  a conversation.

                </div>

              ) : (

                messages.map(
                  (message, index) => (

                    <div
                      key={index}
                      style={{
                        marginBottom:
                          "14px",
                        display:
                          "flex",
                        justifyContent:
                          message.type ===
                          "user"
                            ? "flex-end"
                            : "flex-start"
                      }}
                    >

                      <div
                        style={{
                          maxWidth:
                            "78%",
                          padding:
                            "13px 16px",
                          borderRadius:
                            "15px",
                          background:
                            message.type ===
                            "user"
                              ? "#172033"
                              : "#e2e8f0",
                          color:
                            message.type ===
                            "user"
                              ? "white"
                              : "#172033"
                        }}
                      >

                        {message.text}

                      </div>

                    </div>

                  )
                )

              )}

            </div>


            <div
              style={{
                display:
                  "flex",
                gap:
                  "12px",
                marginTop:
                  "18px"
              }}
            >

              {!recording ? (

                <button
                  onClick={
                    startRecording
                  }
                  disabled={
                    processing ||
                    !toyConnected
                  }
                  style={{
                    flex:
                      "1",
                    padding:
                      "16px",
                    border:
                      "none",
                    borderRadius:
                      "14px",
                    background:
                      toyConnected
                        ? "#172033"
                        : "#cbd5e1",
                    color:
                      "white",
                    fontWeight:
                      "800",
                    fontSize:
                      "15px",
                    cursor:
                      toyConnected
                        ? "pointer"
                        : "not-allowed"
                  }}
                >
                  🎤 Talk to KYROS
                </button>

              ) : (

                <button
                  onClick={
                    stopRecording
                  }
                  style={{
                    flex:
                      "1",
                    padding:
                      "16px",
                    border:
                      "none",
                    borderRadius:
                      "14px",
                    background:
                      "#dc2626",
                    color:
                      "white",
                    fontWeight:
                      "800",
                    fontSize:
                      "15px",
                    cursor:
                      "pointer"
                  }}
                >
                  ⏹ Stop & Send
                </button>

              )}

            </div>


            <div
              style={{
                marginTop:
                  "12px",
                textAlign:
                  "center",
                fontSize:
                  "13px",
                color:
                  "#64748b"
              }}
            >

              {processing
                ? "Processing your message..."
                : status}

            </div>

          </div>

        </div>


        {/* ARCHITECTURE */}

        <div
          style={{
            marginTop:
              "24px",
            background:
              "white",
            borderRadius:
              "20px",
            padding:
              "22px",
            boxShadow:
              "0 15px 45px rgba(15,23,42,.06)"
          }}
        >

          <div
            style={{
              fontWeight:
                "800",
              marginBottom:
                "15px"
            }}
          >
            Live Prototype Pipeline
          </div>


          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              flexWrap:
                "wrap",
              gap:
                "10px",
              color:
                "#475569",
              fontSize:
                "14px"
            }}
          >

            <span>🤗 FSR</span>

            <span>→</span>

            <span>🧸 ESP32</span>

            <span>→</span>

            <span>👀 OLED Eyes</span>

            <span>→</span>

            <span>💻 Frontend</span>

            <span>→</span>

            <span>🧠 AI</span>

            <span>→</span>

            <span>🔊 Response</span>

          </div>

        </div>

      </div>

    </div>

  );

}
