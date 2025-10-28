import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"
import { formatDate } from "@/lib/utils"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || undefined

    const where: any = { archived: false }
    if (category && category !== "-- Category filter --") where.category = category

    const aspectImpacts = await prisma.iMSAspectImpact.findMany({
      where,
      include: {
        createdBy: { select: { name: true } },
        updatedBy: { select: { name: true } },
        documents: { orderBy: { uploadedAt: "desc" } },
        reviews: { orderBy: { reviewDate: "desc" } },
        versions: { orderBy: { createdAt: "desc" } },
      },
      orderBy: [
        { category: "asc" },
        { activityProductService: "asc" }
      ]
    })

    const getRiskLevelDescription = (riskLevel: number) => {
      if (riskLevel >= 20) return "Very High Risk"
      if (riskLevel >= 15) return "High Risk"
      if (riskLevel >= 10) return "Medium Risk"
      if (riskLevel >= 5) return "Low Risk"
      return "Very Low Risk"
    }

    const getRiskLevelColor = (riskLevel: number) => {
      if (riskLevel >= 20) return "text-red-600"
      if (riskLevel >= 15) return "text-orange-600"
      if (riskLevel >= 10) return "text-yellow-600"
      if (riskLevel >= 5) return "text-blue-600"
      return "text-green-600"
    }

    const generateGlobalIMSAspectImpactHTML = (items: typeof aspectImpacts) => `
      <!DOCTYPE html>
      <html>
      <head>
          <title>IMS Aspects & Impacts Register - Complete Report</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 11px; line-height: 1.4; }
              .container { max-width: 1200px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 28px; color: #1f2937; }
              .header h2 { margin: 5px 0 20px 0; font-size: 16px; color: #6b7280; }
              .summary { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
              .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
              .summary-item { text-align: center; }
              .summary-number { font-size: 24px; font-weight: bold; color: #1f2937; }
              .summary-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
              .item-card { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; padding: 15px; page-break-inside: avoid; }
              .item-header { display: flex; justify-content: between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
              .item-title { font-size: 16px; font-weight: bold; color: #1f2937; }
              .item-category { background-color: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; }
              .item-content { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .content-section h4 { font-size: 12px; font-weight: bold; color: #374151; margin-bottom: 8px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; }
              .aspects-list, .impacts-list { font-size: 10px; }
              .aspects-list li, .impacts-list li { margin-bottom: 3px; }
              .risk-analysis { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
              .risk-box { border: 1px solid #d1d5db; border-radius: 6px; padding: 10px; }
              .risk-level { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 5px; }
              .risk-description { font-size: 10px; text-align: center; }
              .text-red-600 { color: #dc2626; }
              .text-orange-600 { color: #ea580c; }
              .text-yellow-600 { color: #ca8a04; }
              .text-blue-600 { color: #2563eb; }
              .text-green-600 { color: #16a34a; }
              .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
              @media print {
                  body { margin: 0; }
                  .item-card { page-break-inside: avoid; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>IMS ASPECTS & IMPACTS REGISTER</h1>
                  <h2>Complete Environmental Risk Assessment Report</h2>
              </div>

              <div class="summary">
                  <div class="summary-grid">
                      <div class="summary-item">
                          <div class="summary-number">${items.length}</div>
                          <div class="summary-label">Total Entries</div>
                      </div>
                      <div class="summary-item">
                          <div class="summary-number">${items.filter(item => item.initialRiskLevel >= 15).length}</div>
                          <div class="summary-label">High Risk Items</div>
                      </div>
                      <div class="summary-item">
                          <div class="summary-number">${items.filter(item => item.residualRiskLevel < item.initialRiskLevel).length}</div>
                          <div class="summary-label">Risk Reduced</div>
                      </div>
                      <div class="summary-item">
                          <div class="summary-number">${new Set(items.map(item => item.category)).size}</div>
                          <div class="summary-label">Categories</div>
                      </div>
                  </div>
              </div>

              ${items.map((item, index) => `
              <div class="item-card">
                  <div class="item-header">
                      <div class="item-title">${item.activityProductService}</div>
                      <div class="item-category">${item.category}</div>
                  </div>
                  
                  <div class="item-content">
                      <div>
                          <h4>Environmental Aspects</h4>
                          <ul class="aspects-list">
                              ${item.aspects.map(aspect => `<li>• ${aspect}</li>`).join('')}
                          </ul>
                      </div>
                      <div>
                          <h4>Environmental Impacts</h4>
                          <ul class="impacts-list">
                              ${item.impacts.map(impact => `<li>• ${impact}</li>`).join('')}
                          </ul>
                      </div>
                  </div>

                  <div class="risk-analysis">
                      <div class="risk-box">
                          <h4>Initial Risk Assessment</h4>
                          <div class="risk-level ${getRiskLevelColor(item.initialRiskLevel)}">${item.initialRiskLevel}</div>
                          <div class="risk-description">${getRiskLevelDescription(item.initialRiskLevel)}</div>
                          <div style="font-size: 10px; margin-top: 8px;">
                              Likelihood: ${item.initialLikelihood} | Severity: ${item.initialSeverity}
                          </div>
                      </div>
                      <div class="risk-box">
                          <h4>Residual Risk Assessment</h4>
                          <div class="risk-level ${getRiskLevelColor(item.residualRiskLevel)}">${item.residualRiskLevel}</div>
                          <div class="risk-description">${getRiskLevelDescription(item.residualRiskLevel)}</div>
                          <div style="font-size: 10px; margin-top: 8px;">
                              Likelihood: ${item.residualLikelihood} | Severity: ${item.residualSeverity}
                          </div>
                      </div>
                  </div>

                  ${item.controlMeasures ? `
                  <div style="margin-top: 15px;">
                      <h4>Control Measures</h4>
                      <div style="font-size: 10px; background-color: #f9fafb; padding: 8px; border-radius: 4px;">
                          ${item.controlMeasures}
                      </div>
                  </div>
                  ` : ''}

                  ${item.controlObjectives.length > 0 ? `
                  <div style="margin-top: 15px;">
                      <h4>Control Objectives</h4>
                      <ul style="font-size: 10px; margin: 0; padding-left: 15px;">
                          ${item.controlObjectives.map(objective => `<li>${objective}</li>`).join('')}
                      </ul>
                  </div>
                  ` : ''}

                  <div style="margin-top: 15px; font-size: 9px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 8px;">
                      Created: ${formatDate(item.createdAt)} by ${item.createdBy.name} | 
                      Last Updated: ${formatDate(item.updatedAt)} by ${item.updatedBy?.name || 'N/A'}
                  </div>
              </div>
              `).join('')}

              <div class="footer">
                  <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                  <p>This report contains ${items.length} environmental risk assessments</p>
              </div>
          </div>
      </body>
      </html>
    `
    const htmlContent = generateGlobalIMSAspectImpactHTML(aspectImpacts)

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="ims-aspects-impacts-complete-report.html"`,
      },
    })
  } catch (error) {
    console.error("Error generating global IMS Aspect Impact PDF:", error)
    return NextResponse.json({ error: "Failed to generate global IMS Aspect Impact PDF" }, { status: 500 })
  }
}, "read")
