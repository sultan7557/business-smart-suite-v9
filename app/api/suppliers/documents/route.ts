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
    },
  })
  return NextResponse.json(documents)
} 