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

function convertEnergyDataToDB(data: any, month: number) {
	return {
		month,
		electricityMeter1: data.electricity.meter1[month - 1] || 0,
		electricityMeter2: data.electricity.meter2[month - 1] || 0,
		gasMeter1: data.gas.meter1[month - 1] || 0,
		gasMeter2: data.gas.meter2[month - 1] || 0,
		water1: data.water.water1[month - 1] || 0,
		water2: data.water.water2[month - 1] || 0,
		paper: data.paper[month - 1] || 0,
		fuel: data.fuel[month - 1] || 0,
		generalWaste1: data.generalWaste.waste1[month - 1] || 0,
		generalWaste2: data.generalWaste.waste2[month - 1] || 0,
		recycledWaste1: data.recycledWaste.waste1[month - 1] || 0,
		recycledWaste2: data.recycledWaste.waste2[month - 1] || 0,
		scrapMetal: data.scrapMetal[month - 1] || 0,
		foodWaste1: data.foodWaste.waste1[month - 1] || 0,
		foodWaste2: data.foodWaste.waste2[month - 1] || 0,
		wood: data.wood[month - 1] || 0,
		cardBales: data.cardBales[month - 1] || 0,
	}
}

export async function GET() {
	const organizationId = 'default'
	const rows = await prisma.energyBaseline.findMany({ where: { organizationId }, orderBy: { month: 'asc' } })
	if (!rows.length) return NextResponse.json({ baseline: null })
	return NextResponse.json({ baseline: { id: 'baseline', ...convertDBToEnergyData(rows), createdAt: rows[0].createdAt, updatedAt: rows[0].updatedAt } })
}

export async function POST(req: Request) {
	const organizationId = 'default'
	const data = await req.json()
	await prisma.energyBaseline.deleteMany({ where: { organizationId } })
	const rows = [] as any[]
	for (let m = 1; m <= 12; m++) rows.push({ ...convertEnergyDataToDB(data, m), year: 0, organizationId })
	await prisma.energyBaseline.createMany({ data: rows })
	return NextResponse.json({ success: true })
}
