<!DOCTYPE html>
<html>
<head>
    <title>Pemberitahuan Admin</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: #16a34a; color: white; padding: 10px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; text-align: center; color: #777; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
        th { width: 40%; color: #555; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>{{ $type }}</h2>
        </div>
        <div class="content">
            <p>Halo Admin,</p>
            <p>Terdapat pemberitahuan baru terkait aktivitas di sistem Eling Bening:</p>
            
            <table>
                @foreach ($data as $key => $value)
                    <tr>
                        <th>{{ ucwords(str_replace('_', ' ', $key)) }}</th>
                        <td>{{ $value }}</td>
                    </tr>
                @endforeach
            </table>

            <p style="margin-top: 20px;">
                Silakan periksa dashboard admin untuk detail lebih lanjut.
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Eling Bening. Pesan ini dikirim secara otomatis.
        </div>
    </div>
</body>
</html>
