import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  app.enableCors({ origin: process.env.WEB_URL ?? 'http://localhost:3000' })

  app.useGlobalPipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true, transform: true }))

  app.setGlobalPrefix('api')

  const doc = new DocumentBuilder()
    .setTitle('AgentHub API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, doc))

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0')
  console.log(`API running on http://localhost:${process.env.PORT ?? 4000}`)
}

bootstrap()
