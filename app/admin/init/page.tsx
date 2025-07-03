'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function InitPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const router = useRouter();

  const initializeSystem = async () => {
    try {
      setIsInitializing(true);

      // Initialize roles
      const rolesResponse = await fetch('/api/roles/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!rolesResponse.ok) {
        throw new Error(`Failed to initialize roles: ${rolesResponse.status}`);
      }

      // Initialize sidebar data
      const dataResponse = await fetch('/api/init-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!dataResponse.ok) {
        throw new Error(`Failed to initialize data: ${dataResponse.status}`);
      }

      toast.success("System initialized successfully!");
      router.push('/admin/permissions');
    } catch (error: any) {
      toast.error("Failed to initialize system: " + error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Initialize System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will initialize the system with default data:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Create default roles (Master Admin, System Admin, Manager, User)</li>
            <li>Create default categories for all sidebar sections</li>
          </ul>
          <Button 
            onClick={initializeSystem} 
            disabled={isInitializing}
          >
            {isInitializing ? 'Initializing...' : 'Initialize System'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 