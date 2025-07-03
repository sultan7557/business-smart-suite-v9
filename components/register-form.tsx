"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { addRegister, updateRegister } from "@/app/actions/register-actions"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  categoryId: z.string().min(1, "Category is required"),
  version: z.string().min(1, "Version is required"),
  reviewDate: z.string().min(1, "Review date is required"),
  nextReviewDate: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  content: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface RegisterFormProps {
  categories: {
    id: string
    name: string
  }[]
  register?: {
    id: string
    title: string
    categoryId: string
    version: string
    reviewDate: Date
    nextReviewDate: Date | null
    department: string
    content: string | null
  }
}

export function RegisterForm({ categories, register }: RegisterFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: register?.title || "",
      categoryId: register?.categoryId || "",
      version: register?.version || "",
      reviewDate: register?.reviewDate ? new Date(register.reviewDate).toISOString().split("T")[0] : "",
      nextReviewDate: register?.nextReviewDate
        ? new Date(register.nextReviewDate).toISOString().split("T")[0]
        : "",
      department: register?.department || "",
      content: register?.content || "",
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("categoryId", data.categoryId)
      formData.append("version", data.version)
      formData.append("reviewDate", data.reviewDate)
      if (data.nextReviewDate) {
        formData.append("nextReviewDate", data.nextReviewDate)
      }
      formData.append("department", data.department)
      if (data.content) {
        formData.append("content", data.content)
      }

      let result
      if (register) {
        result = await updateRegister(register.id, formData)
      } else {
        result = await addRegister(formData)
      }

      if (!result.success) {
        throw new Error(result.error)
      }

      toast.success(register ? "Register updated successfully" : "Register added successfully")
      router.push("/registers")
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version</FormLabel>
              <FormControl>
                <Input placeholder="Enter version" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="reviewDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextReviewDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Review Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="Enter department" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter content"
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : register ? "Update Register" : "Add Register"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
