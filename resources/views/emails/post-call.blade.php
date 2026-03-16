<x-mail::message>

# Post Call Notification

A conversation has completed.

**Agent:** {{ $agentName }}  
**Conversation ID:** {{ $conversationId }}

<x-mail::button :url="$link">
View Conversation
</x-mail::button>

This secure link allows you to view the conversation without logging in.

Thanks,<br>
{{ config('app.name') }}

</x-mail::message>