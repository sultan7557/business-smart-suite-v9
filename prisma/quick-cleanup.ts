import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function quickCleanup() {
  console.log('🧹 Starting quick cleanup of seeded data...')

  try {
    let deletedCount = 0

    // 1. Remove seeded improvement registers (we know this works)
    const deletedImprovementRegisters = await prisma.improvementRegister.deleteMany({
      where: {
        OR: [
          {
            type: {
              contains: 'Sample',
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: 'Sample',
              mode: 'insensitive'
            }
          }
        ]
      }
    })
    deletedCount += deletedImprovementRegisters.count
    console.log(`📈 Deleted ${deletedImprovementRegisters.count} sample improvement registers`)

    // 2. Remove seeded employees
    const deletedEmployees = await prisma.employee.deleteMany({
      where: {
        OR: [
          {
            firstName: {
              contains: 'Sample',
              mode: 'insensitive'
            }
          },
          {
            surname: {
              contains: 'Sample',
              mode: 'insensitive'
            }
          }
        ]
      }
    })
    deletedCount += deletedEmployees.count
    console.log(`👤 Deleted ${deletedEmployees.count} sample employees`)

    // 3. Remove seeded suppliers
    const deletedSuppliers = await prisma.supplier.deleteMany({
      where: {
        name: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedSuppliers.count
    console.log(`🏢 Deleted ${deletedSuppliers.count} sample suppliers`)

    // 4. Remove seeded documents
    const deletedDocuments = await prisma.document.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedDocuments.count
    console.log(`📄 Deleted ${deletedDocuments.count} sample documents`)

    // 5. Remove seeded policies
    const deletedPolicies = await prisma.policy.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedPolicies.count
    console.log(`📋 Deleted ${deletedPolicies.count} sample policies`)

    // 6. Remove seeded procedures
    const deletedProcedures = await prisma.procedure.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedProcedures.count
    console.log(`📝 Deleted ${deletedProcedures.count} sample procedures`)

    // 7. Remove seeded forms
    const deletedForms = await prisma.form.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedForms.count
    console.log(`📊 Deleted ${deletedForms.count} sample forms`)

    // 8. Remove seeded certificates
    const deletedCertificates = await prisma.certificate.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedCertificates.count
    console.log(`🏆 Deleted ${deletedCertificates.count} sample certificates`)

    // 9. Remove seeded manuals
    const deletedManuals = await prisma.manual.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedManuals.count
    console.log(`📚 Deleted ${deletedManuals.count} sample manuals`)

    // 10. Remove seeded job descriptions
    const deletedJobDescriptions = await prisma.jobDescription.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedJobDescriptions.count
    console.log(`💼 Deleted ${deletedJobDescriptions.count} sample job descriptions`)

    // 11. Remove seeded work instructions
    const deletedWorkInstructions = await prisma.workInstruction.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedWorkInstructions.count
    console.log(`🔧 Deleted ${deletedWorkInstructions.count} sample work instructions`)

    // 12. Remove seeded COSHH assessments
    const deletedCOSHH = await prisma.cOSHH.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedCOSHH.count
    console.log(`🧪 Deleted ${deletedCOSHH.count} sample COSHH assessments`)

    // 13. Remove seeded risk assessments
    const deletedRiskAssessments = await prisma.riskAssessment.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedRiskAssessments.count
    console.log(`⚠️ Deleted ${deletedRiskAssessments.count} sample risk assessments`)

    // 14. Remove seeded registers
    const deletedRegisters = await prisma.register.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedRegisters.count
    console.log(`📋 Deleted ${deletedRegisters.count} sample registers`)

    // 15. Remove seeded audits
    const deletedAudits = await prisma.audit.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedAudits.count
    console.log(`🔍 Deleted ${deletedAudits.count} sample audits`)

    // 16. Remove seeded business continuity plans
    const deletedBusinessContinuity = await prisma.businessContinuity.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedBusinessContinuity.count
    console.log(`🔄 Deleted ${deletedBusinessContinuity.count} sample business continuity plans`)

    // 17. Remove seeded management reviews
    const deletedManagementReviews = await prisma.managementReview.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedManagementReviews.count
    console.log(`📊 Deleted ${deletedManagementReviews.count} sample management reviews`)

    // 18. Remove seeded technical files
    const deletedTechnicalFiles = await prisma.technicalFile.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedTechnicalFiles.count
    console.log(`🔧 Deleted ${deletedTechnicalFiles.count} sample technical files`)

    // 19. Remove seeded custom sections
    const deletedCustomSections = await prisma.customSection.deleteMany({
      where: {
        title: {
          contains: 'Sample',
          mode: 'insensitive'
        }
      }
    })
    deletedCount += deletedCustomSections.count
    console.log(`📁 Deleted ${deletedCustomSections.count} sample custom sections`)

    console.log(`\n✅ Quick cleanup completed! Deleted ${deletedCount} total seeded items`)
    console.log('🔒 Admin users and important system data have been preserved')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
quickCleanup()
  .then(() => {
    console.log('🎉 Quick cleanup script finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Quick cleanup script failed:', error)
    process.exit(1)
  }) 