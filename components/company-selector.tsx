import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CompanySelector() {
  return (
    <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-300">
      Business Smart Suite
      <ChevronDown className="h-4 w-4" />
    </Button>
  )
}

