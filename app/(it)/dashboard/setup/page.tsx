import { tabRedirect } from '@/lib/tab-redirect'

// Vecchia URL: questa pagina è ora il tab "setup" di /dashboard/settings.
export default tabRedirect('/dashboard/settings', 'setup')
