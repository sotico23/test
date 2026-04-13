import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWhatsAppLink } from '@/lib/whatsapp-utils';

interface WhatsAppButtonProps {
    phone: string | null | undefined;
    nombre?: string;
    className?: string;
}

export function WhatsAppButton({ phone, nombre, className }: WhatsAppButtonProps) {
    if (!phone) return null;

    const message = nombre ? `Hola ${nombre}, te contacto desde el sistema...` : 'Hola, te contacto desde el sistema...';
    const link = getWhatsAppLink(phone, message);

    return (
        <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 ${className}`}
            onClick={() => window.open(link, '_blank')}
            title="Contactar por WhatsApp"
        >
            <MessageCircle className="h-4 w-4" />
        </Button>
    );
}
