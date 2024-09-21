import { Delta } from "quill/core";

const calcLinesDiff = (senderDelta: Delta, recieverDelta: Delta) => {
    // Extract text from Deltas
    const senderText = new Delta(senderDelta).reduce((acc, op) => acc + (op.insert || ''), '');
    const receiverText = recieverDelta.reduce((acc, op) => acc + (op.insert || ''), '');

    // Split into lines
    const senderLines = senderText.split('\n');
    const receiverLines = receiverText.split('\n');
    console.log(senderLines);
    console.log(receiverLines);

    // Prepare an empty delta to store the final result
    let finalDelta = new Delta();
    let totalChars = 0; // Track the total number of characters processed

    // Diff each line and combine the deltas
    for (let i = 0; i < senderLines.length || i < receiverLines.length; i++) {
      const senderLine = senderLines[i] || '';
      const receiverLine = receiverLines[i] || '';

      // Get the line difference
      const lineDiff = new Delta([{ insert: senderLine }]).diff(new Delta([{ insert: receiverLine }]));

      // Add retain for previous lines and newlines
      if (i > 0) {
        finalDelta.retain(totalChars); // Retain from previous line
        totalChars = 0
      }

      if (lineDiff.ops.length > 0) {
        // Add the line difference to the final delta
        finalDelta = finalDelta.concat(lineDiff);
        let startIndexOfRemainingChars = 0
        lineDiff.ops.forEach((op, idx) => {
          if (op.insert) {
            const insertionLength = op.insert.length as number
            startIndexOfRemainingChars += insertionLength
            if(idx === lineDiff.ops.length-1){
              const sub = receiverLine.substring(startIndexOfRemainingChars)
              console.log("substring: ", sub.length)
              totalChars = sub.length + 1 //for new line
            }
          } else if(op.delete && idx === lineDiff.ops.length-1){
            const sub = receiverLine.substring(startIndexOfRemainingChars)
            console.log("substring: ", sub.length)
            totalChars = sub.length + 1 //for new line
          } else if (op.retain) {
            startIndexOfRemainingChars += op.retain as number
            // totalChars += op.retain as number
          }
        });
      } else {
        totalChars += senderLine.length + 1; // +1 for newline
      }
    }

    // Check and remove unnecessary retains at the end of the delta
    while (finalDelta.ops.length > 0 && finalDelta.ops[finalDelta.ops.length - 1].retain !== undefined) {
      finalDelta.ops.pop(); // Remove the last retain if it's unnecessary
    }
    return finalDelta
}

export default calcLinesDiff