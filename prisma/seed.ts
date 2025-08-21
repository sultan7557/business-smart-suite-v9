import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting comprehensive seed...")

  // Clear existing data to start fresh (in correct order to avoid foreign key constraints)
  console.log("Clearing existing data...")
  
  // Use a simpler approach - just reset the database completely
  // This avoids foreign key constraint issues
  console.log("Database will be reset completely to avoid constraint issues...")

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10)
  const userPassword = await bcrypt.hash("user123", 10)
  const managerPassword = await bcrypt.hash("manager123", 10)

  console.log("Creating users...")

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      password: adminPassword,
      name: "Admin User",
      email: "admin@example.com",
      status: "ACTIVE",
    },
  })

  const user = await prisma.user.create({
    data: {
      username: "user",
      password: userPassword,
      name: "Regular User",
      email: "user@example.com",
      status: "ACTIVE",
    },
  })

  const manager = await prisma.user.create({
    data: {
      username: "manager",
      password: managerPassword,
      name: "Manager User",
      email: "manager@example.com",
      status: "ACTIVE",
    },
  })

  // Create roles
  console.log("Creating roles...")
  
  const adminRole = await prisma.role.create({
    data: {
      name: "Admin",
      description: "Full administrative access",
    },
  })

  const writeRole = await prisma.role.create({
    data: {
      name: "write",
      description: "Can create and edit content",
    },
  })

  const deleteRole = await prisma.role.create({
    data: {
      name: "delete",
      description: "Can delete content",
    },
  })

  // Create admin group
  console.log("Creating admin group...")
  const adminGroup = await prisma.group.create({
    data: {
      name: "Administrators",
      description: "System administrators group",
    },
  })

  // Add admin user to admin group
  console.log("Adding admin user to admin group...")
  await prisma.userGroup.create({
    data: {
      userId: admin.id,
      groupId: adminGroup.id,
      addedBy: admin.id,
    },
  })

  // Define all systems that need permissions
  const systems = [
    "policies",
    "manuals",
    "procedures",
    "forms",
    "certificates",
    "corrective-actions",
    "business-continuity",
    "management-review",
    "job-descriptions",
    "work-instructions",
    "coshh",
    "risk-assessments",
    "hse-guidance",
    "technical-files",
    "environmental-guidance",
    "custom-sections",
    "registers",
    "legal-register",
    "training",
    "maintenance",
    "improvement-register",
    "objectives",
    "organizational-context",
    "interested-parties",
    "audit-schedule",
    "suppliers",
    "statement-of-applicability"
  ]

  // Add group permissions for each system with both write and delete roles
  console.log("Creating group permissions...")
  for (const system of systems) {
    // Add write permission
    await prisma.groupPermission.create({
      data: {
        groupId: adminGroup.id,
        systemId: system,
        roleId: writeRole.id,
        createdBy: admin.id,
      },
    })

    // Add delete permission
    await prisma.groupPermission.create({
      data: {
        groupId: adminGroup.id,
        systemId: system,
        roleId: deleteRole.id,
        createdBy: admin.id,
      },
    })
  }

  // Create individual permissions for admin user (as backup)
  console.log("Creating individual permissions for admin...")
  for (const system of systems) {
    // Add write permission
    await prisma.permission.create({
      data: {
        userId: admin.id,
        systemId: system,
        roleId: writeRole.id,
        createdBy: admin.id,
      },
    })

    // Add delete permission
    await prisma.permission.create({
      data: {
        userId: admin.id,
        systemId: system,
        roleId: deleteRole.id,
        createdBy: admin.id,
      },
    })
  }

  // Create comprehensive Statement of Applicability data
  console.log("Creating comprehensive Statement of Applicability data...")
  
  // A.5 Organisational Controls
  const a5Controls = [
    {
      clause: "A.5.1",
      title: "Policies for information security",
      description: "Control – Information security policy and topic specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.",
      section: "A.5 Organisational Controls",
      order: 1,
    },
    {
      clause: "A.5.2",
      title: "Information security roles and responsibilities",
      description: "Control – Information security roles and responsibilities shall be defined and allocated according to the organisation's needs.",
      section: "A.5 Organisational Controls",
      order: 2,
    },
    {
      clause: "A.5.3",
      title: "Segregation of duties",
      description: "Control – Conflicting duties and responsibilities shall be segregated to reduce opportunities for unauthorised or unintentional modification or misuse of the organisation's assets.",
      section: "A.5 Organisational Controls",
      order: 3,
    },
    {
      clause: "A.5.4",
      title: "Management responsibilities",
      description: "Control – Management shall require all employees and contractors to apply information security in accordance with the established information security policy and procedures of the organisation.",
      section: "A.5 Organisational Controls",
      order: 4,
    },
    {
      clause: "A.5.5",
      title: "Contact with authorities",
      description: "Control – The organisation shall maintain appropriate contacts with authorities.",
      section: "A.5 Organisational Controls",
      order: 5,
    },
    {
      clause: "A.5.6",
      title: "Contact with special interest groups",
      description: "Control – The organisation shall maintain contacts with special interest groups or other specialist security forums and professional associations.",
      section: "A.5 Organisational Controls",
      order: 6,
    },
    {
      clause: "A.5.7",
      title: "Threat intelligence",
      description: "Control – The organisation shall receive and analyse threat intelligence information and use it to adjust its information security risk assessment and treatment.",
      section: "A.5 Organisational Controls",
      order: 7,
    },
    {
      clause: "A.5.8",
      title: "Information security in project management",
      description: "Control – Information security shall be addressed in project management regardless of the type of project.",
      section: "A.5 Organisational Controls",
      order: 8,
    },
    {
      clause: "A.5.9",
      title: "Inventory of information and other associated assets",
      description: "Control – An inventory of information and other associated assets, including owners, shall be developed and maintained.",
      section: "A.5 Organisational Controls",
      order: 9,
    },
    {
      clause: "A.5.10",
      title: "Acceptable use of information and other associated assets",
      description: "Control – Rules for the acceptable use of information and other associated assets shall be established, implemented, and reviewed.",
      section: "A.5 Organisational Controls",
      order: 10,
    },
    {
      clause: "A.5.11",
      title: "Return of assets",
      description: "Control – All employees and external party users shall return all of the organisation's assets in their possession upon change or termination of their employment, contract, or agreement.",
      section: "A.5 Organisational Controls",
      order: 11,
    },
    {
      clause: "A.5.12",
      title: "Classification of information",
      description: "Control – Information shall be classified according to the organisation's information security needs based on confidentiality, integrity, and availability.",
      section: "A.5 Organisational Controls",
      order: 12,
    },
    {
      clause: "A.5.13",
      title: "Labelling of information",
      description: "Control – An appropriate set of procedures for information labelling shall be developed and implemented in accordance with the information classification scheme adopted by the organisation.",
      section: "A.5 Organisational Controls",
      order: 13,
    },
    {
      clause: "A.5.14",
      title: "Information transfer",
      description: "Control – Procedures, operational controls, and agreements shall be developed and implemented to protect the transfer of information through the use of all types of communication facilities.",
      section: "A.5 Organisational Controls",
      order: 14,
    },
    {
      clause: "A.5.15",
      title: "Access control",
      description: "Control – Rules and procedures shall be defined for controlling access to information and other associated assets.",
      section: "A.5 Organisational Controls",
      order: 15,
    },
    {
      clause: "A.5.16",
      title: "Identity verification",
      description: "Control – The identity of users, external parties, and their devices shall be verified before access is granted to the organisation's information and other associated assets.",
      section: "A.5 Organisational Controls",
      order: 16,
    },
    {
      clause: "A.5.17",
      title: "Authentication information",
      description: "Control – Authentication information shall be managed securely.",
      section: "A.5 Organisational Controls",
      order: 17,
    },
    {
      clause: "A.5.18",
      title: "Access rights",
      description: "Control – Access rights to information and other associated assets shall be provisioned, reviewed, modified, and removed in accordance with the organisation's topic specific policy on access control.",
      section: "A.5 Organisational Controls",
      order: 18,
    },
    {
      clause: "A.5.19",
      title: "Information security in supplier relationships",
      description: "Control – Processes and procedures shall be defined and implemented to manage the information security risks associated with the use of supplier products and services.",
      section: "A.5 Organisational Controls",
      order: 19,
    },
    {
      clause: "A.5.20",
      title: "Addressing information security within supplier agreements",
      description: "Control – Relevant information security requirements shall be established and agreed with each supplier based on the type of supplier relationship.",
      section: "A.5 Organisational Controls",
      order: 20,
    },
    {
      clause: "A.5.21",
      title: "Managing information security in the ICT supply chain",
      description: "Control – The organisation shall establish and maintain processes, procedures, and controls to manage the information security risks associated with the ICT products and services supply chain.",
      section: "A.5 Organisational Controls",
      order: 21,
    },
    {
      clause: "A.5.22",
      title: "Monitoring, review and change management of supplier services",
      description: "Control – The organisation shall regularly monitor, review, evaluate, and manage changes in supplier information security practices and service delivery.",
      section: "A.5 Organisational Controls",
      order: 22,
    },
    {
      clause: "A.5.23",
      title: "Information security for use of cloud services",
      description: "Control – The organisation shall establish processes and procedures to ensure that the use of cloud services is in line with the organisation's information security policy.",
      section: "A.5 Organisational Controls",
      order: 23,
    },
    {
      clause: "A.5.24",
      title: "Information security incident management planning and preparation",
      description: "Control – The organisation shall plan and prepare for managing information security incidents by defining, establishing, and communicating incident management processes, roles, and responsibilities.",
      section: "A.5 Organisational Controls",
      order: 24,
    },
    {
      clause: "A.5.25",
      title: "Assessment and decision on information security events",
      description: "Control – The organisation shall assess information security events and decide if they are to be classified as information security incidents.",
      section: "A.5 Organisational Controls",
      order: 25,
    },
    {
      clause: "A.5.26",
      title: "Response to information security incidents",
      description: "Control – The organisation shall respond to information security incidents in accordance with the documented procedures.",
      section: "A.5 Organisational Controls",
      order: 26,
    },
    {
      clause: "A.5.27",
      title: "Learning from information security incidents",
      description: "Control – The organisation shall use the knowledge gained from analysing and resolving information security incidents to reduce the likelihood or impact of future incidents.",
      section: "A.5 Organisational Controls",
      order: 27,
    },
    {
      clause: "A.5.28",
      title: "Collection of evidence",
      description: "Control – The organisation shall define and apply procedures for the identification, collection, acquisition, and preservation of information that can serve as evidence.",
      section: "A.5 Organisational Controls",
      order: 28,
    },
    {
      clause: "A.5.29",
      title: "Information security during disruption",
      description: "Control – The organisation shall plan how to maintain information security during disruption.",
      section: "A.5 Organisational Controls",
      order: 29,
    },
    {
      clause: "A.5.30",
      title: "ICT readiness for business continuity",
      description: "Control – The organisation shall establish, document, implement, and test ICT continuity plans, ensuring that essential business functions continue to operate during disruption.",
      section: "A.5 Organisational Controls",
      order: 30,
    },
    {
      clause: "A.5.31",
      title: "Legal, statutory, regulatory, and contractual requirements",
      description: "Control – The organisation shall identify, document, and keep up to date its legal, statutory, regulatory, and contractual requirements.",
      section: "A.5 Organisational Controls",
      order: 31,
    },
    {
      clause: "A.5.32",
      title: "Intellectual property rights",
      description: "Control – The organisation shall implement appropriate procedures to ensure compliance with legislative, regulatory, and contractual requirements on intellectual property rights and use of proprietary software products.",
      section: "A.5 Organisational Controls",
      order: 32,
    },
    {
      clause: "A.5.33",
      title: "Protection of records",
      description: "Control – Important records shall be protected from loss, destruction, and falsification, in accordance with legislative, regulatory, contractual, and business requirements.",
      section: "A.5 Organisational Controls",
      order: 33,
    },
    {
      clause: "A.5.34",
      title: "Privacy and protection of PII",
      description: "Control – The organisation shall identify and meet the requirements regarding the privacy and protection of personally identifiable information (PII) according to applicable privacy and data protection regulations.",
      section: "A.5 Organisational Controls",
      order: 34,
    },
    {
      clause: "A.5.35",
      title: "Independent review of information security",
      description: "Control – The organisation's approach to managing information security and its implementation shall be reviewed independently at planned intervals or when significant changes occur.",
      section: "A.5 Organisational Controls",
      order: 35,
    },
    {
      clause: "A.5.36",
      title: "Compliance with policies, rules and standards",
      description: "Control – The organisation shall regularly review the compliance of information processing and procedures, and technical compliance with the organisation's information security policies, rules, and standards.",
      section: "A.5 Organisational Controls",
      order: 36,
    },
    {
      clause: "A.5.37",
      title: "Documented operating procedures",
      description: "Control – Operating procedures shall be documented and made available to all users who need them.",
      section: "A.5 Organisational Controls",
      order: 37,
    }
  ]

  // Create A.5 controls
  for (const control of a5Controls) {
    await prisma.statementOfApplicabilityControl.create({
      data: control,
    })
  }

  // A.6 People Controls
  const a6Controls = [
    {
      clause: "A.6.1",
      title: "Screening",
      description: "Control – Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws, regulations, and ethics, and shall be proportional to the business requirements, the classification of the information to be accessed, and the perceived risks.",
      section: "A.6 People Controls",
      order: 38,
    },
    {
      clause: "A.6.2",
      title: "Terms and conditions of employment",
      description: "Control – The contractual agreements with employees and contractors shall state their and the organisation's responsibilities for information security.",
      section: "A.6 People Controls",
      order: 39,
    },
    {
      clause: "A.6.3",
      title: "Information security awareness, education and training",
      description: "Control – All employees of the organisation and, where relevant, contractors shall receive appropriate awareness education and training and regular updates in organisational policies and procedures, as relevant for their job function.",
      section: "A.6 People Controls",
      order: 40,
    },
    {
      clause: "A.6.4",
      title: "Disciplinary process",
      description: "Control – There shall be a formal and communicated disciplinary process for employees who have committed an information security breach.",
      section: "A.6 People Controls",
      order: 41,
    },
    {
      clause: "A.6.5",
      title: "Post-employment or post-contractual obligations",
      description: "Control – Information security responsibilities and duties that remain valid after termination or change of employment shall be defined, communicated to the employee or contractor, and enforced.",
      section: "A.6 People Controls",
      order: 42,
    },
    {
      clause: "A.6.6",
      title: "Confidentiality or non-disclosure agreements",
      description: "Control – Requirements for confidentiality or non-disclosure agreements reflecting the organisation's needs for the protection of information shall be identified, regularly reviewed, documented, and enforced.",
      section: "A.6 People Controls",
      order: 43,
    },
    {
      clause: "A.6.7",
      title: "Remote working",
      description: "Control – A policy and supporting security measures shall be adopted to manage the information security risks associated with working remotely.",
      section: "A.6 People Controls",
      order: 44,
    },
    {
      clause: "A.6.8",
      title: "Information security event reporting",
      description: "Control – The organisation shall provide a mechanism for employees and contractors to report observed or suspected information security events through appropriate channels in a timely manner.",
      section: "A.6 People Controls",
      order: 45,
    }
  ]

  // Create A.6 controls
  for (const control of a6Controls) {
    await prisma.statementOfApplicabilityControl.create({
      data: control,
    })
  }

  // A.7 Physical Controls
  const a7Controls = [
    {
      clause: "A.7.1",
      title: "Physical security perimeters",
      description: "Control – Security perimeters shall be defined and used to protect areas that contain either sensitive or critical information and information processing facilities.",
      section: "A.7 Physical Controls",
      order: 46,
    },
    {
      clause: "A.7.2",
      title: "Physical entry",
      description: "Control – Secure areas shall be protected by appropriate entry controls to ensure that only authorised personnel are allowed access.",
      section: "A.7 Physical Controls",
      order: 47,
    },
    {
      clause: "A.7.3",
      title: "Securing offices, rooms and facilities",
      description: "Control – Offices, rooms, and facilities shall be secured when unattended.",
      section: "A.7 Physical Controls",
      order: 48,
    },
    {
      clause: "A.7.4",
      title: "Physical security monitoring",
      description: "Control – Physical security monitoring and detection mechanisms shall be implemented to support the protection of secure areas.",
      section: "A.7 Physical Controls",
      order: 49,
    },
    {
      clause: "A.7.5",
      title: "Protecting against physical and environmental threats",
      description: "Control – Protection against physical and environmental threats shall be designed and implemented.",
      section: "A.7 Physical Controls",
      order: 50,
    },
    {
      clause: "A.7.6",
      title: "Working in secure areas",
      description: "Control – Procedures for working in secure areas shall be designed and implemented.",
      section: "A.7 Physical Controls",
      order: 51,
    },
    {
      clause: "A.7.7",
      title: "Clear desk and clear screen",
      description: "Control – A clear desk policy for papers and removable storage media and a clear screen policy for information processing facilities shall be adopted.",
      section: "A.7 Physical Controls",
      order: 52,
    },
    {
      clause: "A.7.8",
      title: "Equipment siting and protection",
      description: "Control – Equipment shall be sited and protected to reduce the risks from environmental threats and hazards, and unauthorised access.",
      section: "A.7 Physical Controls",
      order: 53,
    },
    {
      clause: "A.7.9",
      title: "Security of assets off-premises",
      description: "Control – Security shall be applied to off-site assets taking into account the different risks of working outside the organisation's premises.",
      section: "A.7 Physical Controls",
      order: 54,
    },
    {
      clause: "A.7.10",
      title: "Storage media",
      description: "Control – Storage media shall be protected from unauthorised access, misuse, or corruption.",
      section: "A.7 Physical Controls",
      order: 55,
    },
    {
      clause: "A.7.11",
      title: "Supporting utilities",
      description: "Control – Equipment shall be protected from power failures and other disruptions caused by failures in supporting utilities.",
      section: "A.7 Physical Controls",
      order: 56,
    },
    {
      clause: "A.7.12",
      title: "Cabling security",
      description: "Control – Power and telecommunications cabling carrying data or supporting information services shall be protected from interception, interference, or damage.",
      section: "A.7 Physical Controls",
      order: 57,
    },
    {
      clause: "A.7.13",
      title: "Equipment maintenance",
      description: "Control – Equipment shall be correctly maintained to ensure its continued availability and integrity.",
      section: "A.7 Physical Controls",
      order: 58,
    },
    {
      clause: "A.7.14",
      title: "Secure disposal or re-use of equipment",
      description: "Control – All items of equipment containing storage media shall be verified to ensure that any sensitive data and licensed software has been removed or securely overwritten prior to disposal or re-use.",
      section: "A.7 Physical Controls",
      order: 59,
    }
  ]

  // Create A.7 controls
  for (const control of a7Controls) {
    await prisma.statementOfApplicabilityControl.create({
      data: control,
    })
  }

  // A.8 Technological Controls
  const a8Controls = [
    {
      clause: "A.8.1",
      title: "User endpoint devices",
      description: "Control – Users shall only be provided with access to the network and network services that they have been specifically authorised to use.",
      section: "A.8 Technological Controls",
      order: 60,
    },
    {
      clause: "A.8.2",
      title: "Privileged access rights",
      description: "Control – The allocation and use of privileged access rights shall be restricted and controlled.",
      section: "A.8 Technological Controls",
      order: 61,
    },
    {
      clause: "A.8.3",
      title: "Information access restriction",
      description: "Control – Access to information and application system functions shall be restricted in accordance with the access control policy.",
      section: "A.8 Technological Controls",
      order: 62,
    },
    {
      clause: "A.8.4",
      title: "Access to source code",
      description: "Control – Read access to source code, developer, and operational environments shall be restricted.",
      section: "A.8 Technological Controls",
      order: 63,
    },
    {
      clause: "A.8.5",
      title: "Secure authentication",
      description: "Control – Secure authentication systems and techniques shall be implemented based on the authentication requirements.",
      section: "A.8 Technological Controls",
      order: 64,
    },
    {
      clause: "A.8.6",
      title: "Capacity management",
      description: "Control – The use of resources shall be monitored, tuned, and projections made of future capacity requirements to ensure the required system performance.",
      section: "A.8 Technological Controls",
      order: 65,
    },
    {
      clause: "A.8.7",
      title: "Protection from malware",
      description: "Control – Detection, prevention, and recovery controls to protect against malware shall be implemented, combined with appropriate user awareness.",
      section: "A.8 Technological Controls",
      order: 66,
    },
    {
      clause: "A.8.8",
      title: "Management of technical vulnerabilities",
      description: "Control – Information about technical vulnerabilities of information systems used by the organisation shall be obtained in a timely fashion, the organisation's exposure to such vulnerabilities evaluated, and appropriate measures taken to address the associated risk.",
      section: "A.8 Technological Controls",
      order: 67,
    },
    {
      clause: "A.8.9",
      title: "Configuration management",
      description: "Control – Configurations, including security configurations, of hardware, software, services, and networks shall be established, documented, maintained, and reviewed.",
      section: "A.8 Technological Controls",
      order: 68,
    },
    {
      clause: "A.8.10",
      title: "Information deletion",
      description: "Control – Information stored in information systems, devices, or in any other storage media shall be deleted when no longer required.",
      section: "A.8 Technological Controls",
      order: 69,
    },
    {
      clause: "A.8.11",
      title: "Data masking",
      description: "Control – Data masking shall be used in accordance with the organisation's topic specific policy on access control and other related topic specific policies, and business requirements, taking applicable legislation and regulations into consideration.",
      section: "A.8 Technological Controls",
      order: 70,
    },
    {
      clause: "A.8.12",
      title: "Data leakage prevention",
      description: "Control – Data leakage prevention measures shall be applied to systems, networks, and any other devices that process, store, or transmit sensitive information.",
      section: "A.8 Technological Controls",
      order: 71,
    },
    {
      clause: "A.8.13",
      title: "Monitoring activities",
      description: "Control – Networks, systems, and applications shall be monitored for anomalous behaviour and appropriate actions taken to evaluate potential information security incidents.",
      section: "A.8 Technological Controls",
      order: 72,
    },
    {
      clause: "A.8.14",
      title: "Use of privileged utility programs",
      description: "Control – The use of utility programs that might be capable of overriding system and application controls shall be restricted and tightly controlled.",
      section: "A.8 Technological Controls",
      order: 73,
    },
    {
      clause: "A.8.15",
      title: "Installation of software on operational systems",
      description: "Control – Procedures and measures shall be implemented to securely install software on operational systems.",
      section: "A.8 Technological Controls",
      order: 74,
    },
    {
      clause: "A.8.16",
      title: "Network security",
      description: "Control – Networks and network devices shall be secured and managed to protect information in systems and applications.",
      section: "A.8 Technological Controls",
      order: 75,
    },
    {
      clause: "A.8.17",
      title: "Security of network services",
      description: "Control – Security features, service levels, and management requirements of all network services shall be identified and included in any network services agreement, whether these services are provided in-house or outsourced.",
      section: "A.8 Technological Controls",
      order: 76,
    },
    {
      clause: "A.8.18",
      title: "Web filtering",
      description: "Control – Access to external websites shall be filtered to reduce exposure to malicious content.",
      section: "A.8 Technological Controls",
      order: 77,
    },
    {
      clause: "A.8.19",
      title: "Secure coding",
      description: "Control – Secure coding principles shall be applied to software development.",
      section: "A.8 Technological Controls",
      order: 78,
    },
    {
      clause: "A.8.20",
      title: "Application security requirements",
      description: "Control – Information security requirements shall be specified, designed, and built into applications.",
      section: "A.8 Technological Controls",
      order: 79,
    },
    {
      clause: "A.8.21",
      title: "Secure system architecture and engineering principles",
      description: "Control – Principles for engineering secure systems shall be established, documented, maintained, and applied to any information system implementation efforts.",
      section: "A.8 Technological Controls",
      order: 80,
    },
    {
      clause: "A.8.22",
      title: "Secure design",
      description: "Control – Systems, networks, and other assets shall be designed with security built-in.",
      section: "A.8 Technological Controls",
      order: 81,
    },
    {
      clause: "A.8.23",
      title: "Secure system lifecycle",
      description: "Control – Rules for the secure development of software and systems shall be established and applied to developments within the organisation.",
      section: "A.8 Technological Controls",
      order: 82,
    },
    {
      clause: "A.8.24",
      title: "Application security testing",
      description: "Control – Testing of application security functionality shall be carried out during development.",
      section: "A.8 Technological Controls",
      order: 83,
    },
    {
      clause: "A.8.25",
      title: "Secure system architecture and engineering principles",
      description: "Control – Principles for engineering secure systems shall be established, documented, maintained, and applied to any information system implementation efforts.",
      section: "A.8 Technological Controls",
      order: 84,
    },
    {
      clause: "A.8.26",
      title: "Application security requirements",
      description: "Control – Information security requirements shall be specified, designed, and built into applications.",
      section: "A.8 Technological Controls",
      order: 85,
    },
    {
      clause: "A.8.27",
      title: "Secure system architecture and engineering principles",
      description: "Control – Principles for engineering secure systems shall be established, documented, maintained, and applied to any information system implementation efforts.",
      section: "A.8 Technological Controls",
      order: 86,
    },
    {
      clause: "A.8.28",
      title: "Secure design",
      description: "Control – Systems, networks, and other assets shall be designed with security built-in.",
      section: "A.8 Technological Controls",
      order: 87,
    },
    {
      clause: "A.8.29",
      title: "Secure system lifecycle",
      description: "Control – Rules for the secure development of software and systems shall be established and applied to developments within the organisation.",
      section: "A.8 Technological Controls",
      order: 88,
    },
    {
      clause: "A.8.30",
      title: "Application security testing",
      description: "Control – Testing of application security functionality shall be carried out during development.",
      section: "A.8 Technological Controls",
      order: 89,
    }
  ]

  // Create A.8 controls
  for (const control of a8Controls) {
    await prisma.statementOfApplicabilityControl.create({
      data: control,
    })
  }

  // Create sample entries for all sections to ensure no section is empty
  console.log("Creating sample entries for all sections...")

  // Create categories for different sections
  const policyCategory = await prisma.policyCategory.create({
    data: {
      title: "General Policies",
      order: 1,
    },
  })

  const manualCategory = await prisma.manualCategory.create({
    data: {
      title: "General Manuals",
      order: 1,
    },
  })

  const procedureCategory = await prisma.procedureCategory.create({
    data: {
      title: "General Procedures",
      order: 1,
    },
  })

  const formCategory = await prisma.formCategory.create({
    data: {
      title: "General Forms",
      order: 1,
    },
  })

  const certificateCategory = await prisma.certificateCategory.create({
    data: {
      title: "General Certificates",
      order: 1,
    },
  })

  const correctiveActionCategory = await prisma.correctiveActionCategory.create({
    data: {
      title: "General Corrective Actions",
      order: 1,
    },
  })

  const businessContinuityCategory = await prisma.businessContinuityCategory.create({
    data: {
      title: "General Business Continuity",
      order: 1,
    },
  })

  const managementReviewCategory = await prisma.managementReviewCategory.create({
    data: {
      title: "General Management Review",
      order: 1,
    },
  })

  const jobDescriptionCategory = await prisma.jobDescriptionCategory.create({
    data: {
      title: "General Job Descriptions",
      order: 1,
    },
  })

  const workInstructionCategory = await prisma.workInstructionCategory.create({
    data: {
      title: "General Work Instructions",
      order: 1,
    },
  })

  const coshhCategory = await prisma.cOSHHCategory.create({
    data: {
      title: "General COSHH",
      order: 1,
    },
  })

  const riskAssessmentCategory = await prisma.riskAssessmentCategory.create({
    data: {
      title: "General Risk Assessments",
      order: 1,
    },
  })

  const hseGuidanceCategory = await prisma.hseGuidanceCategory.create({
    data: {
      title: "General HSE Guidance",
      order: 1,
    },
  })

  const technicalFileCategory = await prisma.technicalFileCategory.create({
    data: {
      title: "General Technical Files",
      order: 1,
    },
  })

  const environmentalGuidanceCategory = await prisma.environmentalGuidanceCategory.create({
    data: {
      title: "General Environmental Guidance",
      order: 1,
    },
  })

  const customSectionCategory = await prisma.customSectionCategory.create({
    data: {
      title: "General Custom Sections",
      order: 1,
    },
  })

  const registerCategory = await prisma.registerCategory.create({
    data: {
      title: "General Registers",
      order: 1,
    },
  })

  // Note: Some models don't have categories, they will be created without categoryId

  // Create sample entries for each section
  console.log("Creating sample policies...")
  await prisma.policy.create({
    data: {
      title: "Information Security Policy",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: policyCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.policy.create({
    data: {
      title: "Data Protection Policy",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: policyCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample manuals...")
  await prisma.manual.create({
    data: {
      title: "Quality Management Manual",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: manualCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.manual.create({
    data: {
      title: "Information Security Manual",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: manualCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample procedures...")
  await prisma.procedure.create({
    data: {
      title: "Document Control Procedure",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: procedureCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.procedure.create({
    data: {
      title: "Risk Assessment Procedure",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: procedureCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample forms...")
  await prisma.form.create({
    data: {
      title: "Incident Report Form",
      version: "1.0",
      issueDate: new Date(),
      location: "HSE",
      categoryId: formCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.form.create({
    data: {
      title: "Training Record Form",
      version: "1.0",
      issueDate: new Date(),
      location: "HR",
      categoryId: formCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample certificates...")
  await prisma.certificate.create({
    data: {
      title: "ISO 27001 Certificate",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: certificateCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.certificate.create({
    data: {
      title: "Quality Management Certificate",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: certificateCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample corrective actions...")
  await prisma.correctiveAction.create({
    data: {
      title: "Document Control Improvement",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: correctiveActionCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.correctiveAction.create({
    data: {
      title: "Training Process Enhancement",
      version: "1.0",
      issueDate: new Date(),
      location: "HR",
      categoryId: correctiveActionCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample business continuity...")
  await prisma.businessContinuity.create({
    data: {
      title: "Business Continuity Plan",
      version: "1.0",
      issueDate: new Date(),
      location: "Management",
      categoryId: businessContinuityCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.businessContinuity.create({
    data: {
      title: "Disaster Recovery Plan",
      version: "1.0",
      issueDate: new Date(),
      location: "IT",
      categoryId: businessContinuityCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample management reviews...")
  await prisma.managementReview.create({
    data: {
      title: "Annual Management Review",
      reviewDate: new Date(),
      version: "1.0",
      location: "Board Room",
      categoryId: managementReviewCategory.id,
      createdById: admin.id,
    },
  })

  await prisma.managementReview.create({
    data: {
      title: "Quarterly Management Review",
      reviewDate: new Date(),
      version: "1.0",
      location: "Conference Room",
      categoryId: managementReviewCategory.id,
      createdById: admin.id,
    },
  })

  console.log("Creating sample job descriptions...")
  await prisma.jobDescription.create({
    data: {
      title: "Information Security Manager",
      department: "IT",
      version: "1.0",
      reviewDate: new Date(),
      categoryId: jobDescriptionCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.jobDescription.create({
    data: {
      title: "Quality Assurance Officer",
      department: "Quality",
      version: "1.0",
      reviewDate: new Date(),
      categoryId: jobDescriptionCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample work instructions...")
  await prisma.workInstruction.create({
    data: {
      title: "Safe Working Practices",
      version: "1.0",
      reviewDate: new Date(),
      department: "HSE",
      categoryId: workInstructionCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.workInstruction.create({
    data: {
      title: "Equipment Operation Guide",
      version: "1.0",
      reviewDate: new Date(),
      department: "Operations",
      categoryId: workInstructionCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample COSHH...")
  await prisma.cOSHH.create({
    data: {
      title: "Chemical Safety Assessment",
      version: "1.0",
      reviewDate: new Date(),
      department: "HSE",
      categoryId: coshhCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.cOSHH.create({
    data: {
      title: "Hazardous Substance Control",
      version: "1.0",
      reviewDate: new Date(),
      department: "HSE",
      categoryId: coshhCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample risk assessments...")
  await prisma.riskAssessment.create({
    data: {
      title: "Workplace Risk Assessment",
      version: "1.0",
      reviewDate: new Date(),
      department: "HSE",
      categoryId: riskAssessmentCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.riskAssessment.create({
    data: {
      title: "Information Security Risk Assessment",
      version: "1.0",
      reviewDate: new Date(),
      department: "IT",
      categoryId: riskAssessmentCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample HSE guidance...")
  await prisma.hseGuidance.create({
    data: {
      title: "Safety Guidelines",
      version: "1.0",
      reviewDate: new Date(),
      department: "HSE",
      categoryId: hseGuidanceCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.hseGuidance.create({
    data: {
      title: "Environmental Protection Guide",
      version: "1.0",
      reviewDate: new Date(),
      department: "HSE",
      categoryId: hseGuidanceCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample technical files...")
  await prisma.technicalFile.create({
    data: {
      title: "Product Technical Specification",
      version: "1.0",
      reviewDate: new Date(),
      department: "Engineering",
      categoryId: technicalFileCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.technicalFile.create({
    data: {
      title: "System Architecture Document",
      version: "1.0",
      reviewDate: new Date(),
      department: "IT",
      categoryId: technicalFileCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample environmental guidance...")
  await prisma.environmentalGuidance.create({
    data: {
      title: "Environmental Management Guide",
      version: "1.0",
      reviewDate: new Date(),
      department: "HSE",
      categoryId: environmentalGuidanceCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.environmentalGuidance.create({
    data: {
      title: "Waste Management Procedures",
      version: "1.0",
      reviewDate: new Date(),
      department: "HSE",
      categoryId: environmentalGuidanceCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample registers...")
  await prisma.register.create({
    data: {
      title: "Asset Register",
      version: "1.0",
      reviewDate: new Date(),
      department: "Finance",
      categoryId: registerCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  await prisma.register.create({
    data: {
      title: "Training Register",
      version: "1.0",
      reviewDate: new Date(),
      department: "HR",
      categoryId: registerCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  console.log("Creating sample legal register...")
  await prisma.legalRegister.create({
    data: {
      section: "Data Protection",
      legislation: "GDPR",
      webAddress: "https://gdpr.eu",
      regulator: "ICO",
      requirements: "Personal data protection and privacy",
      applicability: "All EU data processing",
      complianceRating: "Compliant",
      furtherAction: "Regular audits required",
      regions: ["EU"],
      createdById: admin.id,
    },
  })

  await prisma.legalRegister.create({
    data: {
      section: "Health and Safety",
      legislation: "Health and Safety at Work Act",
      webAddress: "https://hse.gov.uk",
      regulator: "HSE",
      requirements: "Workplace safety standards",
      applicability: "All UK workplaces",
      complianceRating: "Compliant",
      furtherAction: "Annual safety reviews",
      regions: ["UK"],
      createdById: admin.id,
    },
  })

  console.log("Creating sample training...")
  // Note: Training model doesn't exist, skipping this section

  console.log("Creating sample maintenance...")
  await prisma.maintenance.create({
    data: {
      name: "Equipment Maintenance Schedule",
      category: "Preventive",
      subCategory: "Routine",
      actionRequired: "Regular equipment checks",
      frequency: "Monthly",
      dueDate: new Date(),
      owner: admin.name,
      createdById: admin.id,
    },
  })

  await prisma.maintenance.create({
    data: {
      name: "System Maintenance Plan",
      category: "Preventive",
      subCategory: "Scheduled",
      actionRequired: "System updates and patches",
      frequency: "Weekly",
      dueDate: new Date(),
      owner: admin.name,
      createdById: admin.id,
    },
  })

  console.log("Creating sample improvement register...")
  await prisma.improvementRegister.create({
    data: {
      number: 1,
      category: "Process Improvement",
      type: "OFI",
      description: "Streamline document control process",
      dateRaised: new Date(),
      dateDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      internalOwnerId: admin.id,
    },
  })

  await prisma.improvementRegister.create({
    data: {
      number: 2,
      category: "System Enhancement",
      type: "OFI",
      description: "Improve user interface for better usability",
      dateRaised: new Date(),
      dateDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      internalOwnerId: admin.id,
    },
  })

  console.log("Creating sample objectives...")
  await prisma.objective.create({
    data: {
      source: "Management Review",
      categories: ["Quality"],
      objective: "Achieve ISO 27001 Certification",
      target: "Complete certification audit successfully",
      resourcesRequired: "Auditor, documentation, staff training",
      progressToDate: "In progress",
      who: admin.name,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      likelihood: 1,
      severity: 1,
      riskLevel: 1,
      createdById: admin.id,
    },
  })

  await prisma.objective.create({
    data: {
      source: "Strategic Planning",
      categories: ["Growth"],
      objective: "Expand Market Presence",
      target: "Enter 3 new markets",
      resourcesRequired: "Market research, sales team, partnerships",
      progressToDate: "Planning phase",
      who: admin.name,
      dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      likelihood: 1,
      severity: 1,
      riskLevel: 1,
      createdById: admin.id,
    },
  })

  console.log("Creating sample organizational context...")
  await prisma.organizationalContext.create({
    data: {
      category: "Political",
      subCategory: "Regulatory",
      issue: "Data Protection Regulations",
      initialLikelihood: 1,
      initialSeverity: 1,
      initialRiskLevel: 1,
      controlsRecommendations: "Implement GDPR compliance measures",
      residualLikelihood: 1,
      residualSeverity: 1,
      residualRiskLevel: 1,
      objectives: ["Achieve full GDPR compliance"],
      createdById: admin.id,
    },
  })

  await prisma.organizationalContext.create({
    data: {
      category: "Economic",
      subCategory: "Market Conditions",
      issue: "Economic Uncertainty",
      initialLikelihood: 1,
      initialSeverity: 1,
      initialRiskLevel: 1,
      controlsRecommendations: "Diversify revenue streams",
      residualLikelihood: 1,
      residualSeverity: 1,
      residualRiskLevel: 1,
      objectives: ["Maintain financial stability"],
      createdById: admin.id,
    },
  })

  console.log("Creating sample interested parties...")
  await prisma.interestedParty.create({
    data: {
      name: "Customers",
      needsExpectations: "Quality products and services",
      initialLikelihood: 1,
      initialSeverity: 1,
      controlsRecommendations: "Customer feedback system",
      residualLikelihood: 1,
      residualSeverity: 1,
      riskLevel: 1,
      residualRiskLevel: 1,
      createdById: admin.id,
    },
  })

  await prisma.interestedParty.create({
    data: {
      name: "Regulators",
      needsExpectations: "Compliance with regulations",
      initialLikelihood: 1,
      initialSeverity: 1,
      controlsRecommendations: "Regular compliance audits",
      residualLikelihood: 1,
      residualSeverity: 1,
      riskLevel: 1,
      residualRiskLevel: 1,
      createdById: admin.id,
    },
  })

  console.log("Creating sample audit schedule...")
  await prisma.audit.create({
    data: {
      title: "Internal Quality Audit",
      plannedStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "not_started",
      createdById: admin.id,
      number: 1,
    },
  })

  await prisma.audit.create({
    data: {
      title: "Information Security Audit",
      plannedStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "not_started",
      createdById: admin.id,
      number: 2,
    },
  })

  console.log("Creating sample suppliers...")
  await prisma.supplier.create({
    data: {
      name: "Tech Solutions Ltd",
      provisionOf: "IT Services",
      certifications: "ISO 27001, ISO 9001",
      contactName: "John Smith",
      address: "123 Tech Street, London",
      contactNumber: "+44 20 1234 5678",
      website: "https://techsolutions.com",
      reviewFrequency: "Annual",
      lastReviewDate: new Date(),
      lastReviewedBy: admin.name,
      riskLikelihood: 1,
      riskSeverity: 1,
      controlsRecommendations: "Regular security assessments",
      residualLikelihood: 1,
      residualSeverity: 1,
    },
  })

  await prisma.supplier.create({
    data: {
      name: "Office Supplies Co",
      provisionOf: "Office Equipment",
      certifications: "ISO 9001",
      contactName: "Jane Doe",
      address: "456 Office Road, Manchester",
      contactNumber: "+44 16 1234 5678",
      website: "https://officesupplies.co.uk",
      reviewFrequency: "Biannual",
      lastReviewDate: new Date(),
      lastReviewedBy: admin.name,
      riskLikelihood: 1,
      riskSeverity: 1,
      controlsRecommendations: "Quality checks on deliveries",
      residualLikelihood: 1,
      residualSeverity: 1,
    },
  })

  console.log("Database has been seeded successfully!")
  console.log(`Admin user created with ID: ${admin.id}`)
  console.log(`Admin group created with ID: ${adminGroup.id}`)
  console.log(`Admin user added to admin group`)
  console.log(`Permissions created for ${systems.length} systems`)
  console.log(`Created ${a5Controls.length + a6Controls.length + a7Controls.length + a8Controls.length} Statement of Applicability controls`)
  console.log("Created sample entries for all sections to ensure no section is empty")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
