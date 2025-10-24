export interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

export const chunkText = (
  text: string,
  options: ChunkOptions = {}
): string[] => {
  const { chunkSize = 1000, overlap = 200 } = options;

  // Clean text
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  if (cleanedText.length <= chunkSize) {
    return [cleanedText];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleanedText.length) {
    const endIndex = startIndex + chunkSize;
    let chunk = cleanedText.slice(startIndex, endIndex);

    // Try to break at sentence end
    if (endIndex < cleanedText.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastQuestion = chunk.lastIndexOf('?');
      const lastExclamation = chunk.lastIndexOf('!');
      const lastBreak = Math.max(lastPeriod, lastQuestion, lastExclamation);

      if (lastBreak > chunkSize * 0.5) {
        chunk = chunk.slice(0, lastBreak + 1);
        startIndex += lastBreak + 1;
      } else {
        startIndex = endIndex;
      }
    } else {
      startIndex = endIndex;
    }

    chunks.push(chunk.trim());

    // Apply overlap
    if (startIndex < cleanedText.length && overlap > 0) {
      startIndex = Math.max(0, startIndex - overlap);
    }
  }

  return chunks.filter(chunk => chunk.length > 0);
};
