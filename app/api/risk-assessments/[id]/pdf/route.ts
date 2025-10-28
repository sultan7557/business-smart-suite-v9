import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"
import { notFound } from "next/navigation"

export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    
    const riskAssessment = await prisma.riskAssessment.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        updatedBy: {
          select: {
            name: true,
          },
        },
        assessmentDetails: {
          orderBy: {
            order: "asc",
          },
        },
        whoMayBeHarmed: true,
        ppeRequirements: true,
      },
    })

    if (!riskAssessment) {
      return NextResponse.json({ error: "Risk assessment not found" }, { status: 404 })
    }

    // Generate HTML content for the risk assessment
    const htmlContent = generateRiskAssessmentHTML(riskAssessment)

    // For now, we'll return the HTML content
    // In a production environment, you would use a library like puppeteer or jsPDF to generate actual PDF
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="risk-assessment-${riskAssessment.title.replace(/[^a-zA-Z0-9]/g, '-')}.html"`,
      },
    })
  } catch (error) {
    console.error("Error generating risk assessment PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}, "read")

function generateRiskAssessmentHTML(riskAssessment: any) {
  const formatDate = (date: Date) => new Date(date).toLocaleDateString()
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Risk Assessment - ${riskAssessment.title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            background-color: #f5f5f5;
            padding: 10px;
            border-left: 4px solid #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .risk-high { color: #d32f2f; font-weight: bold; }
        .risk-medium { color: #f57c00; font-weight: bold; }
        .risk-low { color: #388e3c; font-weight: bold; }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            border: 1px solid #ddd;
            padding: 10px;
        }
        .info-label {
            font-weight: bold;
            color: #666;
        }
        .checkbox-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .checkbox-item {
            display: flex;
            align-items: center;
        }
        .checkbox {
            margin-right: 8px;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RISK ASSESSMENT</h1>
        <h2>${riskAssessment.title}</h2>
        <p><strong>Category:</strong> ${riskAssessment.category.title}</p>
        <p><strong>Version:</strong> ${riskAssessment.version} | <strong>Review Date:</strong> ${formatDate(riskAssessment.reviewDate)}</p>
    </div>

    <div class="section">
        <div class="section-title">BASIC INFORMATION</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Department:</div>
                <div>${riskAssessment.department}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Review Date:</div>
                <div>${formatDate(riskAssessment.reviewDate)}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Next Review Date:</div>
                <div>${riskAssessment.nextReviewDate ? formatDate(riskAssessment.nextReviewDate) : 'Not set'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Created By:</div>
                <div>${riskAssessment.createdBy.name}</div>
            </div>
        </div>
    </div>

    ${riskAssessment.whoMayBeHarmed ? `
    <div class="section">
        <div class="section-title">WHO MAY BE HARMED</div>
        <div class="checkbox-list">
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.whoMayBeHarmed.employees ? '☑' : '☐'}</span>
                Employees
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.whoMayBeHarmed.contractors ? '☑' : '☐'}</span>
                Contractors
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.whoMayBeHarmed.visitors ? '☑' : '☐'}</span>
                Visitors
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.whoMayBeHarmed.environment ? '☑' : '☐'}</span>
                Environment
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.whoMayBeHarmed.others ? '☑' : '☐'}</span>
                Others
            </div>
            ${riskAssessment.whoMayBeHarmed.othersDescription ? `
            <div class="checkbox-item" style="grid-column: 1 / -1;">
                <strong>Others Description:</strong> ${riskAssessment.whoMayBeHarmed.othersDescription}
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    ${riskAssessment.ppeRequirements ? `
    <div class="section">
        <div class="section-title">PERSONAL PROTECTIVE EQUIPMENT</div>
        <div class="checkbox-list">
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.ppeRequirements.safetyBoots ? '☑' : '☐'}</span>
                Safety Boots
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.ppeRequirements.gloves ? '☑' : '☐'}</span>
                Gloves
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.ppeRequirements.highVisTop ? '☑' : '☐'}</span>
                High-Vis Top
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.ppeRequirements.highVisTrousers ? '☑' : '☐'}</span>
                High-Vis Trousers
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.ppeRequirements.overalls ? '☑' : '☐'}</span>
                Overalls
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.ppeRequirements.safetyHelmet ? '☑' : '☐'}</span>
                Safety Helmet
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.ppeRequirements.earDefenders ? '☑' : '☐'}</span>
                Ear Defenders
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.ppeRequirements.safetyGoggles ? '☑' : '☐'}</span>
                Safety Goggles
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.ppeRequirements.safetyGlasses ? '☑' : '☐'}</span>
                Safety Glasses
            </div>
            <div class="checkbox-item">
                <span class="checkbox">${riskAssessment.ppeRequirements.others ? '☑' : '☐'}</span>
                Others
            </div>
            ${riskAssessment.ppeRequirements.othersDescription ? `
            <div class="checkbox-item" style="grid-column: 1 / -1;">
                <strong>Others Description:</strong> ${riskAssessment.ppeRequirements.othersDescription}
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">RISK ASSESSMENT MATRIX</div>
        <table>
            <thead>
                <tr>
                    <th>SEVERITY (S)</th>
                    <th>LIKELIHOOD (L)</th>
                    <th>RISK LEVEL</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>5</strong> - Major (Fatality, Loss or damage causes serious business disruption; major fire, explosion etc.)</td>
                    <td><strong>5</strong> - Certain</td>
                    <td><strong>17+</strong><br/>High Risk - Not acceptable. Apply mitigation to eliminate or to further reduce the risk.</td>
                </tr>
                <tr>
                    <td><strong>4</strong> - Fairly High (Permanent disability, loss of limb, hearing or sight to one or more persons. Loss or damage is such that it could cause serious business disruption; fire, flood etc.)</td>
                    <td><strong>4</strong> - Very Likely</td>
                    <td><strong>8-16</strong><br/>Medium Risk - Apply mitigation to eliminate or reduce the risk, and if it remains a high risk, develop robust control measures to limit and manage the effects of any hazards.</td>
                </tr>
                <tr>
                    <td><strong>3</strong> - Moderate (breaks/fractures, loss or damage is such that it could cause minor business disruption)</td>
                    <td><strong>3</strong> - Likely</td>
                    <td><strong>1-7</strong><br/>Low Risk - May be accepted if all reasonably practicable control measures are in place, however, if more can be done to reduce or eliminate the risk, then it should be done.</td>
                </tr>
                <tr>
                    <td><strong>2</strong> - Minor (Minor Injury or illness, no lost time other than minor first aid, loss or damage not exceeding £100)</td>
                    <td><strong>2</strong> - Unlikely</td>
                    <td></td>
                </tr>
                <tr>
                    <td><strong>1</strong> - Very Low (Minor cuts or scratches, no lost time or business disruption)</td>
                    <td><strong>1</strong> - Very Unlikely</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">ASSESSMENT DETAILS</div>
        <table>
            <thead>
                <tr>
                    <th>Hazard Identified</th>
                    <th>Current Controls</th>
                    <th>Severity</th>
                    <th>Likelihood</th>
                    <th>Risk Factor</th>
                    <th>Additional Controls</th>
                    <th>Residual Risk</th>
                    <th>Residual Risk Score</th>
                </tr>
            </thead>
            <tbody>
                ${riskAssessment.assessmentDetails.map((detail: any) => `
                <tr>
                    <td>${detail.hazardIdentified || '-'}</td>
                    <td>${detail.currentControls || '-'}</td>
                    <td>${detail.severity}</td>
                    <td>${detail.likelihood}</td>
                    <td class="risk-${detail.riskFactor >= 17 ? 'high' : detail.riskFactor >= 8 ? 'medium' : 'low'}">${detail.riskFactor}</td>
                    <td>${detail.additionalControls || '-'}</td>
                    <td class="risk-${detail.residualRisk === 'H' ? 'high' : detail.residualRisk === 'M' ? 'medium' : 'low'}">${detail.residualRisk}</td>
                    <td class="risk-${detail.residualRisk === 'H' ? 'high' : detail.residualRisk === 'M' ? 'medium' : 'low'}">
                        ${detail.residualRisk === 'H' ? '17+' : detail.residualRisk === 'M' ? '8-16' : '1-7'}
                    </td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    ${riskAssessment.additionalRequirements ? `
    <div class="section">
        <div class="section-title">ADDITIONAL REQUIREMENTS / INFORMATION / SSoW</div>
        <div style="border: 1px solid #ddd; padding: 15px; background-color: #f9f9f9;">
            ${riskAssessment.additionalRequirements}
        </div>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">DOCUMENT INFORMATION</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Created By:</div>
                <div>${riskAssessment.createdBy.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Created At:</div>
                <div>${formatDate(riskAssessment.createdAt)}</div>
            </div>
            ${riskAssessment.updatedBy ? `
            <div class="info-item">
                <div class="info-label">Last Updated By:</div>
                <div>${riskAssessment.updatedBy.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Last Updated At:</div>
                <div>${formatDate(riskAssessment.updatedAt)}</div>
            </div>
            ` : ''}
        </div>
    </div>

    <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>
</body>
</html>
  `
}

