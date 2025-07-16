import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { join } from 'path'
import { createReadStream, existsSync } from 'fs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params
  if (!documentId) {
    return new NextResponse('Document ID required', { status: 400 })
  }
  const document = await prisma.supplierDocument.findUnique({
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
  response.headers.set('Content-Disposition', `inline; filename="${document.title}"`)
  return response
} 