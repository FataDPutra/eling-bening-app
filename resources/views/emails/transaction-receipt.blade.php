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
            
            <!-- Main Container -->
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                
                <!-- ===== HEADER ===== -->
                <tr>
                    <td style="background:linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%); padding:40px 48px; text-align:center;">
                        @if($logoUrl)
                            <img src="{{ $logoUrl }}" alt="{{ $siteName }} Logo" style="height:64px; width:auto; object-fit:contain; margin-bottom:20px; display:block; margin-left:auto; margin-right:auto;" />
                        @endif
                        <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:800; letter-spacing:-0.5px;">{{ $siteName }}</h1>
                        <p style="margin:6px 0 0; color:rgba(255,255,255,0.75); font-size:13px; font-weight:500; text-transform: uppercase; letter-spacing: 2px;">Bukti Pemesanan Resmi</p>
                    </td>
                </tr>

                <!-- ===== TRANSACTION STATUS BANNER ===== -->
                <tr>
                    <td style="padding:0;">
                        @php
                            $isPaid = in_array($transaction->status, ['paid', 'success']);
                            $statusColor = $isPaid ? '#2e7d32' : '#ef6c00';
                            $statusBg = $isPaid ? '#e8f5e9' : '#fff3e0';
                            $statusText = $isPaid ? '✅ Pembayaran Berhasil' : '⏳ Menunggu Pembayaran';
                        @endphp
                        <div style="background:{{ $statusBg }}; border-left: 4px solid {{ $statusColor }}; padding: 16px 48px; display: flex; align-items: center;">
                            <p style="margin:0; color:{{ $statusColor }}; font-weight:700; font-size:14px;">{{ $statusText }}</p>
                        </div>
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
                                    <p style="margin:0; font-size:11px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:1.5px;">📋 Informasi Transaksi</p>
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
                                <td style="padding:16px 20px; background:#f1f5f9; border-bottom:1px solid #e5e7eb;">
                                    <p style="margin:0; font-size:11px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:1.5px;">👤 Data Pemesan</p>
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
                                <td style="padding:16px 20px; background:#f1f5f9; border-bottom:1px solid #e5e7eb;">
                                    <p style="margin:0; font-size:11px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:1.5px;">📅 Detail Pemesanan</p>
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
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111;">{{ $transaction->check_out_date->format('d M Y') }}</td>
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
                                <td style="padding:16px 20px; background:#f1f5f9; border-bottom:1px solid #e5e7eb;">
                                    <p style="margin:0; font-size:11px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:1.5px;">🛒 Rincian Pesanan</p>
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
                                        <br><span style="font-size:11px; color:#9ca3af; font-weight:400;">{{ implode(', ', $item->guest_names) }}</span>
                                    @endif
                                </td>
                                <td style="padding:12px 20px; font-size:13px; color:#374151; text-align:center;">{{ $item->quantity }}</td>
                                <td style="padding:12px 20px; font-size:13px; color:#111; font-weight:600; text-align:right;">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                            </tr>
                            @endforeach

                            <!-- Add-Ons (child transactions) -->
                            @if($transaction->addons && $transaction->addons->count() > 0)
                                <tr>
                                    <td colspan="3" style="padding:8px 20px; font-size:11px; font-weight:700; color:#6b7280; background:#f9fafb; text-transform:uppercase; letter-spacing:1px; border-top:1px solid #e5e7eb;">ADD-ONS / Fasilitas Tambahan</td>
                                </tr>
                                @foreach($transaction->addons as $addonOrder)
                                    @foreach($addonOrder->items as $addonItem)
                                    <tr style="border-bottom:1px solid #f3f4f6;">
                                        <td style="padding:12px 20px; font-size:13px; color:#374151;">{{ $addonItem->item->name ?? 'Fasilitas' }}</td>
                                        <td style="padding:12px 20px; font-size:13px; color:#374151; text-align:center;">{{ $addonItem->quantity }}</td>
                                        <td style="padding:12px 20px; font-size:13px; color:#374151; text-align:right;">Rp {{ number_format($addonItem->subtotal, 0, ',', '.') }}</td>
                                    </tr>
                                    @endforeach
                                @endforeach
                            @endif

                            <!-- Reschedule Fees -->
                            @if($transaction->reschedules && $transaction->reschedules->where('reschedule_fee', '>', 0)->count() > 0)
                                <tr>
                                    <td colspan="3" style="padding:8px 20px; font-size:11px; font-weight:700; color:#6b7280; background:#f9fafb; text-transform:uppercase; letter-spacing:1px; border-top:1px solid #e5e7eb;">Biaya Reschedule</td>
                                </tr>
                                @foreach($transaction->reschedules as $res)
                                    @if($res->reschedule_fee > 0)
                                    <tr style="border-bottom:1px solid #f3f4f6;">
                                        <td style="padding:12px 20px; font-size:13px; color:#374151;" colspan="2">Biaya Perubahan Jadwal{{ $res->new_check_in_date ? ' → ' . \Carbon\Carbon::parse($res->new_check_in_date)->format('d M Y') : '' }}</td>
                                        <td style="padding:12px 20px; font-size:13px; color:#374151; text-align:right;">Rp {{ number_format($res->reschedule_fee, 0, ',', '.') }}</td>
                                    </tr>
                                    @endif
                                @endforeach
                            @endif

                            <!-- Promo Discount -->
                            @if($transaction->promo && $transaction->discount_amount > 0)
                            <tr style="border-bottom:1px solid #f3f4f6;">
                                <td style="padding:12px 20px; font-size:13px; color:#16a34a;" colspan="2">🎟️ Promo: {{ $transaction->promo->code }}</td>
                                <td style="padding:12px 20px; font-size:13px; color:#16a34a; font-weight:700; text-align:right;">- Rp {{ number_format($transaction->discount_amount, 0, ',', '.') }}</td>
                            </tr>
                            @endif
                        </table>

                        <!-- ===== BOX: Detail Pembayaran ===== -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:24px; overflow:hidden;">
                            <tr>
                                <td style="padding:16px 20px; background:#f1f5f9; border-bottom:1px solid #e5e7eb;">
                                    <p style="margin:0; font-size:11px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:1.5px;">💳 Detail Pembayaran</p>
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
                                            <td style="padding:12px 20px; font-size:13px; color:#6b7280;">Subtotal Item</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#111; text-align:right;">Rp {{ number_format($transaction->total_price, 0, ',', '.') }}</td>
                                        </tr>
                                        @if(($transaction->discount_amount ?? 0) > 0)
                                        <tr style="border-bottom:1px solid #f3f4f6;">
                                            <td style="padding:12px 20px; font-size:13px; color:#16a34a;">Diskon Promo</td>
                                            <td style="padding:12px 20px; font-size:13px; font-weight:600; color:#16a34a; text-align:right;">- Rp {{ number_format($transaction->discount_amount, 0, ',', '.') }}</td>
                                        </tr>
                                        @endif
                                        <!-- Grand Total -->
                                        <tr style="background:#2e7d32;">
                                            <td style="padding:16px 20px; font-size:15px; font-weight:800; color:#ffffff;">TOTAL PEMBAYARAN</td>
                                            <td style="padding:16px 20px; font-size:18px; font-weight:800; color:#ffffff; text-align:right;">Rp {{ number_format($transaction->total_amount ?? $transaction->total_price, 0, ',', '.') }}</td>
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
                                        ⚠️ <strong>Penting:</strong> Harap simpan email ini sebagai bukti transaksi Anda. 
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
                        <p style="margin:0 0 16px; font-size:12px; color:#9ca3af;">📧 {{ $contactEmail }} | ☎️ 08:00 – 18:00 WIB</p>
                        <p style="margin:0; font-size:11px; color:#d1d5db;">&copy; {{ date('Y') }} {{ $siteName }}. Seluruh hak cipta dilindungi.</p>
                    </td>
                </tr>

            </table><!-- /Main Container -->

        </td>
    </tr>
</table><!-- /Wrapper -->

</body>
</html>
