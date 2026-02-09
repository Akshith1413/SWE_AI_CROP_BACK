/**
 * Test script for crop validation system
 * Run this after starting the server to test validation endpoints
 */

const BASE_URL = 'http://localhost:3000/api';

// Test cases
const tests = [
    {
        name: 'Valid Crop and Disease',
        endpoint: '/crop-advice',
        method: 'POST',
        data: {
            crop: 'Tomato',
            disease: 'Early Blight',
            severity: 'medium',
            confidence: 0.93
        },
        expectedSuccess: true
    },
    {
        name: 'Invalid Crop (Nonsensical)',
        endpoint: '/crop-advice',
        method: 'POST',
        data: {
            crop: 'xyz123',
            disease: 'Early Blight'
        },
        expectedSuccess: false
    },
    {
        name: 'Invalid Disease (Nonsensical)',
        endpoint: '/crop-advice',
        method: 'POST',
        data: {
            crop: 'Tomato',
            disease: 'random nonsense disease'
        },
        expectedSuccess: false
    },
    {
        name: 'Fuzzy Match - Crop Typo',
        endpoint: '/crop-advice',
        method: 'POST',
        data: {
            crop: 'tomatoe',
            disease: 'Early Blight'
        },
        expectedSuccess: true
    },
    {
        name: 'Valid Crops List',
        endpoint: '/crop-advice/valid-crops',
        method: 'GET',
        expectedSuccess: true
    },
    {
        name: 'Diseases for Tomato',
        endpoint: '/crop-advice/diseases/tomato',
        method: 'GET',
        expectedSuccess: true
    },
    {
        name: 'Batch - One Invalid Entry',
        endpoint: '/crop-advice/batch',
        method: 'POST',
        data: {
            diseases: [
                {
                    crop: 'Tomato',
                    disease: 'Early Blight'
                },
                {
                    crop: 'nonsense',
                    disease: 'fake disease'
                }
            ]
        },
        expectedSuccess: false
    }
];

async function runTest(test) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test: ${test.name}`);
    console.log(`${'='.repeat(60)}`);

    try {
        const url = `${BASE_URL}${test.endpoint}`;
        const options = {
            method: test.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (test.data && test.method === 'POST') {
            options.body = JSON.stringify(test.data);
        }

        console.log(`Request: ${test.method} ${url}`);
        if (test.data) {
            console.log('Data:', JSON.stringify(test.data, null, 2));
        }

        const response = await fetch(url, options);
        const result = await response.json();

        console.log(`\nStatus: ${response.status}`);
        console.log('Response:', JSON.stringify(result, null, 2));

        const passed = result.success === test.expectedSuccess;
        console.log(`\n✅ Test ${passed ? 'PASSED' : 'FAILED'}`);

        if (!passed) {
            console.log(`Expected success: ${test.expectedSuccess}, Got: ${result.success}`);
        }

        return passed;
    } catch (error) {
        console.error('❌ Test ERROR:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('CROP VALIDATION SYSTEM - TEST SUITE');
    console.log('='.repeat(60));
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Total Tests: ${tests.length}`);

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const result = await runTest(test);
        if (result) {
            passed++;
        } else {
            failed++;
        }

        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total: ${tests.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log('='.repeat(60) + '\n');
}

// Run tests
runAllTests().catch(console.error);
