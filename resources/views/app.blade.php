<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        @php
            $seoTitle = \App\Models\SystemSetting::where('key', 'seo_title')->first()?->value ?? 'Eling Bening Resort & Rekreasi';
            $seoDesc = \App\Models\SystemSetting::where('key', 'seo_description')->first()?->value ?? 'Destinasi alam premium di Ambarawa dengan fasilitas resort eksklusif dan rekreasi air.';
        @endphp

        <title>{{ $seoTitle }}</title>
        <meta name="description" content="{{ $seoDesc }}">
        <!-- Fonts & Icons -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        
        @php
            $midtransIsProduction = \App\Models\SystemSetting::where('key', 'midtrans_is_production')->first()?->value === 'true';
            $midtransClientKey = \App\Models\SystemSetting::where('key', 'midtrans_client_key')->first()?->value ?? '';
            $midtransUrl = $midtransIsProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
        @endphp
        
        <script type="text/javascript"
            src="{{ $midtransUrl }}"
            data-client-key="{{ $midtransClientKey }}"></script>

        @php
            $gaId = \App\Models\SystemSetting::where('key', 'google_analytics_id')->first()?->value;
        @endphp

        @if($gaId)
            <!-- Google Analytics -->
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '{{ $gaId }}');
            </script>
        @endif

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="antialiased">
        <div id="root"></div>
    </body>
</html>
