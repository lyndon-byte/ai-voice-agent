<x-mail::message>

@if($enabled)

# Account Status Update

**Status:** <span style="color:#16a34a;"><strong>Enabled</strong></span>

Your account has been enabled and is now active

@else

# Account Status Update

**Status:** <span style="color:#dc2626;"><strong>Disabled</strong></span>

Your account has been temporarily disabled.

@if($reason)

**Reason:** {{ $reason }}

@endif

If you believe this action was taken in error or need assistance, please contact support.

@endif

Thanks,<br>
{{ config('app.name') }}

</x-mail::message>