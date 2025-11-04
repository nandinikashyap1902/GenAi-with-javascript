# AI Agent SDK with Selenium

An intelligent browser automation agent powered by OpenAI's GPT-4 and Selenium WebDriver. This agent can autonomously navigate websites, fill forms, and interact with web pages using natural language instructions.

## Features

### 🛠️ Available Tools

1. **openBrowser** - Opens a Chrome browser instance
2. **openUrl** - Navigates to any URL
3. **takeScreenshot** - Captures the current page state (automatically called after each action)
4. **clickOnScreen** - Clicks on elements using various selectors (ID, Name, CSS, XPath)
5. **sendKeys** - Types text into input fields

### 🤖 Agent Capabilities

- **Autonomous Navigation**: The agent can navigate websites and understand page structure
- **Visual Feedback**: Takes screenshots after every action to understand the current state
- **Smart Element Detection**: Tries multiple selector strategies to find elements
- **Form Automation**: Can identify and fill authentication forms automatically
- **Error Handling**: Gracefully handles failures and tries alternative approaches

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 3. Install ChromeDriver

The package includes ChromeDriver, but make sure you have Google Chrome installed on your system.

## Usage

### Run the Agent

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### Default Task

The agent is pre-configured to:
1. Navigate to `https://ui.chaicode.com`
2. Locate the authentication form automatically
3. Fill in the necessary details
4. Click the submit/action button

### Custom Tasks

To modify the task, edit the `task` variable in `index.js`:

```javascript
const task = `
Your custom instructions here...
`;
```

## How It Works

### Agent Rules

The agent follows these critical rules:

1. **Screenshot After Every Action**: Calls `take_screenshot` after each step to maintain visual awareness
2. **Plan After Observation**: Analyzes screenshots to determine the next action
3. **Methodical Approach**: Takes one action at a time for reliability
4. **Multiple Selector Strategies**: Tries ID, Name, CSS, and XPath selectors
5. **Action Verification**: Confirms success through screenshots

### Architecture

```
┌─────────────────┐
│   index.js      │  Main entry point
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   agent.js      │  AI Agent with OpenAI integration
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   tools.js      │  Selenium WebDriver tools
└─────────────────┘
```

### Execution Flow

1. **Initialize**: Agent loads with system prompt and rules
2. **Plan**: OpenAI determines the next action based on task and screenshots
3. **Execute**: Agent calls the appropriate Selenium tool
4. **Capture**: Takes screenshot to verify action
5. **Analyze**: OpenAI analyzes the result
6. **Repeat**: Continues until task is complete (max 20 iterations)

## Screenshots

All screenshots are automatically saved to the `./screenshots` directory with timestamps and descriptions.

Example: `screenshot_1_2024-01-15T10-30-45-123Z.png`

## File Structure

```
agent-sdk/
├── index.js           # Main execution file
├── agent.js           # AI Agent class
├── tools.js           # Selenium tools implementation
├── package.json       # Dependencies
├── .env.example       # Environment template
├── .env               # Your API keys (create this)
├── README.md          # This file
└── screenshots/       # Auto-generated screenshots
```

## Troubleshooting

### Chrome Not Found
Make sure Google Chrome is installed on your system.

### ChromeDriver Issues
The package includes ChromeDriver, but if you encounter issues:
```bash
npm install chromedriver@latest
```

### OpenAI API Errors
- Verify your API key is correct in `.env`
- Check you have sufficient credits at https://platform.openai.com/usage
- Ensure you're using a compatible model (GPT-4 Turbo)

### Element Not Found
The agent will automatically try multiple selector strategies. If persistent:
- Check the website structure
- Try different selector types in the tool definitions
- Increase wait times in `tools.js`

## Advanced Customization

### Modify System Prompt

Edit the `systemPrompt` in `agent.js` to change agent behavior:

```javascript
this.systemPrompt = `Your custom instructions...`;
```

### Add New Tools

1. Add method to `SeleniumTools` class in `tools.js`
2. Add tool definition in `agent.js` `getToolDefinitions()`
3. Add case in `agent.js` `executeTool()`

### Adjust Iteration Limit

Change `maxIterations` in `agent.js`:

```javascript
this.maxIterations = 30; // Default is 20
```

## Security Notes

⚠️ **Important**: Never commit your `.env` file or expose your OpenAI API key publicly.

## License

MIT

## Support

For issues or questions, please check:
- Selenium WebDriver docs: https://www.selenium.dev/documentation/
- OpenAI API docs: https://platform.openai.com/docs
