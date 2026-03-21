import Tesseract from 'tesseract.js';

export const scanMemberCard = async (file) => {
  // Tesseract takes the file and 'eng' (English) as the language
  const { data: { text } } = await Tesseract.recognize(file, 'eng');
  
  // This looks for the "Member #" text from your PDF 
  const match = text.match(/Member\s*#\s*(\d{9})/i);
  return match ? match[1] : null; 
};