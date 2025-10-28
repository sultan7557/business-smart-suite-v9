import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"
import { formatDate } from "@/lib/utils"

export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const aspectImpact = await prisma.iMSAspectImpact.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
        updatedBy: { select: { name: true } },
        documents: { orderBy: { uploadedAt: "desc" } },
        reviews: { orderBy: { reviewDate: "desc" } },
        versions: { orderBy: { createdAt: "desc" } },
      },
    })

    if (!aspectImpact) {
      return NextResponse.json({ error: "IMS Aspect Impact not found" }, { status: 404 })
    }

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

    const generateIMSAspectImpactHTML = (item: typeof aspectImpact) => `
      <!DOCTYPE html>
      <html>
      <head>
          <title>IMS Aspect Impact - ${item.activityProductService}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 12px; line-height: 1.5; }
              .container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h1 { margin: 0; font-size: 24px; }
              .header h2 { margin: 5px 0 15px 0; font-size: 18px; color: #555; }
              .section-title { font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
              .info-item strong { display: block; margin-bottom: 2px; color: #555; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .text-red-600 { color: #dc2626; }
              .text-orange-600 { color: #ea580c; }
              .text-yellow-600 { color: #ca8a04; }
              .text-blue-600 { color: #2563eb; }
              .text-green-600 { color: #16a34a; }
              .text-center { text-align: center; }
              .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #888; }
              .page-break { page-break-before: always; }
              @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>IMS ASPECTS & IMPACTS REGISTER</h1>
                  <h2>${item.activityProductService}</h2>
              </div>

              <div class="info-grid">
                  <div class="info-item"><strong>Category:</strong> ${item.category}</div>
                  <div class="info-item"><strong>Activity/Product/Service:</strong> ${item.activityProductService}</div>
                  <div class="info-item"><strong>Created By:</strong> ${item.createdBy.name}</div>
                  <div class="info-item"><strong>Created At:</strong> ${formatDate(item.createdAt)}</div>
                  <div class="info-item"><strong>Last Updated By:</strong> ${item.updatedBy?.name || 'N/A'}</div>
                  <div class="info-item"><strong>Last Updated At:</strong> ${formatDate(item.updatedAt)}</div>
              </div>

              <div class="section-title">ASPECTS</div>
              <div class="info-grid">
                  ${item.aspects.map(aspect => `<div class="info-item">• ${aspect}</div>`).join('')}
              </div>

              <div class="section-title">IMPACTS</div>
              <div class="info-grid">
                  ${item.impacts.map(impact => `<div class="info-item">• ${impact}</div>`).join('')}
              </div>

              <div class="section-title">RISK ANALYSIS BEFORE CONTROL MEASURES</div>
              <table>
                  <thead>
                      <tr>
                          <th>Likelihood</th>
                          <th>Severity</th>
                          <th>Risk Level</th>
                          <th>Risk Description</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td class="text-center">${item.initialLikelihood}</td>
                          <td class="text-center">${item.initialSeverity}</td>
                          <td class="text-center">
                              <span class="${getRiskLevelColor(item.initialRiskLevel)}">
                                  ${item.initialRiskLevel}
                              </span>
                              <div style="font-size: 10px; color: #666;">${getRiskLevelDescription(item.initialRiskLevel)}</div>
                          </td>
                          <td>${item.commentsRecommendations || 'N/A'}</td>
                      </tr>
                  </tbody>
              </table>

              <div class="section-title">RISK ANALYSIS AFTER CONTROL MEASURES</div>
              <table>
                  <thead>
                      <tr>
                          <th>Residual Likelihood</th>
                          <th>Residual Severity</th>
                          <th>Residual Risk Level</th>
                          <th>Risk Description</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td class="text-center">${item.residualLikelihood}</td>
                          <td class="text-center">${item.residualSeverity}</td>
                          <td class="text-center">
                              <span class="${getRiskLevelColor(item.residualRiskLevel)}">
                                  ${item.residualRiskLevel}
                              </span>
                              <div style="font-size: 10px; color: #666;">${getRiskLevelDescription(item.residualRiskLevel)}</div>
                          </td>
                          <td>${item.controlMeasures || 'N/A'}</td>
                      </tr>
                  </tbody>
              </table>

              <div class="section-title">CONTROL OBJECTIVES</div>
              <div class="info-grid">
                  ${item.controlObjectives.map(objective => `<div class="info-item">• ${objective}</div>`).join('')}
              </div>

              ${item.reviews.length > 0 ? `
              <div class="section-title">REVIEWS</div>
              <table>
                  <thead>
                      <tr>
                          <th>Reviewer</th>
                          <th>Review Date</th>
                          <th>Next Review Date</th>
                          <th>Details</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${item.reviews.map((review: any) => `
                      <tr>
                          <td>${review.reviewerName || 'N/A'}</td>
                          <td>${formatDate(review.reviewDate)}</td>
                          <td>${review.nextReviewDate ? formatDate(review.nextReviewDate) : 'N/A'}</td>
                          <td>${review.reviewDetails || 'N/A'}</td>
                      </tr>
                      `).join('')}
                  </tbody>
              </table>
              ` : ''}

              <div class="footer">
                  <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              </div>
          </div>
      </body>
      </html>
    `
    const htmlContent = generateIMSAspectImpactHTML(aspectImpact)

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="ims-aspect-impact-${aspectImpact.activityProductService.replace(/[^a-zA-Z0-9]/g, '-')}.html"`,
      },
    })
  } catch (error) {
    console.error("Error generating IMS Aspect Impact PDF:", error)
    return NextResponse.json({ error: "Failed to generate IMS Aspect Impact PDF" }, { status: 500 })
  }
}, "read")
