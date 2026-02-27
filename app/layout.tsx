import './globals.css';

export const metadata = {
  title: 'Git Chronos',
  description: 'Cinematic Git Visualizer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
