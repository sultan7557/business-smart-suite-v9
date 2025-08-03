'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, Eye, Edit, Trash2, Plus, Clock, AlertTriangle, CheckCircle } from "lucide-react";

type UserPermission = {
  id: string;
  systemId: string;
  roleId: string;
  role: { id: string; name: string; description: string | null };
  expiry: string | null;
  createdAt: string;
};

type Role = { id: string; name: string; description?: string | null };

// Predefined system modules with their descriptions
const SYSTEM_MODULES = [
  { id: 'policies', name: 'Policies', description: 'Manage company policies and procedures' },
  { id: 'manuals', name: 'Manuals', description: 'Access and edit operational manuals' },
  { id: 'procedures', name: 'Procedures', description: 'Manage standard operating procedures' },
  { id: 'forms', name: 'Forms', description: 'Create and manage forms' },
  { id: 'certificates', name: 'Certificates', description: 'Manage certificates and compliance documents' },
  { id: 'corrective-actions', name: 'Corrective Actions', description: 'Track and manage corrective actions' },
  { id: 'business-continuity', name: 'Business Continuity', description: 'Business continuity planning and management' },
  { id: 'management-review', name: 'Management Review', description: 'Management review processes' },
  { id: 'job-descriptions', name: 'Job Descriptions', description: 'Manage job descriptions and roles' },
  { id: 'work-instructions', name: 'Work Instructions', description: 'Create and manage work instructions' },
  { id: 'coshh', name: 'COSHH', description: 'Control of Substances Hazardous to Health' },
  { id: 'risk-assessments', name: 'Risk Assessments', description: 'Risk assessment management' },
  { id: 'hse-guidance', name: 'HSE Guidance', description: 'Health and Safety guidance documents' },
  { id: 'technical-files', name: 'Technical Files', description: 'Technical documentation management' },
  { id: 'environmental-guidance', name: 'Environmental Guidance', description: 'Environmental management guidance' },
  { id: 'custom-sections', name: 'Custom Sections', description: 'Custom content sections' },
  { id: 'registers', name: 'Registers', description: 'Various registers and logs' },
  { id: 'legal-register', name: 'Legal Register', description: 'Legal compliance register' },
  { id: 'training', name: 'Training', description: 'Training management and records' },
  { id: 'maintenance', name: 'Maintenance', description: 'Maintenance schedules and records' },
  { id: 'improvement-register', name: 'Improvement Register', description: 'Continuous improvement tracking' },
  { id: 'objectives', name: 'Objectives', description: 'Organizational objectives management' },
  { id: 'organizational-context', name: 'Organizational Context', description: 'Organizational context and scope' },
  { id: 'interested-parties', name: 'Interested Parties', description: 'Stakeholder management' },
  { id: 'audit-schedule', name: 'Audit Schedule', description: 'Audit planning and scheduling' },
  { id: 'suppliers', name: 'Suppliers', description: 'Supplier management and documentation' },
  { id: 'statement-of-applicability', name: 'Statement of Applicability', description: 'ISO compliance statements' },
];

// Predefined roles with their capabilities - these should match the database role names
const PREDEFINED_ROLES = [
  { name: 'View Only', description: 'Can view content but cannot edit' },
  { name: 'Edit', description: 'Can view and edit content' },
  { name: 'Delete', description: 'Can view, edit, and delete content' },
  { name: 'Admin', description: 'Full administrative access' },
  { name: 'Approve', description: 'Can approve changes and content' },
  { name: 'Manage Users', description: 'Can manage user accounts and permissions' },
];

const GrantPermissionSchema = z.object({
  systemId: z.string().min(1, "System ID is required"),
  roleId: z.string().min(1, "Role is required"),
  expiry: z.string().nullable().optional().transform((val) => {
    if (!val) return null;
    try {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return date.toISOString();
    } catch (error) {
      throw new Error("Invalid datetime format");
    }
  }),
});

const UserPermissionsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [user, setUser] = useState<{ id: string; name: string; email: string; username: string; status: string } | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGrantPermissionDialogOpen, setIsGrantPermissionDialogOpen] = useState(false);
  const [newPermissionRoleId, setNewPermissionRoleId] = useState('');
  const [newPermissionSystemId, setNewPermissionSystemId] = useState('');
  const [newPermissionExpiry, setNewPermissionExpiry] = useState('');
  const [activeTab, setActiveTab] = useState('current');

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch user details: " + err.message);
    }
  }, [userId]);

  const fetchUserPermissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/permissions/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPermissions(data.permissions);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch user permissions: " + err.message);
    }
  }, [userId]);

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
    if (userId) {
      setLoading(true);
      Promise.all([
        fetchUserDetails(),
        fetchUserPermissions(),
        fetchAvailableRoles()
      ]).finally(() => setLoading(false));
    }
  }, [userId, fetchUserDetails, fetchUserPermissions, fetchAvailableRoles]);

  const handleGrantPermission = async () => {
    try {
      // Find the actual role ID from the available roles
      const selectedRole = availableRoles.find(role => role.name === newPermissionRoleId);
      
      if (!selectedRole) {
        toast.error("Selected role not found in available roles");
        return;
      }

      // Get the actual role from database to ensure we have the correct ID
      const actualRole = await fetch(`/api/roles`).then(res => res.json()).then(data => 
        data.roles.find((r: any) => r.name === selectedRole.name)
      );

      if (!actualRole) {
        toast.error("Role not found in database");
        return;
      }

      const validatedData = GrantPermissionSchema.parse({
        systemId: newPermissionSystemId,
        roleId: actualRole.id, // Use the actual role ID from database
        expiry: newPermissionExpiry ? new Date(newPermissionExpiry).toISOString() : null,
      });

      const response = await fetch(`/api/permissions/users/${userId}`, {
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

      toast.success("Permission granted successfully!");
      setIsGrantPermissionDialogOpen(false);
      setNewPermissionRoleId('');
      setNewPermissionSystemId('');
      setNewPermissionExpiry('');
      fetchUserPermissions();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        err.issues.forEach(issue => {
          toast.error(issue.message);
        });
      } else {
        toast.error("Failed to grant permission: " + err.message);
      }
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    if (!confirm("Are you sure you want to revoke this permission?")) {
      return;
    }
    try {
      const response = await fetch(`/api/permissions/users/${userId}/${permissionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast.success("Permission revoked successfully!");
      fetchUserPermissions();
    } catch (err: any) {
      toast.error("Failed to revoke permission: " + err.message);
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'view':
      case 'view only':
        return <Eye className="w-4 h-4" />;
      case 'edit':
        return <Edit className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'approve':
        return <Shield className="w-4 h-4" />;
      case 'manage_users':
        return <Shield className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'view':
      case 'view only':
        return 'secondary';
      case 'edit':
        return 'default';
      case 'delete':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'approve':
        return 'default';
      case 'manage_users':
        return 'default';
      default:
        return 'outline';
    }
  };

  const isPermissionExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  };

  const isPermissionExpiringSoon = (expiry: string | null) => {
    if (!expiry) return false;
    const expiryDate = new Date(expiry);
    const now = new Date();
    const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading user permissions...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen">Error: {error}</div>;
  if (!user) return <div className="flex items-center justify-center min-h-screen">User not found.</div>;

  const expiredPermissions = permissions.filter(p => isPermissionExpired(p.expiry));
  const expiringSoonPermissions = permissions.filter(p => isPermissionExpiringSoon(p.expiry));
  const activePermissions = permissions.filter(p => !isPermissionExpired(p.expiry) && !isPermissionExpiringSoon(p.expiry));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Permissions</h1>
            <p className="text-gray-600">{user.name} ({user.email})</p>
          </div>
        </div>
        <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
          {user.status}
        </Badge>
      </div>

      {/* Permission Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current Permissions</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredPermissions.length})</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon ({expiringSoonPermissions.length})</TabsTrigger>
          <TabsTrigger value="grant">Grant New</TabsTrigger>
        </TabsList>

        {/* Current Permissions Tab */}
        <TabsContent value="current" className="space-y-4">
      <Card>
        <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Active Permissions</span>
              </CardTitle>
        </CardHeader>
        <CardContent>
              {activePermissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No active permissions assigned to this user.</p>
                </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                      <TableHead>Module</TableHead>
                  <TableHead>Role</TableHead>
                      <TableHead>Granted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    {activePermissions.map((perm) => {
                      const module = SYSTEM_MODULES.find(m => m.id === perm.systemId);
                      return (
                  <TableRow key={perm.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{module?.name || perm.systemId}</div>
                              <div className="text-sm text-gray-500">{module?.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(perm.role.name)} className="flex items-center space-x-1">
                              {getRoleIcon(perm.role.name)}
                              <span>{perm.role.name}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {new Date(perm.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleRevokePermission(perm.id)}>
                              <Trash2 className="w-4 h-4 mr-1" />
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expired Permissions Tab */}
        <TabsContent value="expired" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span>Expired Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expiredPermissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
                  <p>No expired permissions.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Expired</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiredPermissions.map((perm) => {
                      const module = SYSTEM_MODULES.find(m => m.id === perm.systemId);
                      return (
                        <TableRow key={perm.id} className="bg-red-50">
                          <TableCell>
                            <div>
                              <div className="font-medium">{module?.name || perm.systemId}</div>
                              <div className="text-sm text-gray-500">{module?.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="flex items-center space-x-1">
                              {getRoleIcon(perm.role.name)}
                              <span>{perm.role.name}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-red-600 font-medium">
                              {perm.expiry ? new Date(perm.expiry).toLocaleDateString() : 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleRevokePermission(perm.id)}>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiring Soon Tab */}
        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span>Expiring Soon</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expiringSoonPermissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
                  <p>No permissions expiring soon.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringSoonPermissions.map((perm) => {
                      const module = SYSTEM_MODULES.find(m => m.id === perm.systemId);
                      const daysUntilExpiry = perm.expiry ? Math.ceil((new Date(perm.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                      return (
                        <TableRow key={perm.id} className="bg-orange-50">
                          <TableCell>
                            <div>
                              <div className="font-medium">{module?.name || perm.systemId}</div>
                              <div className="text-sm text-gray-500">{module?.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center space-x-1">
                              {getRoleIcon(perm.role.name)}
                              <span>{perm.role.name}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-orange-600 font-medium">
                              {perm.expiry ? new Date(perm.expiry).toLocaleDateString() : 'Unknown'}
                              <div className="text-xs">({daysUntilExpiry} days left)</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleRevokePermission(perm.id)}>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grant New Permission Tab */}
        <TabsContent value="grant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Grant New Permission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
          <Dialog open={isGrantPermissionDialogOpen} onOpenChange={setIsGrantPermissionDialogOpen}>
            <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Grant New Permission
                  </Button>
            </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Grant Permission to {user.name}</DialogTitle>
                    <DialogDescription>Select a module and role to grant permissions.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="module-select" className="text-right">Module</Label>
                      <Select onValueChange={setNewPermissionSystemId} value={newPermissionSystemId}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a module" />
                        </SelectTrigger>
                        <SelectContent>
                          {SYSTEM_MODULES.map(module => (
                            <SelectItem key={module.id} value={module.id}>
                              <div>
                                <div className="font-medium">{module.name}</div>
                                <div className="text-xs text-gray-500">{module.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role-select" className="text-right">Role</Label>
                  <Select onValueChange={setNewPermissionRoleId} value={newPermissionRoleId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map(role => (
                            <SelectItem key={role.id} value={role.name}>
                              <div className="flex items-center space-x-2">
                                {getRoleIcon(role.name)}
                                <div>
                                  <div className="font-medium">{role.name}</div>
                                  <div className="text-xs text-gray-500">{role.description}</div>
                                </div>
                              </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="expiry-input" className="text-right">Expiry Date</Label>
                      <Input 
                        id="expiry-input" 
                        type="datetime-local" 
                        value={newPermissionExpiry} 
                        onChange={(e) => setNewPermissionExpiry(e.target.value)} 
                        className="col-span-3" 
                        placeholder="Optional - Leave empty for no expiry"
                      />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleGrantPermission}>Grant Permission</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPermissionsPage; 