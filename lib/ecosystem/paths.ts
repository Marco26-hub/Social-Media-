export const toolSlug = (id: string) => id === 'softi' ? 'mercati-finanziari-analyzer' : id
export const toolHref = (id: string) => '/marketplace/' + toolSlug(id)
