<?php

namespace App\Mail;

use App\Models\MailTemplate;
use App\Services\MailConfigurationService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;

class DynamicNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;

    public $messageBody;

    public array $variables;

    public ?int $ownerId = null;

    public function __construct(
        string $slug,
        string $toEmail,
        string $toName = '',
        array $variables = [],
        ?int $ownerId = null
    ) {
        $this->ownerId = $ownerId ?? (Auth::check() ? Auth::user()->getOwnerId() : null);

        $template = MailTemplate::where('slug', $slug)
            ->where('owner_id', $this->ownerId)
            ->where('is_active', true)
            ->first();

        if (! $template) {
            $template = MailTemplate::where('slug', $slug)
                ->whereNull('owner_id')
                ->where('is_active', true)
                ->first();
        }

        if (! $template) {
            $defaults = [
                'bienvenida' => [
                    'subject' => '¡Bienvenido a {{business_name}}!',
                    'content' => 'Hola {{user_name}}, gracias por unirte a nosotros.',
                ],
                'factura' => [
                    'subject' => 'Tu factura de {{business_name}}',
                    'content' => 'Hola {{user_name}}, adjuntamos tu factura reciente.',
                ],
                'olvido-contrasena' => [
                    'subject' => 'Restablecer contraseña',
                    'content' => 'Haz clic en el enlace para restablecer tu contraseña: {{reset_link}}',
                ],
                'cotizacion' => [
                    'subject' => 'Tu cotización de {{business_name}}',
                    'content' => 'Hola {{user_name}}, adjuntamos tu cotización reciente.',
                ],
                'pedido-confirmado' => [
                    'subject' => 'Pedido confirmado en {{business_name}}',
                    'content' => 'Tu pedido ha sido confirmado y está siendo procesado.',
                ],
                'cuenta-activada' => [
                    'subject' => 'Cuenta activada en {{business_name}}',
                    'content' => 'Tu cuenta ha sido activada exitosamente.',
                ],
            ];

            if (isset($defaults[$slug])) {
                $this->subject = $this->replaceVariables($defaults[$slug]['subject'], $variables);
                $this->messageBody = $this->replaceVariables($defaults[$slug]['content'], $variables);
            } else {
                $this->subject = 'Notificación';
                $this->messageBody = 'Plantilla no encontrada: '.$slug;
            }
        } else {
            $this->subject = $this->replaceVariables($template->subject, $variables);
            $this->messageBody = $this->replaceVariables($template->content, $variables);
        }

        $this->variables = $variables;
        $this->to($toEmail, $toName);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.dynamic',
            with: [
                'content' => $this->messageBody,
                'variables' => $this->variables,
            ],
        );
    }

    public function build($mailer = null)
    {
        $mailer = $mailer ?? $this;

        if ($this->ownerId) {
            $service = app(MailConfigurationService::class);
            $config = $service->getActiveConfig($this->ownerId);

            if ($config) {
                $service->applyConfiguration($config);

                return $mailer
                    ->mailer('tenant_smtp')
                    ->subject($this->subject)
                    ->view('emails.dynamic', [
                        'content' => $this->messageBody,
                        'variables' => $this->variables,
                    ]);
            }
        }

        return $mailer
            ->subject($this->subject)
            ->view('emails.dynamic', [
                'content' => $this->messageBody,
                'variables' => $this->variables,
            ]);
    }

    public function replaceVariables(string $template, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $template = str_replace("{{{$key}}}", (string) $value, $template);
            $template = str_replace("{{ $key }}", (string) $value, $template);
        }

        return $template;
    }
}
