import { PrismaClient } from '../src/generated/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.plan.upsert({
    where: { slug: 'free' },
    update: {},
    create: {
      slug: 'free',
      name: 'Free',
      maxMessagesPerDay: 30,
      maxSessionsPerDay: 3,
      maxActiveSessions: 5,
      maxMcpServers: 2,
      maxSkills: 3,
      maxFileUploadsPerDay: 5,
      maxFileSizeMb: 5,
      storageLimitMb: 50,
    },
  })

  await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      slug: 'pro',
      name: 'Pro',
      maxMessagesPerDay: -1,
      maxSessionsPerDay: -1,
      maxActiveSessions: -1,
      maxMcpServers: 20,
      maxSkills: -1,
      maxFileUploadsPerDay: 50,
      maxFileSizeMb: 50,
      storageLimitMb: 5000,
    },
  })

  const skills = [
    { slug: 'web-search', name: 'Web Search', description: 'ค้นหาข้อมูลจากอินเทอร์เน็ตแบบ real-time' },
    { slug: 'code-review', name: 'Code Review', description: 'วิเคราะห์และรีวิวโค้ด พร้อมแนะนำการปรับปรุง' },
    { slug: 'sql-query', name: 'SQL Query', description: 'ช่วยเขียนและ optimize SQL queries' },
    { slug: 'file-analysis', name: 'File Analysis', description: 'วิเคราะห์เนื้อหาไฟล์และสรุปข้อมูลสำคัญ' },
  ]

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: skill,
      create: skill,
    })
  }

  const models = [
    { id: 'model-anthropic-claude-sonnet-4', name: 'anthropic/claude-sonnet-4-20250514', contextLimit: 200000, compactAt: 0.8 },
    { id: 'model-anthropic-claude-opus-4', name: 'anthropic/claude-opus-4-20250514', contextLimit: 200000, compactAt: 0.8 },
    { id: 'model-openai-gpt-4-1', name: 'openai/gpt-4.1', contextLimit: 1047576, compactAt: 0.8 },
    { id: 'model-openai-gpt-4-1-mini', name: 'openai/gpt-4.1-mini', contextLimit: 1047576, compactAt: 0.8 },
    { id: 'model-google-gemini-2-5-pro', name: 'google/gemini-2.5-pro', contextLimit: 1048576, compactAt: 0.8 },
    { id: 'model-google-gemini-2-5-flash', name: 'google/gemini-2.5-flash', contextLimit: 1048576, compactAt: 0.8 },
  ]

  for (const model of models) {
    await prisma.modelConfig.upsert({
      where: { name: model.name },
      update: { contextLimit: model.contextLimit, compactAt: model.compactAt },
      create: model,
    })
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
