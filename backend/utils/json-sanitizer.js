/**
 * Utility script to test JSON sanitization
 * 
 * Usage: node json-sanitizer.js path/to/json-file.json
 */

const fs = require('fs');

// Basic JSON sanitization function
function sanitizeJsonString(jsonString) {
  // Remove any comments
  jsonString = jsonString.replace(/\/\/.*$/gm, '');
  
  // Handle common escape character issues
  jsonString = jsonString.replace(/\\([^"\\\/bfnrtu])/g, '\\\\$1');
  
  // Handle multiple consecutive backslashes (common in LaTeX/math expressions)
  jsonString = jsonString.replace(/\\{2,}/g, '\\\\');
  
  // Remove any markdown code block markers
  jsonString = jsonString.replace(/```json|```/g, '');
  
  // Try to extract JSON if it's wrapped in other text
  const jsonMatch = jsonString.match(/(\{[\s\S]*\})/);
  if (jsonMatch && jsonMatch[0]) {
    return jsonMatch[0];
  }
  
  return jsonString;
}

// Advanced sanitization for deeply problematic JSON
function deepSanitizeJson(jsonString) {
  // Find all the card titles and sanitize them specifically
  const titleRegex = /"title": ?"([^"]+)"/g;
  let match;
  let sanitized = jsonString;
  
  while ((match = titleRegex.exec(jsonString)) !== null) {
    const originalTitle = match[1];
    // Create a deeply sanitized version of the title
    let sanitizedTitle = originalTitle
      .replace(/\\\\/g, '\\') // Replace double backslashes
      .replace(/\\(?!["\\/bfnrt])/g, '') // Remove invalid escape sequences
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Remove control characters
    
    // Replace the original title with the sanitized one
    sanitized = sanitized.replace(
      `"title": "${originalTitle}"`, 
      `"title": "${sanitizedTitle}"`
    );
  }
  
  // Final pass to handle any remaining issues
  sanitized = sanitized
    .replace(/\\+([^"\\\/bfnrtu])/g, '$1') // Remove invalid escapes
    .replace(/,\s*}/g, '}') // Fix trailing commas
    .replace(/,\s*]/g, ']'); // Fix trailing commas in arrays
    
  return sanitized;
}

// Main function
function main() {
  if (process.argv.length < 3) {
    console.log('Please provide a JSON file path');
    process.exit(1);
  }

  const filePath = process.argv[2];
  
  try {
    const jsonString = fs.readFileSync(filePath, 'utf8');
    console.log('Original JSON size:', jsonString.length);
    
    // Try parsing the original JSON
    try {
      JSON.parse(jsonString);
      console.log('Original JSON is valid');
    } catch (error) {
      console.log('Original JSON is invalid:', error.message);
      
      // Try basic sanitization
      const sanitized = sanitizeJsonString(jsonString);
      console.log('Basic sanitized JSON size:', sanitized.length);
      
      try {
        JSON.parse(sanitized);
        console.log('Basic sanitized JSON is valid');
        fs.writeFileSync(filePath + '.sanitized.json', sanitized);
        console.log('Saved sanitized JSON to', filePath + '.sanitized.json');
      } catch (error) {
        console.log('Basic sanitized JSON is invalid:', error.message);
        
        // Try deep sanitization
        const deepSanitized = deepSanitizeJson(jsonString);
        console.log('Deep sanitized JSON size:', deepSanitized.length);
        
        try {
          JSON.parse(deepSanitized);
          console.log('Deep sanitized JSON is valid');
          fs.writeFileSync(filePath + '.deep-sanitized.json', deepSanitized);
          console.log('Saved deep-sanitized JSON to', filePath + '.deep-sanitized.json');
        } catch (error) {
          console.log('Deep sanitized JSON is still invalid:', error.message);
        }
      }
    }
  } catch (error) {
    console.log('Error reading file:', error.message);
  }
}

main();
