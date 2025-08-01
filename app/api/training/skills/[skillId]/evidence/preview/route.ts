import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { join } from 'path'
import { createReadStream, existsSync } from 'fs'

export async function GET(req: NextRequest, context: { params: { skillId: string } }) {
  const params = typeof context.params.then === 'function' ? await context.params : context.params;
  const skillId = params.skillId;
  if (!skillId) {
    return new NextResponse('Skill ID required', { status: 400 })
  }
  
  const employeeSkill = await prisma.employeeSkill.findUnique({
    where: { id: skillId },
    include: {
      skill: true,
      employee: true
    }
  })
  
  if (!employeeSkill) {
    return new NextResponse('Skill not found', { status: 404 })
  }
  
  if (!employeeSkill.evidence) {
    return new NextResponse('No evidence file found', { status: 404 })
  }
  
  // The evidence field contains the file URL like /uploads/filename.ext
  const filePath = join(process.cwd(), 'public', employeeSkill.evidence)
  if (!existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 })
  }
  
  const stream = createReadStream(filePath)
  const response = new NextResponse(stream as any)
  
  // Try to determine content type from file extension
  const fileExtension = employeeSkill.evidence.split('.').pop()?.toLowerCase()
  let contentType = 'application/octet-stream'
  
  switch (fileExtension) {
    case 'pdf':
      contentType = 'application/pdf'
      break
    case 'jpg':
    case 'jpeg':
      contentType = 'image/jpeg'
      break
    case 'png':
      contentType = 'image/png'
      break
    case 'doc':
      contentType = 'application/msword'
      break
    case 'docx':
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      break
    case 'xls':
      contentType = 'application/vnd.ms-excel'
      break
    case 'xlsx':
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
  }
  
  response.headers.set('Content-Type', contentType)
  response.headers.set('Content-Disposition', 'inline')
  return response
} 