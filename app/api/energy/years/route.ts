import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function convertDBToEnergyData(rows: any) {
	const months = Array.from({ length: 12 }, (_, i) => i + 1)
	const byMonth: Record<number, any> = {}
	rows.forEach((r: any) => { byMonth[r.month] = r })
	const get = (field: string) => months.map(m => byMonth[m]?.[field] ?? 0)
	return {
		electricity: { meter1: get('electricityMeter1'), meter2: get('electricityMeter2') },
		gas: { meter1: get('gasMeter1'), meter2: get('gasMeter2') },
		water: { water1: get('water1'), water2: get('water2') },
		paper: get('paper'),
		fuel: get('fuel'),
		generalWaste: { waste1: get('generalWaste1'), waste2: get('generalWaste2') },
		recycledWaste: { waste1: get('recycledWaste1'), waste2: get('recycledWaste2') },
		scrapMetal: get('scrapMetal'),
		foodWaste: { waste1: get('foodWaste1'), waste2: get('foodWaste2') },
		wood: get('wood'),
		cardBales: get('cardBales'),
	}
}

export async function GET() {
	const organizationId = 'default'
	const years = await prisma.energyYear.findMany({ where: { organizationId, isActive: true }, orderBy: { year: 'asc' }, include: { monthlyData: true } })
	const mapped = years.map(y => ({ id: y.id, name: y.name, year: y.year, data: convertDBToEnergyData(y.monthlyData), createdAt: y.createdAt, updatedAt: y.updatedAt }))
	return NextResponse.json({ years: mapped })
}

export async function POST(req: Request) {
	const { year, name } = await req.json()
	const organizationId = 'default'
	const created = await prisma.energyYear.create({ data: { year, name, organizationId } })
	return NextResponse.json({ year: created })
}
