<x-mail::message>
# You're Invited

You have been invited to join **Talking to eleven**.

Click the button below to create your account and get started.

<x-mail::button :url="$inviteLink">
Create Your Account
</x-mail::button>

If you did not expect this invitation, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>