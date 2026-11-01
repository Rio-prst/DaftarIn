import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  if (process.env.SWAGGER_ENABLED === 'false') {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('DaftarIn API')
    .setDescription(
      'Dokumentasi API Platform Persiapan, Pendampingan, dan Katalog Layanan Publik DaftarIn',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .addTag('auth', 'Autentikasi, sesi, pemulihan sandi, dan aktivasi')
    .addTag('catalog', 'Katalog layanan publik dan wilayah')
    .addTag('preparations', 'Draf persiapan warga, berkas, dan snapshot')
    .addTag(
      'applications',
      'Pengajuan resmi, timeline, pelaporan, dan penarikan',
    )
    .addTag(
      'officer',
      'Tinjauan pendamping, penilaian item, keputusan, dan eskalasi',
    )
    .addTag('admin', 'Manajemen layanan, versi panduan, penugasan, dan audit')
    .addTag('account', 'Profil akun, preferensi, dan anggota keluarga')
    .addTag('help', 'Tiket bantuan warga dan balasan pendamping')
    .addTag('chat', 'Relay asisten panduan AI & fallback katalog lokal')
    .addTag('dashboard', 'Ringkasan dashboard warga')
    .addTag('notifications', 'Notifikasi status dan aksi')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'DaftarIn API Documentation',
  });
}
