// import { type NextRequest, NextResponse } from "next/server"
// import prisma from "@/lib/prisma"
// import { withAuth } from "@/lib/auth"

// export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
//   try {
//     const policy = await prisma.policy.findUnique({
//       where: {
//         id: params.id,
//       },
//       include: {
//         category: true,
//         createdBy: {
//           select: {
//             name: true,
//           },
//         },
//         updatedBy: {
//           select: {
//             name: true,
//           },
//         },
//         versions: {
//           include: {
//             createdBy: {
//               select: {
//                 name: true,
//               },
//             },
//             document: true,
//           },
//           orderBy: {
//             createdAt: "desc",
//           },
//         },
//         documents: {
//           orderBy: {
//             uploadedAt: "desc",
//           },
//         },
//       },
//     })

//     if (!policy) {
//       return NextResponse.json({ error: "Policy not found" }, { status: 404 })
//     }

//     return NextResponse.json(policy)
//   } catch (error) {
//     console.error("Error fetching policy:", error)
//     return NextResponse.json({ error: "Failed to fetch policy" }, { status: 500 })
//   }
// })

// export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
//   try {
//     const data = await request.json()
//     const user = await request.json()

//     const policy = await prisma.policy.update({
//       where: {
//         id: params.id,
//       },
//       data: {
//         ...data,
//         updatedById: user.id,
//       },
//     })

//     return NextResponse.json(policy)
//   } catch (error) {
//     console.error("Error updating policy:", error)
//     return NextResponse.json({ error: "Failed to update policy" }, { status: 500 })
//   }
// }, "write")

// export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
//   try {
//     // Soft delete by setting archived to true
//     const policy = await prisma.policy.update({
//       where: {
//         id: params.id,
//       },
//       data: {
//         archived: true,
//       },
//     })

//     return NextResponse.json(policy)
//   } catch (error) {
//     console.error("Error deleting policy:", error)
//     return NextResponse.json({ error: "Failed to delete policy" }, { status: 500 })
//   }
// }, "delete")

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  // Extract ID from URL
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  try {
    const policy = await prisma.policy.findUnique({
      where: {
        id: id,
      },
      include: {
        category: true,
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
        versions: {
          include: {
            createdBy: {
              select: {
                name: true,
              },
            },
            document: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
        },
      },
    })

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 })
    }

    return NextResponse.json(policy)
  } catch (error) {
    console.error("Error fetching policy:", error)
    return NextResponse.json({ error: "Failed to fetch policy" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest) => {
  // Extract ID from URL
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  try {
    const data = await request.json()
    const user = await getUser() // Get user from auth helper

    const policy = await prisma.policy.update({
      where: {
        id: id,
      },
      data: {
        ...data,
        updatedById: user?.id,
      },
    })

    return NextResponse.json(policy)
  } catch (error) {
    console.error("Error updating policy:", error)
    return NextResponse.json({ error: "Failed to update policy" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest) => {
  // Get id from the URL
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  try {
    // Soft delete by setting archived to true
    const policy = await prisma.policy.update({
      where: {
        id: id,
      },
      data: {
        archived: true,
      },
    })

    return NextResponse.json(policy)
  } catch (error) {
    console.error("Error deleting policy:", error)
    return NextResponse.json({ error: "Failed to delete policy" }, { status: 500 })
  }
}, "delete")