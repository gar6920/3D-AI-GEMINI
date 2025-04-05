# 3D-AI-GEMINI

A 3D multiplayer game with PlayCanvas and Colyseus integration.

## Project Overview

This project combines PlayCanvas for the 3D front-end with Colyseus for real-time multiplayer functionality.

## Getting Started

### Prerequisites
- Node.js (for Colyseus server)
- PlayCanvas account

### Setup

#### Client
1. The client code is managed via PlayCanvas Editor
2. External scripts required:
   - Buffer polyfill
   - Colyseus.js

#### Server
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## PlayCanvas Sync
For local development with PlayCanvas, a sync configuration is set up in `.pcconfig`.

## Project Structure
The project follows a modular structure:
- `client/`: PlayCanvas front-end code
- `server/`: Colyseus server code
- `docs/`: Design documents and notes

## Development
Check the docs folder for detailed design documents and implementation plans.
