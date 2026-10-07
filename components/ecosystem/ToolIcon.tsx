import { Video, ChartNoAxesCombined, Scale, FolderOpen, Calculator, ShieldCheck, Bot, Sparkles } from 'lucide-react';
const icons={video:Video,chart:ChartNoAxesCombined,scale:Scale,folder:FolderOpen,calculator:Calculator,shield:ShieldCheck,bot:Bot,spark:Sparkles};
export function ToolIcon({name,size=24}:{name:string;size?:number}){const Icon=icons[name as keyof typeof icons]??Sparkles;return <Icon size={size} strokeWidth={1.5} aria-hidden="true"/>;}
