"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, FileText, BookOpen, ClipboardList, FileInput, Award, BarChart, AlertTriangle, Briefcase, Users, FileWarning, AlertOctagon, HardHat, FileCode } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

const ICONS = [
  { value: "FileText", label: "File Text", icon: FileText },
  { value: "BookOpen", label: "Book", icon: BookOpen },
  { value: "ClipboardList", label: "Clipboard", icon: ClipboardList },
  { value: "FileInput", label: "File Input", icon: FileInput },
  { value: "Award", label: "Award", icon: Award },
  { value: "BarChart", label: "Chart", icon: BarChart },
  { value: "AlertTriangle", label: "Alert", icon: AlertTriangle },
  { value: "Briefcase", label: "Briefcase", icon: Briefcase },
  { value: "Users", label: "Users", icon: Users },
  { value: "FileWarning", label: "File Warning", icon: FileWarning },
  { value: "AlertOctagon", label: "Alert Octagon", icon: AlertOctagon },
  { value: "HardHat", label: "Hard Hat", icon: HardHat },
  { value: "FileCode", label: "File Code", icon: FileCode },
]

interface CustomSectionDialogProps {
  mode?: "create" | "edit"
  section?: {
    id: string
    title: string
    description?: string
    icon: string
  }
  onSuccess?: () => void
}

export default function CustomSectionDialog({
  mode = "create",
  section,
  onSuccess,
}: CustomSectionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: section?.title || "",
    description: section?.description || "",
    icon: section?.icon || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(
        `/api/custom-sections${mode === "edit" ? `?id=${section?.id}` : ""}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to save section")
      }

      toast.success(
        `Section ${mode === "create" ? "created" : "updated"} successfully`
      )
      setOpen(false)
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error("Error saving section:", error)
      toast.error("Failed to save section")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 bg-white/10 hover:bg-white/20 border-none">
          {mode === "create" ? "+ Add folder" : "Edit Section"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Section" : "Edit Section"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Section Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter section title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter section description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) =>
                setFormData({ ...formData, icon: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {ICONS.map((icon) => {
                  const IconComponent = icon.icon
                  return (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{icon.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : (mode === "create" ? "Create Section" : "Save Changes")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 