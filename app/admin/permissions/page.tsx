'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Trash2, UserX, UserCheck, RotateCcw, AlertTriangle } from "lucide-react";

const inviteUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  systemId: z.string().min(1, "System ID is required"),
  roleId: z.string().optional(),
});

type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const PermissionsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSystemId, setInviteSystemId] = useState('business-smart-suite');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [roles, setRoles] = useState<{ id: string; name: string; description?: string | null }[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'deactivate' | 'reactivate' | 'delete' | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUserError(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setUserError(err.message);
      toast.error("Failed to fetch users: " + err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/roles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRoles(data.roles);
    } catch (err: any) {
      toast.error("Failed to fetch roles: " + err.message);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleInviteUser = async () => {
    try {
      const validatedData = inviteUserSchema.parse({
        name: inviteName,
        email: inviteEmail,
        systemId: inviteSystemId,
        roleId: inviteRoleId || undefined,
      });

      const response = await fetch('/api/users/invite', {
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

      toast.success("Invitation sent successfully!");
      setInviteName('');
      setInviteEmail('');
      setInviteRoleId('');
      setIsInviteDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        err.issues.forEach(issue => {
          toast.error(issue.message);
        });
      } else {
        toast.error("Failed to send invitation: " + err.message);
      }
    }
  };

  const handleViewUserPermissions = (userId: string) => {
    router.push(`/admin/permissions/users/${userId}`);
  };

  const handleUserAction = (user: User, action: 'deactivate' | 'reactivate' | 'delete') => {
    setSelectedUser(user);
    setActionType(action);
    setIsActionDialogOpen(true);
  };

  const confirmUserAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      let response;
      let successMessage = '';

      switch (actionType) {
        case 'deactivate':
          response = await fetch(`/api/users/${selectedUser.id}`, {
            method: 'DELETE',
          });
          successMessage = "User deactivated successfully!";
          break;

        case 'reactivate':
          response = await fetch(`/api/users/${selectedUser.id}/reactivate`, {
            method: 'POST',
          });
          successMessage = "User reactivated successfully!";
          break;

        case 'delete':
          response = await fetch(`/api/users/${selectedUser.id}/delete`, {
        method: 'DELETE',
      });
          successMessage = "User permanently deleted!";
          break;
      }

      if (!response?.ok) {
        const errorData = await response?.json();
        throw new Error(errorData?.error || `HTTP error! status: ${response?.status}`);
      }

      toast.success(successMessage);
      setIsActionDialogOpen(false);
      setSelectedUser(null);
      setActionType(null);
      fetchUsers(); // Refresh the users list
    } catch (err: any) {
      toast.error(`Failed to ${actionType} user: ${err.message}`);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'deactivate':
        return <UserX className="w-5 h-5 text-orange-600" />;
      case 'reactivate':
        return <UserCheck className="w-5 h-5 text-green-600" />;
      case 'delete':
        return <Trash2 className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionTitle = (action: string) => {
    switch (action) {
      case 'deactivate':
        return 'Deactivate User';
      case 'reactivate':
        return 'Reactivate User';
      case 'delete':
        return 'Permanently Delete User';
      default:
        return 'User Action';
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'deactivate':
        return 'This will prevent the user from accessing the system. They can be reactivated later.';
      case 'reactivate':
        return 'This will restore the user\'s access to the system.';
      case 'delete':
        return 'This will permanently delete the user and all their data. This action cannot be undone.';
      default:
        return 'Are you sure you want to perform this action?';
    }
  };

  const getActionButtonText = (action: string) => {
    switch (action) {
      case 'deactivate':
        return 'Deactivate User';
      case 'reactivate':
        return 'Reactivate User';
      case 'delete':
        return 'Delete Permanently';
      default:
        return 'Confirm Action';
    }
  };

  const getActionButtonVariant = (action: string) => {
    switch (action) {
      case 'deactivate':
        return 'outline';
      case 'reactivate':
        return 'default';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loadingUsers) return <div>Loading permissions data...</div>;
  if (userError) return <div>Error loading data. Users: {userError}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite a new user to this system:</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="invite-name" className="block text-sm font-medium text-gray-700">Invited users name:</label>
            <Input id="invite-name" placeholder="Users name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
          </div>
          <div className="col-span-1 md:col-span-1">
            <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700">Invited users email:</label>
            <Input id="invite-email" placeholder="Users email address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          </div>
          <div className="col-span-1 md:col-span-1 flex justify-end">
             <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>Invite user</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Invite User</DialogTitle>
                  <DialogDescription>Fill in the details to send an invitation.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="invite-dialog-name" className="text-right">Name</Label>
                    <Input id="invite-dialog-name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="invite-dialog-email" className="text-right">Email</Label>
                    <Input id="invite-dialog-email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="invite-dialog-role" className="text-right">Role (Optional)</Label>
                    <Select onValueChange={setInviteRoleId} value={inviteRoleId}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleInviteUser}>Send Invitation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      user.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                      user.status === 'INVITED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                        onClick={() => handleViewUserPermissions(user.id)}
                        >
                        View/Edit Permissions
                        </Button>
                      
                      {user.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user, 'deactivate')}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Deactivate
                        </Button>
                      )}
                      
                      {user.status === 'INACTIVE' && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleUserAction(user, 'reactivate')}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reactivate
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                            onClick={() => handleUserAction(user, 'delete')}
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                        </Button>
                        </>
                      )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* User Action Confirmation Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType && getActionIcon(actionType)}
              {actionType && getActionTitle(actionType)}
            </DialogTitle>
            <DialogDescription>
              {actionType && getActionDescription(actionType)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-600">Username: {selectedUser.username}</p>
                <p className="text-sm text-gray-600">Status: {selectedUser.status}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType ? getActionButtonVariant(actionType) : 'outline'} 
              onClick={confirmUserAction}
            >
              {actionType && getActionButtonText(actionType)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionsPage; 