import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dashboard Jadwal Sekolah',
  description: 'Frontend Siswa, Guru, dan Yayasan Edulab',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
