# Real-Time-Editor

Real Time Editor is a collaborative document editing platform inspired by Google Docs. It allows users to create and edit documents in real time, with the ability to invite collaborators and work together seamlessly. The app integrates Quill's rich text editor, leveraging its Delta format to represent changes in the document.

Real-time synchronization is achieved through WebSockets using Socket.IO, allowing users to see updates instantly as they type. Conflicts between simultaneous edits are resolved using Operational Transformations (OT), ensuring that every user's document stays in sync and converges correctly, even when multiple collaborators are editing at the same time.

A key feature is live cursors, which display each user's cursor position and text selection in real time, offering visibility into what collaborators are working on. This enhances collaboration, making the editing experience smoother and more intuitive.

To maintain performance, the app implements throttling when sending document changes over WebSockets, reducing the number of updates transmitted without compromising real-time responsiveness.

# Screenshots

![landing page](https://i.imgur.com/RO24Cod.png)
![home page](https://i.imgur.com/hEWwCRW.png)
![home page](https://i.imgur.com/dC3NUXx.png)
