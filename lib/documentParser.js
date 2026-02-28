// lib/documentParser.js
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * Parse PDF file and extract text content
 */
export async function parsePDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

/**
 * Parse DOCX file and extract text content
 */
export async function parseDOCX(file) {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

/**
 * Parse text file
 */
export async function parseTXT(file) {
  try {
    const text = await file.text();
    return text.trim();
  } catch (error) {
    console.error('TXT parsing error:', error);
    throw new Error('Failed to parse text file');
  }
}

/**
 * Main document parser - automatically detects file type and parses accordingly
 */
export async function parseDocument(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Detect file type and parse accordingly
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await parsePDF(file);
  } 
  else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await parseDOCX(file);
  }
  else if (
    fileType === 'application/msword' ||
    fileName.endsWith('.doc')
  ) {
    throw new Error('Legacy .doc files are not supported. Please convert to .docx format.');
  }
  else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await parseTXT(file);
  }
  else {
    throw new Error(`Unsupported file type: ${fileType}. Please upload PDF, DOCX, or TXT files.`);
  }
}

/**
 * Validate extracted text
 */
export function validateResumeText(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'No text content found in the document' };
  }

  const trimmedText = text.trim();
  
  if (trimmedText.length < 50) {
    return { valid: false, error: 'Document content is too short (minimum 50 characters required)' };
  }

  if (trimmedText.length > 50000) {
    return { valid: false, error: 'Document content is too long (maximum 50,000 characters)' };
  }

  return { valid: true, text: trimmedText };
}