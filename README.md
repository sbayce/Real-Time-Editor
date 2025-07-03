# Real-Time-Editor
A collaborative document editing platform built with WebSockets, allowing multiple users to edit the same document simultaneously. It features live cursor positions and text selections for each user, with conflict-free editing and real time synchronization.

![demo](https://i.postimg.cc/7P5vHvX3/realtime-editor-ezgif-com-video-to-gif-converter.gif)

# Motivation
Collaboration is a core feature of modern productivity tools. I built this project to explore how WebSockets works and how an application like Google Docs functions behind the scenes.

## Usage
1. Clone the repository:
   ```bash
   git clone https://github.com/sbayce/Real-Time-Editor.git
   ````

3. Install dependencies:
   ```bash
   npm install
   ````

5. Create a .env file inside the server folder with the following:
   ```bash
   DATABASE_URL=your_postgresql_connection_string
   ````

7. Start the server:
   ```bash
   cd server
   npm start
   ````

# Screenshots
![landing page](https://i.imgur.com/9DE16hT.png)
![home page](https://i.imgur.com/kgsJJu9.png)
![home page](https://i.imgur.com/ZghMuON.png)
