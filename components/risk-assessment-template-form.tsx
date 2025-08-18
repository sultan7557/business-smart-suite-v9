"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, Edit, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface WhoMayBeHarmed {
  employees: boolean
  contractors: boolean
  generalPublic: boolean
  visitors: boolean
  environment: boolean
  others: boolean
  othersDescription?: string
}

interface PpeRequirements {
  safetyBoots: boolean
  gloves: boolean
  highVisTop: boolean
  highVisTrousers: boolean
  overalls: boolean
  safetyHelmet: boolean
  earDefenders: boolean
  safetyGoggles: boolean
  safetyGlasses: boolean
  others: boolean
  othersDescription?: string
}

interface AssessmentDetail {
  id: string
  hazardIdentified: string
  currentControls: string
  severity: number
  likelihood: number
  riskFactor: number
  additionalControls?: string
  residualRisk?: string
}

interface RiskAssessmentTemplateFormProps {
  riskAssessment?: any
  canEdit: boolean
  onSave?: (data: any) => Promise<void>
  isNew?: boolean
  categories?: Array<{ id: string; title: string }>
}

export default function RiskAssessmentTemplateForm({ 
  riskAssessment, 
  canEdit, 
  onSave,
  isNew = false,
  categories = []
}: RiskAssessmentTemplateFormProps) {
  const [isEditing, setIsEditing] = useState(isNew)
  const [isLoading, setIsLoading] = useState(false)
  
  // Basic form data
  const [basicData, setBasicData] = useState({
    title: riskAssessment?.title || "",
    version: riskAssessment?.version || "1.0",
    reviewDate: riskAssessment?.reviewDate ? new Date(riskAssessment.reviewDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    nextReviewDate: riskAssessment?.nextReviewDate ? new Date(riskAssessment.nextReviewDate).toISOString().split("T")[0] : "",
    department: riskAssessment?.department || "",
    categoryId: riskAssessment?.categoryId || "",
    additionalRequirements: riskAssessment?.additionalRequirements || ""
  })

  // Template-specific data
  const [whoMayBeHarmed, setWhoMayBeHarmed] = useState<WhoMayBeHarmed>({
    employees: riskAssessment?.whoMayBeHarmed?.employees || false,
    contractors: riskAssessment?.whoMayBeHarmed?.contractors || false,
    generalPublic: riskAssessment?.whoMayBeHarmed?.generalPublic || false,
    visitors: riskAssessment?.whoMayBeHarmed?.visitors || false,
    environment: riskAssessment?.whoMayBeHarmed?.environment || false,
    others: riskAssessment?.whoMayBeHarmed?.others || false,
    othersDescription: riskAssessment?.whoMayBeHarmed?.othersDescription || ""
  })

  const [ppeRequirements, setPpeRequirements] = useState<PpeRequirements>({
    safetyBoots: riskAssessment?.ppeRequirements?.safetyBoots || false,
    gloves: riskAssessment?.ppeRequirements?.gloves || false,
    highVisTop: riskAssessment?.ppeRequirements?.highVisTop || false,
    highVisTrousers: riskAssessment?.ppeRequirements?.highVisTrousers || false,
    overalls: riskAssessment?.ppeRequirements?.overalls || false,
    safetyHelmet: riskAssessment?.ppeRequirements?.safetyHelmet || false,
    earDefenders: riskAssessment?.ppeRequirements?.earDefenders || false,
    safetyGoggles: riskAssessment?.ppeRequirements?.safetyGoggles || false,
    safetyGlasses: riskAssessment?.ppeRequirements?.safetyGlasses || false,
    others: riskAssessment?.ppeRequirements?.others || false,
    othersDescription: riskAssessment?.ppeRequirements?.othersDescription || ""
  })

  const [assessmentDetails, setAssessmentDetails] = useState<AssessmentDetail[]>(
    riskAssessment?.assessmentDetails || [
      {
        id: "1",
        hazardIdentified: "",
        currentControls: "",
        severity: 3,
        likelihood: 3,
        riskFactor: 9,
        additionalControls: "",
        residualRisk: "M"
      }
    ]
  )

  const handleBasicDataChange = (field: string, value: any) => {
    setBasicData(prev => ({ ...prev, [field]: value }))
  }

  const handleWhoMayBeHarmedChange = (field: keyof WhoMayBeHarmed, value: boolean | string) => {
    setWhoMayBeHarmed(prev => ({ ...prev, [field]: value }))
  }

  const handlePpeRequirementsChange = (field: keyof PpeRequirements, value: boolean | string) => {
    setPpeRequirements(prev => ({ ...prev, [field]: value }))
  }

  const addAssessmentDetail = () => {
    const newDetail: AssessmentDetail = {
      id: Date.now().toString(),
      hazardIdentified: "",
      currentControls: "",
      severity: 3,
      likelihood: 3,
      riskFactor: 9,
      additionalControls: "",
      residualRisk: "M"
    }
    setAssessmentDetails(prev => [...prev, newDetail])
  }

  const removeAssessmentDetail = (id: string) => {
    if (assessmentDetails.length > 1) {
      setAssessmentDetails(prev => prev.filter(detail => detail.id !== id))
    }
  }

  const updateAssessmentDetail = (id: string, field: keyof AssessmentDetail, value: any) => {
    setAssessmentDetails(prev => prev.map(detail => {
      if (detail.id === id) {
        const updated = { ...detail, [field]: value }
        // Auto-calculate risk factor
        if (field === 'severity' || field === 'likelihood') {
          updated.riskFactor = updated.severity * updated.likelihood
          // Auto-determine residual risk
          if (updated.riskFactor >= 17) {
            updated.residualRisk = "H"
          } else if (updated.riskFactor >= 8) {
            updated.residualRisk = "M"
          } else {
            updated.residualRisk = "L"
          }
        }
        return updated
      }
      return detail
    }))
  }

  const handleSave = async () => {
    if (!canEdit) return

    // Validate required fields
    if (!basicData.title || !basicData.categoryId || !basicData.version || !basicData.reviewDate || !basicData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // Validate template data
    if (!assessmentDetails || assessmentDetails.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one hazard assessment detail",
        variant: "destructive"
      })
      return
    }

    // Validate each assessment detail
    for (const detail of assessmentDetails) {
      if (!detail.hazardIdentified.trim() || !detail.currentControls.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all hazard identification and current controls fields",
          variant: "destructive"
        })
        return
      }
    }

    setIsLoading(true)
    try {
      const formData = {
        ...basicData,
        whoMayBeHarmed,
        ppeRequirements,
        assessmentDetails: assessmentDetails.map(detail => ({
          ...detail,
          hazardIdentified: detail.hazardIdentified.trim(),
          currentControls: detail.currentControls.trim(),
          additionalControls: detail.additionalControls?.trim() || ""
        }))
      }

      if (onSave) {
        await onSave(formData)
      } else {
        // Default save behavior - save to database with proper structure
        const response = await fetch(`/api/risk-assessments/${riskAssessment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: basicData.title,
            version: basicData.version,
            reviewDate: new Date(basicData.reviewDate),
            nextReviewDate: basicData.nextReviewDate ? new Date(basicData.nextReviewDate) : null,
            department: basicData.department,
            categoryId: basicData.categoryId,
            additionalRequirements: basicData.additionalRequirements,
            whoMayBeHarmed,
            ppeRequirements,
            assessmentDetails: formData.assessmentDetails
          })
        })

        if (!response.ok) {
          throw new Error("Failed to save")
        }
      }

      toast({
        title: "Success",
        description: "Risk assessment saved successfully"
      })
      
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving:", error)
      toast({
        title: "Error",
        description: "Failed to save risk assessment",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskLevelDescription = (riskFactor: number) => {
    if (riskFactor >= 17) return "High Risk - Not acceptable. Apply mitigation to eliminate or to further reduce the risk."
    if (riskFactor >= 8) return "Medium Risk - Apply mitigation to eliminate or reduce the risk, and if it remains a high risk, develop robust control measures to limit and manage the effects of any hazards."
    return "Low Risk - May be accepted if all reasonably practicable control measures are in place, however, if more can be done to reduce or eliminate the risk, then it should be done."
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Basic Information
            {canEdit && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={basicData.title}
                onChange={(e) => handleBasicDataChange("title", e.target.value)}
                readOnly={!isEditing}
                placeholder="Enter risk assessment title"
              />
            </div>
            <div>
              <Label htmlFor="categoryId">Category *</Label>
              {isEditing ? (
                <select
                  id="categoryId"
                  value={basicData.categoryId}
                  onChange={(e) => handleBasicDataChange("categoryId", e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  value={categories.find(c => c.id === basicData.categoryId)?.title || "No category selected"}
                  readOnly
                  className="bg-gray-50"
                />
              )}
            </div>
            <div>
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                value={basicData.version}
                onChange={(e) => handleBasicDataChange("version", e.target.value)}
                readOnly={!isEditing}
                placeholder="e.g. 1.0"
              />
            </div>
            <div>
              <Label htmlFor="reviewDate">Review Date *</Label>
              <Input
                id="reviewDate"
                type="date"
                value={basicData.reviewDate}
                onChange={(e) => handleBasicDataChange("reviewDate", e.target.value)}
                readOnly={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="nextReviewDate">Next Review Date</Label>
              <Input
                id="nextReviewDate"
                type="date"
                value={basicData.nextReviewDate}
                onChange={(e) => handleBasicDataChange("nextReviewDate", e.target.value)}
                readOnly={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={basicData.department}
                onChange={(e) => handleBasicDataChange("department", e.target.value)}
                readOnly={!isEditing}
                placeholder="e.g. IT, Operations"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Who May Be Harmed */}
      <Card>
        <CardHeader>
          <CardTitle>WHO MAY BE HARMED?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="employees"
                  checked={whoMayBeHarmed.employees}
                  onCheckedChange={(checked) => handleWhoMayBeHarmedChange("employees", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="employees">Employees</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contractors"
                  checked={whoMayBeHarmed.contractors}
                  onCheckedChange={(checked) => handleWhoMayBeHarmedChange("contractors", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="contractors">Contractors</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generalPublic"
                  checked={whoMayBeHarmed.generalPublic}
                  onCheckedChange={(checked) => handleWhoMayBeHarmedChange("generalPublic", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="generalPublic">General Public</Label>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visitors"
                  checked={whoMayBeHarmed.visitors}
                  onCheckedChange={(checked) => handleWhoMayBeHarmedChange("visitors", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="visitors">Visitors</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="environment"
                  checked={whoMayBeHarmed.environment}
                  onCheckedChange={(checked) => handleWhoMayBeHarmedChange("environment", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="environment">Environment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="others"
                  checked={whoMayBeHarmed.others}
                  onCheckedChange={(checked) => handleWhoMayBeHarmedChange("others", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="others">Others (i.e. Disabled/Young/Expectant Mothers etc.)</Label>
              </div>
              {whoMayBeHarmed.others && (
                <Input
                  placeholder="Please specify"
                  value={whoMayBeHarmed.othersDescription || ""}
                  onChange={(e) => handleWhoMayBeHarmedChange("othersDescription", e.target.value)}
                  disabled={!isEditing}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Protective Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>PERSONAL PROTECTIVE EQUIPMENT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="safetyBoots"
                  checked={ppeRequirements.safetyBoots}
                  onCheckedChange={(checked) => handlePpeRequirementsChange("safetyBoots", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="safetyBoots">Safety Boots</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gloves"
                  checked={ppeRequirements.gloves}
                  onCheckedChange={(checked) => handlePpeRequirementsChange("gloves", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="gloves">Gloves</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="highVisTop"
                  checked={ppeRequirements.highVisTop}
                  onCheckedChange={(checked) => handlePpeRequirementsChange("highVisTop", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="highVisTop">High-Vis Top</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="highVisTrousers"
                  checked={ppeRequirements.highVisTrousers}
                  onCheckedChange={(checked) => handlePpeRequirementsChange("highVisTrousers", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="highVisTrousers">High-Vis Trousers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overalls"
                  checked={ppeRequirements.overalls}
                  onCheckedChange={(checked) => handlePpeRequirementsChange("overalls", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="overalls">Overalls</Label>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="safetyHelmet"
                  checked={ppeRequirements.safetyHelmet}
                  onCheckedChange={(checked) => handlePpeRequirementsChange("safetyHelmet", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="safetyHelmet">Safety Helmet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="earDefenders"
                  checked={ppeRequirements.earDefenders}
                  onCheckedChange={(checked) => handlePpeRequirementsChange("earDefenders", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="earDefenders">Ear Defenders</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="safetyGoggles"
                  checked={ppeRequirements.safetyGoggles}
                  onCheckedChange={(checked) => handlePpeRequirementsChange("safetyGoggles", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="safetyGoggles">Safety Goggles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="safetyGlasses"
                  checked={ppeRequirements.safetyGlasses}
                  onCheckedChange={(checked) => handlePpeRequirementsChange("safetyGlasses", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="safetyGlasses">Safety Glasses</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ppeOthers"
                  checked={ppeRequirements.others}
                  onCheckedChange={(checked) => handlePpeRequirementsChange("others", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="ppeOthers">Others specify:</Label>
              </div>
              {ppeRequirements.others && (
                <Input
                  placeholder="Please specify"
                  value={ppeRequirements.othersDescription || ""}
                  onChange={(e) => handlePpeRequirementsChange("othersDescription", e.target.value)}
                  disabled={!isEditing}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment Key */}
      <Card>
        <CardHeader>
          <CardTitle>RISK ASSESSMENT KEY</CardTitle>
          <p className="text-sm text-gray-600">
            Initial RISK is assessed by the SEVERITY of Harm – Controls are then put in to place to reduce the PROBABILITY of the occurrence – This then gives the actual RISK LEVEL for this activity/process –further ACTIONS can be added to reduce this probability further.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">SEVERITY (S)</th>
                  <th className="border border-gray-300 p-2 text-left">LIKELIHOOD (L)</th>
                  <th className="border border-gray-300 p-2 text-left">RISK LEVEL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">
                    <strong>5</strong> - Major (Fatality, Loss or damage causes serious business disruption; major fire, explosion etc.)
                  </td>
                  <td className="border border-gray-300 p-2">
                    <strong>5</strong> - Certain
                  </td>
                  <td className="border border-gray-300 p-2">
                    <strong>17+</strong><br />
                    High Risk - Not acceptable. Apply mitigation to eliminate or to further reduce the risk.
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">
                    <strong>4</strong> - Fairly High (Permanent disability, loss of limb, hearing or sight to one or more persons. Loss or damage is such that it could cause serious business disruption; fire, flood etc.)
                  </td>
                  <td className="border border-gray-300 p-2">
                    <strong>4</strong> - Very Likely
                  </td>
                  <td className="border border-gray-300 p-2">
                    <strong>8-16</strong><br />
                    Medium Risk - Apply mitigation to eliminate or reduce the risk, and if it remains a high risk, develop robust control measures to limit and manage the effects of any hazards.
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">
                    <strong>3</strong> - Moderate (breaks/fractures, loss or damage is such that it could cause minor business disruption)
                  </td>
                  <td className="border border-gray-300 p-2">
                    <strong>3</strong> - Likely
                  </td>
                  <td className="border border-gray-300 p-2">
                    <strong>1-7</strong><br />
                    Low Risk - May be accepted if all reasonably practicable control measures are in place, however, if more can be done to reduce or eliminate the risk, then it should be done.
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">
                    <strong>2</strong> - Minor (Minor Injury or illness, no lost time other than minor first aid, loss or damage not exceeding £100)
                  </td>
                  <td className="border border-gray-300 p-2">
                    <strong>2</strong> - Unlikely
                  </td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">
                    <strong>1</strong> - Very Low (Minor cuts or scratches, no lost time or business disruption)
                  </td>
                  <td className="border border-gray-300 p-2">
                    <strong>1</strong> - Very Unlikely
                  </td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            ASSESSMENT
            {isEditing && (
              <Button variant="outline" size="sm" onClick={addAssessmentDetail}>
                <Plus className="h-4 w-4 mr-2" />
                Add Hazard
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Hazard identified</th>
                  <th className="border border-gray-300 p-2 text-left">Current Controls</th>
                  <th className="border border-gray-300 p-2 text-left">Severity<br/>1-5</th>
                  <th className="border border-gray-300 p-2 text-left">Likelihood<br/>1-5</th>
                  <th className="border border-gray-300 p-2 text-left">Risk Factor</th>
                  <th className="border border-gray-300 p-2 text-left">Additional Controls/Recommendations</th>
                  <th className="border border-gray-300 p-2 text-left">Residual Risk</th>
                  {isEditing && (
                    <th className="border border-gray-300 p-2 text-left">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {assessmentDetails.map((detail, index) => (
                  <tr key={detail.id}>
                    <td className="border border-gray-300 p-2">
                      {isEditing ? (
                        <Textarea
                          value={detail.hazardIdentified}
                          onChange={(e) => updateAssessmentDetail(detail.id, "hazardIdentified", e.target.value)}
                          placeholder="Describe the hazard"
                          className="min-h-[60px] resize-none"
                        />
                      ) : (
                        detail.hazardIdentified || "-"
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {isEditing ? (
                        <Textarea
                          value={detail.currentControls}
                          onChange={(e) => updateAssessmentDetail(detail.id, "currentControls", e.target.value)}
                          placeholder="Describe current controls"
                          className="min-h-[60px] resize-none"
                        />
                      ) : (
                        detail.currentControls || "-"
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {isEditing ? (
                        <select
                          value={detail.severity}
                          onChange={(e) => updateAssessmentDetail(detail.id, "severity", parseInt(e.target.value))}
                          className="w-full p-1 border rounded"
                        >
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      ) : (
                        detail.severity
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {isEditing ? (
                        <select
                          value={detail.likelihood}
                          onChange={(e) => updateAssessmentDetail(detail.id, "likelihood", parseInt(e.target.value))}
                          className="w-full p-1 border rounded"
                        >
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      ) : (
                        detail.likelihood
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <span className={`font-bold ${
                        detail.riskFactor >= 17 ? 'text-red-600' : 
                        detail.riskFactor >= 8 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {detail.riskFactor}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {getRiskLevelDescription(detail.riskFactor)}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-2">
                      {isEditing ? (
                        <Textarea
                          value={detail.additionalControls || ""}
                          onChange={(e) => updateAssessmentDetail(detail.id, "additionalControls", e.target.value)}
                          placeholder="Additional controls needed"
                          className="min-h-[60px] resize-none"
                        />
                      ) : (
                        detail.additionalControls || "-"
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <span className={`font-bold text-lg ${
                        detail.residualRisk === 'H' ? 'text-red-600' : 
                        detail.residualRisk === 'M' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {detail.residualRisk}
                      </span>
                    </td>
                    {isEditing && (
                      <td className="border border-gray-300 p-2">
                        {assessmentDetails.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeAssessmentDetail(detail.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>ADDITIONAL REQUIREMENTS / INFORMATION / SSoW</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={basicData.additionalRequirements}
            onChange={(e) => handleBasicDataChange("additionalRequirements", e.target.value)}
            readOnly={!isEditing}
            placeholder="Additional requirements, information, or Safe System of Work details..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex gap-2 justify-end">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
