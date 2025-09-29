# Robert Memorial Website

A memorial website with an interactive message board that saves messages to a local server.

*In Loving Memory of Robert Nicholas Estrada - February 2, 1999 - September 29, 2025*

## Features

- **Interactive Message Board**: Visitors can submit condolences and memories
- **Server-Side Storage**: Messages are saved to a local JSON file on the server
- **Real-time Updates**: Messages are displayed immediately after submission
- **Like System**: Visitors can like messages, with counts saved to the server
- **Auto-incrementing Statistics**: Some stats update automatically over time
- **Photo Gallery**: Display photos and videos with lightbox functionality
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   # or use the start script:
   ./start-server.sh
   ```

3. **Open in Browser**:
   Visit `http://localhost:3000`

## How the Message Board Works

### Frontend (Website)
- Users fill out the condolences form with their name, relationship, and message
- JavaScript sends the data to the server via POST request to `/api/messages`
- New messages are displayed immediately on the page
- Existing messages are loaded when the page loads

### Backend (Server)
- **Express.js server** runs on port 3000
- **Message storage**: All messages are saved to `/data/messages.json`
- **API endpoints**:
  - `GET /api/messages` - Load all existing messages
  - `POST /api/messages` - Save a new message
  - `POST /api/messages/:id/like` - Like a specific message

### Data Storage
- Messages are stored in `/data/messages.json` as an array
- Each message includes:
  - Unique ID and timestamp
  - Name, email (optional), relationship
  - Message content
  - Like count

### Message Format
```json
{
  "id": "1695984000000",
  "name": "John Doe",
  "email": "john@example.com",
  "relationship": "friend",
  "message": "Robert was an amazing person...",
  "timestamp": "2025-09-29T12:00:00.000Z",
  "likes": 5
}
```

## File Structure

```
/workspaces/Robert-Memorial/
├── index.html          # Main website file
├── server.js           # Node.js server
├── package.json        # Dependencies
├── start-server.sh     # Startup script
├── data/
│   └── messages.json   # Stored messages
├── pics/               # Photos and videos
├── js/
│   └── main.js         # Additional JavaScript
└── styles/
    └── main.css        # Additional styles
```

## Server Endpoints

- `GET /` - Serves the main website
- `GET /api/messages` - Returns all messages as JSON
- `POST /api/messages` - Accepts new message submissions
- `POST /api/messages/:id/like` - Increments like count for a message

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

## Notes

- Messages persist between server restarts
- The server creates the `data` directory automatically if it doesn't exist
- All messages are stored locally - no external database required
- The website works offline except for the message submission feature

---

*"Life is not measured by the number of breaths we take, but by the L's that take in Fantasy."*

Created with love and remembrance 💝