import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
	const body = await req.json()
	const { id } = await context.params
	await prisma.energyMonthlyData.deleteMany({ where: { energyYearId: id } })
	const rows = [] as any[]
	for (let m = 1; m <= 12; m++) rows.push({ ...convertEnergyDataToDB(body, m), energyYearId: id })
	await prisma.energyMonthlyData.createMany({ data: rows })
	return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params
	await prisma.energyMonthlyData.deleteMany({ where: { energyYearId: id } })
	await prisma.energyYear.delete({ where: { id } })
	return NextResponse.json({ success: true })
}
