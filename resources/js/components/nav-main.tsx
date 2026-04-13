import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    // Group items by their 'group' property
    const groupedItems = items.reduce((acc, item) => {
        const groupName = item.group || 'GENERAL';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);

    return (
        <div className="space-y-4">
            {Object.entries(groupedItems).map(([groupName, groupItems]) => (
                <SidebarGroup key={groupName} className="px-2 py-0">
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 px-2 py-3">
                        {groupName}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {groupItems.map((item) => {
                            const isParentActive = item.items?.some(sub => isCurrentUrl(sub.href)) || isCurrentUrl(item.href);
                            
                            // Direct link for items without sub-items (e.g. Dashboard)
                            if (!item.items || item.items.length === 0) {
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={{ children: item.title }}
                                            isActive={isCurrentUrl(item.href)}
                                            asChild
                                            className={`relative overflow-hidden transition-all duration-300 ${isCurrentUrl(item.href) ? 'bg-primary/10 font-bold text-primary shadow-sm' : 'hover:bg-muted/50'}`}
                                        >
                                            <Link href={item.href} prefetch className="flex items-center gap-3">
                                                {isCurrentUrl(item.href) && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary animate-in slide-in-from-left duration-300" />
                                                )}
                                                {item.icon && <item.icon className={`size-4 ${isCurrentUrl(item.href) ? 'text-primary' : ''}`} />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            }

                            // Collapsible group for items with sub-items
                            return (
                                <Collapsible
                                    key={item.title}
                                    asChild
                                    defaultOpen={isParentActive}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={{ children: item.title }}
                                                className={`relative transition-all duration-300 ${isParentActive ? 'bg-muted/30 font-semibold' : 'hover:bg-muted/50'}`}
                                            >
                                                {isParentActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary/40 animate-in slide-in-from-left duration-300" />
                                                )}
                                                {item.icon && <item.icon className="size-4" />}
                                                <span>{item.title}</span>
                                                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub className="ml-3 border-l-2 border-muted/30 pl-2 mt-1 space-y-1">
                                                {item.items.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isCurrentUrl(subItem.href)}
                                                            className={`transition-colors duration-200 ${isCurrentUrl(subItem.href) ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-muted/30 text-muted-foreground hover:text-foreground'}`}
                                                        >
                                                            <Link href={subItem.href} prefetch className="flex items-center gap-2">
                                                                {isCurrentUrl(subItem.href) && (
                                                                    <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                                                                )}
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </div>
    );
}
