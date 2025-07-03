"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { createObjective, updateObjective, completeObjective } from "@/app/actions/objective-actions"
import { format } from "date-fns"

// Categories
const categories = [
  { value: "Quality", label: "Quality" },
  { value: "Environmental", label: "Environmental" },
  { value: "H&S", label: "H&S" },
  { value: "Business", label: "Business" },
  { value: "Information Security", label: "Information Security" },
  { value: "Valuing People", label: "Valuing People" },
];

interface ObjectiveFormProps {
  objective?: any; // The objective object if editing
  isDialog?: boolean;
  onClose?: () => void;
}

export default function ObjectiveForm({ objective, isDialog, onClose }: ObjectiveFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [source, setSource] = useState(objective?.source || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(objective?.categories || []);
  const [objectiveText, setObjectiveText] = useState(objective?.objective || "");
  const [target, setTarget] = useState(objective?.target || "");
  const [resourcesRequired, setResourcesRequired] = useState(objective?.resourcesRequired || "");
  const [progressToDate, setProgressToDate] = useState(objective?.progressToDate || "");
  const [who, setWho] = useState(objective?.who || "");
  const [dueDate, setDueDate] = useState(objective?.dueDate ? format(new Date(objective.dueDate), "yyyy-MM-dd") : "");
  const [likelihood, setLikelihood] = useState(objective?.likelihood || 1);
  const [severity, setSeverity] = useState(objective?.severity || 1);
  const [dateCompleted, setDateCompleted] = useState(objective?.dateCompleted ? format(new Date(objective.dateCompleted), "yyyy-MM-dd") : "");
  const [createAssociatedObjective, setCreateAssociatedObjective] = useState(false);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedCategories.length === 0) {
        throw new Error("Please select at least one category");
      }

      const formData = {
        source,
        categories: selectedCategories,
        objective: objectiveText,
        target,
        resourcesRequired,
        progressToDate,
        who,
        dueDate: dueDate ? new Date(dueDate) : null,
        likelihood: Number(likelihood),
        severity: Number(severity),
      };

      let result;
      if (objective) {
        // Update existing objective
        result = await updateObjective(objective.id, formData);
      } else {
        // Create new objective
        result = await createObjective(formData);
      }

      if (result.success) {
        toast({
          title: objective ? "Objective updated" : "Objective created",
          description: objective
            ? "The objective has been updated successfully."
            : "A new objective has been created successfully.",
        });
        
        if (isDialog && onClose) {
          onClose();
        } else {
          router.push("/objectives");
          router.refresh();
        }
      } else {
        throw new Error(result.error || "Failed to save objective");
      }
    } catch (error: any) {
      console.error("Error saving objective:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the objective.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!dateCompleted) {
      toast({
        title: "Error",
        description: "Please enter a completion date",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await completeObjective(objective.id, new Date(dateCompleted));
      
      if (result.success) {
        toast({
          title: "Objective completed",
          description: "The objective has been marked as completed.",
        });
        
        if (isDialog && onClose) {
          onClose();
        } else {
          router.push("/objectives");
          router.refresh();
        }
      } else {
        throw new Error(result.error || "Failed to complete objective");
      }
    } catch (error: any) {
      console.error("Error completing objective:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while completing the objective.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="source">Source</Label>
            <Input 
              id="source" 
              value={source} 
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div>
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categories.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category.value}`}
                    checked={selectedCategories.includes(category.value)}
                    onCheckedChange={(checked) => handleCategoryChange(category.value, checked as boolean)}
                  />
                  <Label htmlFor={`category-${category.value}`}>{category.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="objective">Objective</Label>
            <Input 
              id="objective" 
              value={objectiveText} 
              onChange={(e) => setObjectiveText(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="target">Target</Label>
            <Textarea 
              id="target" 
              value={target} 
              onChange={(e) => setTarget(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="resourcesRequired">Resources required</Label>
            <Textarea 
              id="resourcesRequired" 
              value={resourcesRequired} 
              onChange={(e) => setResourcesRequired(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="progressToDate">Progress to date</Label>
            <Textarea 
              id="progressToDate" 
              value={progressToDate} 
              onChange={(e) => setProgressToDate(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="who">Who</Label>
            <Input 
              id="who" 
              value={who} 
              onChange={(e) => setWho(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Due date</Label>
            <Input 
              id="dueDate" 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Likelihood</Label>
                  <RadioGroup 
                    value={likelihood.toString()} 
                    onValueChange={(value) => setLikelihood(parseInt(value))}
                    className="flex space-x-4 mt-2"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value.toString()} id={`likelihood-${value}`} />
                        <Label htmlFor={`likelihood-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label>Severity</Label>
                  <RadioGroup 
                    value={severity.toString()} 
                    onValueChange={(value) => setSeverity(parseInt(value))}
                    className="flex space-x-4 mt-2"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value.toString()} id={`severity-${value}`} />
                        <Label htmlFor={`severity-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          {objective && (
            <Card>
              <CardHeader className="bg-red-500 text-white">
                <CardTitle>Closure options</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dateCompleted">Date Completed</Label>
                    <Input 
                      id="dateCompleted" 
                      type="date" 
                      value={dateCompleted} 
                      onChange={(e) => setDateCompleted(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="createAssociatedObjective"
                      checked={createAssociatedObjective}
                      onCheckedChange={(checked) => setCreateAssociatedObjective(checked as boolean)}
                    />
                    <Label htmlFor="createAssociatedObjective">Create associated objective</Label>
                  </div>

                  <Button 
                    type="button" 
                    onClick={handleComplete}
                    disabled={isSubmitting || objective?.completed}
                    className="w-full"
                  >
                    {objective?.completed ? "Already Completed" : "Mark as Completed"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!objective && (
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-gray-600">Closure options are available once the item has been created.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => isDialog && onClose ? onClose() : router.push("/objectives")} 
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : objective ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
}