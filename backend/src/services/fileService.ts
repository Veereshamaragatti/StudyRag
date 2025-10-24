import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';
import { chunkText } from '../utils/chunkText';

export interface ParsedFile {
  text: string;
  chunks: string[];
  metadata?: {
    pages?: number;
    [key: string]: any;
  };
}

export const parseFile = async (filePath: string, fileType: string): Promise<ParsedFile> => {
  try {
    let text = '';
    let metadata: any = {};

    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension === '.pdf' || fileType === 'application/pdf') {
      // Parse PDF
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdf(dataBuffer);
      text = pdfData.text;
      metadata.pages = pdfData.numpages;
    } else if (
      fileExtension === '.docx' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // Parse DOCX
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (fileExtension === '.txt' || fileType === 'text/plain') {
      // Parse TXT
      text = await fs.readFile(filePath, 'utf-8');
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Clean and chunk the text
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    const chunks = chunkText(cleanedText, { chunkSize: 1000, overlap: 200 });

    return {
      text: cleanedText,
      chunks,
      metadata,
    };
  } catch (error) {
    console.error('Error parsing file:', error);
    throw new Error(`Failed to parse file: ${error}`);
  }
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
