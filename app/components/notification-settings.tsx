"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { getNotificationSettings, updateNotificationSettings } from "@/app/actions/supplier-document-actions"
import { Loader } from "@/components/ui/loader"

interface NotificationSettingsProps {
  userId: string
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    notification30Days: true,
    notification14Days: true,
    notification7Days: true,
    notification1Day: true,
    emailEnabled: true
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const result = await getNotificationSettings(userId)
        if (result.success) {
          setSettings(result.data)
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [userId])

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateNotificationSettings(userId, settings)
      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Your notification preferences have been updated successfully.",
        })
      } else {
        throw new Error(result.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loader message="Loading notification settings..." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Document Expiry Notifications</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure when you want to receive email notifications about document expirations.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="emailEnabled"
            checked={settings.emailEnabled}
            onCheckedChange={(checked) => handleSettingChange("emailEnabled", checked as boolean)}
          />
          <label htmlFor="emailEnabled" className="text-sm font-medium text-gray-900">
            Enable email notifications
          </label>
        </div>

        {settings.emailEnabled && (
          <div className="ml-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="notification30Days"
                checked={settings.notification30Days}
                onCheckedChange={(checked) => handleSettingChange("notification30Days", checked as boolean)}
              />
              <label htmlFor="notification30Days" className="text-sm text-gray-900">
                Notify 30 days before expiry
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="notification14Days"
                checked={settings.notification14Days}
                onCheckedChange={(checked) => handleSettingChange("notification14Days", checked as boolean)}
              />
              <label htmlFor="notification14Days" className="text-sm text-gray-900">
                Notify 14 days before expiry
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="notification7Days"
                checked={settings.notification7Days}
                onCheckedChange={(checked) => handleSettingChange("notification7Days", checked as boolean)}
              />
              <label htmlFor="notification7Days" className="text-sm text-gray-900">
                Notify 7 days before expiry
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="notification1Day"
                checked={settings.notification1Day}
                onCheckedChange={(checked) => handleSettingChange("notification1Day", checked as boolean)}
              />
              <label htmlFor="notification1Day" className="text-sm text-gray-900">
                Notify 1 day before expiry
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader size="sm" ariaLabel="Saving..." /> : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

