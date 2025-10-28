"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DocumentManager from "../components/document-manager"
import ReviewManager from "../components/review-manager"

const CATEGORIES = ["Buildings & Utilities","Goods In","Offices","Product Lifecycle","Raw Materials","Waste"]
const ASPECTS = [
  "Emissions to air",
  "Pollution of land", 
  "Discharge of water",
  "Use of materials / natural resources",
  "Solid waste management",
  "Hazardous waste"
]

const IMPACTS = [
  "Deforestation, depletion of natural resources",
  "Air pollution (noise and fumes)",
  "Global warming",
  "Land contamination", 
  "Water pollution",
  "Harm to flora/fauna/aquatics"
]
const CONTROL_OBJECTIVES = [
  "Minimizing environmental impact - Net Zero",
  "Maintain ISO Certification for ISO 14001:2015/45001:2018",
  "Review of Information on Target",
  "Modernised Sales Template",
]

export default function EditIMSAspectImpactPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const id = params?.id as string
  const isNew = id === "new"

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState<string>("")
  const [activity, setActivity] = useState<string>("")
  const [aspects, setAspects] = useState<string[]>([])
  const [impacts, setImpacts] = useState<string[]>([])
  const [initialLikelihood, setInitialLikelihood] = useState<number>(0)
  const [initialSeverity, setInitialSeverity] = useState<number>(0)
  const [controlMeasures, setControlMeasures] = useState<string>("")
  const [residualLikelihood, setResidualLikelihood] = useState<number>(0)
  const [residualSeverity, setResidualSeverity] = useState<number>(0)
  const [comments, setComments] = useState<string>("")
  const [objectives, setObjectives] = useState<string[]>([])
  const [showUpload, setShowUpload] = useState<boolean>(false)
  const [customAspect, setCustomAspect] = useState("")
  const [customImpact, setCustomImpact] = useState("")
  const [showCustomAspect, setShowCustomAspect] = useState(false)
  const [showCustomImpact, setShowCustomImpact] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [showReviews, setShowReviews] = useState(false)
  const [version, setVersion] = useState("1.0")
  const [showVersionDialog, setShowVersionDialog] = useState(false)
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split("T")[0])

  const residualRisk = useMemo(() => (residualLikelihood * residualSeverity) || 0, [residualLikelihood, residualSeverity])
  const initialRisk = useMemo(() => (initialLikelihood * initialSeverity) || 0, [initialLikelihood, initialSeverity])

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    fetch(`/api/ims-aspects-impacts/${id}`).then(r => r.json()).then(({ data }) => {
      setCategory(data.category)
      setActivity(data.activityProductService)
      setAspects(data.aspects || [])
      setImpacts(data.impacts || [])
      setInitialLikelihood(data.initialLikelihood || 0)
      setInitialSeverity(data.initialSeverity || 0)
      setControlMeasures(data.controlMeasures || "")
      setResidualLikelihood(data.residualLikelihood || 0)
      setResidualSeverity(data.residualSeverity || 0)
      setComments(data.commentsRecommendations || "")
      setObjectives(data.controlObjectives || [])
    }).finally(() => setLoading(false))
    
    // Load reviews
    fetch(`/api/ims-aspects-impacts/${id}/reviews`).then(r => r.json()).then(({ data }) => {
      setReviews(data || [])
    }).catch(() => setReviews([]))
  }, [id, isNew])

  useEffect(() => {
    if (searchParams?.get("upload")) setShowUpload(true)
  }, [searchParams])

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  function addCustomAspect() {
    if (customAspect.trim() && !ASPECTS.includes(customAspect.trim())) {
      setAspects([...aspects, customAspect.trim()])
      setCustomAspect("")
      setShowCustomAspect(false)
    }
  }

  function addCustomImpact() {
    if (customImpact.trim() && !IMPACTS.includes(customImpact.trim())) {
      setImpacts([...impacts, customImpact.trim()])
      setCustomImpact("")
      setShowCustomImpact(false)
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      category,
      activityProductService: activity,
      aspects,
      impacts,
      initialLikelihood,
      initialSeverity,
      controlMeasures,
      residualLikelihood,
      residualSeverity,
      commentsRecommendations: comments,
      controlObjectives: objectives,
      version,
      reviewDate,
    }
    const res = await fetch(isNew ? "/api/ims-aspects-impacts" : `/api/ims-aspects-impacts/${id}` , {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      const { data } = await res.json()
      router.push(`/ims-aspects-impacts`)
    }
    setSaving(false)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ims-aspects-impacts" className="text-sm">← Back to register</Link>
          <h1 className="text-xl font-semibold">{isNew ? "Add risk" : "Edit risk"}</h1>
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <div className="space-y-2">
          <Label>Risk Category</Label>
          <select className="border rounded px-3 py-2 w-80" required value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Please Select -</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Activity/Product/Service</Label>
          <Input value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Describe the activity, product, or service" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Version</Label>
            <div className="flex gap-2">
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0" />
              <Button type="button" variant="outline" onClick={() => setShowVersionDialog(true)}>
                Upscale Version
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Review Date</Label>
            <Input 
              type="date" 
              value={reviewDate} 
              onChange={(e) => setReviewDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Aspects</Label>
            <div className="mt-2 space-y-2">
              {ASPECTS.map((a) => (
                <label key={a} className="flex items-center gap-2">
                  <Checkbox checked={aspects.includes(a)} onCheckedChange={() => toggle(aspects, a, setAspects)} />
                  <span className="text-sm">{a}</span>
                </label>
              ))}
              {aspects.filter(a => !ASPECTS.includes(a)).map((a) => (
                <label key={a} className="flex items-center gap-2">
                  <Checkbox checked={aspects.includes(a)} onCheckedChange={() => toggle(aspects, a, setAspects)} />
                  <span className="text-sm text-blue-600">{a}</span>
                </label>
              ))}
              {!showCustomAspect ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCustomAspect(true)}>
                  + Add Custom Aspect
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter custom aspect" 
                    value={customAspect} 
                    onChange={(e) => setCustomAspect(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomAspect()}
                  />
                  <Button type="button" size="sm" onClick={addCustomAspect}>Add</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    setShowCustomAspect(false)
                    setCustomAspect("")
                  }}>Cancel</Button>
                </div>
              )}
            </div>
          </div>
          <div>
            <Label>Impacts</Label>
            <div className="mt-2 space-y-2">
              {IMPACTS.map((i) => (
                <label key={i} className="flex items-center gap-2">
                  <Checkbox checked={impacts.includes(i)} onCheckedChange={() => toggle(impacts, i, setImpacts)} />
                  <span className="text-sm">{i}</span>
                </label>
              ))}
              {impacts.filter(i => !IMPACTS.includes(i)).map((i) => (
                <label key={i} className="flex items-center gap-2">
                  <Checkbox checked={impacts.includes(i)} onCheckedChange={() => toggle(impacts, i, setImpacts)} />
                  <span className="text-sm text-blue-600">{i}</span>
                </label>
              ))}
              {!showCustomImpact ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCustomImpact(true)}>
                  + Add Custom Impact
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter custom impact" 
                    value={customImpact} 
                    onChange={(e) => setCustomImpact(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomImpact()}
                  />
                  <Button type="button" size="sm" onClick={addCustomImpact}>Add</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    setShowCustomImpact(false)
                    setCustomImpact("")
                  }}>Cancel</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Risk Analysis Before Control Measures</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Likelihood (0-5)</Label>
              <RadioGroup value={String(initialLikelihood)} onValueChange={(v) => setInitialLikelihood(Number(v))} className="flex gap-4 mt-2">
                {[0,1,2,3,4,5].map((n) => (
                  <label key={n} className="flex items-center gap-2"><RadioGroupItem value={String(n)} id={`pre-like-${n}`} />{n}</label>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>Severity (0-5)</Label>
              <RadioGroup value={String(initialSeverity)} onValueChange={(v) => setInitialSeverity(Number(v))} className="flex gap-4 mt-2">
                {[0,1,2,3,4,5].map((n) => (
                  <label key={n} className="flex items-center gap-2"><RadioGroupItem value={String(n)} id={`pre-sev-${n}`} />{n}</label>
                ))}
              </RadioGroup>
            </div>
            <div className="text-sm text-muted-foreground">Risk Level: {initialRisk}</div>
            <div>
              <Label>Comments/Recommendations</Label>
              <Textarea rows={3} value={comments} onChange={(e) => setComments(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Risk Analysis After Control Measures</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Residual Likelihood (0-5)</Label>
              <RadioGroup value={String(residualLikelihood)} onValueChange={(v) => setResidualLikelihood(Number(v))} className="flex gap-4 mt-2">
                {[0,1,2,3,4,5].map((n) => (
                  <label key={n} className="flex items-center gap-2"><RadioGroupItem value={String(n)} id={`post-like-${n}`} />{n}</label>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>Residual Severity (0-5)</Label>
              <RadioGroup value={String(residualSeverity)} onValueChange={(v) => setResidualSeverity(Number(v))} className="flex gap-4 mt-2">
                {[0,1,2,3,4,5].map((n) => (
                  <label key={n} className="flex items-center gap-2"><RadioGroupItem value={String(n)} id={`post-sev-${n}`} />{n}</label>
                ))}
              </RadioGroup>
            </div>
            <div className="text-sm text-muted-foreground">Residual Risk: {residualRisk}</div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label>Control Measures</Label>
          <Textarea rows={4} value={controlMeasures} onChange={(e) => setControlMeasures(e.target.value)} />
        </div>

        <div>
          <Label>Control Objectives</Label>
          <div className="mt-2 space-y-2">
            {CONTROL_OBJECTIVES.map((o) => (
              <label key={o} className="flex items-center gap-2">
                <Checkbox checked={objectives.includes(o)} onCheckedChange={() => toggle(objectives, o, setObjectives)} />
                <span className="text-sm">{o}</span>
              </label>
            ))}
          </div>
        </div>

        {isNew ? (
          <div className="text-sm text-muted-foreground">
            Documents can only be uploaded against existing items. Once you have saved this new item you will be able to upload documents.
          </div>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowUpload(true)}>Manage documents</Button>
            <Button type="button" variant="outline" onClick={() => setShowReviews(true)}>Manage reviews</Button>
            <Button type="button" variant="outline" asChild>
              <a href={`/api/ims-aspects-impacts/${id}/pdf`} target="_blank">
                Download PDF
              </a>
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/ims-aspects-impacts")}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </form>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Management</DialogTitle>
          </DialogHeader>
          {!isNew && (
            <DocumentManager 
              riskId={id as string} 
              onDocumentsChange={() => setShowUpload(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showReviews} onOpenChange={setShowReviews}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Reviews</DialogTitle>
          </DialogHeader>
          <ReviewManager 
            aspectImpactId={id} 
            reviews={reviews} 
            onReviewsChange={setReviews} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}





