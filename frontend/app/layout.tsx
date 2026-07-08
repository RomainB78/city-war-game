import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chroniques de la Boucle | Territoires et Conquêtes',
  description: 'Jeu de stratégie et conquête de territoires en ligne pour 2 joueurs dans la boucle de la Seine.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-[#0c0a09] bg-grid text-stone-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
