import 'dotenv/config';
import { createAgent } from './agent.js';

async function main() {
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
    console.log('\n📝 Please create a .env file with your OpenAI API key:');
    console.log('   OPENAI_API_KEY=your-api-key-here\n');
    process.exit(1);
  }

  // Create the agent instance
  const agent = createAgent(process.env.OPENAI_API_KEY);

  // Define the task
  const task = `
Go to https://ui.chaicode.com
Locate the authentication form automatically
Fill in the necessary details with appropriate test data
Click the action/submit button

Remember to:
- Always call the 'take_screenshot' tool after each step to see what is happening
- After taking a screenshot, analyze it and plan the next action based on what you see
- Be thorough and methodical in your approach
`;

  try {
    // Run the agent
    await agent.run(task);
    
    // Wait for user to manually close
    console.log('\n💡 The browser is still open for you to inspect the results.');
    console.log('   Press Ctrl+C when you are done to close everything.');
    
    // Keep the process alive
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await agent.cleanup();
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down...');
  process.exit(0);
});

// Run the main function
main();
