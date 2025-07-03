import { Button } from "./button"
import { Calendar, Text } from "lucide-react"
import React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

export type SortType = "name" | "date"
export type SortDirection = "asc" | "desc"

interface SortButtonsProps {
  sortType: SortType
  sortDirection: SortDirection
  onSortChange: (type: SortType, direction: SortDirection) => void
  className?: string
}

export const SortButtons: React.FC<SortButtonsProps> = ({
  sortType,
  sortDirection,
  onSortChange,
  className = "",
}) => {
  return (
    <TooltipProvider>
      <div className={`flex gap-1 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={sortType === "name" ? "default" : "outline"}
              size="icon"
              className="h-6 w-6"
              aria-label="Sort by Name"
              onClick={() =>
                onSortChange(
                  "name",
                  sortType === "name" && sortDirection === "asc" ? "desc" : "asc"
                )
              }
            >
              <Text className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sort by Name</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={sortType === "date" ? "default" : "outline"}
              size="icon"
              className="h-6 w-6"
              aria-label="Sort by Date"
              onClick={() =>
                onSortChange(
                  "date",
                  sortType === "date" && sortDirection === "asc" ? "desc" : "asc"
                )
              }
            >
              <Calendar className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sort by Date</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
} 