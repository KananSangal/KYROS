import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Volume2,
  LoaderCircle,
  Sparkles,
  UserRound,
  Square,
  RotateCcw,
} from "lucide-react";

import api from "../services/api";
import "./TalkToKyros.css";

export default function TalkToKyros() {
  const [children, setChildren] = useState([]);
  const [states, setStates] = useState([]);

  const [selectedChild, setSelectedChild] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [recording, setRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStarting, setSessionStarting] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const loadData = async () => {
    try {
      setLoadingData(true);

      const [childrenResponse, statesResponse] =
        await Promise.all([
          api.get("/children"),
          api.get("/cultural/states"),
        ]);

      const loadedChildren =
        childrenResponse.data.children || [];

      const loadedStates =
        statesResponse.data.states || [];

      setChildren(loadedChildren);
      setStates(loadedStates);

      if (loadedChildren.length > 0) {
        setSelectedChild(loadedChildren[0]._id);
      }
    } catch (error) {
      console.error("Unable to load KYROS data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const startSession = async () => {
    if (!selectedChild || sessionId) {
      return;
    }

    try {
      setSessionStarting(true);

      const selectedStateObject = states.find(
        (state) => state._id === selectedState
      );

      const response = await api.post("/sessions", {
        childId: selectedChild,
        type: "conversation",
        title: "Talk to KYROS",
        state: selectedStateObject?._id || null,
        language: "English",
      });

      setSessionId(response.data.session._id);
    } catch (error) {
      console.error("Unable to start session:", error);
    } finally {
      setSessionStarting(false);
    }
  };

  const ensureSession = async () => {
    if (sessionId) {
      return sessionId;
    }

    if (!selectedChild) {
      return null;
    }

    try {
      setSessionStarting(true);

      const selectedStateObject = states.find(
        (state) => state._id === selectedState
      );

      const response = await api.post("/sessions", {
        childId: selectedChild,
        type: "conversation",
        title: "Talk to KYROS",
        state: selectedStateObject?._id || null,
        language: "English",
      });

      const newSessionId = response.data.session._id;

      setSessionId(newSessionId);

      return newSessionId;
    } catch (error) {
      console.error("Unable to start session:", error);
      return null;
    } finally {
      setSessionStarting(false);
    }
  };

  const sendMessage = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage || loading) {
      return;
    }

    if (!selectedChild) {
      alert("Please select a child first.");
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: cleanMessage,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      await ensureSession();

      const selectedStateObject = states.find(
        (state) => state._id === selectedState
      );

      const response = await api.post("/ai/chat", {
        message: cleanMessage,
        childId: selectedChild,
        stateCode: selectedStateObject?.code || undefined,
      });

      const reply = response.data.reply;

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "kyros",
          text: reply,
        },
      ]);
    } catch (error) {
      console.error("KYROS chat error:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "error",
          text:
            error.response?.data?.message ||
            "Sorry, KYROS could not respond right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const startRecording = async () => {
    if (recording || voiceLoading) {
      return;
    }

    if (!selectedChild) {
      alert("Please select a child first.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      alert(
        "Microphone access is not supported in this browser."
      );
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      let mimeType = "";

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {
        mimeType = "audio/webm;codecs=opus";
      } else if (
        MediaRecorder.isTypeSupported("audio/webm")
      ) {
        mimeType = "audio/webm";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => {
          track.stop();
        });

        const blob = new Blob(
          audioChunksRef.current,
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          }
        );

        await sendVoiceMessage(blob);
      };

      mediaRecorderRef.current = recorder;

      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Microphone error:", error);

      alert(
        "Microphone permission was denied or unavailable."
      );
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) {
      return;
    }

    if (
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    setVoiceLoading(true);

    try {
      await ensureSession();

      const selectedStateObject = states.find(
        (state) => state._id === selectedState
      );

      const formData = new FormData();

      const extension =
        audioBlob.type.includes("webm")
          ? "webm"
          : "wav";

      formData.append(
        "audio",
        audioBlob,
        `kyros-recording.${extension}`
      );

      formData.append(
        "childId",
        selectedChild
      );

      if (selectedStateObject?.code) {
        formData.append(
          "stateCode",
          selectedStateObject.code
        );
      }

      const response = await api.post(
        "/ai/voice-chat",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const transcript =
        response.data.transcript || "";

      const reply =
        response.data.reply || "";

      if (transcript) {
        setMessages((previous) => [
          ...previous,
          {
            id: Date.now(),
            role: "user",
            text: transcript,
            voice: true,
          },
        ]);
      }

      if (reply) {
        setMessages((previous) => [
          ...previous,
          {
            id: Date.now() + 1,
            role: "kyros",
            text: reply,
            voice: true,
          },
        ]);
      }

      if (response.data.audio?.path) {
        const audio = new Audio(
          `http://localhost:5000${response.data.audio.path}`
        );

        audio.play().catch((error) => {
          console.error(
            "Unable to autoplay KYROS audio:",
            error
          );
        });
      }
    } catch (error) {
      console.error("KYROS voice error:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now(),
          role: "error",
          text:
            error.response?.data?.message ||
            "KYROS could not understand the voice message.",
        },
      ]);
    } finally {
      setVoiceLoading(false);
    }
  };

  const endConversation = async () => {
    if (!sessionId) {
      return;
    }

    try {
      const response = await api.post(
        `/sessions/${sessionId}/end`
      );

      const earned =
        response.data.session?.xpEarned || 0;

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now(),
          role: "system",
          text: `Conversation completed. You earned ${earned} XP!`,
        },
      ]);

      setSessionId(null);
    } catch (error) {
      console.error(
        "Unable to end conversation:",
        error
      );
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setMessage("");
    setSessionId(null);
  };

  const selectedChildObject = children.find(
    (child) => child._id === selectedChild
  );

  if (loadingData) {
    return (
      <div className="talk-loading">
        <LoaderCircle
          size={30}
          className="talk-spinner"
        />
        <span>Preparing KYROS...</span>
      </div>
    );
  }

  return (
    <div className="talk-page">
      <div className="talk-header">
        <div>
          <p className="talk-eyebrow">
            KYROS · AI COMPANION
          </p>

          <h1>Talk to KYROS</h1>

          <p>
            Ask KYROS about stories, India, culture,
            languages, festivals and anything you are
            curious about.
          </p>
        </div>

        <div className="kyros-status">
          <span className="status-dot" />
          <span>KYROS online</span>
        </div>
      </div>

      <div className="talk-layout">
        <aside className="talk-sidebar">
          <div className="talk-panel">
            <div className="panel-heading">
              <UserRound size={17} />
              <span>Child</span>
            </div>

            <select
              value={selectedChild}
              onChange={(event) => {
                setSelectedChild(event.target.value);
                setSessionId(null);
                setMessages([]);
              }}
            >
              {children.length === 0 ? (
                <option value="">
                  No child available
                </option>
              ) : (
                children.map((child) => (
                  <option
                    key={child._id}
                    value={child._id}
                  >
                    {child.name}
                  </option>
                ))
              )}
            </select>

            {selectedChildObject && (
              <div className="child-mini-card">
                <div className="child-avatar">
                  {selectedChildObject.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div>
                  <strong>
                    {selectedChildObject.name}
                  </strong>

                  <span>
                    Age {selectedChildObject.age}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="talk-panel">
            <div className="panel-heading">
              <Sparkles size={17} />
              <span>Cultural context</span>
            </div>

            <select
              value={selectedState}
              onChange={(event) =>
                setSelectedState(event.target.value)
              }
            >
              <option value="">
                General India
              </option>

              {states.map((state) => (
                <option
                  key={state._id}
                  value={state._id}
                >
                  {state.name}
                </option>
              ))}
            </select>

            <p className="context-help">
              Choose a state to help KYROS focus the
              conversation on that culture.
            </p>
          </div>

          <div className="talk-panel session-panel">
            <div className="panel-heading">
              <Bot size={17} />
              <span>Session</span>
            </div>

            <div className="session-status">
              <span
                className={
                  sessionId
                    ? "session-indicator active"
                    : "session-indicator"
                }
              />

              {sessionId
                ? "Conversation active"
                : "No active conversation"}
            </div>

            {!sessionId ? (
              <button
                className="session-start-button"
                onClick={startSession}
                disabled={
                  !selectedChild ||
                  sessionStarting
                }
              >
                {sessionStarting ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="talk-spinner"
                    />
                    Starting...
                  </>
                ) : (
                  "Start conversation"
                )}
              </button>
            ) : (
              <button
                className="session-end-button"
                onClick={endConversation}
              >
                End conversation
              </button>
            )}
          </div>
        </aside>

        <section className="chat-card">
          <div className="chat-topbar">
            <div className="chat-identity">
              <div className="kyros-avatar">
                <Bot size={23} />
              </div>

              <div>
                <strong>KYROS</strong>
                <span>
                  Your cultural learning companion
                </span>
              </div>
            </div>

            <button
              className="reset-button"
              onClick={resetConversation}
              title="New conversation"
            >
              <RotateCcw size={17} />
            </button>
          </div>

          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-kyros-icon">
                  <Bot size={34} />
                </div>

                <h2>Namaste! I'm KYROS 👋</h2>

                <p>
                  Let's explore India's amazing culture
                  together.
                </p>

                <div className="suggestion-grid">
                  <button
                    onClick={() =>
                      setMessage(
                        "Tell me a fun story from India."
                      )
                    }
                  >
                    📖 Tell me a story
                  </button>

                  <button
                    onClick={() =>
                      setMessage(
                        "Tell me something interesting about Rajasthan."
                      )
                    }
                  >
                    🏰 Explore Rajasthan
                  </button>

                  <button
                    onClick={() =>
                      setMessage(
                        "Teach me a traditional Indian greeting."
                      )
                    }
                  >
                    🗣️ Teach me a greeting
                  </button>

                  <button
                    onClick={() =>
                      setMessage(
                        "Tell me a fun fact about Indian festivals."
                      )
                    }
                  >
                    🎉 Fun festival fact
                  </button>
                </div>
              </div>
            ) : (
              <div className="message-list">
                {messages.map((item) => (
                  <div
                    className={`message-row ${item.role}`}
                    key={item.id}
                  >
                    {item.role === "kyros" && (
                      <div className="message-avatar kyros-message-avatar">
                        <Bot size={17} />
                      </div>
                    )}

                    {item.role === "user" && (
                      <div className="message-avatar user-message-avatar">
                        <UserRound size={16} />
                      </div>
                    )}

                    <div className="message-content">
                      <span className="message-label">
                        {item.role === "kyros"
                          ? "KYROS"
                          : item.role === "user"
                          ? "You"
                          : item.role === "system"
                          ? "Session"
                          : "Notice"}
                      </span>

                      <div className="message-bubble">
                        {item.text}

                        {item.voice &&
                          item.role === "user" && (
                            <Mic
                              size={13}
                              className="voice-message-icon"
                            />
                          )}
                      </div>
                    </div>
                  </div>
                ))}

                {(loading || voiceLoading) && (
                  <div className="message-row kyros">
                    <div className="message-avatar kyros-message-avatar">
                      <Bot size={17} />
                    </div>

                    <div className="message-content">
                      <span className="message-label">
                        KYROS
                      </span>

                      <div className="typing-bubble">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="chat-composer">
            <div className="composer-row">
              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleMessageKeyDown}
                placeholder={
                  recording
                    ? "Listening..."
                    : "Ask KYROS anything..."
                }
                rows={1}
                disabled={
                  recording ||
                  voiceLoading ||
                  loading
                }
              />

              <button
                className={`voice-button ${
                  recording ? "recording" : ""
                }`}
                onClick={
                  recording
                    ? stopRecording
                    : startRecording
                }
                disabled={voiceLoading || loading}
                title={
                  recording
                    ? "Stop recording"
                    : "Talk to KYROS"
                }
              >
                {recording ? (
                  <Square size={19} />
                ) : voiceLoading ? (
                  <LoaderCircle
                    size={20}
                    className="talk-spinner"
                  />
                ) : (
                  <Mic size={21} />
                )}
              </button>

              <button
                className="send-button"
                onClick={sendMessage}
                disabled={
                  !message.trim() ||
                  loading ||
                  recording ||
                  voiceLoading
                }
              >
                {loading ? (
                  <LoaderCircle
                    size={20}
                    className="talk-spinner"
                  />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>

            <div className="composer-footer">
              <span>
                <Volume2 size={13} />
                Voice replies are played automatically
              </span>

              <span>
                Press Enter to send
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}