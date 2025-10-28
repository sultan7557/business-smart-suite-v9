"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2, Paperclip, Search, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DocumentManager from "./components/document-manager"

const CATEGORY_OPTIONS = [
  "Offices",
  "Buildings & Utilities",
  "Goods In",
  "Product Lifecycle",
  "Raw Materials",
  "Waste",
]

type Item = {
  id: string
  category: string
  activityProductService: string
  aspects: string[]
  impacts: string[]
  initialRiskLevel: number
  controlMeasures?: string | null
  residualRiskLevel: number
  documents?: any[]
}

export default function IMSAspectsImpactsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [items, setItems] = useState<Item[]>([])
  const [category, setCategory] = useState<string>("-- Category filter --")
  const [activity, setActivity] = useState<string>("-- Activity/Product/Service filter --")
  const [search, setSearch] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [selectedItemForDocs, setSelectedItemForDocs] = useState<Item | null>(null)
  const [showDocumentManager, setShowDocumentManager] = useState(false)

  const sidebarFilter = params?.get("category") || undefined

  useEffect(() => {
    if (sidebarFilter) setCategory(sidebarFilter)
  }, [sidebarFilter])

  async function load() {
    setLoading(true)
    const qs = new URLSearchParams()
    if (category) qs.set("category", category)
    if (activity) qs.set("activity", activity)
    if (search) qs.set("search", search)
    const res = await fetch(`/api/ims-aspects-impacts?${qs.toString()}`)
    const json = await res.json()
    setItems(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [category, activity])

  const filtered = useMemo(() => items, [items])

  function riskBoxColor(value: number) {
    if (value <= 7) return "bg-green-100 text-green-800"
    if (value <= 16) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    load()
  }

  return (
    <div className="flex h-full">
      <aside className="w-64 border-r p-4 space-y-2">
        <h2 className="font-semibold mb-2">Categories</h2>
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c}
            onClick={() => router.push(`/ims-aspects-impacts?category=${encodeURIComponent(c)}`)}
            className={`block text-left w-full px-2 py-1 rounded hover:bg-muted ${category === c ? "bg-muted" : ""}`}
          >
            {c}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">IMS Aspects & Impacts Register</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/api/ims-aspects-impacts/pdf" target="_blank">
                Download Complete PDF
              </a>
            </Button>
            <Link href="/ims-aspects-impacts/new">
              <Button>Add risk</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="-- Category filter --">{category}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-- Category filter --">-- Category filter --</SelectItem>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="-- Activity/Product/Service filter --">{activity}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-- Activity/Product/Service filter --">-- Activity/Product/Service filter --</SelectItem>
                {/* Activity options can be dynamic; leave as free filter */}
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8 w-80" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        <Card>
          <CardContent className="pt-4">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="text-left">
                    <th className="p-2 w-48">Category</th>
                    <th className="p-2 w-72">Activity/Product/Service</th>
                    <th className="p-2 w-[28rem]">Impacts/Aspects</th>
                    <th className="p-2 w-36">Risk Level</th>
                    <th className="p-2 w-[28rem]">Control Measures</th>
                    <th className="p-2 w-36">Residual Risk</th>
                    <th className="p-2 w-36">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td className="p-4" colSpan={7}>Loading...</td></tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr><td className="p-4" colSpan={7}>No records</td></tr>
                  )}
                  {!loading && filtered.map((it) => (
                    <tr key={it.id} className="border-t hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/ims-aspects-impacts/${it.id}`)}>
                      <td className="p-2 align-top">{it.category}</td>
                      <td className="p-2 align-top">{it.activityProductService}</td>
                      <td className="p-2 whitespace-pre-wrap align-top">
                        <div>
                          <div className="text-muted-foreground text-xs mb-1">Aspects</div>
                          {it.aspects.join(", ")}
                        </div>
                        <div className="mt-2">
                          <div className="text-muted-foreground text-xs mb-1">Impacts</div>
                          {it.impacts.join(", ")}
                        </div>
                      </td>
                      <td className="p-2 align-top">
                        <div className={`inline-block px-2 py-1 rounded ${riskBoxColor(it.initialRiskLevel)}`}>{it.initialRiskLevel}</div>
                      </td>
                      <td className="p-2 whitespace-pre-wrap align-top">{it.controlMeasures || ""}</td>
                      <td className="p-2 align-top">
                        <div className={`inline-block px-2 py-1 rounded ${riskBoxColor(it.residualRiskLevel)}`}>{it.residualRiskLevel}</div>
                      </td>
                      <td className="p-2 align-top">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/ims-aspects-impacts/${it.id}`}><Button variant="outline" size="icon"><Pencil className="w-4 h-4" /></Button></Link>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => {
                              setSelectedItemForDocs(it)
                              setShowDocumentManager(true)
                            }}
                          >
                            {it.documents && it.documents.length > 0 ? (
                              <FileText className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Paperclip className="w-4 h-4" />
                            )}
                          </Button>
                          <Button variant="outline" size="icon" onClick={async () => {
                            if (!confirm("Delete this item?")) return
                            await fetch(`/api/ims-aspects-impacts/${it.id}`, { method: "DELETE" })
                            load()
                          }}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Document Manager Modal */}
      <Dialog open={showDocumentManager} onOpenChange={setShowDocumentManager}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Documents - {selectedItemForDocs?.category} - {selectedItemForDocs?.activityProductService}
            </DialogTitle>
          </DialogHeader>
          {selectedItemForDocs && (
            <DocumentManager 
              riskId={selectedItemForDocs.id} 
              onDocumentsChange={() => {
                load()
                setShowDocumentManager(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


