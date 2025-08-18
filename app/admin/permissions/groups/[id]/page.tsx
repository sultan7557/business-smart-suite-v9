'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type GroupPermission = {
  id: string;
  systemId: string;
  roleId: string;
  role: { id: string; name: string; description: string | null };
  expiry: string | null;
};

type Role = { id: string; name: string; description?: string | null };

const GrantGroupPermissionSchema = z.object({
  systemId: z.string().min(1, "System ID is required"),
  roleId: z.string().min(1, "Role is required"),
  expiry: z.string().datetime().optional().nullable(),
});

const GroupPermissionsPage: React.FC = () => {
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [permissions, setPermissions] = useState<GroupPermission[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGrantPermissionDialogOpen, setIsGrantPermissionDialogOpen] = useState(false);
  const [newPermissionRoleId, setNewPermissionRoleId] = useState('');
  const [newPermissionSystemId, setNewPermissionSystemId] = useState('business-smart-suite'); // Default
  const [newPermissionExpiry, setNewPermissionExpiry] = useState('');

  const fetchGroupDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGroup(data.group);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch group details: " + err.message);
    }
  }, [groupId]);

  const fetchGroupPermissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/permissions/groups/${groupId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPermissions(data.permissions);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch group permissions: " + err.message);
    }
  }, [groupId]);

  const fetchAvailableRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/roles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAvailableRoles(data.roles);
    } catch (err: any) {
      toast.error("Failed to fetch available roles: " + err.message);
    }
  }, []);

  useEffect(() => {
    if (groupId) {
      setLoading(true);
      Promise.all([
        fetchGroupDetails(),
        fetchGroupPermissions(),
        fetchAvailableRoles()
      ]).finally(() => setLoading(false));
    }
  }, [groupId, fetchGroupDetails, fetchGroupPermissions, fetchAvailableRoles]);

  const handleGrantPermission = async () => {
    try {
      const validatedData = GrantGroupPermissionSchema.parse({
        systemId: newPermissionSystemId,
        roleId: newPermissionRoleId,
        expiry: newPermissionExpiry || null,
      });

      const response = await fetch(`/api/permissions/groups/${groupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast.success("Group permission granted successfully!");
      setIsGrantPermissionDialogOpen(false);
      setNewPermissionRoleId('');
      setNewPermissionExpiry('');
      fetchGroupPermissions(); // Refresh permissions list
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        err.issues.forEach(issue => {
          toast.error(issue.message);
        });
      } else {
        toast.error("Failed to grant group permission: " + err.message);
      }
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    if (!confirm("Are you sure you want to revoke this group permission?")) {
      return;
    }
    try {
      const response = await fetch(`/api/permissions/groups/${groupId}/${permissionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast.success("Group permission revoked successfully!");
      fetchGroupPermissions(); // Refresh permissions list
    } catch (err: any) {
      toast.error("Failed to revoke group permission: " + err.message);
    }
  };

  if (loading) return <div>Loading group permissions...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!group) return <div>Group not found.</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Permissions for Group: {group.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">Current Group Permissions</h3>
          {permissions.length === 0 ? (
            <p>No direct permissions assigned to this group.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>System ID</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell className="font-medium">{perm.role.name}</TableCell>
                    <TableCell>{perm.systemId}</TableCell>
                    <TableCell>{perm.expiry ? new Date(perm.expiry).toLocaleDateString() : 'Never'}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleRevokePermission(perm.id)}>
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <h3 className="text-lg font-semibold mt-8 mb-4">Grant New Group Permission</h3>
          <Dialog open={isGrantPermissionDialogOpen} onOpenChange={setIsGrantPermissionDialogOpen}>
            <DialogTrigger asChild>
              <Button>Grant Group Permission</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Grant Permission to Group: {group.name}</DialogTitle>
                <DialogDescription>Select a role and optionally an expiry date for the new group permission.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role-select" className="text-right">Role</Label>
                  <Select onValueChange={setNewPermissionRoleId} value={newPermissionRoleId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="system-id-input" className="text-right">System ID</Label>
                  <Input id="system-id-input" value={newPermissionSystemId} onChange={(e) => setNewPermissionSystemId(e.target.value)} className="col-span-3" placeholder="e.g., business-smart-suite" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiry-input" className="text-right">Expiry Date (Optional)</Label>
                  <Input id="expiry-input" type="datetime-local" value={newPermissionExpiry} onChange={(e) => setNewPermissionExpiry(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleGrantPermission}>Grant Permission</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupPermissionsPage; 