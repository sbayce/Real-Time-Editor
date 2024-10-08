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

    // If the line count differs, we need to handle extra new lines
  // if (senderLines.length !== receiverLines.length) {
  //   const lineDiffCount = receiverLines.length - senderLines.length;

  //   if (lineDiffCount > 0) {
  //     // Receiver has more lines (new lines added)
  //     // Insert new lines at the appropriate positions
  //     finalDelta.retain(totalChars); // Retain any previous content
  //     finalDelta.insert('\n'.repeat(lineDiffCount+1)); // Insert the new lines
  //   } else {
  //     // Sender has more lines (lines removed)
  //     finalDelta.retain(totalChars); // Retain any previous content
  //     finalDelta.delete(Math.abs(lineDiffCount+1)); // Delete the extra lines
  //   }

  //   // Adjust the lines so that they are the same length for further comparison
  //   const minLines = Math.min(senderLines.length, receiverLines.length);
  //   senderLines.length = receiverLines.length = minLines;
  // }

    // Diff each line and combine the deltas
    for (let i = 0; i < senderLines.length || i < receiverLines.length; i++) {
      const senderLine = senderLines[i] || '';
      const receiverLine = receiverLines[i] || '';

      // Get the line difference
      let lineDiff
      // if(!receiverLine && senderLine && senderLine === receiverLines[i+1]){ // inserted line
      // if(receiverLine !== senderLine && senderLine === receiverLines[i+1]){ // inserted line
      if(receiverLine !== senderLine && senderLine !== '' && receiverLines.slice(i+1).includes(senderLine)){ // inserted line
        let insert = `${receiverLine}\n`
        let j = 0
        while(receiverLines.slice(i+1)[j] !== senderLine){
          insert += `${receiverLines.slice(i+1)[j]}\n`
          j++
        }
        lineDiff = new Delta([{ insert }])
        receiverLines.splice(i+1, j+1) // delete next element
      // }else if(receiverLine && !senderLine && receiverLine === senderLines[i+1]){ // deleted line
      // }else if(receiverLine !== senderLine && receiverLine === senderLines[i+1]){ // deleted line
      }else if(receiverLine !== senderLine && senderLines.slice(i+1).includes(receiverLine)){ // deleted line
        let deletedLines = senderLine.length+1
        let j = 0
        while(senderLines.slice(i+1)[j] !== receiverLine){
          deletedLines += senderLines.slice(i+1)[j].length+1
          j++
        }
        lineDiff = new Delta([{ delete: deletedLines }])
        senderLines.splice(i+1, j+1) // delete next element
      }else{
        lineDiff = new Delta([{ insert: senderLine }]).diff(new Delta([{ insert: receiverLine }]));
      }
      // const lineDiff = new Delta([{ insert: senderLine }]).diff(new Delta([{ insert: receiverLine }]));

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