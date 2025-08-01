// app/actions/training-actions.ts
"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import * as XLSX from 'xlsx'

// Employee actions
export async function getEmployees(includeArchived = false) {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        archived: includeArchived ? undefined : false
      },
      orderBy: {
        firstName: 'asc'
      },
      include: {
        employeeSkills: {
          include: {
            skill: true
          }
        }
      }
    })
    
    return { success: true, data: employees }
  } catch (error) {
    console.error("Error fetching employees:", error)
    return { success: false, error: "Failed to fetch employees" }
  }
}

export async function getEmployee(id: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        employeeSkills: {
          include: {
            skill: true
          }
        },
        documents: {
          include: {
            uploadedBy: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      }
    })
    
    if (!employee) {
      return { success: false, error: "Employee not found" }
    }
    
    return { success: true, data: employee }
  } catch (error) {
    console.error("Error fetching employee:", error)
    return { success: false, error: "Failed to fetch employee" }
  }
}

export async function createEmployee(data: any) {
  try {
    const employee = await prisma.employee.create({
      data: {
        firstName: data.firstName,
        surname: data.surname,
        occupation: data.occupation,
        department: data.department,
        systemUserId: data.systemUserId === "none" ? null : data.systemUserId,
        profilePicture: data.profilePicture
      }
    })
    
    revalidatePath("/training")
    return { success: true, data: employee }
  } catch (error) {
    console.error("Error creating employee:", error)
    return { success: false, error: "Failed to create employee" }
  }
}

export async function updateEmployee(id: string, data: any) {
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName,
        surname: data.surname,
        occupation: data.occupation,
        department: data.department,
        systemUserId: data.systemUserId === "none" ? null : data.systemUserId,
        profilePicture: data.profilePicture
      }
    })
    
    revalidatePath("/training")
    revalidatePath(`/training/${id}`)
    return { success: true, data: employee }
  } catch (error) {
    console.error("Error updating employee:", error)
    return { success: false, error: "Failed to update employee" }
  }
}

export async function archiveEmployee(id: string) {
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: { archived: true }
    })
    
    revalidatePath("/training")
    return { success: true, data: employee }
  } catch (error) {
    console.error("Error archiving employee:", error)
    return { success: false, error: "Failed to archive employee" }
  }
}

export async function unarchiveEmployee(id: string) {
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: { archived: false }
    })
    
    revalidatePath("/training")
    return { success: true, data: employee }
  } catch (error) {
    console.error("Error unarchiving employee:", error)
    return { success: false, error: "Failed to unarchive employee" }
  }
}

export async function deleteEmployee(id: string) {
  try {
    await prisma.employee.delete({
      where: { id }
    })
    
    revalidatePath("/training")
    return { success: true }
  } catch (error) {
    console.error("Error deleting employee:", error)
    return { success: false, error: "Failed to delete employee" }
  }
}

// Skill actions
export async function getSkills() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    return { success: true, data: skills }
  } catch (error) {
    console.error("Error fetching skills:", error)
    return { success: false, error: "Failed to fetch skills" }
  }
}

export async function getSkill(id: string) {
  try {
    const skill = await prisma.skill.findUnique({
      where: { id }
    })
    
    if (!skill) {
      return { success: false, error: "Skill not found" }
    }
    
    return { success: true, data: skill }
  } catch (error) {
    console.error("Error fetching skill:", error)
    return { success: false, error: "Failed to fetch skill" }
  }
}

export async function createSkill(data: any) {
  try {
    // Convert departments from array of strings to proper format
    const departments = Array.isArray(data.departments) 
      ? data.departments 
      : (data.departments ? [data.departments] : [])
    
    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        description: data.description,
        frequencyDays: parseInt(data.frequencyDays) || 0,
        departments: departments,
        mandatory: data.mandatory === "Yes"
      }
    })
    
    revalidatePath("/training/skills")
    return { success: true, data: skill }
  } catch (error) {
    console.error("Error creating skill:", error)
    return { success: false, error: "Failed to create skill" }
  }
}

export async function updateSkill(id: string, data: any) {
  try {
    // Convert departments from array of strings to proper format
    const departments = Array.isArray(data.departments) 
      ? data.departments 
      : (data.departments ? [data.departments] : [])
    
    const skill = await prisma.skill.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        frequencyDays: parseInt(data.frequencyDays) || 0,
        departments: departments,
        mandatory: data.mandatory === "Yes"
      }
    })
    
    revalidatePath("/training/skills")
    return { success: true, data: skill }
  } catch (error) {
    console.error("Error updating skill:", error)
    return { success: false, error: "Failed to update skill" }
  }
}

export async function deleteSkill(id: string) {
  try {
    await prisma.skill.delete({
      where: { id }
    })
    
    revalidatePath("/training/skills")
    return { success: true }
  } catch (error) {
    console.error("Error deleting skill:", error)
    return { success: false, error: "Failed to delete skill" }
  }
}

// Employee Skill actions
export async function addEmployeeSkill(employeeId: string, skillId: string, dateCompleted: string, evidence?: File) {
  try {
    let evidenceUrl = undefined
    
    // Upload evidence file if provided
    if (evidence) {
      // Check file size (10MB limit)
      if (evidence.size > 10 * 1024 * 1024) {
        return { success: false, error: "File size must be less than 10MB" }
      }
      
      // Create a unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${evidence.name}`
      const uploadDir = join(process.cwd(), "public", "uploads")
      const filePath = join(uploadDir, filename)
      
      // Ensure the uploads directory exists
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (err) {
        // Directory exists already
      }
      
      // Save the file
      const bytes = await evidence.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
      
      evidenceUrl = `/uploads/${filename}`
    }
    
    const employeeSkill = await prisma.employeeSkill.create({
      data: {
        employeeId,
        skillId,
        dateCompleted: new Date(dateCompleted),
        evidence: evidenceUrl
      }
    })
    
    revalidatePath(`/training/${employeeId}`)
    return { success: true, data: employeeSkill }
  } catch (error) {
    console.error("Error adding employee skill:", error)
    return { success: false, error: "Failed to add employee skill" }
  }
}

export async function updateEmployeeSkill(id: string, dateCompleted: string, evidence?: string) {
  try {
    const employeeSkill = await prisma.employeeSkill.update({
      where: { id },
      data: {
        dateCompleted: new Date(dateCompleted),
        evidence
      }
    })
    
    const employee = await prisma.employee.findFirst({
      where: {
        employeeSkills: {
          some: {
            id
          }
        }
      }
    })
    
    if (employee) {
      revalidatePath(`/training/${employee.id}`)
    }
    
    return { success: true, data: employeeSkill }
  } catch (error) {
    console.error("Error updating employee skill:", error)
    return { success: false, error: "Failed to update employee skill" }
  }
}

export async function deleteEmployeeSkill(id: string) {
  try {
    const employeeSkill = await prisma.employeeSkill.findUnique({
      where: { id },
      select: { employeeId: true }
    })
    
    await prisma.employeeSkill.delete({
      where: { id }
    })
    
    if (employeeSkill) {
      revalidatePath(`/training/${employeeSkill.employeeId}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting employee skill:", error)
    return { success: false, error: "Failed to delete employee skill" }
  }
}

// Document actions
export async function uploadEmployeeDocument(employeeId: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }
    const file = formData.get("file") as File
    const title = formData.get("title") as string || (file ? file.name : "")
    if (!file) {
      return { success: false, error: "No file provided" }
    }
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 10MB" }
    }
    // Create a unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const uploadDir = join(process.cwd(), "public", "uploads")
    const filePath = join(uploadDir, filename)
    // Ensure the uploads directory exists
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // Directory exists already
    }
    // Save the file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    // Create document record
    const document = await prisma.employeeDocument.create({
      data: {
        employeeId,
        title: title || file.name,
        fileUrl: `/uploads/${filename}`,
        fileType: file.type,
        uploadedById: user.id as string
      }
    })
    revalidatePath(`/training/${employeeId}`)
    return { success: true, data: document }
  } catch (error) {
    console.error("Error uploading document:", error)
    return { success: false, error: "Failed to upload document" }
  }
}

export async function deleteEmployeeDocument(id: string) {
  try {
    const document = await prisma.employeeDocument.findUnique({
      where: { id },
      select: { employeeId: true }
    })
    
    await prisma.employeeDocument.delete({
      where: { id }
    })
    
    if (document) {
      revalidatePath(`/training/${document.employeeId}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting document:", error)
    return { success: false, error: "Failed to delete document" }
  }
}

// Training Matrix Export
export async function generateTrainingMatrix() {
  try {
    // Get all employees and skills
    const employees = await prisma.employee.findMany({
      where: { archived: false },
      orderBy: { firstName: 'asc' },
      include: {
        employeeSkills: {
          include: {
            skill: true
          }
        }
      }
    })
    
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' }
    })
    
    // Create matrix data
    const matrixData = employees.map(employee => {
      const row: any = {
        Employee: `${employee.firstName} ${employee.surname}`
      }
      
      // Add skill columns
      skills.forEach(skill => {
        const employeeSkill = employee.employeeSkills.find(es => es.skillId === skill.id)
        if (employeeSkill) {
          row[skill.name] = new Date(employeeSkill.dateCompleted).toLocaleDateString()
        } else {
          row[skill.name] = "Not completed"
        }
      })
      
      return row
    })
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(matrixData)
    
    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Training Matrix")
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    
    return { 
      success: true, 
      data: {
        buffer: excelBuffer,
        filename: `Training_Matrix_${new Date().toISOString().split('T')[0]}.xlsx`
      }
    }
  } catch (error) {
    console.error("Error generating training matrix:", error)
    return { success: false, error: "Failed to generate training matrix" }
  }
}