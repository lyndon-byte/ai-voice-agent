<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Spatie\Multitenancy\Jobs\NotTenantAware;

class AccountStatusMail extends Mailable implements ShouldQueue, NotTenantAware
{
    use Queueable, SerializesModels;

    public bool $enabled;
    public ?string $reason;

    /**
     * Create a new message instance.
     */
    public function __construct(bool $enabled, ?string $reason = null)
    {
        $this->enabled = $enabled;
        $this->reason = $this->formatReason($reason);
    }

    protected function formatReason(?string $reason): ?string
    {
        if (!$reason) {
            return null;
        }

        return match ($reason) {
            'free_trial_ended' => 'Your free trial period has ended.',
            'unpaid_balance' => 'There is an outstanding unpaid balance on your account.',
            default => 'Your account status has been updated.',
        };
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->enabled
                ? 'Your Account Has Been Enabled'
                : 'Your Account Has Been Disabled'
        );;
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.account-status',
            with: [
                'enabled' => $this->enabled,
                'reason' => $this->reason
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
