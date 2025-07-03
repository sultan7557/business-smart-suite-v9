import { Button } from "@/components/ui/button"
import { Plus, Users, Archive } from 'lucide-react'
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import InterestedPartiesClient from "./interested-parties-client"

export default async function InterestedPartiesPage() {
  const canEdit = await hasPermission("write")
  const canDelete = await hasPermission("delete")
  
  // Fetch both archived and non-archived interested parties
  const interestedParties = await prisma.interestedParty.findMany({
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
      updatedBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { archived: 'asc' },
      { order: 'asc' }
    ],
  })

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Interested Parties</h1>
        </div>
      </div>
      
      <InterestedPartiesClient 
        interestedParties={interestedParties} 
        canEdit={canEdit} 
        canDelete={canDelete} 
      />
      
      <div className="mt-6 p-4 bg-gray-100 text-sm">
        <p>The Company has determined that some of the above needs and expectations of Interested Parties may hold some form of compliance obligation which are determined and documented in the Register of Legal & Other Requirements.</p>
      </div>
    </div>
  )
}