import { router } from '@inertiajs/react';
import { 
    Search, 
    LayoutDashboard, 
    Users, 
    Tags, 
    FileText, 
    ShoppingCart, 
    Truck, 
    UserCheck,
    Car,
    Briefcase
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const modules = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Clientes', icon: Users, href: '/clientes' },
    { name: 'Categorías', icon: Tags, href: '/categorias' },
    { name: 'Cotizaciones', icon: FileText, href: '/cotizaciones' },
    { name: 'Ventas (POS)', icon: ShoppingCart, href: '/ventas' },
    { name: 'Entregas', icon: Truck, href: '/entregas' },
    { name: 'Conductores', icon: UserCheck, href: '/conductores' },
    { name: 'Vehículos', icon: Car, href: '/vehiculos' },
    { name: 'Proyectos', icon: Briefcase, href: '/proyectos' },
];

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const filteredModules = modules.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase())
    );

    const navigate = (href: string) => {
        setOpen(false);
        router.visit(href);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-all border border-transparent hover:border-border group"
            >
                <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
                <span className="hidden md:inline-block">Buscar...</span>
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 border-none shadow-2xl max-w-xl bg-background/80 backdrop-blur-xl">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="sr-only">Búsqueda Global</DialogTitle>
                        <div className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-primary" />
                            <Input
                                autoFocus
                                placeholder="Escribe para buscar un módulo..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="border-none focus-visible:ring-0 text-lg h-10 bg-transparent"
                            />
                        </div>
                    </DialogHeader>
                    <div className="max-h-[300px] overflow-y-auto p-2">
                        {filteredModules.length > 0 ? (
                            <div className="grid gap-1">
                                {filteredModules.map((m) => (
                                    <button
                                        key={m.href}
                                        onClick={() => navigate(m.href)}
                                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-primary/10 transition-all text-left group"
                                    >
                                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary group-hover:text-white transition-colors">
                                            <m.icon className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold">{m.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                No se encontraron resultados para "{query}"
                            </div>
                        )}
                    </div>
                    <div className="p-2 border-t bg-muted/30 text-[10px] text-muted-foreground flex justify-between px-4">
                        <span>Selecciona un módulo para navegar</span>
                        <span>ESC para cerrar</span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
