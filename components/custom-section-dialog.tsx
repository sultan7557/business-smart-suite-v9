"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

interface CustomSectionDialogProps {
  onSuccess?: () => void
}

export default function CustomSectionDialog({ onSuccess }: CustomSectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("FileText")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/custom-sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          icon,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create custom section")
      }

      toast({
        title: "Success",
        description: "Custom section created successfully",
      })

      setTitle("")
      setDescription("")
      setIcon("FileText")
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error creating custom section:", error)
      toast({
        title: "Error",
        description: "Failed to create custom section",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-purple-500 hover:border-purple-400 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-medium backdrop-blur-sm">
          <Plus className="h-5 w-5 mr-2" />
          Add Folder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Custom Section</DialogTitle>
          <DialogDescription>
            Add a new custom section to organize your content. This will appear as a new box on the homepage.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter section title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Enter section description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FileText">File Text</SelectItem>
                  <SelectItem value="BookOpen">Book Open</SelectItem>
                  <SelectItem value="ClipboardList">Clipboard List</SelectItem>
                  <SelectItem value="FileInput">File Input</SelectItem>
                  <SelectItem value="Award">Award</SelectItem>
                  <SelectItem value="BarChart">Bar Chart</SelectItem>
                  <SelectItem value="AlertTriangle">Alert Triangle</SelectItem>
                  <SelectItem value="Briefcase">Briefcase</SelectItem>
                  <SelectItem value="Users">Users</SelectItem>
                  <SelectItem value="FileWarning">File Warning</SelectItem>
                  <SelectItem value="AlertOctagon">Alert Octagon</SelectItem>
                  <SelectItem value="HardHat">Hard Hat</SelectItem>
                  <SelectItem value="FileCode">File Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 