// "use server"

// import prisma from "@/lib/prisma"
// import { revalidatePath } from "next/cache"
// import { getUser } from "@/lib/auth"

// interface ReviewData {
//   reviewerName: string
//   reviewDate: Date
//   nextReviewDate?: Date
//   details: string
// }

// export async function addCOSHHReview(coshhId: string, data: ReviewData) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       return { success: false, error: "Unauthorized" }
//     }

//     const review = await prisma.COSHHReview.create({
//       data: {
//         coshhId,
//         reviewerName: data.reviewerName,
//         reviewDate: data.reviewDate,
//         nextReviewDate: data.nextReviewDate,
//         details: data.details,
//         reviewedById: user.id,
//       },
//     })

//     return { success: true, data: review }
//   } catch (error) {
//     console.error("Error adding COSHH review:", error)
//     return { success: false, error: "Failed to add review" }
//   }
// }

// export async function getCOSHHReviews(coshhId: string) {
//   try {
//     const reviews = await prisma.COSHHReview.findMany({
//       where: { coshhId },
//       orderBy: { reviewDate: "desc" },
//       include: {
//         reviewedBy: {
//           select: {
//             name: true,
//           },
//         },
//       },
//     })

//     return { success: true, data: reviews }
//   } catch (error) {
//     console.error("Error fetching COSHH reviews:", error)
//     return { success: false, error: "Failed to fetch reviews" }
//   }
// }

// export async function deleteCOSHHReview(reviewId: string) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       return { success: false, error: "Unauthorized" }
//     }

//     await prisma.COSHHReview.delete({
//       where: { id: reviewId },
//     })

//     return { success: true }
//   } catch (error) {
//     console.error("Error deleting COSHH review:", error)
//     return { success: false, error: "Failed to delete review" }
//   }
// }

// export async function archiveCOSHH(coshhId: string) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       return { success: false, error: "Unauthorized" }
//     }

//     await prisma.cOSHH.update({
//       where: { id: coshhId },
//       data: {
//         archived: true,
//         updatedById: user.id,
//       },
//     })

//     return { success: true }
//   } catch (error) {
//     console.error("Error archiving COSHH:", error)
//     return { success: false, error: "Failed to archive COSHH" }
//   }
// }

// export async function unarchiveCOSHH(coshhId: string) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       return { success: false, error: "Unauthorized" }
//     }

//     await prisma.cOSHH.update({
//       where: { id: coshhId },
//       data: {
//         archived: false,
//         updatedById: user.id,
//       },
//     })

//     return { success: true }
//   } catch (error) {
//     console.error("Error unarchiving COSHH:", error)
//     return { success: false, error: "Failed to unarchive COSHH" }
//   }
// }

// export async function deleteCOSHH(coshhId: string) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       return { success: false, error: "Unauthorized" }
//     }

//     await prisma.cOSHH.delete({
//       where: { id: coshhId },
//     })

//     return { success: true }
//   } catch (error) {
//     console.error("Error deleting COSHH:", error)
//     return { success: false, error: "Failed to delete COSHH" }
//   }
// }

// export async function addCOSHHVersion(coshhId: string, formData: FormData) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       throw new Error("Unauthorized")
//     }

//     const version = formData.get("version") as string
//     const reviewDate = formData.get("reviewDate") as string
//     const notes = formData.get("notes") as string
//     const documentId = formData.get("documentId") as string | undefined

//     const coshhVersion = await prisma.cOSHHVersion.create({
//       data: {
//         version,
//         reviewDate: new Date(reviewDate),
//         notes,
//         coshhId,
//         documentId,
//         createdById: user.id as string,
//       },
//     })

//     revalidatePath(`/coshh/${coshhId}`)
//     return { success: true, coshhVersion }
//   } catch (error) {
//     console.error("Error adding COSHH version:", error)
//     return { success: false, error: "Failed to add version" }
//   }
// }

// export async function toggleHighlight(id: string, type: "category" | "coshh") {
//   try {
//     const user = await getUser()
//     if (!user) {
//       throw new Error("Unauthorized")
//     }

//     if (type === "category") {
//       const category = await prisma.cOSHHCategory.findUnique({
//         where: { id },
//         select: { highlighted: true },
//       })

//       await prisma.cOSHHCategory.update({
//         where: { id },
//         data: { highlighted: !category?.highlighted },
//       })
//     } else {
//       const coshh = await prisma.cOSHH.findUnique({
//         where: { id },
//         select: { highlighted: true },
//       })

//       await prisma.cOSHH.update({
//         where: { id },
//         data: {
//           highlighted: !coshh?.highlighted,
//           updatedById: user.id as string,
//         },
//       })
//     }

//     revalidatePath("/coshh")
//     return { success: true }
//   } catch (error) {
//     console.error("Error toggling highlight:", error)
//     return { success: false, error: "Failed to toggle highlight" }
//   }
// }

// export async function archiveItem(id: string, type: "category" | "coshh") {
//   try {
//     const user = await getUser()
//     if (!user) {
//       throw new Error("Unauthorized")
//     }

//     if (type === "category") {
//       await prisma.cOSHHCategory.update({
//         where: { id },
//         data: { archived: true },
//       })

//       await prisma.cOSHH.updateMany({
//         where: { categoryId: id },
//         data: {
//           archived: true,
//           updatedById: user.id as string,
//         },
//       })
//     } else {
//       await prisma.cOSHH.update({
//         where: { id },
//         data: {
//           archived: true,
//           updatedById: user.id as string,
//         },
//       })
//     }

//     revalidatePath("/coshh")
//     return { success: true }
//   } catch (error) {
//     console.error("Error archiving item:", error)
//     return { success: false, error: "Failed to archive item" }
//   }
// }

// export async function unarchiveItem(id: string, type: "category" | "coshh") {
//   try {
//     const user = await getUser()
//     if (!user) {
//       throw new Error("Unauthorized")
//     }

//     if (type === "category") {
//       await prisma.cOSHHCategory.update({
//         where: { id },
//         data: { archived: false },
//       })

//       await prisma.cOSHH.updateMany({
//         where: { categoryId: id },
//         data: {
//           archived: false,
//           updatedById: user.id as string,
//         },
//       })
//     } else {
//       await prisma.cOSHH.update({
//         where: { id },
//         data: {
//           archived: false,
//           updatedById: user.id as string,
//         },
//       })
//     }

//     revalidatePath("/coshh")
//     return { success: true }
//   } catch (error) {
//     console.error("Error unarchiving item:", error)
//     return { success: false, error: "Failed to unarchive item" }
//   }
// }

// export async function deleteItem(id: string, type: "category" | "coshh") {
//   try {
//     const user = await getUser()
//     if (!user) {
//       throw new Error("Unauthorized")
//     }

//     if (type === "coshh") {
//       await prisma.cOSHHVersion.deleteMany({
//         where: { coshhId: id },
//       })
      
//       await prisma.cOSHH.delete({
//         where: { id },
//       })
//     } else {
//       const coshhs = await prisma.cOSHH.findMany({
//         where: { categoryId: id },
//         select: { id: true },
//       })
      
//       await prisma.cOSHHVersion.deleteMany({
//         where: { coshhId: { in: coshhs.map(coshh => coshh.id) } },
//       })
      
//       await prisma.cOSHH.deleteMany({
//         where: { categoryId: id },
//       })

//       await prisma.cOSHHCategory.delete({
//         where: { id },
//       })
//     }

//     revalidatePath("/coshh")
//     return { success: true }
//   } catch (error) {
//     console.error("Error deleting item:", error)
//     return { success: false, error: "Failed to delete item" }
//   }
// }

// export async function reorderItem(id: string, type: "category" | "coshh", direction: "up" | "down") {
//   try {
//     const user = await getUser()
//     if (!user) {
//       throw new Error("Unauthorized")
//     }

//     if (type === "coshh") {
//       const coshh = await prisma.cOSHH.findUnique({
//         where: { id },
//         select: { order: true, categoryId: true },
//       })

//       if (!coshh) {
//         throw new Error("COSHH not found")
//       }

//       const currentOrder = coshh.order
//       const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

//       const coshhAtNewOrder = await prisma.cOSHH.findFirst({
//         where: {
//           categoryId: coshh.categoryId,
//           order: newOrder,
//           archived: false,
//         },
//       })

//       if (coshhAtNewOrder) {
//         await prisma.cOSHH.update({
//           where: { id: coshhAtNewOrder.id },
//           data: { order: currentOrder },
//         })

//         await prisma.cOSHH.update({
//           where: { id },
//           data: {
//             order: newOrder,
//             updatedById: user.id as string,
//           },
//         })
//       }
//     } else {
//       const category = await prisma.cOSHHCategory.findUnique({
//         where: { id },
//         select: { order: true },
//       })

//       if (!category) {
//         throw new Error("Category not found")
//       }

//       const currentOrder = category.order
//       const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

//       const categoryAtNewOrder = await prisma.cOSHHCategory.findFirst({
//         where: {
//           order: newOrder,
//           archived: false,
//         },
//       })

//       if (categoryAtNewOrder) {
//         await prisma.cOSHHCategory.update({
//           where: { id: categoryAtNewOrder.id },
//           data: { order: currentOrder },
//         })

//         await prisma.cOSHHCategory.update({
//           where: { id },
//           data: { order: newOrder },
//         })
//       }
//     }

//     revalidatePath("/coshh")
//     return { success: true }
//   } catch (error) {
//     console.error("Error reordering item:", error)
//     return { success: false, error: "Failed to reorder item" }
//   }
// }

// export async function addCOSHH(data: {
//   title: string
//   version: string
//   reviewDate: string
//   nextReviewDate?: string
//   department: string
//   content?: string
//   categoryId: string
// }) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       throw new Error("Unauthorized")
//     }

//     const highestOrderCOSHH = await prisma.cOSHH.findFirst({
//       where: { categoryId: data.categoryId },
//       orderBy: { order: "desc" },
//       select: { order: true },
//     })

//     const newOrder = highestOrderCOSHH ? highestOrderCOSHH.order + 1 : 1

//     const coshh = await prisma.cOSHH.create({
//       data: {
//         title: data.title,
//         version: data.version,
//         reviewDate: new Date(data.reviewDate),
//         nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
//         department: data.department,
//         content: data.content,
//         categoryId: data.categoryId,
//         createdById: user.id as string,
//         order: newOrder,
//       },
//     })

//     revalidatePath("/coshh")
//     return { success: true, coshh }
//   } catch (error) {
//     console.error("Error adding COSHH:", error)
//     return { success: false, error: "Failed to add COSHH" }
//   }
// }

// export async function addCategory(title: string) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       throw new Error("Unauthorized")
//     }

//     const highestOrderCategory = await prisma.cOSHHCategory.findFirst({
//       orderBy: { order: "desc" },
//       select: { order: true },
//     })

//     const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 1

//     const category = await prisma.cOSHHCategory.create({
//       data: {
//         title,
//         order: newOrder,
//       },
//     })

//     revalidatePath("/coshh")
//     return { success: true, category }
//   } catch (error) {
//     console.error("Error adding category:", error)
//     return { success: false, error: "Failed to add category" }
//   }
// }

// export async function editCategory(id: string, title: string) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       throw new Error("Unauthorized")
//     }

//     const category = await prisma.cOSHHCategory.update({
//       where: { id },
//       data: {
//         title,
//         updatedById: user.id as string,
//       },
//     })

//     revalidatePath("/coshh")
//     return { success: true, category }
//   } catch (error) {
//     console.error("Error editing category:", error)
//     return { success: false, error: "Failed to edit category" }
//   }
// }

// export async function approveCOSHH(id: string) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       throw new Error("Unauthorized")
//     }

//     const coshh = await prisma.cOSHH.update({
//       where: { id },
//       data: {
//         approved: true,
//         updatedById: user.id as string,
//       },
//     })

//     revalidatePath("/coshh")
//     return { success: true, coshh }
//   } catch (error) {
//     console.error("Error approving COSHH:", error)
//     return { success: false, error: "Failed to approve COSHH" }
//   }
// }


"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Toggle highlight status
export async function toggleHighlight(id: string, type: "coshh" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "coshh") {
      const coshh = await prisma.cOSHH.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.cOSHH.update({
        where: { id },
        data: {
          highlighted: !coshh?.highlighted,
          updatedById: user.id as string,
        },
      })
    } else {
      const category = await prisma.cOSHHCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.cOSHHCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/coshh")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Approve COSHH
export async function approveCOSHH(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.cOSHH.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/coshh")
    return { success: true }
  } catch (error) {
    console.error("Error approving COSHH:", error)
    return { success: false, error: "Failed to approve COSHH" }
  }
}

// Disapprove COSHH
export async function disapproveCOSHH(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.cOSHH.update({
      where: { id },
      data: {
        approved: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/coshh")
    return { success: true }
  } catch (error) {
    console.error("Error disapproving COSHH:", error)
    return { success: false, error: "Failed to disapprove COSHH" }
  }
}

// Archive COSHH or category
export async function archiveItem(id: string, type: "coshh" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "coshh") {
      await prisma.cOSHH.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we archive the category and all its COSHHs
      await prisma.cOSHHCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.cOSHH.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/coshh")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive COSHH or category
export async function unarchiveItem(id: string, type: "coshh" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "coshh") {
      await prisma.cOSHH.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we unarchive the category and all its COSHHs
      await prisma.cOSHHCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.cOSHH.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/coshh")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete COSHH or category
export async function deleteItem(id: string, type: "coshh" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "coshh") {
      // First delete all COSHH versions
      await prisma.cOSHHVersion.deleteMany({
        where: { coshhId: id },
      })

      // Delete all reviews
      await prisma.cOSHHReview.deleteMany({
        where: { coshhId: id },
      })

      // Then delete the COSHH
      await prisma.cOSHH.delete({
        where: { id },
      })
    } else {
      // For categories, first get all COSHHs in this category
      const coshhs = await prisma.cOSHH.findMany({
        where: { categoryId: id },
        select: { id: true },
      })

      // Delete all versions for all COSHHs in this category
      await prisma.cOSHHVersion.deleteMany({
        where: { coshhId: { in: coshhs.map((c) => c.id) } },
      })

      // Delete all reviews for all COSHHs in this category
      await prisma.cOSHHReview.deleteMany({
        where: { coshhId: { in: coshhs.map((c) => c.id) } },
      })

      // Then delete all COSHHs
      await prisma.cOSHH.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.cOSHHCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/coshh")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder COSHHs within a category (for drag and drop)
export async function reorderCOSHHs(categoryId: string, coshhIds: string[]) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Update the order of each COSHH
    const updatePromises = coshhIds.map((id, index) =>
      prisma.cOSHH.update({
        where: { id },
        data: {
          order: index,
          updatedById: user.id as string,
        },
      }),
    )

    await Promise.all(updatePromises)

    revalidatePath("/coshh")
    return { success: true }
  } catch (error) {
    console.error("Error reordering COSHHs:", error)
    return { success: false, error: "Failed to reorder COSHHs" }
  }
}

// Add COSHH
export async function addCOSHH(data: {
  title: string
  version: string
  reviewDate: string
  nextReviewDate?: string
  department: string
  content?: string
  categoryId: string
}) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order in this category
    const highestOrderCOSHH = await prisma.cOSHH.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCOSHH ? highestOrderCOSHH.order + 1 : 0

    const coshh = await prisma.cOSHH.create({
      data: {
        title: data.title,
        version: data.version,
        reviewDate: new Date(data.reviewDate),
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
        department: data.department,
        content: data.content,
        categoryId: data.categoryId,
        createdById: user.id as string,
        order: newOrder,
      },
    })

    revalidatePath("/coshh")
    return { success: true, coshh }
  } catch (error) {
    console.error("Error adding COSHH:", error)
    return { success: false, error: "Failed to add COSHH" }
  }
}

// Add category
export async function addCategory(title: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order
    const highestOrderCategory = await prisma.cOSHHCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 0

    const category = await prisma.cOSHHCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/coshh")
    return { success: true, category }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit COSHH
export async function editCOSHH(
  id: string,
  data: {
    title?: string
    version?: string
    reviewDate?: Date
    nextReviewDate?: Date
    department?: string
  },
) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const coshh = await prisma.cOSHH.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/coshh")
    return { success: true, coshh }
  } catch (error) {
    console.error("Error editing COSHH:", error)
    return { success: false, error: "Failed to edit COSHH" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    const category = await prisma.cOSHHCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/coshh")
    return { success: true, category }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

// Add COSHH review
export async function addCOSHHReview(
  coshhId: string,
  data: {
    details: string
    reviewDate: Date
    nextReviewDate?: Date
    reviewerName: string
  },
) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const review = await prisma.cOSHHReview.create({
      data: {
        coshhId,
        reviewedById: user.id,
        reviewerName: data.reviewerName,
        details: data.details,
        reviewDate: data.reviewDate,
        nextReviewDate: data.nextReviewDate,
      },
      include: {
        reviewedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    revalidatePath(`/coshh/${coshhId}`)
    return { success: true, data: review }
  } catch (error) {
    console.error("Error adding COSHH review:", error)
    return { success: false, error: "Failed to add COSHH review" }
  }
}

// Delete COSHH review
export async function deleteCOSHHReview(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.cOSHHReview.delete({
      where: { id },
    })

    revalidatePath("/coshh")
    return { success: true }
  } catch (error) {
    console.error("Error deleting COSHH review:", error)
    return { success: false, error: "Failed to delete COSHH review" }
  }
}

// Get COSHH reviews
export async function getCOSHHReviews(coshhId: string) {
  try {
    const reviews = await prisma.cOSHHReview.findMany({
      where: { coshhId },
      orderBy: { reviewDate: "desc" },
      include: {
        reviewedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return { success: true, data: reviews }
  } catch (error) {
    console.error("Error fetching COSHH reviews:", error)
    return { success: false, error: "Failed to fetch COSHH reviews" }
  }
}

