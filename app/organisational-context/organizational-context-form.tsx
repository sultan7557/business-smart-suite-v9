"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { createOrganizationalContext, updateOrganizationalContext } from "@/app/actions/organizational-context-actions"
import { Loader } from "@/components/ui/loader"
import { getObjectives } from "@/app/actions/objective-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ObjectiveForm from "@/app/objectives/objective-form"

// Categories and subcategories
const categories = [
  { value: "political", label: "Political" },
  { value: "social", label: "Social" },
  { value: "economic", label: "Economic" },
  { value: "technology", label: "Technology" },
  { value: "legal", label: "Legal" },
  { value: "environmental", label: "Environmental" },
];

const subCategories = [
  { value: "strength", label: "Strength" },
  { value: "weakness", label: "Weakness" },
  { value: "opportunity", label: "Opportunity" },
  { value: "threat", label: "Threat" },
];

// Real objectives will be fetched from Objective section

interface OrganizationalContextFormProps {
  entry?: any; // The entry object if editing
  isDialog?: boolean;
  onClose?: () => void;
}

export default function OrganizationalContextForm({ entry, isDialog, onClose }: OrganizationalContextFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
  
  // Form state
  const [category, setCategory] = useState(entry?.category || "");
  const [subCategory, setSubCategory] = useState(entry?.subCategory || "");
  const [issue, setIssue] = useState(entry?.issue || "");
  const [initialLikelihood, setInitialLikelihood] = useState(entry?.initialLikelihood || 1);
  const [initialSeverity, setInitialSeverity] = useState(entry?.initialSeverity || 1);
  const [controlsRecommendations, setControlsRecommendations] = useState(entry?.controlsRecommendations || "");
  const [residualLikelihood, setResidualLikelihood] = useState(entry?.residualLikelihood || 1);
  const [residualSeverity, setResidualSeverity] = useState(entry?.residualSeverity || 1);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(entry?.objectives || []);

  // Load objectives from Objectives section
  useEffect(() => {
    let isMounted = true;
    const loadObjectives = async () => {
      try {
        const result = await getObjectives(false, false);
        if (isMounted) {
          if (result.success && Array.isArray(result.data)) {
            setObjectives(result.data);
          } else {
            console.error("Failed to load objectives", result.error);
          }
        }
      } catch (err) {
        console.error("Error loading objectives", err);
      }
    };
    loadObjectives();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = {
        category,
        subCategory,
        issue,
        initialLikelihood: Number(initialLikelihood),
        initialSeverity: Number(initialSeverity),
        controlsRecommendations,
        residualLikelihood: Number(residualLikelihood),
        residualSeverity: Number(residualSeverity),
        objectives: selectedObjectives,
      };

      let result;
      if (entry) {
        // Update existing entry
        result = await updateOrganizationalContext(entry.id, formData);
      } else {
        // Create new entry
        result = await createOrganizationalContext(formData);
      }

      if (result.success) {
        toast({
          title: entry ? "Entry updated" : "Entry created",
          description: entry
            ? "The organizational context entry has been updated successfully."
            : "A new organizational context entry has been created successfully.",
        });
        
        if (isDialog && onClose) {
          onClose();
        } else {
          router.push("/organisational-context");
          router.refresh();
        }
      } else {
        throw new Error(result.error || "Failed to save entry");
      }
    } catch (error: any) {
      console.error("Error saving entry:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleObjectiveChange = (objective: string, checked: boolean) => {
    if (checked) {
      setSelectedObjectives([...selectedObjectives, objective]);
    } else {
      setSelectedObjectives(selectedObjectives.filter(obj => obj !== objective));
    }
  };

  const refreshObjectives = async () => {
    try {
      const result = await getObjectives(false, false);
      if (result.success && Array.isArray(result.data)) {
        setObjectives(result.data);
      }
    } catch (err) {
      console.error("Error refreshing objectives", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Select Category --" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subCategory">Sub Category</Label>
            <Select 
              value={subCategory} 
              onValueChange={setSubCategory}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Select Sub Category --" />
              </SelectTrigger>
              <SelectContent>
                {subCategories.map((subCat) => (
                  <SelectItem key={subCat.value} value={subCat.value}>
                    {subCat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="issue">Issue</Label>
            <Textarea 
              id="issue" 
              value={issue} 
              onChange={(e) => setIssue(e.target.value)}
              required
              className="min-h-[80px]"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis before controls and recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Likelihood</Label>
                  <RadioGroup 
                    value={initialLikelihood.toString()} 
                    onValueChange={(value) => setInitialLikelihood(parseInt(value))}
                    className="flex space-x-4 mt-2"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value.toString()} id={`initial-likelihood-${value}`} />
                        <Label htmlFor={`initial-likelihood-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label>Severity</Label>
                  <RadioGroup 
                    value={initialSeverity.toString()} 
                    onValueChange={(value) => setInitialSeverity(parseInt(value))}
                    className="flex space-x-4 mt-2"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value.toString()} id={`initial-severity-${value}`} />
                        <Label htmlFor={`initial-severity-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="controlsRecommendations">Controls & Recommendations</Label>
            <Textarea 
              id="controlsRecommendations" 
              value={controlsRecommendations} 
              onChange={(e) => setControlsRecommendations(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis after controls and recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Residual Likelihood</Label>
                  <RadioGroup 
                    value={residualLikelihood.toString()} 
                    onValueChange={(value) => setResidualLikelihood(parseInt(value))}
                    className="flex space-x-4 mt-2"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value.toString()} id={`residual-likelihood-${value}`} />
                        <Label htmlFor={`residual-likelihood-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label>Residual Severity</Label>
                  <RadioGroup 
                    value={residualSeverity.toString()} 
                    onValueChange={(value) => setResidualSeverity(parseInt(value))}
                    className="flex space-x-4 mt-2"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value.toString()} id={`residual-severity-${value}`} />
                        <Label htmlFor={`residual-severity-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Associated objectives linked to this identified risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Linked Objectives</Label>
                  <Dialog open={isObjectiveDialogOpen} onOpenChange={(open) => {
                    setIsObjectiveDialogOpen(open)
                    if (!open) {
                      // After closing, refresh the list
                      refreshObjectives();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">Add Objective</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Objective</DialogTitle>
                      </DialogHeader>
                      <ObjectiveForm isDialog={true} onClose={() => setIsObjectiveDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2">
                  {objectives.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No objectives found. Use "Add Objective" to create one.</div>
                  ) : (
                    objectives.map((obj) => {
                      const label = obj.objective as string;
                      return (
                        <div key={obj.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`objective-${obj.id}`}
                            checked={selectedObjectives.includes(label)}
                            onCheckedChange={(checked) => handleObjectiveChange(label, checked as boolean)}
                          />
                          <Label htmlFor={`objective-${obj.id}`}>{label}</Label>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => isDialog && onClose ? onClose() : router.push("/organisational-context")} 
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader size="sm" ariaLabel="Saving..." /> : entry ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
}