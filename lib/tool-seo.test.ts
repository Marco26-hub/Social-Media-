import {test,expect} from 'playwright/test'
import {toolMetadata,toolStructuredData} from './ecosystem/tool-seo'
import type {SwaTool} from './ecosystem/catalog'

const tool:SwaTool={id:'ugc',is_internal:true,is_coming_soon:false,cta_href:null,copy:{
 name:'UGC Video Creator',category:'Marketing & contenuti',summary:'Foto prodotto, prompt, immagini e video con API personale.',
 headline:'Una storia per il prodotto.',intro:'Collega Gemini e verifica l’accesso Veo prima della generazione.',
 audience:'Per e-commerce e brand.',icon:'video',action:'Apri',benefits:[['Prompt','Rivedi il prompt.']],steps:[],
 faq:[['Serve una API personale?','Sì, collega la tua API Gemini.']],
}}
const url='https://www.socialautomation.app/marketplace/ugc'
test('metadata uses tool content and keeps protected pages out of indexing',()=>{
 const meta=toolMetadata(tool,url)
 expect(meta.description).toBe(tool.copy.summary)
 expect(meta.alternates?.canonical).toBe(url)
 expect(meta.robots).toEqual({index:false,follow:false})
 expect(meta.openGraph?.description).toBe(tool.copy.summary)
})
test('structured data matches visible benefits, audience and FAQ without invented offers',()=>{
 const serialized=JSON.stringify(toolStructuredData(tool,url,'https://www.socialautomation.app/marketplace'))
 expect(serialized).toContain('Rivedi il prompt.')
 expect(serialized).toContain('Sì, collega la tua API Gemini.')
 expect(serialized).not.toContain('offers')
 expect(serialized).not.toContain('aggregateRating')
})
test('upcoming projects are not marked as available software',()=>{
 const serialized=JSON.stringify(toolStructuredData({...tool,is_coming_soon:true},url,'https://www.socialautomation.app/marketplace'))
 expect(serialized).not.toContain('SoftwareApplication')
})
