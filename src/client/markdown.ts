function handleMultilineBlockQuotes(text: string, match: string) {
  // Clean up the blockquote markers and normalize nested levels
  const cleaned = match.split("\n").map((line) => {
    const firstMatch = line.match(/^>+/)?.at(0) || "";
    const level = firstMatch.length;
    const content = line.replace(/^>+ ?/, "");
    return { level, content };
  });

  // Build nested blockquote structure
  let html = "";
  let currentLevel = 0;

  cleaned.forEach(({ level, content }) => {
    while (level > currentLevel) {
      html += "<blockquote>";
      currentLevel++;
    }
    while (level < currentLevel) {
      html += "</blockquote>";
      currentLevel--;
    }
    html += content + "\n";
  });

  // Close any remaining blockquotes
  while (currentLevel > 0) {
    html += "</blockquote>";
    currentLevel--;
  }

  return html;
}

/**
 *  Mark-and-Collect
 *
 *  The goal of this algorithm is to convert markdown to psuedo-html
 *  and then convert it to a tree.
 *
 *  Step #1: Parse raw string converting different elements into a uniform
 *  syntax which can later be parsed and traversed.
 *
 *      - Special consideration to make the p-html contain attributes
 *        which can later be identified and removed easily.
 *
 *      - Be flexible and able to correct minor errors as they arise.
 *
 *      - Allow for extensions later on.
 *
 *  Step #2: Split the document by these elements into a tree.
 *
 *
 */

function getPseudoHtmlFromMarkdown(text: string) {
  const blockIndexes: [start: number, end: number][] = [];

  // check is already inside clode-block range
  const isInsideCodeBlock = (i: number, z: number): boolean => {
    return blockIndexes.some(([beg, end]) => {
      if (i > beg && i < end) return true;
      if (z > beg && z < end) return true;
      return false;
    });
  };

  return (
    text
      // HANDLE CODE BLOCKS:
      .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code, start) => {
        if (isInsideCodeBlock(start, start + match.length)) {
          console.log("already inside code block, returning!");
          return match;
        }
        blockIndexes.push([start, start + match.length]);
        return `<pre class="code-block" x-lang="${lang}"><code>${code}</code></pre>`;
      })
      // HANDLE INLINE CODE:
      .replace(/`([^`]+)`/g, (match, code, start) => {
        if (isInsideCodeBlock(start, start + match.length)) {
          console.log("already inside code block, returning!");
          return match;
        }
        blockIndexes.push([start, start + match.length]);
        return `<code class="inline-block">${code}</code>`;
      })
      // HANDLE UNORDERED LISTS:
      .replace(/(\n|^)- (.*)/g, (match, _, item) => {
        return `<ul><li>${item}</li></ul>`;
      })
      // HANDLE ORDERED LISTS:
      .replace(/(\n|^)\d+\. (.*)/g, (match, _, item) => {
        return `<ol><li>${item}</li></ol>`;
      })
      // HANDLE BLOCKQUOTES:
      .replace(/(\n|^)> (.*)/g, (match, _, quote) => {
        return `<blockquote>${quote}</blockquote>`;
      })
      // HANDLE HEADINGS:
      .replace(/(\n|^)#+ (.*)/g, (match, _, heading) => {
        return `<h1>${heading}</h1>`;
      })
      // FIX BACK-TO-BACK LISTS:
      .replace(/<\/ol><ol>/g, "\n")
      .replace(/<\/ul><ul>/g, "\n")
      // FIX BACK-TO-BACK BLOCKQUOTES:
      .replace(/<\/blockquote><blockquote>/g, "<br>")
  );
}

console.clear();
const output = getPseudoHtmlFromMarkdown(`
<think>This is an example of some of the output</think>

Ok so first do the following:

\`\`\`javascript
console.log('hello, world!');
\`\`\`

and then you are (())
`);

console.log(output);
