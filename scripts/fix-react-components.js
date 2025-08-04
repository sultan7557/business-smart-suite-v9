#!/usr/bin/env node

// Fix React Components Script
// This script fixes the syntax errors in React components caused by the quick performance fixes

const fs = require('fs')
const path = require('path')

console.log('🔧 Fixing React component syntax errors...')

const reactComponents = [
  'components/business-continuity-client.tsx',
  'components/certificates-client.tsx',
  'components/corrective-actions-client.tsx',
  'components/coshh-client.tsx',
  'components/environmental-guidance-client.tsx',
  'components/forms-client.tsx',
  'components/hse-guidance-client.tsx',
  'components/job-descriptions-client.tsx',
  'components/management-reviews-client.tsx',
  'components/manuals-client.tsx',
  'components/procedures-client.tsx',
  'components/registers-client.tsx',
  'components/risk-assessments-client.tsx',
  'components/technical-file-client.tsx',
  'components/work-instructions-client.tsx',
]

function fixReactComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let fixed = false

  // Fix the incorrect React.memo syntax
  const incorrectMemoPattern = /export default function (\w+)\(([^)]*)\): \{\s*([^}]*)\s*\}\s*\)\s*\n\nexport default \$1/g
  
  if (incorrectMemoPattern.test(content)) {
    content = content.replace(incorrectMemoPattern, 'export default function $1($2) {\n  $3\n}')
    fixed = true
  }

  // Fix the broken React.memo wrapper
  const brokenMemoPattern = /const (\w+) = React\.memo\(function \1\(([^)]*)\): \{\s*([^}]*)\s*\}\s*\)\s*\n\nexport default \$1/g
  
  if (brokenMemoPattern.test(content)) {
    content = content.replace(brokenMemoPattern, 'export default function $1($2) {\n  $3\n}')
    fixed = true
  }

  // Fix any remaining broken syntax
  const brokenSyntaxPattern = /\)\s*\n\nexport default \$1/g
  
  if (brokenSyntaxPattern.test(content)) {
    content = content.replace(brokenSyntaxPattern, '')
    fixed = true
  }

  // Add proper React.memo wrapper if needed
  if (!content.includes('React.memo') && content.includes('export default function')) {
    content = content.replace(
      /export default function (\w+)/g,
      'const $1 = React.memo(function $1'
    )
    content = content.replace(
      /^}$/m,
      '})\n\nexport default $1'
    )
    fixed = true
  }

  if (fixed) {
    fs.writeFileSync(filePath, content)
    console.log(`✅ Fixed: ${filePath}`)
  } else {
    console.log(`✅ No fixes needed: ${filePath}`)
  }
}

// Fix all React components
reactComponents.forEach(fixReactComponent)

console.log('🎉 React component syntax errors fixed!')
console.log('📋 Next steps:')
console.log('1. Run: npm run build')
console.log('2. Test the application')
console.log('3. Deploy to production') 