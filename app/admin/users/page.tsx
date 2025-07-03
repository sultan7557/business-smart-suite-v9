import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, UserPlus } from "lucide-react"
import { hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"

// Mock user data
const users = [
  { id: 1, name: "Admin User", username: "admin", email: "admin@example.com", role: "admin", status: "active" },
  { id: 2, name: "Regular User", username: "user", email: "user@example.com", role: "user", status: "active" },
  { id: 3, name: "Manager User", username: "manager", email: "manager@example.com", role: "manager", status: "active" },
  { id: 4, name: "John Keen", username: "jkeen", email: "john.keen@example.com", role: "user", status: "inactive" },
  {
    id: 5,
    name: "Dave Nicholson",
    username: "dnicholson",
    email: "dave.nicholson@example.com",
    role: "manager",
    status: "active",
  },
  {
    id: 6,
    name: "Kulvinder Bhullar",
    username: "kbhullar",
    email: "kulvinder.bhullar@example.com",
    role: "user",
    status: "active",
  },
]

export default async function UsersPage() {
  const hasManageUsersPermission = await hasPermission("manage_users")

  if (!hasManageUsersPermission) {
    redirect("/")
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "admin" ? "destructive" : user.role === "manager" ? "default" : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "outline" : "secondary"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

