import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const supplierId = searchParams.get('supplierId')
  if (!supplierId) {
    return NextResponse.json([], { status: 200 })
  }
  
  const documents = await prisma.supplierDocument.findMany({
    where: { supplierId },
    orderBy: { uploadedAt: 'desc' },
    select: {
      id: true,
      title: true,
      fileType: true,
      size: true,
      uploadedAt: true,
      expiryDate: true,
      assignedUserId: true,
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
  })
  
  // Set cache control headers to prevent caching
  const response = NextResponse.json(documents)
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
} 