"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { createLegalRegister, updateLegalRegister } from "../actions/legal-register-actions"
import { Loader } from '@/components/ui/loader'

// Section options
const sectionOptions = [
  "Air",
  "Waste",
  "Water",
  "Energy & Renewables",
  "Chemicals & Dangerous Substances",
  "Building & Equipment",
  "Vehicles & Equipment",
  "Vehicles & Employers",
  "Conservation",
  "Environmental Protection",
  "Information Security",
  "Other",
]

// Compliance rating options
const complianceRatingOptions = [
  "A - Required and fully applied",
  "B - Required and partially applied",
  "C - No direct compliance requirement",
  "D - Not applicable",
  "NULL",
]

interface LegalRegisterFormProps {
  legalRegister?: any // The legal register object if editing
}

export default function LegalRegisterForm({ legalRegister }: LegalRegisterFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [section, setSection] = useState(legalRegister?.section || "")
  const [complianceRating, setComplianceRating] = useState(legalRegister?.complianceRating || "")
  const [regions, setRegions] = useState<string[]>(legalRegister?.regions || ["England"])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Convert form data to appropriate types
      const data = {
        section: formData.get("section") as string,
        legislation: formData.get("legislation") as string,
        webAddress: formData.get("webAddress") as string,
        regulator: formData.get("regulator") as string,
        requirements: formData.get("requirements") as string,
        applicability: formData.get("applicability") as string,
        complianceRating: (formData.get("complianceRating") as string).split(" - ")[0],
        furtherAction: formData.get("furtherAction") as string,
        regions,
      }

      let result
      if (legalRegister) {
        // Update existing legal register
        result = await updateLegalRegister(legalRegister.id, data)
      } else {
        // Create new legal register
        result = await createLegalRegister(data)
      }

      if (result.success) {
        toast({
          title: legalRegister ? "Legal register updated" : "Legal register created",
          description: legalRegister
            ? "The legal register has been updated successfully."
            : "A new legal register has been created successfully.",
        })
        router.push("/legal-register")
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to save legal register")
      }
    } catch (error: any) {
      console.error("Error saving legal register:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the legal register.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleRegion = (region: string) => {
    setRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {isSubmitting && <Loader overlay message={legalRegister ? 'Saving changes...' : 'Saving...'} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="section">Section</Label>
            <Select name="section" value={section} onValueChange={setSection} required>
              <SelectTrigger>
                <SelectValue placeholder="-- Select Section --" />
              </SelectTrigger>
              <SelectContent>
                {sectionOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="legislation">Legislation</Label>
            <Input id="legislation" name="legislation" defaultValue={legalRegister?.legislation || ""} required />
          </div>

          <div>
            <Label htmlFor="webAddress">Web address</Label>
            <Input id="webAddress" name="webAddress" defaultValue={legalRegister?.webAddress || ""} />
          </div>

          <div>
            <Label htmlFor="regulator">Regulator</Label>
            <Input id="regulator" name="regulator" defaultValue={legalRegister?.regulator || ""} required />
          </div>

          <div>
            <Label htmlFor="requirements">Summary of requirements</Label>
            <Textarea
              id="requirements"
              name="requirements"
              defaultValue={legalRegister?.requirements || ""}
              required
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="applicability">Applicability</Label>
            <Textarea
              id="applicability"
              name="applicability"
              defaultValue={legalRegister?.applicability || ""}
              required
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="complianceRating">Compliance rating</Label>
            <Select name="complianceRating" value={complianceRating} onValueChange={setComplianceRating} required>
              <SelectTrigger>
                <SelectValue placeholder="-- Select Compliance Rating --" />
              </SelectTrigger>
              <SelectContent>
                {complianceRatingOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="furtherAction">Further action</Label>
            <Textarea
              id="furtherAction"
              name="furtherAction"
              defaultValue={legalRegister?.furtherAction || ""}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Regions</Label>
            <div className="space-y-2 border p-3 rounded-md">
              {["England", "Wales", "Scotland", "Ireland", "Northern Ireland"].map((region) => (
                <div key={region} className="flex items-center space-x-2">
                  <Checkbox
                    id={`region-${region}`}
                    checked={regions.includes(region)}
                    onCheckedChange={() => toggleRegion(region)}
                  />
                  <Label htmlFor={`region-${region}`}>{region}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-medium mb-2">Documents</h3>
            {legalRegister ? (
              <div className="border p-4 rounded-md">
                <p className="text-gray-500 mb-4">Drag documents onto the grey box below to upload</p>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <p className="text-sm text-gray-500">Drag and drop your files here, or click to browse</p>
                </div>
              </div>
            ) : (
              <div className="border p-4 rounded-md">
                <p className="text-gray-500">
                  Documents can only be uploaded against existing items. Once you have saved this new item then you will
                  be able to upload documents.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-start space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader size="sm" ariaLabel="Saving..." /> : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/legal-register")} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}