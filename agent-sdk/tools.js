import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import path from 'path';

// Create state object to hold browser instance and config
function createToolsState() {
  return {
    driver: null,
    screenshotDir: './screenshots',
    screenshotCounter: 0
  };
}

// Initialize screenshots directory
function initializeScreenshotDir(screenshotDir) {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
}

/**
 * Tool 1: Open Browser
 * Opens a Chrome browser instance
 */
async function openBrowser(state) {
  try {
    const options = new chrome.Options();
    options.addArguments('--start-maximized');
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    // Selenium 4.x Manager will automatically download the correct ChromeDriver version
    state.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('✅ Browser opened successfully');
    return {
      success: true,
      message: 'Browser opened successfully'
    };
  } catch (error) {
    console.error('❌ Failed to open browser:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tool 2: Open URL
 * Navigates to a specific URL
 */
async function openUrl(state, url) {
  try {
    if (!state.driver) {
      throw new Error('Browser not opened. Please open browser first.');
    }
    
    await state.driver.get(url);
    // Wait for page to load
    await state.driver.sleep(2000);
    
    console.log(`✅ Navigated to: ${url}`);
    return {
      success: true,
      message: `Successfully navigated to ${url}`
    };
  } catch (error) {
    console.error('❌ Failed to open URL:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tool 3: Take Screenshot
 * Captures a screenshot of the current page
 */
async function takeScreenshot(state, description = '') {
  try {
    if (!state.driver) {
      throw new Error('Browser not opened. Please open browser first.');
    }
    
    state.screenshotCounter++;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot_${state.screenshotCounter}_${timestamp}.png`;
    const filepath = path.join(state.screenshotDir, filename);
    
    const screenshot = await state.driver.takeScreenshot();
    fs.writeFileSync(filepath, screenshot, 'base64');
    
    console.log(`📸 Screenshot saved: ${filename}`);
    if (description) {
      console.log(`   Description: ${description}`);
    }
    
    return {
      success: true,
      message: `Screenshot saved as ${filename}`,
      filepath: filepath,
      description: description,
      screenshotData: screenshot
    };
  } catch (error) {
    console.error('❌ Failed to take screenshot:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tool 4: Click on Screen
 * Clicks on an element identified by selector
 */
async function clickOnScreen(state, selector, selectorType = 'css') {
  try {
    if (!state.driver) {
      throw new Error('Browser not opened. Please open browser first.');
    }
    
    let element;
    
    switch (selectorType.toLowerCase()) {
      case 'id':
        element = await state.driver.wait(until.elementLocated(By.id(selector)), 10000);
        break;
      case 'name':
        element = await state.driver.wait(until.elementLocated(By.name(selector)), 10000);
        break;
      case 'xpath':
        element = await state.driver.wait(until.elementLocated(By.xpath(selector)), 10000);
        break;
      case 'css':
      default:
        element = await state.driver.wait(until.elementLocated(By.css(selector)), 10000);
        break;
    }
    
    await state.driver.wait(until.elementIsVisible(element), 10000);
    await element.click();
    
    console.log(`🖱️  Clicked on element: ${selector} (${selectorType})`);
    return {
      success: true,
      message: `Successfully clicked on ${selector}`
    };
  } catch (error) {
    console.error('❌ Failed to click:', error.message);
    return {
      success: false,
      error: error.message,
      selector: selector
    };
  }
}

/**
 * Tool 5: Send Keys
 * Types text into an input field
 */
async function sendKeys(state, selector, text, selectorType = 'css') {
  try {
    if (!state.driver) {
      throw new Error('Browser not opened. Please open browser first.');
    }
    
    let element;
    
    switch (selectorType.toLowerCase()) {
      case 'id':
        element = await state.driver.wait(until.elementLocated(By.id(selector)), 10000);
        break;
      case 'name':
        element = await state.driver.wait(until.elementLocated(By.name(selector)), 10000);
        break;
      case 'xpath':
        element = await state.driver.wait(until.elementLocated(By.xpath(selector)), 10000);
        break;
      case 'css':
      default:
        element = await state.driver.wait(until.elementLocated(By.css(selector)), 10000);
        break;
    }
    
    await state.driver.wait(until.elementIsVisible(element), 10000);
    await element.clear();
    await element.sendKeys(text);
    
    console.log(`⌨️  Typed into element: ${selector} (${selectorType})`);
    return {
      success: true,
      message: `Successfully sent keys to ${selector}`
    };
  } catch (error) {
    console.error('❌ Failed to send keys:', error.message);
    return {
      success: false,
      error: error.message,
      selector: selector
    };
  }
}

/**
 * Helper: Get page source
 */
async function getPageSource(state) {
  try {
    if (!state.driver) {
      throw new Error('Browser not opened.');
    }
    return await state.driver.getPageSource();
  } catch (error) {
    console.error('❌ Failed to get page source:', error.message);
    return null;
  }
}

/**
 * Helper: Get current URL
 */
async function getCurrentUrl(state) {
  try {
    if (!state.driver) {
      throw new Error('Browser not opened.');
    }
    return await state.driver.getCurrentUrl();
  } catch (error) {
    console.error('❌ Failed to get current URL:', error.message);
    return null;
  }
}

/**
 * Helper: Find elements
 */
async function findElements(state, selector, selectorType = 'css') {
  try {
    if (!state.driver) {
      throw new Error('Browser not opened.');
    }
    
    let elements;
    switch (selectorType.toLowerCase()) {
      case 'id':
        elements = await state.driver.findElements(By.id(selector));
        break;
      case 'name':
        elements = await state.driver.findElements(By.name(selector));
        break;
      case 'xpath':
        elements = await state.driver.findElements(By.xpath(selector));
        break;
      case 'tag':
        elements = await state.driver.findElements(By.tagName(selector));
        break;
      case 'css':
      default:
        elements = await state.driver.findElements(By.css(selector));
        break;
    }
    
    return elements;
  } catch (error) {
    console.error('❌ Failed to find elements:', error.message);
    return [];
  }
}

/**
 * Helper: Execute JavaScript
 */
async function executeScript(state, script) {
  try {
    if (!state.driver) {
      throw new Error('Browser not opened.');
    }
    return await state.driver.executeScript(script);
  } catch (error) {
    console.error('❌ Failed to execute script:', error.message);
    return null;
  }
}

/**
 * Cleanup: Close browser
 */
async function closeBrowser(state) {
  try {
    if (state.driver) {
      await state.driver.quit();
      state.driver = null;
      console.log('✅ Browser closed successfully');
    }
  } catch (error) {
    console.error('❌ Failed to close browser:', error.message);
  }
}

// Export all tools and utilities
export {
  createToolsState,
  initializeScreenshotDir,
  openBrowser,
  openUrl,
  takeScreenshot,
  clickOnScreen,
  sendKeys,
  getPageSource,
  getCurrentUrl,
  findElements,
  executeScript,
  closeBrowser
};
