// File: app/improvement-register/improvement-register-form.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import {
  createImprovementRegister,
  updateImprovementRegister,
  getNextImprovementNumber,
} from "../actions/improvement-register-actions"
import { format } from "date-fns"
import { Loader } from '@/components/ui/loader'

// Category options
const categoryOptions = [
  "Accident",
  "Complaint",
  "Environment",
  "External Audit",
  "Goods Damaged in Transit",
  "Health and Safety",
  "Improvement Suggestion",
  "Information Security",
  "Installation Issue",
  "Internal Audit",
  "Management Review",
  "Near Miss",
  "Process Issue",
  "Safeguarding",
  "Supplier Defect",
]

// Type options
const typeOptions = ["OFI", "Non Conformance", "Major Non Conformance"]

// Root cause options
const rootCauseOptions = [
  "Materials",
  "Machinery",
  "Location",
  "Human Error",
  "Management Error",
  "Lack of Control Procedure",
  "Software",
  "Information Security",
  "Other",
]

interface ImprovementRegisterFormProps {
  users: {
    id: string
    name: string
    email: string | null
  }[]
  improvement?: any // The improvement object if editing
}

export default function ImprovementRegisterForm({ users, improvement }: ImprovementRegisterFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nextNumber, setNextNumber] = useState<number | null>(null)
  const [category, setCategory] = useState(improvement?.category || "")
  const [type, setType] = useState(improvement?.type || "OFI")
  const [rootCauseType, setRootCauseType] = useState(improvement?.rootCauseType || "")
  const [restrictedAccess, setRestrictedAccess] = useState(improvement?.restrictedAccess || false)
  const [restrictedUsers, setRestrictedUsers] = useState<string[]>(improvement?.restrictedUsers || [])
  const [likelihoodRating, setLikelihoodRating] = useState<number | undefined>(improvement?.likelihoodRating)
  const [severityRating, setSeverityRating] = useState<number | undefined>(improvement?.severityRating)

  // Checkboxes
  const [evaluatedForSimilar, setEvaluatedForSimilar] = useState(improvement?.evaluatedForSimilar || false)
  const [requiresRiskAnalysis, setRequiresRiskAnalysis] = useState(improvement?.requiresRiskAnalysis || false)
  const [affectedPolicies, setAffectedPolicies] = useState(improvement?.affectedPolicies || false)
  const [justified, setJustified] = useState(improvement?.justified || false)

  useEffect(() => {
    if (!improvement) {
      // Fetch the next improvement number
      const fetchNextNumber = async () => {
        try {
          const nextNum = await getNextImprovementNumber()
          setNextNumber(nextNum)
        } catch (error) {
          console.error("Error fetching next improvement number:", error)
          toast({
            title: "Error",
            description: "Failed to fetch next improvement number",
            variant: "destructive",
          })
        }
      }

      fetchNextNumber()
    } else {
      setNextNumber(improvement.number)
    }
  }, [improvement])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Convert form data to appropriate types
      const data = {
        category: formData.get("category") as string,
        otherCategory: formData.get("otherCategory") as string,
        number: Number.parseInt(formData.get("number") as string),
        numberSuffix: formData.get("numberSuffix") as string,
        type: formData.get("type") as string,
        description: formData.get("description") as string,
        originator: formData.get("originator") as string,
        evaluatedForSimilar,
        requiresRiskAnalysis,
        affectedPolicies,
        justified,
        containmentAction: formData.get("containmentAction") as string,
        rootCauseType: formData.get("rootCauseType") as string,
        rootCause: formData.get("rootCause") as string,
        correctiveAction: formData.get("correctiveAction") as string,
        comments: formData.get("comments") as string,
        internalOwnerId: formData.get("internalOwnerId") === "none" ? null : formData.get("internalOwnerId") as string,
        externalOwner: formData.get("externalOwner") as string,
        internalRaisedById: formData.get("internalRaisedById") === "none" ? null : formData.get("internalRaisedById") as string,
        externalRaisedBy: formData.get("externalRaisedBy") as string,
        dateRaised: formData.get("dateRaised") ? new Date(formData.get("dateRaised") as string) : new Date(),
        dateDue: formData.get("dateDue") ? new Date(formData.get("dateDue") as string) : undefined,
        dateActionTaken: formData.get("dateActionTaken")
          ? new Date(formData.get("dateActionTaken") as string)
          : undefined,
        likelihoodRating: likelihoodRating,
        severityRating: severityRating,
        restrictedAccess,
        restrictedUsers,
        dateCompleted: formData.get("dateCompleted") ? new Date(formData.get("dateCompleted") as string) : undefined,
        completedById: formData.get("completedById") === "none" ? null : formData.get("completedById") as string,
        effectivenessOfAction: formData.get("effectivenessOfAction") as string,
        cost: Number.parseFloat(formData.get("cost") as string) || 0,
      }

      let result
      if (improvement) {
        // Update existing improvement
        result = await updateImprovementRegister(improvement.id, data)
      } else {
        // Create new improvement
        result = await createImprovementRegister(data)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: improvement ? "Improvement updated successfully" : "Improvement created successfully",
        })
        router.push("/improvement-register")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save improvement",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error saving improvement:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the improvement",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleRestrictedUser = (userId: string) => {
    setRestrictedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {isSubmitting && <Loader overlay message={improvement ? 'Saving changes...' : 'Saving...'} />}
      <div className="bg-gray-100 p-4 mb-4">
        <p className="font-medium">Next improvement report reference is: {nextNumber}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select name="category" value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="-- Please Select --" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category === "Other" && (
            <div>
              <Label htmlFor="otherCategory">Other category</Label>
              <Input
                id="otherCategory"
                name="otherCategory"
                defaultValue={improvement?.otherCategory || ""}
                required={category === "Other"}
              />
            </div>
          )}

          <div>
            <Label htmlFor="number">Improvement number</Label>
            <Input
              id="number"
              name="number"
              type="number"
              value={nextNumber || ""}
              onChange={(e) => setNextNumber(Number.parseInt(e.target.value))}
              required
            />
          </div>

          <div>
            <Label htmlFor="numberSuffix">Improvement number suffix</Label>
            <Input
              id="numberSuffix"
              name="numberSuffix"
              placeholder="Reference number suffix"
              defaultValue={improvement?.numberSuffix || ""}
            />
          </div>

          <div>
            <Label htmlFor="type">Improvement type</Label>
            <Select name="type" value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="-- Please Select --" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description of improvement/Non-conformance</Label>
            <Textarea id="description" name="description" defaultValue={improvement?.description || ""} required />
          </div>

          <div>
            <Label htmlFor="originator">Originator</Label>
            <Input id="originator" name="originator" defaultValue={improvement?.originator || ""} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="evaluatedForSimilar"
                checked={evaluatedForSimilar}
                onCheckedChange={(checked) => setEvaluatedForSimilar(!!checked)}
              />
              <Label htmlFor="evaluatedForSimilar">Evaluated for similar non-conformances?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresRiskAnalysis"
                checked={requiresRiskAnalysis}
                onCheckedChange={(checked) => setRequiresRiskAnalysis(!!checked)}
              />
              <Label htmlFor="requiresRiskAnalysis">Any changes required to risk analysis?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="affectedPolicies"
                checked={affectedPolicies}
                onCheckedChange={(checked) => setAffectedPolicies(!!checked)}
              />
              <Label htmlFor="affectedPolicies">Has this effected the company's policies and/or objectives?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="justified" checked={justified} onCheckedChange={(checked) => setJustified(!!checked)} />
              <Label htmlFor="justified">Justified?</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="containmentAction">Containment action taken</Label>
            <Textarea
              id="containmentAction"
              name="containmentAction"
              defaultValue={improvement?.containmentAction || ""}
            />
          </div>

          <div>
            <Label htmlFor="rootCauseType">Root cause type</Label>
            <Select name="rootCauseType" value={rootCauseType} onValueChange={setRootCauseType}>
              <SelectTrigger>
                <SelectValue placeholder="-- Please Select --" />
              </SelectTrigger>
              <SelectContent>
                {rootCauseOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="rootCause">Root cause</Label>
            <Textarea id="rootCause" name="rootCause" defaultValue={improvement?.rootCause || ""} />
          </div>

          <div>
            <Label htmlFor="correctiveAction">Corrective action taken</Label>
            <Textarea
              id="correctiveAction"
              name="correctiveAction"
              defaultValue={improvement?.correctiveAction || ""}
            />
          </div>

          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" name="comments" defaultValue={improvement?.comments || ""} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Owner</Label>
            <div className="mt-2">
              <Label htmlFor="internalOwnerId">Internal owner</Label>
              <Select name="internalOwnerId" defaultValue={improvement?.internalOwnerId || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Please Select --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Please Select --</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2">
              <Label htmlFor="externalOwner">External/other owner</Label>
              <Input id="externalOwner" name="externalOwner" defaultValue={improvement?.externalOwner || ""} />
            </div>
          </div>

          <div>
            <Label>Raised by</Label>
            <div className="mt-2">
              <Label htmlFor="internalRaisedById">Internal</Label>
              <Select name="internalRaisedById" defaultValue={improvement?.internalRaisedById || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Please Select --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Please Select --</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2">
              <Label htmlFor="externalRaisedBy">External/other</Label>
              <Input id="externalRaisedBy" name="externalRaisedBy" defaultValue={improvement?.externalRaisedBy || ""} />
            </div>
          </div>

          <div>
            <Label htmlFor="dateRaised">Date raised</Label>
            <Input
              id="dateRaised"
              name="dateRaised"
              type="date"
              defaultValue={
                improvement?.dateRaised
                  ? format(new Date(improvement.dateRaised), "yyyy-MM-dd")
                  : format(new Date(), "yyyy-MM-dd")
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="dateDue">Date due</Label>
            <Input
              id="dateDue"
              name="dateDue"
              type="date"
              defaultValue={improvement?.dateDue ? format(new Date(improvement.dateDue), "yyyy-MM-dd") : ""}
            />
          </div>

          <div>
            <Label htmlFor="dateActionTaken">Date action taken</Label>
            <Input
              id="dateActionTaken"
              name="dateActionTaken"
              type="date"
              defaultValue={
                improvement?.dateActionTaken ? format(new Date(improvement.dateActionTaken), "yyyy-MM-dd") : ""
              }
            />
          </div>

          <div>
            <Label>Risk Analysis</Label>
            <div className="mt-2">
              <Label>Likelihood</Label>
              <div className="flex space-x-4 mt-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={`likelihood-${rating}`} className="flex items-center space-x-1">
                    <input
                      type="radio"
                      id={`likelihood-${rating}`}
                      name="likelihoodRating"
                      value={rating}
                      checked={likelihoodRating === rating}
                      onChange={() => setLikelihoodRating(rating)}
                    />
                    <Label htmlFor={`likelihood-${rating}`}>{rating}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2">
              <Label>Severity</Label>
              <div className="flex space-x-4 mt-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={`severity-${rating}`} className="flex items-center space-x-1">
                    <input
                      type="radio"
                      id={`severity-${rating}`}
                      name="severityRating"
                      value={rating}
                      checked={severityRating === rating}
                      onChange={() => setSeverityRating(rating)}
                    />
                    <Label htmlFor={`severity-${rating}`}>{rating}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="bg-yellow-100 p-3 mb-4 border-l-4 border-yellow-500">
                <h3 className="font-medium">Restricted user access</h3>
                <p className="text-sm">
                  By selecting users in the list below then only those selected will be able to access this improvement
                  record. If no users are selected then all users will have access.
                </p>
              </div>

              <div>
                <Label>Restrict access to:</Label>
                <div className="mt-2 space-y-2 border p-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={restrictedUsers.includes(user.id)}
                        onCheckedChange={() => toggleRestrictedUser(user.id)}
                      />
                      <Label htmlFor={`user-${user.id}`}>
                        {user.name} ({user.email})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 bg-red-50">
              <h3 className="font-medium mb-4">Closure options</h3>

              <div>
                <Label htmlFor="dateCompleted">Date Completed</Label>
                <Input
                  id="dateCompleted"
                  name="dateCompleted"
                  type="date"
                  defaultValue={
                    improvement?.dateCompleted ? format(new Date(improvement.dateCompleted), "yyyy-MM-dd") : ""
                  }
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="completedById">Completed by</Label>
                <Select name="completedById" defaultValue={improvement?.completedById || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Please Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Please Select --</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4">
                <Label htmlFor="effectivenessOfAction">Effectiveness of action</Label>
                <Textarea
                  id="effectivenessOfAction"
                  name="effectivenessOfAction"
                  defaultValue={improvement?.effectivenessOfAction || ""}
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="cost">Cost</Label>
                <Input id="cost" name="cost" type="number" defaultValue={improvement?.cost || "0"} />
              </div>
            </CardContent>
          </Card>

          {!improvement && (
            <div className="text-sm text-gray-500">
              Documents can only be uploaded against existing items. Once you have saved this new item then you will be
              able to upload documents.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-start space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader size="sm" ariaLabel="Saving..." /> : improvement ? "Update" : "Save"}
        </Button>
        <Button type="submit" name="saveAndContinue" value="true" disabled={isSubmitting}>
          {isSubmitting ? <Loader size="sm" ariaLabel="Saving..." /> : "Save and continue"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/improvement-register")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
