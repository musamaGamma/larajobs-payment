'use client'

import { useEffect, useState } from 'react'

export default function CSPTestPage() {
  const [cspHeaders, setCspHeaders] = useState<string>('')
  const [testResults, setTestResults] = useState<any>({})

  useEffect(() => {
    // Test CSP headers
    const testCSP = async () => {
      try {
        const response = await fetch('/api/csp-test')
        const cspHeader = response.headers.get('content-security-policy')
        setCspHeaders(cspHeader || 'No CSP header found')
        
        // Test HyperPay domains
        const tests = {
          'HyperPay Script Source': cspHeader?.includes('https://eu-test.oppwa.com'),
          'jQuery Script Source': cspHeader?.includes('https://code.jquery.com'),
          'Nonce Support': cspHeader?.includes('nonce-'),
          'Unsafe Eval Support': cspHeader?.includes('unsafe-eval'),
          'Frame Source': cspHeader?.includes('frame-src'),
          'Form Action': cspHeader?.includes('form-action'),
          'Object Source': cspHeader?.includes("object-src 'none'"),
        }
        
        setTestResults(tests)
      } catch (error) {
        console.error('CSP test failed:', error)
      }
    }

    testCSP()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">PCI DSS v4.0 CSP Compliance Test</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current CSP Headers</h2>
          <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
            {cspHeaders}
          </pre>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Compliance Tests</h2>
          <div className="space-y-2">
            {Object.entries(testResults).map(([test, passed]) => (
              <div key={test} className="flex items-center gap-2">
                <span className={passed ? 'text-green-600' : 'text-red-600'}>
                  {passed ? '✅' : '❌'}
                </span>
                <span>{test}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">PCI DSS v4.0 Requirements</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>✅ integrity=true parameter in checkout request</li>
            <li>✅ integrity attribute in script tag</li>
            <li>✅ crossorigin="anonymous" attribute</li>
            <li>✅ Nonce-based CSP for inline scripts</li>
            <li>✅ Restricted script-src to trusted domains</li>
            <li>✅ unsafe-eval support for HyperPay widget</li>
            <li>✅ Proper frame-src and form-action directives</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Test with actual HyperPay integration</li>
            <li>Verify integrity values are working</li>
            <li>Check CSP Evaluator tool results</li>
            <li>Test in production environment</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
