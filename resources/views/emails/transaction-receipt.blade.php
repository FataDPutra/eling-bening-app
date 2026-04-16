<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Konfirmasi Transaksi - {{ $siteName }}</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; color:#333333; -webkit-text-size-adjust:100%;">

<!-- Wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;">
    <tr>
        <td align="center" style="padding: 40px 20px;">
            @php
                // Calculate nights for resort bookings
                $nights = 1;
                if ($transaction->check_in_date && $transaction->check_out_date) {
                    $nights = $transaction->check_in_date->diffInDays($transaction->check_out_date);
                    $nights = $nights > 0 ? $nights : 1;
                }
                $isResort = $transaction->booking_type === 'RESORT';
            @endphp
            
            <!-- Main Container -->
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                
                <!-- ===== HEADER ===== -->
                <tr>
                    <td style="background:linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%); padding:40px 48px; text-align:center;">
                        @if($logoUrl)
                            @php
                                $finalLogoUrl = trim($logoUrl);
                                if (str_starts_with($finalLogoUrl, 'data:')) {
                                    // Handle Base64 Data URL (common in CMS)
                                    if (preg_match('/^data:image\/(\w+);base64,(.+)$/', $finalLogoUrl, $matches)) {
                                        $type = $matches[1];
                                        $data = base64_decode($matches[2]);
                                        $finalLogoUrl = $message->embedData($data, 'logo.' . $type, 'image/' . $type);
                                    }
                                }
                            @endphp
                            <img src="{{ $finalLogoUrl }}" alt="{{ $siteName }} Logo" style="height:80px; width:auto; object-fit:contain; margin-bottom:10px; display:block; margin-left:auto; margin-right:auto;" />
                        @endif
                        <p style="margin:0; color:rgba(255,255,255,0.75); font-size:13px; font-weight:500; text-transform: uppercase; letter-spacing: 2px;">Bukti Pemesanan Resmi</p>
                    </td>
                </tr>

                <!-- ===== TRANSACTION STATUS BANNER ===== -->
                <tr>
                    <td style="padding:0;">
                        @php
                            $isPaid = in_array($transaction->status, ['paid', 'success']);
                            $statusColor = $isPaid ? '#2e7d32' : '#ef6c00';
                            $statusBg = $isPaid ? '#e8f5e9' : '#fff3e0';
                            $statusText = $isPaid ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran';
                        @endphp
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{{ $statusBg }}; border-left: 4px solid {{ $statusColor }};">
                            <tr>
                                <td style="padding: 16px 48px;">
                                    <table cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="vertical-align:middle; padding-right:8px; line-height:1;">
                                                @if($isPaid)
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="{{ $statusColor }}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                                    </svg>
                                                @else
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="{{ $statusColor }}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                                                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                                    </svg>
                                                @endif
                                            </td>
                                            <td style="vertical-align:middle; line-height:1;">
                                                <p style="margin:0; color:{{ $statusColor }}; font-weight:700; font-size:14px; line-height:1;">{{ $statusText }}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- ===== BODY ===== -->
                <tr>
                    <td style="padding: 40px 48px;">

                        <!-- Greeting -->
                        <p style="margin:0 0 8px; font-size:16px; font-weight:600; color:#111;">Halo, {{ $transaction->booker_name ?? $transaction->user->name }}!</p>
                        <p style="margin:0 0 32px; font-size:14px; color:#666; line-height:1.7;">
                            Terima kasih telah mempercayai layanan kami. Berikut adalah ringkasan transaksi Anda.
                        </p>

                        <!-- ===== BOX: Informasi Transaksi ===== -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:24px; overflow:hidden;">
                            <tr>
                                <td style="padding:16px 20px; background:#f1f5f9; border-bottom:1px solid #e5e7eb;">
                                    <table cellpadding="0" cellspacing="0" border="0" style="height:14px;">
                                        <tr>
                                            <td style="vertical-align:middle; padding-right:10px; line-height:1;">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b7280" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                                                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v3h10V5h2v14z"/>
                                                </svg>
                                            </td>
                                            <td style="vertical-align:middle; line-height:1;">
                                                <p style="margin:0; font-size:11px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:1.5px; line-height:1;">Informasi Transaksi</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280; width:40%;">No. Transaksi</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:700; color:#111; font-family:monospace;">#{{ $transaction->id }}</td>
                                        </tr>
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280;">Tanggal Pemesanan</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111;">{{ $transaction->created_at->format('d M Y, H:i') }} WIB</td>
                                        </tr>
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280;">Tipe Pemesanan</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111;">{{ $transaction->booking_type ?? '-' }}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280;">Status Pembayaran</td>
                                            <td style="padding:12px 20px;">
                                                <span style="display:inline-block; background:{{ $statusBg }}; color:{{ $statusColor }}; font-size:11px; font-weight:800; padding:4px 12px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">
                                                    {{ strtoupper($transaction->status) }}
                                                </span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <!-- ===== BOX: Data Pemesan ===== -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:24px; overflow:hidden;">
                            <tr>
                                <td colspan="2" style="padding:16px 20px; background:#f1f5f9; border-bottom:1px solid #e5e7eb;">
                                    <table cellpadding="0" cellspacing="0" border="0" style="height:14px;">
                                        <tr>
                                            <td style="vertical-align:middle; padding-right:10px; line-height:1;">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b7280" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                                                </svg>
                                            </td>
                                            <td style="vertical-align:middle; line-height:1;">
                                                <p style="margin:0; font-size:11px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:1.5px; line-height:1;">Data Pemesan</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280; width:40%;">Nama Lengkap</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:700; color:#111;">{{ $transaction->booker_name ?? $transaction->user->name }}</td>
                                        </tr>
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280;">Email</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111;">{{ $transaction->booker_email ?? $transaction->user->email }}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280;">No. Telepon</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111;">{{ $transaction->booker_phone ?? '-' }}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <!-- ===== BOX: Detail Pemesanan ===== -->
                        @if($transaction->check_in_date)
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:24px; overflow:hidden;">
                            <tr>
                                <td colspan="2" style="padding:16px 20px; background:#f1f5f9; border-bottom:1px solid #e5e7eb;">
                                    <table cellpadding="0" cellspacing="0" border="0" style="height:14px;">
                                        <tr>
                                            <td style="vertical-align:middle; padding-right:10px; line-height:1;">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b7280" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                                                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/>
                                                </svg>
                                            </td>
                                            <td style="vertical-align:middle; line-height:1;">
                                                <p style="margin:0; font-size:11px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:1.5px; line-height:1;">Detail Pemesanan</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280; width:40%;">Check-In</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:700; color:#111;">{{ $transaction->check_in_date ? $transaction->check_in_date->format('d M Y') : '-' }}</td>
                                        </tr>
                                        @if($transaction->check_out_date)
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280;">Check-Out</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111;">{{ $transaction->check_out_date->format('d M Y') }} ({{ $nights }} Malam)</td>
                                        </tr>
                                        @endif
                                        @if($transaction->special_requests)
                                        <tr>
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280;">Permintaan Khusus</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111;">{{ $transaction->special_requests }}</td>
                                        </tr>
                                        @endif
                                    </table>
                                </td>
                            </tr>
                        </table>
                        @endif

                        <!-- ===== BOX: Rincian Pesanan ===== -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:24px; overflow:hidden;">
                            <tr>
                                <td colspan="3" style="padding:16px 20px; background:#f1f5f9; border-bottom:1px solid #e5e7eb;">
                                    <table cellpadding="0" cellspacing="0" border="0" style="height:14px;">
                                        <tr>
                                            <td style="vertical-align:middle; padding-right:10px; line-height:1;">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b7280" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                                                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                                                </svg>
                                            </td>
                                            <td style="vertical-align:middle; line-height:1;">
                                                <p style="margin:0; font-size:11px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:1.5px; line-height:1;">Rincian Pesanan</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <!-- Table Header -->
                            <tr style="border-bottom:1px solid #e5e7eb;">
                                <td style="padding:10px 20px; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Item</td>
                                <td style="padding:10px 20px; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; text-align:center;">Qty</td>
                                <td style="padding:10px 20px; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; text-align:right;">Subtotal</td>
                            </tr>
                            <!-- Main Items -->
                            @foreach($transaction->items as $item)
                            <tr style="border-bottom:1px solid #f3f4f6;">
                                <td style="padding:12px 20px; font-size:13px; color:#111; font-weight:600;">
                                    {{ $item->item->name ?? 'Item' }}
                                    @if($item->guest_names && count($item->guest_names) > 0)
                                        <br><span style="font-size:11px; color:#9ca3af; font-weight:400;">Tamu: {{ implode(', ', $item->guest_names) }}</span>
                                    @endif
                                </td>
                                <td style="padding:12px 20px; font-size:13px; color:#374151; text-align:center;">{{ $item->quantity }}</td>
                                <td style="padding:12px 20px; font-size:13px; color:#111; font-weight:600; text-align:right;">
                                    @php
                                        $itemTotal = $item->subtotal;
                                        // Mirroring logic from handlePrint: multiply by nights for resort items
                                        if ($isResort && str_contains(strtolower($item->item_type ?? ''), 'resort')) {
                                            $itemTotal = $item->subtotal * $nights;
                                        }
                                    @endphp
                                    Rp {{ number_format($itemTotal, 0, ',', '.') }}
                                </td>
                            </tr>
                            @endforeach

                            <!-- Additional Facilities (JSON Array in main transaction) -->
                            @if(!empty($transaction->additional_facilities))
                                @foreach($transaction->additional_facilities as $fac)
                                <tr style="border-bottom:1px solid #f3f4f6;">
                                    <td style="padding:12px 20px; font-size:13px; color:#374151;">{{ $fac['name'] ?? ($fac['label'] ?? 'Fasilitas') }}</td>
                                    <td style="padding:12px 20px; font-size:13px; color:#374151; text-align:center;">1</td>
                                    <td style="padding:12px 20px; font-size:13px; color:#111; font-weight:600; text-align:right;">
                                        @php
                                            $facPrice = $fac['price'] ?? ($fac['amount'] ?? 0);
                                            if ($isResort) $facPrice *= $nights;
                                        @endphp
                                        Rp {{ number_format($facPrice, 0, ',', '.') }}
                                    </td>
                                </tr>
                                @endforeach
                            @endif

                            <!-- Add-Ons (child transactions) -->
                            @if($transaction->addons && $transaction->addons->count() > 0)
                                <tr>
                                    <td colspan="3" style="padding:8px 20px; font-size:11px; font-weight:700; color:#2e7d32; background:#f0f9f0; text-transform:uppercase; letter-spacing:1px; border-top:1px solid #e5e7eb;">Layanan & Fasilitas Tambahan (Add-ons)</td>
                                </tr>
                                @foreach($transaction->addons as $addonOrder)
                                    @if(in_array($addonOrder->status, ['success', 'paid']))
                                        @foreach($addonOrder->items as $addonItem)
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#374151;">{{ $addonItem->item->name ?? 'Fasilitas' }} <span style="font-size:10px; color:#9ca3af; font-style:italic;">(Add-on)</span></td>
                                            <td style="padding:12px 20px; font-size:13px; color:#374151; text-align:center;">{{ $addonItem->quantity }}</td>
                                            <td style="padding:12px 20px; font-size:13px; color:#374151; text-align:right;">Rp {{ number_format($addonItem->subtotal, 0, ',', '.') }}</td>
                                        </tr>
                                        @endforeach
                                    @endif
                                @endforeach
                            @endif

                            <!-- Reschedule Fees -->
                            @php
                                $completedReschedules = $transaction->reschedules ? $transaction->reschedules->where('status', 'completed') : collect();
                            @endphp
                            @if($completedReschedules->count() > 0)
                                <tr>
                                    <td colspan="3" style="padding:8px 20px; font-size:11px; font-weight:700; color:#c2410c; background:#fff7ed; text-transform:uppercase; letter-spacing:1px; border-top:1px solid #e5e7eb;">Penyesuaian Jadwal (Reschedule)</td>
                                </tr>
                                @foreach($completedReschedules as $res)
                                    <tr style="border-bottom:1px solid #f3f4f6;">
                                        <td style="padding:12px 20px; font-size:13px; color:#374151;" colspan="2">
                                            Biaya Perubahan Jadwal<br>
                                            <span style="font-size:11px; color:#9ca3af;">{{ \Carbon\Carbon::parse($res->old_date)->format('d/m/y') }} → {{ \Carbon\Carbon::parse($res->new_date)->format('d/m/y') }}</span>
                                        </td>
                                        <td style="padding:12px 20px; font-size:13px; color:#374151; text-align:right;">Rp {{ number_format($res->final_charge, 0, ',', '.') }}</td>
                                    </tr>
                                @endforeach
                            @endif

                            <!-- Promo Discount -->
                            @if($transaction->promo && $transaction->discount_amount > 0)
                            <tr style="border-bottom:1px solid #f3f4f6;">
                                <td style="padding:12px 20px; font-size:13px; color:#16a34a;" colspan="2">
                                    <table cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="vertical-align:middle; padding-right:6px;">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#16a34a" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M19.74 2.26L16.21 2.5a.755.755 0 0 0-.67.44l-1.37 3.03l-3.03 1.37a.76.76 0 0 0-.44.67l-.24 3.53l-3.53.24a.76.76 0 0 0-.67.44l-1.37 3.03l-3.03 1.37a.755.755 0 0 0-.44.67l-.24 3.53l3.53-.24a.76.76 0 0 0 .67-.44l1.37-3.03l3.03-1.37a.76.76 0 0 0 .44-.67l.24-3.53l3.53-.24a.76.76 0 0 0 .67-.44l1.37-3.03l3.03-1.37a.755.755 0 0 0 .44-.67l.24-3.53zM12 18a6 6 0 1 1 6-6a6 6 0 0 1-6 6z"/>
                                                </svg>
                                            </td>
                                            <td style="vertical-align:middle;">
                                                <span>Promo: {{ $transaction->promo->code }}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td style="padding:12px 20px; font-size:13px; color:#16a34a; font-weight:700; text-align:right;">- Rp {{ number_format($transaction->discount_amount, 0, ',', '.') }}</td>
                            </tr>
                            @endif
                        </table>

                        <!-- ===== BOX: Detail Pembayaran ===== -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:24px; overflow:hidden;">
                            <tr>
                                <td style="padding:16px 20px; background:#f1f5f9; border-bottom:1px solid #e5e7eb;">
                                    <table cellpadding="0" cellspacing="0" border="0" style="height:14px;">
                                        <tr>
                                            <td style="vertical-align:middle; padding-right:10px; line-height:1;">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b7280" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                                                </svg>
                                            </td>
                                            <td style="vertical-align:middle; line-height:1;">
                                                <p style="margin:0; font-size:11px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:1.5px; line-height:1;">Detail Pembayaran</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        @if($transaction->payment_method)
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280; width:50%;">Metode Pembayaran</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111; text-align:right; text-transform:uppercase;">{{ $transaction->payment_method }}</td>
                                        </tr>
                                        @endif
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280;">Subtotal Pesanan</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111; text-align:right;">
                                                @php
                                                    $mainSubtotal = collect($transaction->items)->reduce(function($acc, $item) use ($isResort, $nights) {
                                                        $val = $item->subtotal;
                                                        if ($isResort && str_contains(strtolower($item->item_type ?? ''), 'resort')) {
                                                            $val *= $nights;
                                                        }
                                                        return $acc + $val;
                                                    }, 0);
                                                    
                                                    if (!empty($transaction->additional_facilities)) {
                                                        foreach($transaction->additional_facilities as $fac) {
                                                            $p = $fac['price'] ?? ($fac['amount'] ?? 0);
                                                            if ($isResort) $p *= $nights;
                                                            $mainSubtotal += $p;
                                                        }
                                                    }
                                                @endphp
                                                Rp {{ number_format($mainSubtotal, 0, ',', '.') }}
                                            </td>
                                        </tr>
                                        @php
                                            $addonsTotal = $transaction->addons ? $transaction->addons->whereIn('status', ['success', 'paid'])->sum('total_price') : 0;
                                            $rescTotal = $completedReschedules->sum('final_charge');
                                        @endphp
                                        @if($addonsTotal > 0)
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280;">Layanan Tambahan (Add-ons)</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111; text-align:right;">Rp {{ number_format($addonsTotal, 0, ',', '.') }}</td>
                                        </tr>
                                        @endif
                                        @if($rescTotal > 0)
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280;">Total Biaya Reschedule</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111; text-align:right;">Rp {{ number_format($rescTotal, 0, ',', '.') }}</td>
                                        </tr>
                                        @endif
                                        @if(($transaction->discount_amount ?? 0) > 0)
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#16a34a;">Diskon Promo</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#16a34a; text-align:right;">- Rp {{ number_format($transaction->discount_amount, 0, ',', '.') }}</td>
                                        </tr>
                                        @endif
                                        <!-- Grand Total -->
                                        <tr style="background:#2e7d32;">
                                            <td style="padding:16px 20px; font-size:15px; font-weight:800; color:#ffffff;">TOTAL AKHIR</td>
                                            <td style="padding:16px 20px; font-size:18px; font-weight:800; color:#ffffff; text-align:right;">
                                                @php
                                                    $grandTotal = $mainSubtotal + $addonsTotal + $rescTotal - ($transaction->discount_amount ?? 0);
                                                @endphp
                                                Rp {{ number_format($grandTotal, 0, ',', '.') }}
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <!-- Note -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffbeb; border:1px solid #fde68a; border-radius:12px; margin-bottom:24px;">
                            <tr>
                                <td style="padding:16px 20px;">
                                    <p style="margin:0; font-size:13px; color:#92400e; line-height:1.7;">
                                        <strong>Penting:</strong> Harap simpan email ini sebagai bukti transaksi Anda. 
                                        Tunjukkan e-tiket atau bukti transaksi ini kepada petugas saat tiba di lokasi.
                                    </p>
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>

                <!-- ===== FOOTER ===== -->
                <tr>
                    <td style="background:#f8fafc; border-top:1px solid #e5e7eb; padding:32px 48px; text-align:center;">
                        <p style="margin:0 0 8px; font-size:14px; font-weight:700; color:#374151;">{{ $siteName }}</p>
                        <p style="margin:0 0 4px; font-size:12px; color:#9ca3af;">Jl. Sarjono, Bauman, Ambarawa, Kab. Semarang, Jawa Tengah</p>
                        <p style="margin:0 0 16px; font-size:12px; color:#9ca3af;">{{ $contactEmail }} | 08:00 – 18:00 WIB</p>
                        <p style="margin:0; font-size:11px; color:#d1d5db;">&copy; {{ date('Y') }} {{ $siteName }}. Seluruh hak cipta dilindungi.</p>
                    </td>
                </tr>

            </table><!-- /Main Container -->

        </td>
    </tr>
</table><!-- /Wrapper -->

</body>
</html>
