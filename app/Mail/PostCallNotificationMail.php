<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Spatie\Multitenancy\Jobs\NotTenantAware;

class PostCallNotificationMail extends Mailable implements ShouldQueue, NotTenantAware
{
    use Queueable, SerializesModels;

    public $agentName;
    public $conversationId;
    public $link;

    /**
     * Create a new message instance.
     */
    public function __construct($agentName, $conversationId, $link)
    {
        $this->agentName = $agentName;
        $this->conversationId = $conversationId;
        $this->link = $link;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Call Completed – {$this->agentName}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.post-call',
            with: [
                'agentName' => $this->agentName,
                'conversationId' => $this->conversationId,
                'link' => $this->link,
            ],
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
