# SimpleChat

SimpleChat is a basic real-time chat application built using Node.js, Express, and WebSockets.

![demo](chatRoom.gif)

## Features
- Real-time chat functionality
- Supports multiple users
- Simple and lightweight UI
- WebSocket-based communication

## Getting Started

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v14 or later)
- **npm** (comes with Node.js)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Jwallee/SimpleChat.git
   cd SimpleChat
   ```
2. Install dependencies:
```bash
npm install
```

### Running the Application

To start the local chat server, run:
```bash
npm start
```

Now, the server is running on **http://localhost:3000/**

### Example Deployment

For this test app, I used **Heroku** to get online chat capabilities. An example would be:

```bash
heroku create simple-chat-app
git push heroku main
heroku open
```

---
### Author
**James Robinett**