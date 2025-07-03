"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { createInterestedParty, updateInterestedParty } from "@/app/actions/interested-party-actions"

interface InterestedPartyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interestedParty?: any // The interested party object if editing
}

export default function InterestedPartyForm({ open, onOpenChange, interestedParty }: InterestedPartyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      
      let result
      if (interestedParty) {
        // Update existing interested party
        result = await updateInterestedParty(interestedParty.id, formData)
      } else {
        // Create new interested party
        result = await createInterestedParty(formData)
      }
      
      if (result.success) {
        toast({
          title: interestedParty ? "Interested Party updated" : "Interested Party created",
          description: interestedParty 
            ? "The interested party has been updated successfully." 
            : "A new interested party has been created successfully.",
        })
        onOpenChange(false)
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to save interested party")
      }
    } catch (error: any) {
      console.error("Error saving interested party:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the interested party.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {interestedParty ? "Edit Interested Party" : "Add Interested Party"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Interested Party</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={interestedParty?.name || ""} 
                required 
                placeholder="Shareholders, Employees, Clients, Suppliers, Landlords etc..."
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                defaultValue={interestedParty?.description || ""} 
                placeholder="Brief description of the interested party"
              />
            </div>
            
            <div>
              <Label htmlFor="needsExpectations">Needs & Expectations</Label>
              <Textarea 
                id="needsExpectations" 
                name="needsExpectations" 
                defaultValue={interestedParty?.needsExpectations || ""} 
                rows={4}
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Risk Analysis before controls and recommendations</h3>
              
              <div className="mb-4">
                <Label>Likelihood</Label>
                <RadioGroup 
                  name="initialLikelihood" 
                  defaultValue={interestedParty?.initialLikelihood?.toString() || "3"}
                  className="flex space-x-4 mt-2"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex items-center space-x-1">
                      <RadioGroupItem value={value.toString()} id={`likelihood-${value}`} />
                      <Label htmlFor={`likelihood-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label>Severity</Label>
                <RadioGroup 
                  name="initialSeverity" 
                  defaultValue={interestedParty?.initialSeverity?.toString() || "3"}
                  className="flex space-x-4 mt-2"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex items-center space-x-1">
                      <RadioGroupItem value={value.toString()} id={`severity-${value}`} />
                      <Label htmlFor={`severity-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            
            <div>
              <Label htmlFor="controlsRecommendations">Controls & Recommendations</Label>
              <Textarea 
                id="controlsRecommendations" 
                name="controlsRecommendations" 
                defaultValue={interestedParty?.controlsRecommendations || ""} 
                rows={4}
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Risk Analysis after controls and recommendations</h3>
              
              <div className="mb-4">
                <Label>Residual Likelihood</Label>
                <RadioGroup 
                  name="residualLikelihood" 
                  defaultValue={interestedParty?.residualLikelihood?.toString() || "1"}
                  className="flex space-x-4 mt-2"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex items-center space-x-1">
                      <RadioGroupItem value={value.toString()} id={`residual-likelihood-${value}`} />
                      <Label htmlFor={`residual-likelihood-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label>Residual Severity</Label>
                <RadioGroup 
                  name="residualSeverity" 
                  defaultValue={interestedParty?.residualSeverity?.toString() || "3"}
                  className="flex space-x-4 mt-2"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex items-center space-x-1">
                      <RadioGroupItem value={value.toString()} id={`residual-severity-${value}`} />
                      <Label htmlFor={`residual-severity-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : interestedParty ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}