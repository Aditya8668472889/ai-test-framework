import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Convert URL to a clean class name e.g. https://demo.opencart.com → OpenCart
function urlToClassName(url: string): string {
  return url
    .replace(/https?:\/\//, '')
    .replace(/www\./, '')
    .split('.')[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^\w/, c => c.toUpperCase()) + 'Page';
}

async function generateTests(url: string) {
  console.log(`\n🤖 Generating tests for: ${url}`);
  console.log('─────────────────────────────────────');

  const className = urlToClassName(url);
  console.log(`📝 Class name: ${className}`);

  const prompt = `
    You are a senior test automation engineer.
    
    Generate Playwright TypeScript test cases for this URL: ${url}
    
    STRICT RULES — follow exactly:

    1. Generate TWO separate files clearly marked with these exact separators:

    ===SPEC_FILE===
    (spec file content here)
    ===END_SPEC===

    ===PAGE_FILE===
    (page object content here)
    ===END_PAGE===

    2. SPEC FILE rules:
    - Import the Page Object from '../pages/${className}'
    - Use exactly this class name: ${className}
    - Each test body must be exactly ONE line — a single POM method call
    - No expect(), no locators, no logic inside spec at all
    - Use beforeEach to initialize the page object and call goto()
    - Generate exactly 5 tests

    3. PAGE FILE rules:
    - Full Page Object class named exactly: ${className}
    - Follow this EXACT structure:

    import { Page, Locator, expect } from '@playwright/test';

    export class ${className} {

      readonly page: Page;
      readonly someElement: Locator;
      readonly anotherElement: Locator;

      constructor(page: Page) {
        this.page = page;
        this.someElement = page.locator('#some-selector');
        this.anotherElement = page.locator('[data-test="something"]');
      }

      async goto() {
        await this.page.goto('${url}');
      }

      async verifyMethodName() {
        await this.someElement.fill('value');
        await expect(this.anotherElement).toContainText('expected');
      }

    }

    - ALL locators must be defined as readonly Locator in constructor — never inline
    - NO hardcoded strings inside methods — use the readonly Locator properties
    - Every method bundles action + assertion together
    - No parameters in public methods — all data defined inside the method
    - Export the class

    4. Keep total output under 150 lines
    5. Return ONLY TypeScript code, no explanations
    6. Make sure ALL brackets are properly closed
  `;

  try {
    console.log('⏳ Asking Claude to generate tests...');

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Clean up markdown
    const cleanResponse = response
      .replace(/```typescript/g, '')
      .replace(/```ts/g, '')
      .replace(/```/g, '')
      .trim();

    // Split into spec and page files
    const specMatch = cleanResponse.match(/===SPEC_FILE===([\s\S]*?)===END_SPEC===/);
    const pageMatch = cleanResponse.match(/===PAGE_FILE===([\s\S]*?)===END_PAGE===/);

    if (!specMatch || !pageMatch) {
      console.error('❌ Could not parse generated files — please run again');
      console.log('Raw response:', cleanResponse.substring(0, 300));
      process.exit(1);
    }

    const specCode = specMatch[1].trim();
    const pageCode = pageMatch[1].trim();

    // Safety checks
    if (!specCode.includes('test(')) {
      console.error('❌ No tests found in spec file — please run again');
      process.exit(1);
    }

    if (!pageCode.includes('class')) {
      console.error('❌ No class found in page file — please run again');
      process.exit(1);
    }

    const specEndsCorrectly = specCode.endsWith('}') || specCode.endsWith('});');
    const pageEndsCorrectly = pageCode.endsWith('}') || pageCode.endsWith('});');

    if (!specEndsCorrectly || !pageEndsCorrectly) {
      console.error('❌ Generated code appears incomplete — please run again');
      console.log('Spec ends with:', specCode.slice(-20));
      console.log('Page ends with:', pageCode.slice(-20));
      process.exit(1);
    }

    // Save spec file with timestamp
    const timestamp = Date.now();
    const specFileName = `generated_${timestamp}.spec.ts`;
    const specPath = path.join(__dirname, '..', 'tests', specFileName);
    fs.writeFileSync(specPath, specCode);

    // Save page file with class name — unique per URL
    const pageFileName = `${className}.ts`;
    const pagePath = path.join(__dirname, '..', 'pages', pageFileName);
    fs.writeFileSync(pagePath, pageCode);

    console.log('✅ Files generated successfully!');
    console.log(`📁 Spec saved to: tests/${specFileName}`);
    console.log(`📁 Page saved to: pages/${pageFileName}`);
    console.log(`📊 Spec lines: ${specCode.split('\n').length}`);
    console.log(`📊 Page lines: ${pageCode.split('\n').length}`);
    console.log('\n--- Spec Preview ---\n');
    console.log(specCode.substring(0, 300) + '...');
    console.log('\n--- Page Preview ---\n');
    console.log(pageCode.substring(0, 300) + '...');

  } catch (error) {
    console.error('❌ Error generating tests:', error);
  }
}

const url = process.argv[2];

if (!url) {
  console.error('❌ Please provide a URL');
  console.error('Usage: ts-node utils/generateTests.ts <url>');
  process.exit(1);
}

generateTests(url);