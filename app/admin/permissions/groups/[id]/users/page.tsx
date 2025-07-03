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

type GroupUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  addedAt: string;
  addedBy: string | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  status: string;
};

type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const GroupUsersPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const groupId = params?.id;

  if (!groupId) {
    return <div>Group ID not found.</div>;
  }

  const [group, setGroup] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

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

  const fetchGroupUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGroupUsers(data.users);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch group users: " + err.message);
    }
  }, [groupId]);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/users?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Filter out users that are already in the group
      const filteredUsers = data.users.filter((user: User) => 
        !groupUsers.some(groupUser => groupUser.id === user.id)
      );
      setAvailableUsers(filteredUsers);
      setPagination(data.pagination);
    } catch (err: any) {
      toast.error("Failed to fetch available users: " + err.message);
    }
  }, [groupUsers, pagination.page, pagination.pageSize, search]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchGroupDetails(),
      fetchGroupUsers(),
      fetchAvailableUsers()
    ]).finally(() => setLoading(false));
  }, [fetchGroupDetails, fetchGroupUsers, fetchAvailableUsers]);

  const handleAddUser = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast.success("User added to group successfully!");
      setIsAddUserDialogOpen(false);
      setSelectedUserId('');
      fetchGroupUsers();
      fetchAvailableUsers();
    } catch (err: any) {
      toast.error("Failed to add user to group: " + err.message);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user from the group?")) {
      return;
    }
    try {
      const response = await fetch(`/api/groups/${groupId}/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast.success("User removed from group successfully!");
      fetchGroupUsers();
      fetchAvailableUsers();
    } catch (err: any) {
      toast.error("Failed to remove user from group: " + err.message);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) return <div>Loading group users...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!group) return <div>Group not found.</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Users in Group: {group.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">Group Members</h3>
          {groupUsers.length === 0 ? (
            <p>No users in this group.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Added At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{new Date(user.addedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveUser(user.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <h3 className="text-lg font-semibold mt-8 mb-4">Add User to Group</h3>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add User to {group.name}</DialogTitle>
                <DialogDescription>Select a user to add to this group.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="search" className="text-right">Search</Label>
                  <Input
                    id="search"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search users..."
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="user-select" className="text-right">User</Label>
                  <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <span className="py-2">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupUsersPage; 