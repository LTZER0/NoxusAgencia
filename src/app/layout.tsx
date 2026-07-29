import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import CookieConsent from '@/components/CookieConsent'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins' })

export const metadata: Metadata = {
  title: 'Micro-SaaS para Comércio Local',
  description: 'Sistema multi-tenant para pequenos comércios.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${poppins.variable}`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
