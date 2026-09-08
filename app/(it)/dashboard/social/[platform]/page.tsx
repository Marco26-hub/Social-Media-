import { redirect } from 'next/navigation'

// Le pagine per-piattaforma sono state unificate in /dashboard/social (selettore
// canale in cima). Questo stub tiene vive le vecchie URL (bookmark, link nel
// dashboard) redirigendole alla pagina unica con la piattaforma pre-selezionata.
export default async function SocialPlatformRedirect({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params
  redirect(`/dashboard/social?platform=${encodeURIComponent(platform)}`)
}
