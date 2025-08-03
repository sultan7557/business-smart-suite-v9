"use client"

import { Search, HelpCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import CompanySelector from "./company-selector"
import { UserNav } from "./user-nav"
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
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-4 flex justify-between items-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.2),transparent_50%)]"></div>
        
        <div className="flex items-center relative z-10">
          <CompanySelector />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 backdrop-blur-sm">
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
                      <div
                        key={result.id}
                        className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          router.push(result.href)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{result.title}</h4>
                            <p className="text-sm text-gray-600">{result.section}</p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {result.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-8 text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Start typing to search...
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 backdrop-blur-sm">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Help & Support</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Quick Navigation</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Use the Business Smart Suite dropdown in the top-left corner to quickly navigate between different sections of the application.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Search Functionality</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Search across all sections using the search icon. Results will show documents, policies, and other relevant content.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Need More Help?</h4>
                  <p className="text-sm text-gray-600">
                    Contact your system administrator for additional support or training.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <UserNav />
        </div>
      </div>
    </header>
  )
}

