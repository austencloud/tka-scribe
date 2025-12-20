/**
 * Test Deep Analysis Engine
 * 
 * Run with: node test-deep-analysis.js
 * 
 * This script tests the deep analysis functionality by:
 * 1. Checking Ollama connectivity
 * 2. Creating a mock feedback item
 * 3. Running the deep analysis
 */

import http from 'http';

// Mock feedback item for testing
const mockFeedback = {
  id: 'test-feedback-001',
  title: 'Beat frame layout is confusing',
  description: 'When I try to change the beat frame layout, the options panel is confusing. The icons don\'t clearly show what each layout option will do.',
  type: 'bug',
  priority: 'medium',
  status: 'new',
  capturedModule: 'create',
  capturedTab: 'sequence',
  createdAt: new Date()
};

async function checkOllamaHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:11434/api/tags', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const models = parsed.models || [];
          const hasQwen = models.some(m => m.name === 'qwen2.5:32b');
          resolve({ available: true, hasQwen, models: models.map(m => m.name) });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000);
  });
}

async function testDeepAnalysisEndpoint() {
  console.log('🔍 Testing Deep Analysis Endpoint\n');
  console.log('=' .repeat(60));
  
  // Step 1: Check Ollama health
  console.log('\n📡 Step 1: Checking Ollama health...');
  try {
    const health = await checkOllamaHealth();
    console.log(`   ✅ Ollama is running`);
    console.log(`   Models available: ${health.models.join(', ')}`);
    const hasLlama = health.models.some(m => m.includes('llama3.2'));
    console.log(`   Has llama3.2: ${hasLlama ? '✅ Yes' : '❌ No'}`);
    
    if (!hasLlama) {
      console.log('\n⚠️  llama3.2 is recommended for faster analysis.');
      console.log('   Run: ollama pull llama3.2:latest');
    }
  } catch (error) {
    console.log(`   ❌ Ollama is not running or not reachable`);
    console.log(`   Error: ${error.message}`);
    console.log('\n💡 Start Ollama and try again.');
    return;
  }

  // Step 2: Test the API health endpoint
  console.log('\n📡 Step 2: Testing API health endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:5173/api/feedback/deep-analyze?action=health');
    const healthData = await healthResponse.json();
    console.log(`   API Response: ${JSON.stringify(healthData)}`);
    
    if (!healthData.available) {
      console.log(`   ❌ API reports Ollama not available: ${healthData.error}`);
      return;
    }
    console.log(`   ✅ API health check passed`);
  } catch (error) {
    console.log(`   ❌ Could not reach API endpoint`);
    console.log(`   Make sure dev server is running (npm run dev)`);
    console.log(`   Error: ${error.message}`);
    return;
  }

  // Step 3: Test deep analysis with mock feedback
  console.log('\n📡 Step 3: Testing deep analysis with mock feedback...');
  console.log(`   Feedback: "${mockFeedback.title}"`);
  console.log(`   Description: "${mockFeedback.description.substring(0, 60)}..."`);
  console.log('\n   Starting SSE stream...');
  console.log('   (This may take a few minutes as the AI explores the codebase)\n');

  try {
    const response = await fetch('http://localhost:5173/api/feedback/deep-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedbackData: mockFeedback,  // Use inline feedback data instead of feedbackId
        config: {
          maxIterations: 40,  // More iterations for thorough analysis
          confidenceThreshold: 0.70,  // Reasonable threshold
          maxFilesRead: 80
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`   ❌ API Error: ${response.status}`);
      console.log(`   ${JSON.stringify(errorData)}`);
      return;
    }

    // Read SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let eventCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const text = decoder.decode(value);
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6));
            eventCount++;
            
            // Format output based on event type
            switch (event.type) {
              case 'started':
                console.log(`   🚀 Analysis started`);
                break;
              case 'thinking':
                console.log(`   💭 ${event.message.substring(0, 80)}...`);
                break;
              case 'tool_call':
                console.log(`   🔧 Tool: ${event.data?.tool} - ${event.message.substring(0, 60)}`);
                break;
              case 'confidence_update':
                console.log(`   📊 Confidence: ${(event.data?.confidence * 100).toFixed(1)}%`);
                break;
              case 'iteration':
                console.log(`   🔄 Iteration ${event.data?.iteration}`);
                break;
              case 'completed':
                console.log(`   ✅ Analysis complete!`);
                console.log('\n   📋 Result Summary:');
                console.log(`   Files explored: ${event.data?.filesExplored || 'N/A'}`);
                console.log(`   Final confidence: ${((event.data?.confidence || 0) * 100).toFixed(1)}%`);
                break;
              case 'error':
                console.log(`   ❌ Error: ${event.message}`);
                break;
              default:
                console.log(`   📨 ${event.type}: ${event.message?.substring(0, 60)}`);
            }
          } catch (e) {
            // Ignore parse errors for partial data
          }
        }
      }
    }

    console.log(`\n   Total events received: ${eventCount}`);
    console.log('\n✅ Deep analysis test complete!');
    
  } catch (error) {
    console.log(`   ❌ Error during analysis: ${error.message}`);
  }
}

// Run the test
testDeepAnalysisEndpoint().catch(console.error);
