
import * as pdfjsLib from 'pdfjs-dist';


pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;


try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
} catch (error) {
  console.warn('Failed to set PDF.js worker, using fallback mode');
}

/**
 * Extract text content from a PDF file
 * @param {File} file - The PDF file to parse
 * @returns {Promise<string>} - The extracted text content
 */
export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');

      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error parsing PDF:', error);

    
    if (error.message?.includes('worker')) {
      throw new Error('PDF parsing requires internet connection for worker script. Please check your connection and try again.');
    }

    throw new Error('Failed to parse PDF file. Please ensure the file is a valid PDF and try again.');
  }
};

/**
 * Extract text content from a DOCX file
 * @param {File} file - The DOCX file to parse
 * @returns {Promise<string>} - The extracted text content
 */
export const extractTextFromDOCX = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
};

/**
 * Extract contact information from resume text using regex patterns
 * @param {string} text - The resume text content
 * @returns {object} - Extracted contact information
 */
export const extractContactInfo = (text) => {
  const info = {
    name: null,
    email: null,
    phone: null
  };

  
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = normalizedText.match(emailPattern);
  if (emailMatch) {
    info.email = emailMatch[0];
  }

  const phonePatterns = [
    /(\+\d{1,3}[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}/,  
    /(\+\d{1,3}[- ]?)?\(\d{3}\)\s*\d{3}[- ]?\d{4}/, 
    /(\+\d{1,3}[- ]?)?\d{10}/, 
  ];

  for (const pattern of phonePatterns) {
    const phoneMatch = normalizedText.match(pattern);
    if (phoneMatch) {
      info.phone = phoneMatch[0];
      break;
    }
  }

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];

    if (info.email && line.includes(info.email)) continue;
    if (info.phone && line.includes(info.phone)) continue;

    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && line.length <= 50) {
      
      const namePattern = /^[A-Za-z\s\-']+$/;
      if (namePattern.test(line)) {
        info.name = line;
        break;
      }
    }
  }

  return info;
};

/**
 * Parse a resume file and extract contact information
 * @param {File} file - The resume file (PDF or DOCX)
 * @returns {Promise<object>} - Extracted contact information
 */
export const parseResume = async (file) => {
  try {
    let text = '';


    if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractTextFromDOCX(file);
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Could not extract text from the uploaded file. Please ensure the file contains readable text.');
    }

    const contactInfo = extractContactInfo(text);

    return {
      ...contactInfo,
      resume: file,
      rawText: text
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
};
