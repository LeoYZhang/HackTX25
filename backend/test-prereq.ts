import { extractOneProblem } from "./src/routes/parse";
import { getPrerequisites } from "./src/utils/prereq";
import { readFileSync } from "fs";

/**
 * Test function that processes a file and gets prerequisites for the extracted problem
 * @param filePath - Path to the file containing a math problem
 * @param existingTopics - Predefined array of topics to avoid
 */
async function testPrerequisites(filePath: string, existingTopics: string[] = []) {
  try {
    console.log("=".repeat(60));
    console.log("TESTING PREREQUISITE GENERATION");
    console.log("=".repeat(60));
    
    // Read the file
    console.log(`\n📁 Reading file: ${filePath}`);
    const fileBuffer = readFileSync(filePath);
    const mimeType = getMimeType(filePath);
    
    // Extract problem using extractOneProblem
    console.log("\n🔍 Extracting math problem...");
    const problemText = await extractOneProblem(fileBuffer, mimeType);
    console.log("Extracted problem:");
    console.log("-".repeat(40));
    console.log(problemText);
    console.log("-".repeat(40));
    
    // Get prerequisites for the problem
    console.log("\n🌳 Getting prerequisites...");
    console.log(`Existing topics to avoid: ${existingTopics.join(", ") || "None"}`);
    
    const prerequisites = await getPrerequisites(problemText, existingTopics);
    
    // Print the prerequisites
    console.log("\n📊 PREREQUISITES:");
    console.log("=".repeat(40));
    if (prerequisites.length === 0) {
      console.log("No prerequisites found or error occurred.");
    } else {
      prerequisites.forEach((prereq, index) => {
        console.log(`${index + 1}. ${prereq}`);
      });
    }
    
    console.log(`\n✅ Found ${prerequisites.length} prerequisites!`);
    
  } catch (error) {
    console.error("\n❌ Error during test:", error);
  }
}

/**
 * Get MIME type based on file extension
 */
function getMimeType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

// Example usage
async function main() {
  // Example file path - replace with actual file path
  const filePath = process.argv[2] || "./test-math-problem.pdf";
  
  // Example existing topics to avoid duplicates
  const existingTopics: string[] = [];
  
  console.log("Usage: npm run test-pmap <file-path>");
  console.log(`Testing with file: ${filePath}`);
  console.log(`Existing topics: ${existingTopics.join(", ")}`);
  
  await testPrerequisites(filePath, existingTopics);
}

// Run the test if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { testPrerequisites };