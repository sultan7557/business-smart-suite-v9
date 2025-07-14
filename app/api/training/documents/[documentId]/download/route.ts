import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { join } from 'path'
import { createReadStream, existsSync } from 'fs'

export async function GET(req: NextRequest, context: { params: { documentId: string } }) {
  const params = typeof context.params.then === 'function' ? await context.params : context.params;
  const documentId = params.documentId;
  if (!documentId) {
    return new NextResponse('Document ID required', { status: 400 })
  }
  const document = await prisma.employeeDocument.findUnique({
    where: { id: documentId },
  })
  if (!document) {
    return new NextResponse('Document not found', { status: 404 })
  }
  // The fileUrl is like /uploads/filename.ext
  const filePath = join(process.cwd(), 'public', document.fileUrl)
  if (!existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 })
  }
  const stream = createReadStream(filePath)
  const response = new NextResponse(stream as any)
  response.headers.set('Content-Type', document.fileType || 'application/octet-stream')
  // Check for ?download=1 to force download
  const url = new URL(req.url)
  const forceDownload = url.searchParams.get('download') === '1'
  response.headers.set('Content-Disposition', `${forceDownload ? 'attachment' : 'inline'}; filename="${document.title}"`)
  return response
} 