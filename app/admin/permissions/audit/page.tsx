'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { z } from 'zod';

type AuditLog = {
  id: string;
  action: string;
  userId: string;
  systemId: string;
  roleId: string;
  performedBy: string;
  createdAt: string;
  details: any; // JSON field
  user?: { id: string; name: string; email: string };
  role?: { id: string; name: string };
};

type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const auditLogQuerySchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  systemId: z.string().optional(),
  roleId: z.string().optional(),
  performedBy: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(10),
});

const AuditTrailPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filterUserId, setFilterUserId] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterSystemId, setFilterSystemId] = useState('');
  const [filterPerformedBy, setFilterPerformedBy] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const fetchAuditLogs = useCallback(async (page: number, pageSize: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (filterUserId) params.append('userId', filterUserId);
      if (filterAction) params.append('action', filterAction);
      if (filterSystemId) params.append('systemId', filterSystemId);
      if (filterPerformedBy) params.append('performedBy', filterPerformedBy);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);

      const response = await fetch(`/api/permissions/audit?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAuditLogs(data.auditLogs);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch audit logs: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [filterUserId, filterAction, filterSystemId, filterPerformedBy, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchAuditLogs(pagination.page, pagination.pageSize);
  }, [fetchAuditLogs, pagination.page, pagination.pageSize]);

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) return <div>Loading audit logs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Permission Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Input placeholder="Filter by User ID" value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)} />
            <Input placeholder="Filter by Action" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} />
            <Input placeholder="Filter by System ID" value={filterSystemId} onChange={(e) => setFilterSystemId(e.target.value)} />
            <Input placeholder="Filter by Performed By User ID" value={filterPerformedBy} onChange={(e) => setFilterPerformedBy(e.target.value)} />
            <Input type="date" placeholder="Start Date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
            <Input type="date" placeholder="End Date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>

          {auditLogs.length === 0 ? (
            <p>No audit logs found matching your criteria.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>System ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.user?.name || log.userId}</TableCell>
                    <TableCell>{log.systemId}</TableCell>
                    <TableCell>{log.role?.name || log.roleId}</TableCell>
                    <TableCell>{log.performedBy}</TableCell>
                    <TableCell>{JSON.stringify(log.details)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-between items-center mt-6">
            <Button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}>Previous</Button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <Button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrailPage; 