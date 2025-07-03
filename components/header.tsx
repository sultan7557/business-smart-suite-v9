"use client"

import { Search, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import CompanySelector from "./company-selector"
import { UserNav } from "./user-nav"
import { getUser } from "@/lib/auth"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  title: string
  type: string
  href: string
  section: string
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error("Search failed")
      const results = await response.json()
      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <header className="w-full">
      <div className="bg-blue-100 p-2 flex justify-between items-center">
        <CompanySelector />
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Search</DialogTitle>
              </DialogHeader>
              <div className="relative">
                <Input
                  placeholder="Search across all sections..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  className="pr-8"
                />
                {isSearching && (
                  <div className="absolute right-2 top-2.5">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                  </div>
                )}
              </div>
              <ScrollArea className="h-[300px] mt-4">
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={result.href}
                        className="block p-2 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => router.push(result.href)}
                      >
                        <div className="font-medium">{result.title}</div>
                        <div className="text-sm text-gray-500">
                          {result.type} in {result.section}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center text-gray-500 py-8">
                    {isSearching ? "Searching..." : "No results found"}
                  </div>
                ) : null}
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  )
}

