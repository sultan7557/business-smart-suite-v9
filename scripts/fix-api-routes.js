#!/usr/bin/env node

// Fix API Routes Script
// This script fixes the syntax errors in API routes caused by the quick performance fixes

const fs = require('fs')
const path = require('path')

console.log('🔧 Fixing API route syntax errors...')

const apiRoutes = [
  'app/api/business-continuity/route.ts',
  'app/api/certificates/route.ts',
  'app/api/custom-sections/route.ts',
  'app/api/job-descriptions/route.ts',
  'app/api/management-reviews/route.ts',
  'app/api/manuals/route.ts',
  'app/api/registers/route.ts',
  'app/api/risk-assessments/route.ts',
  'app/api/technical-file/route.ts',
  'app/api/hse-guidance/route.ts',
  'app/api/environmental-guidance/route.ts',
  'app/api/corrective-actions/route.ts',
  'app/api/forms/route.ts',
  'app/api/procedures/route.ts',
  'app/api/coshh/route.ts',
]

function fixApiRoute(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let fixed = false

  // Fix the incorrect catch block syntax
  const incorrectPattern = /} catch \(error, \{\s*status: 200,\s*headers: \{\s*"Content-Type": "application\/json",\s*"Cache-Control": "public, max-age=300",\s*\},\s*\}\) \{/g
  
  if (incorrectPattern.test(content)) {
    content = content.replace(incorrectPattern, '} catch (error) {')
    fixed = true
  }

  // Fix the incorrect return statement syntax
  const incorrectReturnPattern = /return NextResponse\.json\(([^,]+)\)\s*}\s*catch \(error, \{\s*status: 200,\s*headers: \{\s*"Content-Type": "application\/json",\s*"Cache-Control": "public, max-age=300",\s*\},\s*\}\) \{/g
  
  if (incorrectReturnPattern.test(content)) {
    content = content.replace(incorrectReturnPattern, 'return NextResponse.json($1, {\n        status: 200,\n        headers: {\n          "Content-Type": "application/json",\n          "Cache-Control": "public, max-age=300",\n        },\n      })\n  } catch (error) {')
    fixed = true
  }

  // Fix simple return statements that need caching headers
  const simpleReturnPattern = /return NextResponse\.json\(([^,]+)\)\s*}\s*catch \(error\) \{/g
  
  if (simpleReturnPattern.test(content)) {
    content = content.replace(simpleReturnPattern, 'return NextResponse.json($1, {\n        status: 200,\n        headers: {\n          "Content-Type": "application/json",\n          "Cache-Control": "public, max-age=300",\n        },\n      })\n  } catch (error) {')
    fixed = true
  }

  if (fixed) {
    fs.writeFileSync(filePath, content)
    console.log(`✅ Fixed: ${filePath}`)
  } else {
    console.log(`✅ No fixes needed: ${filePath}`)
  }
}

// Fix all API routes
apiRoutes.forEach(fixApiRoute)

console.log('🎉 API route syntax errors fixed!')
console.log('📋 Next steps:')
console.log('1. Run: npm run build')
console.log('2. Test the application')
console.log('3. Deploy to production') 