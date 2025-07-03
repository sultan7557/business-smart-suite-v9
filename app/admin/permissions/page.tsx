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

const inviteUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  systemId: z.string().min(1, "System ID is required"),
  roleId: z.string().optional(),
});

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
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

type Group = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
  };
};

const PermissionsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSystemId, setInviteSystemId] = useState('rkms-portal');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string; description?: string | null }[]>([]);

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

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    setGroupError(null);
    try {
      const response = await fetch('/api/groups');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGroups(data.groups);
    } catch (err: any) {
      setGroupError(err.message);
      toast.error("Failed to fetch groups: " + err.message);
    } finally {
      setLoadingGroups(false);
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
    fetchGroups();
    fetchRoles();
  }, [fetchUsers, fetchGroups, fetchRoles]);

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

  const handleCreateGroup = async () => {
    try {
      const validatedData = groupSchema.parse({
        name: newGroupName,
        description: newGroupDescription || undefined,
      });

      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...validatedData,
          userIds: selectedUsers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast.success("Group created successfully!");
      setNewGroupName('');
      setNewGroupDescription('');
      setSelectedUsers([]);
      setIsCreateGroupDialogOpen(false);
      fetchGroups();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        err.issues.forEach(issue => {
          toast.error(issue.message);
        });
      } else {
        toast.error("Failed to create group: " + err.message);
      }
    }
  };

  const handleViewUserPermissions = (userId: string) => {
    router.push(`/admin/permissions/users/${userId}`);
  };

  const handleViewGroupPermissions = (groupId: string) => {
    router.push(`/admin/permissions/groups/${groupId}`);
  };

  const handleViewGroupUsers = (groupId: string) => {
    router.push(`/admin/permissions/groups/${groupId}/users`);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete group');
      }

      toast.success('Group deleted successfully');
      fetchGroups(); // Refresh the groups list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete group');
    }
  };

  const handleDeleteUserFromGroup = async (groupId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the group?')) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove user from group');
      }

      toast.success('User removed from group successfully');
      fetchGroups(); // Refresh the groups list
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove user from group');
    }
  };

  if (loadingUsers || loadingGroups) return <div>Loading permissions data...</div>;
  if (userError || groupError) return <div>Error loading data. Users: {userError}, Groups: {groupError}</div>;

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
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleViewUserPermissions(user.id)}>View/Edit Permissions</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage groups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {groups.length === 0 ? (
            <p>There are currently no groups for this system. Use the options below to create a new group.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>{group.description}</TableCell>
                    <TableCell>{group._count.users}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/permissions/groups/${group.id}/users`)}
                        >
                          View Users
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/permissions/groups/${group.id}/permissions`)}
                        >
                          Manage Permissions
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          Delete Group
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex gap-4 items-end">
            <Button onClick={() => setIsCreateGroupDialogOpen(true)}>Create New Group</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>Enter group details and select users to add to the group.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group-name" className="text-right">Name</Label>
              <Input
                id="group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="col-span-3"
                placeholder="Enter group name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group-description" className="text-right">Description</Label>
              <Input
                id="group-description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="col-span-3"
                placeholder="Enter group description (optional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group-users" className="text-right">Users</Label>
              <div className="col-span-3 space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor={`user-${user.id}`} className="text-sm">
                      {user.name} ({user.email})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateGroup}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionsPage; 