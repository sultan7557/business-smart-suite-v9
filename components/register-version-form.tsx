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
import { toast } from "sonner"
import { updateRegister } from "@/app/actions/register-actions"

const formSchema = z.object({
  version: z.string().min(1, "Version is required"),
  reviewDate: z.string().min(1, "Review date is required"),
  nextReviewDate: z.string().optional(),
  content: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface RegisterVersionFormProps {
  register: {
    id: string
    version: string
    reviewDate: Date
    nextReviewDate: Date | null
    content: string | null
  }
}

export function RegisterVersionForm({ register }: RegisterVersionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version: register.version,
      reviewDate: new Date(register.reviewDate).toISOString().split("T")[0],
      nextReviewDate: register.nextReviewDate
        ? new Date(register.nextReviewDate).toISOString().split("T")[0]
        : "",
      content: register.content || "",
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append("version", data.version)
      formData.append("reviewDate", data.reviewDate)
      if (data.nextReviewDate) {
        formData.append("nextReviewDate", data.nextReviewDate)
      }
      if (data.content) {
        formData.append("content", data.content)
      }

      const result = await updateRegister(register.id, formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast.success("Register version updated successfully")
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
            {isLoading ? "Saving..." : "Update Version"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
