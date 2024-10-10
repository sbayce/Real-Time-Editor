# Real-Time-Editor

Real Time Editor is a collaborative document editing platform inspired by Google Docs. It allows users to create and edit documents in real time, with the ability to invite collaborators and work together seamlessly. The app integrates Quill's rich text editor, leveraging its Delta format to represent changes in the document.

The key feature of Real Time Editor is its ability to handle conflicts between simultaneous edits. This is achieved using Operational Transformations (OT), which ensures that every user's document remains synchronized and converges correctly, even when multiple collaborators are making changes at the same time. This guarantees that all edits are integrated smoothly, resolving any conflicting changes automatically.

Real-time synchronization is achieved by Socket.IO and WebSockets, providing instant updates as users type. The app also supports live cursors, displaying each user's cursor position and text selection in real time, enhancing the collaborative experience by allowing users to see where others are working.

To maintain performance, the app implements throttling when sending document changes over WebSockets, reducing the number of updates transmitted without compromising real-time responsiveness.

# Screenshots

![landing page](https://i.imgur.com/9DE16hT.png)
![home page](https://i.imgur.com/kgsJJu9.png)
![home page](https://i.imgur.com/ZghMuON.png)
