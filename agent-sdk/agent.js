import OpenAI from 'openai';
import * as tools from './tools.js';

// System prompt with rules
const SYSTEM_PROMPT = `You are an intelligent browser automation agent. You have access to browser automation tools to interact with web pages.

CRITICAL RULES:
1. ALWAYS call the 'take_screenshot' tool after EVERY action (after opening browser, navigating, clicking, typing, etc.)
2. After taking a screenshot, analyze what you see and plan your next action based on the visual state
3. When you see a form, identify all input fields before filling them
4. Look for submit buttons, login buttons, or action buttons after filling forms
5. Be patient and methodical - take one action at a time
6. If an action fails, try alternative selectors (id, name, xpath, css)
7. Always verify your actions were successful by taking screenshots

Your available tools:
- openBrowser: Opens a Chrome browser
- openUrl: Navigates to a URL
- takeScreenshot: Captures the current page state (MUST use after every action)
- clickOnScreen: Clicks on an element using a selector
- sendKeys: Types text into an input field

When identifying elements, try these selector strategies in order:
1. ID attributes (most reliable)
2. Name attributes (for form inputs)
3. CSS selectors (class names, element types)
4. XPath (as last resort)`;

/**
 * Get tool definitions for OpenAI function calling
 */
function getToolDefinitions() {
  return [
    {
      type: 'function',
      function: {
        name: 'openBrowser',
        description: 'Opens a Chrome browser window. Must be called before any other browser actions.',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'openUrl',
        description: 'Navigates the browser to a specific URL. Browser must be open first.',
        parameters: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to navigate to (e.g., https://example.com)'
            }
          },
          required: ['url']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'takeScreenshot',
        description: 'Takes a screenshot of the current browser state. MUST be called after every action to see what is happening on the page.',
        parameters: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'A brief description of what this screenshot captures (e.g., "After loading homepage", "After clicking login")'
            }
          },
          required: ['description']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'clickOnScreen',
        description: 'Clicks on an element on the page using a selector.',
        parameters: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'The selector to identify the element (e.g., "#submit-btn", "button[type=submit]", "//button[@id=\'login\']")'
            },
            selectorType: {
              type: 'string',
              enum: ['id', 'name', 'css', 'xpath'],
              description: 'The type of selector being used. Default is "css".'
            }
          },
          required: ['selector']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'sendKeys',
        description: 'Types text into an input field identified by a selector.',
        parameters: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'The selector to identify the input field'
            },
            text: {
              type: 'string',
              description: 'The text to type into the field'
            },
            selectorType: {
              type: 'string',
              enum: ['id', 'name', 'css', 'xpath'],
              description: 'The type of selector being used. Default is "css".'
            }
          },
          required: ['selector', 'text']
        }
      }
    }
  ];
}

/**
 * Execute a tool based on the function call from OpenAI
 */
async function executeTool(toolsState, toolName, args) {
  console.log(`\n🔧 Executing tool: ${toolName}`);
  console.log(`📝 Arguments:`, args);
  
  let result;
  
  switch (toolName) {
    case 'openBrowser':
      result = await tools.openBrowser(toolsState);
      break;
    case 'openUrl':
      result = await tools.openUrl(toolsState, args.url);
      break;
    case 'takeScreenshot':
      result = await tools.takeScreenshot(toolsState, args.description);
      break;
    case 'clickOnScreen':
      result = await tools.clickOnScreen(toolsState, args.selector, args.selectorType || 'css');
      break;
    case 'sendKeys':
      result = await tools.sendKeys(toolsState, args.selector, args.text, args.selectorType || 'css');
      break;
    default:
      result = { success: false, error: `Unknown tool: ${toolName}` };
  }
  
  return result;
}

/**
 * Main agent execution function
 */
async function runAgent(openai, toolsState, userTask, maxIterations = 20) {
  console.log('\n🤖 AI Agent Starting...');
  console.log(`📋 Task: ${userTask}\n`);
  
  // Initialize conversation with system prompt and user task
  const conversationHistory = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userTask }
  ];
  
  let iteration = 0;
  
  try {
    while (iteration < maxIterations) {
      iteration++;
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🔄 Iteration ${iteration}/${maxIterations}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      
      // Call OpenAI to get the next action
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: conversationHistory,
        tools: getToolDefinitions(),
        tool_choice: 'auto'
      });
      
      const assistantMessage = response.choices[0].message;
      
      // Add assistant's response to conversation history
      conversationHistory.push(assistantMessage);
      
      // Check if the assistant wants to call a function
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Execute all tool calls
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);
          
          // Execute the tool
          const toolResult = await executeTool(toolsState, toolName, toolArgs);
          
          // Add tool result to conversation history
          conversationHistory.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult)
          });
        }
      } else if (assistantMessage.content) {
        // Agent is providing a response or has completed the task
        console.log('\n💭 Agent says:', assistantMessage.content);
        
        // Check if the agent indicates completion
        if (assistantMessage.content.toLowerCase().includes('completed') || 
            assistantMessage.content.toLowerCase().includes('finished') ||
            assistantMessage.content.toLowerCase().includes('done')) {
          console.log('\n✅ Task completed successfully!');
          break;
        }
      }
      
      // Small delay between iterations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (iteration >= maxIterations) {
      console.log('\n⚠️  Maximum iterations reached. Task may not be fully completed.');
    }
    
  } catch (error) {
    console.error('\n❌ Agent error:', error.message);
    throw error;
  } finally {
    // Keep browser open for inspection
    console.log('\n📌 Browser will remain open for inspection.');
    console.log('   Press Ctrl+C to close and exit.');
  }
}

/**
 * Create and initialize agent
 */
function createAgent(apiKey) {
  const openai = new OpenAI({ apiKey });
  const toolsState = tools.createToolsState();
  tools.initializeScreenshotDir(toolsState.screenshotDir);
  
  return {
    openai,
    toolsState,
    run: (userTask, maxIterations) => runAgent(openai, toolsState, userTask, maxIterations),
    cleanup: () => tools.closeBrowser(toolsState)
  };
}

export { createAgent, getToolDefinitions, executeTool, runAgent };
