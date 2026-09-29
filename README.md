# KYROS

## Smart Cultural Companion Toy

KYROS is an AI-powered physical smart companion designed to provide children with screen-free cultural learning, storytelling, conversations, quizzes, and gamified exploration of Indian culture.

## Project Structure

- `firmware/` — ESP32-S3 firmware
- `backend/` — Backend API, AI services and database integration
- `frontend/` — Parent dashboard

## Architecture

Child
→ KYROS Hardware
→ ESP32-S3
→ Wi-Fi
→ Backend
→ STT
→ Cultural Knowledge
→ AI
→ TTS
→ ESP32-S3
→ Speaker

Parallel:

ESP32
→ Backend
→ Database
→ Parent Dashboard