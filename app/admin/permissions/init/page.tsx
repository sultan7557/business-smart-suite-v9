'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function InitRolesPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const router = useRouter();

  const initializeRoles = async () => {
    try {
      setIsInitializing(true);
      const response = await fetch('/api/roles/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      toast.success(data.message);
      router.push('/admin/permissions');
    } catch (error: any) {
      toast.error("Failed to initialize roles: " + error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Initialize Permissions System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will create the default roles for the permissions system:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Master Admin - Full system access with all permissions</li>
            <li>System Admin - System administration access</li>
            <li>Manager - Management level access</li>
            <li>User - Standard user access</li>
          </ul>
          <Button 
            onClick={initializeRoles} 
            disabled={isInitializing}
          >
            {isInitializing ? 'Initializing...' : 'Initialize Roles'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 