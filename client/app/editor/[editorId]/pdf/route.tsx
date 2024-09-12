import { Page, Text, View, Document, StyleSheet, renderToStream, Font, Image } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { Delta } from 'quill/core';

type ListType = 'bullet' | 'numbered'

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'public/fonts/Roboto-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: './public/fonts/Roboto-Bold.ttf',
      fontWeight: 700,
    },
    {
      src: './public/fonts/Roboto-Italic.ttf',
      fontWeight: 400,
      fontStyle: 'italic'
    },
    {
      src: './public/fonts/Roboto-BoldItalic.ttf',
      fontWeight: 700,
      fontStyle: 'italic'
    }
  ]
})

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 75,
  },
  section: {
    marginBottom: 5,
  },
  text: {
    fontFamily: "Roboto",
    fontSize: 12, // Default font size (can be a string)
    color: '#000000', // Default text color
    fontWeight: 400,
    backgroundColor: 'transparent', // Default background color
    textAlign: 'justify',
    lineHeight: 1.5,
    
  },
  list: {
    fontSize: 12,
    color: '#000000',
  }
});

// Function to parse Quill Delta to PDF content
const parseDeltaToPDFContent = (delta: Delta) => {
  const elements = [];
  let currentLine: React.ReactNode[] = []; // To store text fragments on the same line
  let currentListType: ListType | null = null; // To track the current list type ('bullet' or 'ordered')
  let listItems: React.ReactElement[] = []; // To store list items

  delta.ops.forEach((op, index) => {
    const { insert } = op;
    const attributes = op.attributes || {};
    console.log("op: ", op)

    // Define a new style object for each text fragment based on attributes
    let style = { ...styles.text };

    if (attributes.bold) style.fontWeight = 700
    if (attributes.italic) style.fontStyle = 'italic';
    if (attributes.underline) style.textDecoration = 'underline';
    if (attributes.strike) style.textDecoration = 'line-through';
    if (attributes.size) style.fontSize = Number(String(attributes.size).slice(0, -2))-4
    if (attributes.color) style.color = attributes.color;
    if (attributes.align) style.textAlign = attributes.align;
    if (attributes.background) style.backgroundColor = attributes.background;
    // if (attributes.font) style.fontFamily = attributes.font;

    // Handle lists. Check is the next op contains a 'list' attribute
    if (delta.ops[index+1] && delta.ops[index+1].attributes && delta.ops[index+1].attributes.list) {
      if (currentListType && currentListType !== delta.ops[index+1].attributes.list) {
        // If the list type changes, push the current list items and reset
        elements.push(
          <Text key={`list-${index}`} style={{}}>
            {listItems}
          </Text>
        );
        listItems = [];
      }
      currentListType = delta.ops[index+1].attributes.list;
    } else {
      if (currentListType) {
        // If exiting a list, push the current list items and reset
        elements.push(
          <Text key={`list-${index}`} style={{}}>
            {listItems}
          </Text>
        );
        currentListType = null;
        listItems = [];
      }
    }

    if (delta.ops[index+1] && delta.ops[index+1].attributes && delta.ops[index+1].attributes.align) {
        style.textAlign = delta.ops[index+1].attributes.align
    }

    if (typeof insert === 'object' && insert.image) {
      elements.push(
        <Text key={`line-${index}-before-img`} style={{}}>
          {currentLine}
        </Text>
      );
      currentLine = [];
      // Insert is an image object
      elements.push(
        <Image key={index} src={insert.image} style={styles.image} />
      );
    }else if (typeof insert === 'string' && (!attributes?.list || !attributes?.align)) { // ignore attributes of 'list' (already addressed in previous iteration)
      // Split the string by newlines to handle multi-line text
      const fragments = insert.split('\n');
      console.log("fragments: ", fragments)

      fragments.forEach((fragment, i) => {
        if (fragment) {

          if (currentListType) {
            // Add list item with the correct bullet or number
            const bullet = currentListType === 'bullet' ? '• ' : `${listItems.length + 1}. `;
            listItems.push(
              <Text key={`${index}-${i}`} style={{}}>
                {/* Add non-breaking spaces for indentation */}
                <Text style={styles.list}>
                  {'\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'} {/* Adjust number of spaces for indentation */}
                  {bullet}
                </Text>
                <Text style={style}>{fragment}</Text> {/* Text content */}
              </Text>
            );
            // listItems.push(
            //   <Text key={`${index}-${i}`}  style={styles.list}>
            //     {'\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}{bullet}
            //   </Text>
            // );
            // listItems.push(
            //   <Text key={`${index}-${i}`} style={style}>
            //     {fragment}
            //   </Text>
            // )
          }else {
            // Add each fragment with its style to the current line
            console.log("current line style: ", style)
            currentLine.push(
              <Text>
              <Text key={`${index}-${i}`} style={style}>
                {fragment}
              </Text>
              </Text>
            );
          }
        }

        // If a newline is encountered, push the current line to elements and reset it
        if (i < fragments.length - 1) {
          currentLine.push(
            <Text key={`${index}-${i}`} style={style}>
              {"\n"}
            </Text>
          );

          elements.push(
            <Text key={`line-${index}-${i}`} style={{}}>
              {currentLine}
            </Text>
          );
          currentLine = []; // Reset for the next line
        }
      });
    }
  });

  // Push any remaining list items
  if (currentListType) {
    elements.push(
      <Text key={`list-last`} style={{}}>
        {listItems}
      </Text>
    );
  }

  // Push any remaining content in the current line
  // console.log("currentLine: ", currentLine[0].props.style)
  if (currentLine.length > 0) {
    elements.push(
      <Text key="last-line" style={{}}>
        {currentLine}
      </Text>
    );
  }
  // elements[0].props.children.forEach(element => {
  //   console.log("Element: ", element)
  // })

  return elements;
};




// Create Document Component
const MyDocument = ({ pagesContent }) => (
  <Document>
    {pagesContent.map(content => 
      <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        {content}
      </View>
    </Page>
    )}
  </Document>
);

export async function POST(request: Request, { params }: { params: { editorId: string } }) {
  try {
    const { delta } = await request.json(); // Receive Delta from the request
    const pagesContent = []
    for (const value of Object.values(delta)) {
      const pageContent = parseDeltaToPDFContent(value as Delta)
      pagesContent.push(pageContent)
    }

    // const pdfContent = parseDeltaToPDFContent(delta); 

    const stream = await renderToStream(<MyDocument pagesContent={pagesContent} />); // Render PDF
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.error();
  }
}
