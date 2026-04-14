import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Eye, X, Check, Calendar, User, CreditCard, ChevronRight, Info, ShoppingCart, Clock, ArrowUpRight, ArrowRight, DollarSign, LayoutGrid, Download, MessageSquare, Quote, Star, CheckCircle2, Ticket, DoorOpen, DoorClosed, Plus, Minus, BedDouble, Bed, Utensils, Coffee, Package, Gamepad2 } from 'lucide-react';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import { useContent } from '../../context/ContentContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Bookings() {
    const { content } = useContent();
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [isAllTime, setIsAllTime] = useState(false);
    const [resortFilter, setResortFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all'); // all, resort, addon
    
    // Addon states
    const [isAddingAddon, setIsAddingAddon] = useState(false);
    const [addonFacilities, setAddonFacilities] = useState([]);
    const [addonQuantities, setAddonQuantities] = useState({});
    const [isSubmittingAddon, setIsSubmittingAddon] = useState(false);

    const months = [
        { name: 'Januari', value: 1 }, { name: 'Februari', value: 2 }, { name: 'Maret', value: 3 },
        { name: 'April', value: 4 }, { name: 'Mei', value: 5 }, { name: 'Juni', value: 6 },
        { name: 'Juli', value: 7 }, { name: 'Agustus', value: 8 }, { name: 'September', value: 9 },
        { name: 'Oktober', value: 10 }, { name: 'November', value: 11 }, { name: 'Desember', value: 12 }
    ];

    const fetchBookings = async () => {
        try {
            const period = isAllTime ? 'all' : selectedMonth;
            const res = await axios.get(`/api/transactions?month=${period}&year=${selectedYear}&include_addons=1`);
            // Load both resort and addon types
            const relevantBookings = (res.data || []).filter(b => ['RESORT', 'ADDON'].includes(b.booking_type));
            setBookings(relevantBookings);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
            toast.error("Gagal memuat data transaksi");
            setIsLoading(false);
        }
    };

    const handleCheckAction = async (action) => {
        try {
            const res = await axios.post(`/api/transactions/${selectedBooking.id}/${action}`);
            toast.success(`Berhasil ${action}!`);
            setSelectedBooking(res.data.data);
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || `Gagal ${action}`);
        }
    };

    const fetchAddonFacilities = async () => {
        try {
            const res = await axios.get('/api/addon-facilities');
            setAddonFacilities(res.data);
            const initialQuantities = {};
            res.data.forEach(f => initialQuantities[f.id] = 0);
            setAddonQuantities(initialQuantities);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddAddon = async () => {
        const orderItems = Object.entries(addonQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({ item_id: parseInt(id), quantity: qty }));

        if (orderItems.length === 0) {
            toast.error('Pilih minimal 1 fasilitas.');
            return;
        }

        setIsSubmittingAddon(true);
        try {
            await axios.post(`/api/transactions/${selectedBooking.id}/addons`, {
                items: orderItems,
                payment_method: 'automated'
            });
            
            // Close modal FIRST so it doesn't block the Swal alert
            setIsAddingAddon(false);
            setAddonQuantities({});

            await Swal.fire({
                title: 'Berhasil!',
                text: 'Fasilitas tambahan berhasil ditambahkan ke bill tamu.',
                icon: 'success',
                confirmButtonColor: '#2E7D32',
                customClass: { popup: 'rounded-[1.5rem]' }
            });

            // Refresh detail
            const res = await axios.get(`/api/transactions/${selectedBooking.id}`);
            setSelectedBooking(res.data);
            fetchBookings();
        } catch (err) {
            Swal.fire({
                title: 'Gagal!',
                text: err.response?.data?.message || 'Terjadi kesalahan saat menambahkan fasilitas.',
                icon: 'error',
                customClass: { popup: 'rounded-[1.5rem]' }
            });
        } finally {
            setIsSubmittingAddon(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchAddonFacilities(); // Ensure we have the facility names for lookup
    }, [selectedMonth, selectedYear, isAllTime]);

    // Re-fetch booking detail when selected to get fresh addon items
    useEffect(() => {
        if (selectedBooking?.id) {
            axios.get(`/api/transactions/${selectedBooking.id}`)
                .then(res => {
                    // Only update if it's still the same booking
                    setSelectedBooking(prev => prev?.id === res.data.id ? res.data : prev);
                })
                .catch(err => console.error("Detail fetch failed", err));
        }
    }, [selectedBooking?.id]);

    const uniqueResortNames = Array.from(new Set(
        bookings.map(b => b.items?.[0]?.item?.name).filter(Boolean)
    ));

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.user && b.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

        const matchesResort = resortFilter === 'all'
            ? true
            : b.items?.some(item => item.item?.name === resortFilter);

        const isAddon = b.booking_type === 'ADDON' || b.id.startsWith('ADD-');
        const isResort = b.booking_type === 'RESORT' || b.id.startsWith('EB-RES-');

        const matchesType = typeFilter === 'all' 
            ? true 
            : (typeFilter === 'resort' ? isResort : isAddon);

        return matchesSearch && matchesStatus && matchesResort && matchesType;
    });

    const getStatusStyles = (status) => {
        if (status === 'paid' || status === 'success') return 'bg-success/10 text-success border-success/20';
        if (status === 'pending') return 'bg-warning/10 text-warning border-warning/20';
        return 'bg-danger/10 text-danger border-danger/20';
    };

    const getGrandTotal = (booking) => {
        const basePr = Number(booking.total_price || 0);
        const addPr = (booking.addons?.filter(a => ['paid', 'success'].includes(a.status)).reduce((acc, curr) => acc + Number(curr.total_price || 0), 0) || 0);
        const rescPr = (booking.reschedules?.filter(r => r.status === 'completed').reduce((acc, curr) => acc + Number(curr.final_charge || 0), 0) || 0);
        return basePr + addPr + rescPr;
    };

    const handleExport = () => {
        if (filteredBookings.length === 0) {
            toast.error("Tidak ada data untuk diekspor");
            return;
        }

        const periodTitle = isAllTime ? 'TOTAL SEMUA PERIODE' : `${months.find(m => m.value === selectedMonth).name.toUpperCase()} ${selectedYear}`;
        const exportDate = new Date().toLocaleString('id-ID');
        const totalRevenue = filteredBookings.filter(b => b.status === 'success' || b.status === 'paid').reduce((acc, curr) => acc + getGrandTotal(curr), 0);

        const csvRows = [
            [`"LAPORAN PESANAN RESORT - ELING BENING"`],
            [`"PERIODE: ${periodTitle}"`],
            [`"TANGGAL EKSPOR: ${exportDate}"`],
            [''],
            ['Order ID', 'Customer Name', 'Email', 'Phone', 'Check-in', 'Check-out', 'Total (IDR)', 'Status'],
            ...filteredBookings.map(b => [
                b.id,
                `"${b.booker_name || b.user?.name || 'Guest'}"`,
                b.booker_email || b.user?.email || '-',
                `'${b.booker_phone || '-'}`, // Use ' to force string in Excel
                new Date(b.check_in_date).toLocaleDateString('id-ID'),
                b.check_out_date ? new Date(b.check_out_date).toLocaleDateString('id-ID') : '-',
                getGrandTotal(b),
                b.status.toUpperCase()
            ].join(',')),
            [''],
            ['', '', '', '', '', 'TOTAL OMSET:', totalRevenue, '']
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        const fileName = isAllTime ? 'Laporan_Resort_Semua_Periode.csv' : `Laporan_Resort_${months.find(m => m.value === selectedMonth).name}_${selectedYear}.csv`;
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Data laporan berhasil diekspor');
    };

    const handlePrint = (booking) => {
        if (!booking) return;
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Gagal membuka jendela cetak. Pastikan popup tidak diblokir oleh browser.");
            return;
        }

        try {
            const checkIn = booking.check_in_date ? new Date(booking.check_in_date) : new Date();
            const checkOut = booking.check_out_date ? new Date(booking.check_out_date) : null;
            const nights = checkOut ? Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 1;
            const safeNights = nights > 0 ? nights : 1;
            
            let resortPriceSum = 0;
            let facilitiesSum = 0;
            let allAddons = booking.addons || [];
            
            const isResort = booking.booking_type === 'RESORT';
            
            // 1. Process Main Items
            (booking.items || []).forEach(item => {
                const sub = Number(item.subtotal || 0);
                if (isResort && item.item_type?.includes('Resort')) {
                    resortPriceSum += sub * safeNights;
                } else {
                    resortPriceSum += sub;
                }
            });

            // 2. Process Main Facilities (from JSON/Array field)
            let f = booking.additional_facilities || booking.facilities || [];
            if (typeof f === 'string') try { f = JSON.parse(f); } catch(e) { f = []; }
            facilitiesSum = (Array.isArray(f) ? f : []).reduce((acc, curr) => acc + ( (isResort) ? Number(curr.price || curr.amount || 0) * safeNights : Number(curr.price || curr.amount || 0) ), 0);

            // 3. Process Linked Addon Transactions (Mirroring Admin Detail view)
            let combinedAddonItems = [];
            allAddons.forEach(addon => {
                if (addon.status === 'success' || addon.status === 'paid') {
                    (addon.items || []).forEach(ai => {
                        combinedAddonItems.push({
                            name: ai.item?.name || 'Layanan Tambahan',
                            qty: ai.quantity || 1,
                            sub: Number(ai.subtotal || 0)
                        });
                        facilitiesSum += Number(ai.subtotal || 0);
                    });
                }
            });

            const discountAmount = Number(booking.discount_amount || 0);
            const totalPrice = Number(booking.total_price || 0) + allAddons.reduce((acc, curr) => (curr.status === 'success' || curr.status === 'paid') ? acc + Number(curr.total_price || 0) : acc, 0);
            const netBeforeTax = resortPriceSum + facilitiesSum - discountAmount;
            const taxAmount = Math.max(0, totalPrice - netBeforeTax);

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Invoice - ${booking.id}</title>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; align-items: center; }
                            .logo-container img { height: 60px; object-contain: contain; }
                            .invoice-info { text-align: right; }
                            .invoice-info h1 { margin: 0; color: #1a1a1a; font-size: 20px; }
                            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                            .details h3 { font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 10px; }
                            .details p { margin: 0; font-weight: 600; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                            th { background: #f9f9f9; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #666; border-bottom: 1px solid #eee; }
                            td { padding: 12px; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
                            .totals { margin-left: auto; width: 330px; }
                            .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
                            .total-row.grand { border-top: 2px solid #2e7d32; margin-top: 10px; padding-top: 15px; font-weight: 900; font-size: 18px; color: #2e7d32; }
                            .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 2px; }
                            @media print {
                                body { padding: 0; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="logo-container">
                                <img src="${content?.layout?.logo || '/images/logo.png'}" alt="Logo" />
                            </div>
                            <div class="invoice-info">
                                <h1>INVOICE ${isResort ? 'RESORT' : 'LAYANAN'}</h1>
                                <p style="font-size: 12px; color: #666;">ID: #${booking.id}</p>
                            </div>
                        </div>
                        
                        <div class="details">
                            <div>
                                <h3>Dipesan Oleh</h3>
                                <p>${booking.booker_name || booking.user?.name || 'Guest'}</p>
                                <p style="font-weight: 400; font-size: 12px;">${booking.booker_email || booking.user?.email || '-'}</p>
                                <p style="font-weight: 400; font-size: 12px;">${booking.booker_phone || '-'}</p>
                            </div>
                            <div style="text-align: right;">
                                <h3>Jadwal Kunjungan</h3>
                                <p>${checkIn.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                ${checkOut ? `<p style="font-weight: 400; font-size: 12px;">s/d ${checkOut.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (${safeNights} Malam)</p>` : ''}
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Item Deskripsi</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(booking.items || []).map(it => `
                                    <tr>
                                        <td>${it.item?.name || 'Item Pesanan'}</td>
                                        <td style="text-align: center;">${it.quantity || 1}</td>
                                        <td style="text-align: right;">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(isResort && it.item_type?.includes('Resort') ? Number(it.subtotal || 0) * safeNights : Number(it.subtotal || 0))}</td>
                                    </tr>
                                `).join('')}
                                ${(Array.isArray(f) ? f : []).map(fac => `
                                    <tr>
                                        <td>${fac.name || fac.label}</td>
                                        <td style="text-align: center;">1</td>
                                        <td style="text-align: right;">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(isResort ? Number(fac.price || fac.amount || 0) * safeNights : Number(fac.price || fac.amount || 0))}</td>
                                    </tr>
                                `).join('')}
                                ${combinedAddonItems.map(ai => `
                                    <tr>
                                        <td>${ai.name} <span style="font-size: 9px; opacity: 0.6; font-style: italic;">(Add-on)</span></td>
                                        <td style="text-align: center;">${ai.qty}</td>
                                        <td style="text-align: right;">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ai.sub)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div class="totals">
                            <div class="total-row">
                                <span>Harga Unit Resort</span>
                                <span>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(resortPriceSum)}</span>
                            </div>
                            ${facilitiesSum > 0 ? `
                                <div class="total-row">
                                    <span>Fasilitas Tambahan</span>
                                    <span>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(facilitiesSum)}</span>
                                </div>
                            ` : ''}
                            <div class="total-row">
                                <span>Pajak Pemerintah (10%)</span>
                                <span>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(taxAmount)}</span>
                            </div>
                            ${discountAmount > 0 ? `
                                <div class="total-row" style="color: #2e7d32; font-weight: bold;">
                                    <span>Potongan Promo</span>
                                    <span>- ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(discountAmount)}</span>
                                </div>
                            ` : ''}
                            <div class="total-row grand">
                                <span>TOTAL BAYAR</span>
                                <span>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPrice)}</span>
                            </div>
                            <div class="total-row" style="margin-top: 10px; font-size: 10px; opacity: 0.6;">
                                <span>Metode Pembayaran</span>
                                <span>${booking.payment_method?.toUpperCase() || 'MIDTRANS'}</span>
                            </div>
                        </div>

                        <div class="footer">
                            Terima Kasih Atas Kunjungan Anda<br>
                            Eling Bening - Ambarawa, Indonesia
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            
            let printed = false;
            // Wait for resources to load
            printWindow.onload = function() {
                if (!printed) {
                    printed = true;
                    printWindow.focus();
                    printWindow.print();
                }
            };

            // Fallback if onload doesn't fire
            setTimeout(() => {
                if (printWindow && !printed) {
                    printed = true;
                    printWindow.focus();
                    printWindow.print();
                }
            }, 1000);

        } catch (error) {
            console.error("Print Error:", error);
            toast.error("Terjadi kesalahan saat menyiapkan invoice.");
            printWindow.close();
        }
    };

    const getItemIcon = (itemName = '') => {
        const name = itemName.toLowerCase();
        if (name.includes('bed') || name.includes('kasur')) return <Bed size={18} />;
        if (name.includes('breakfast') || name.includes('makan') || name.includes('lunch') || name.includes('dinner')) return <Utensils size={18} />;
        if (name.includes('coffee') || name.includes('kopi') || name.includes('minum')) return <Coffee size={18} />;
        if (name.includes('resort') || name.includes('villa') || name.includes('room')) return <BedDouble size={18} />;
        if (name.includes('pool') || name.includes('renang')) return <LayoutGrid size={18} />;
        if (name.includes('game') || name.includes('play')) return <Gamepad2 size={18} />;
        return <Package size={18} />;
    };

    const stats = [
        { label: 'Total Transaksi', value: filteredBookings.length, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Dikonfirmasi', value: filteredBookings.filter(b => b.status === 'success' || b.status === 'paid').length, icon: Check, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        { label: 'Menunggu', value: filteredBookings.filter(b => b.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
        { label: 'Pendapatan', value: formatRupiah(filteredBookings.filter(b => b.status === 'success' || b.status === 'paid').reduce((acc, curr) => acc + getGrandTotal(curr), 0)), icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    ];

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-black text-admin-text-main tracking-tight">Registry Transaksi & Reservasi</h1>
                    <p className="text-xs md:text-sm text-admin-text-muted font-bold">Monitoring arus kas masuk, verifikasi status pemesanan, dan audit log transaksi pelanggan secara real-time.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center md:justify-end gap-3 w-full md:w-auto shrink-0">
                    <div className="relative w-full sm:w-auto">
                        <button 
                            onClick={() => setShowMonthPicker(!showMonthPicker)}
                            className="flex items-center gap-3 px-6 py-2.5 rounded-xl border border-admin-border bg-white text-admin-text-main font-black text-[10px] uppercase tracking-widest hover:bg-admin-bg transition-all shadow-sm w-full sm:min-w-[200px] h-[45px]"
                        >
                            <Calendar size={16} className="text-admin-primary" /> {isAllTime ? 'Total Semua' : `${months.find(m => m.value === selectedMonth).name} ${selectedYear}`}
                        </button>

                        {showMonthPicker && (
                            <>
                                <div className="fixed inset-0 z-[1000]" onClick={() => setShowMonthPicker(false)}></div>
                                <div className="absolute right-0 sm:right-0 mt-2 w-full sm:w-80 bg-white rounded-2xl shadow-2xl border border-admin-border p-5 z-[1001] animate-scale-up">
                                    <button 
                                        onClick={() => {
                                            setIsAllTime(true);
                                            setShowMonthPicker(false);
                                        }}
                                        className={`w-full py-3 mb-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            isAllTime 
                                            ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20' 
                                            : 'bg-admin-bg text-admin-text-muted hover:bg-admin-border'
                                        }`}
                                    >
                                        Lihat Total Semua
                                    </button>
                                    
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-admin-border">
                                        <button onClick={() => { setSelectedYear(y => y - 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><ChevronRight size={14} className="rotate-180" /></button>
                                        <span className="font-black text-admin-text-main text-xs">{selectedYear}</span>
                                        <button onClick={() => { setSelectedYear(y => y + 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><ChevronRight size={14} /></button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {months.map(m => (
                                            <button 
                                                key={m.value}
                                                onClick={() => {
                                                    setSelectedMonth(m.value);
                                                    setIsAllTime(false);
                                                    setShowMonthPicker(false);
                                                }}
                                                className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                                    !isAllTime && selectedMonth === m.value 
                                                    ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20' 
                                                    : 'hover:bg-admin-bg text-admin-text-muted'
                                                }`}
                                            >
                                                {m.name.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <button onClick={handleExport} className="btn-primary py-2.5 shadow-lg shadow-admin-primary/20 h-[45px] w-full sm:w-auto">
                        <Download size={18} /> Export Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="admin-card group hover:scale-[1.02] transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-black text-admin-text-main">{stat.value}</h3>
                            </div>
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} ${stat.border} border flex items-center justify-center shadow-inner`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-table-container">
                <div className="table-header-actions mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-admin-primary/10 text-admin-primary">
                            <ShoppingCart size={18} />
                        </div>
                        <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Riwayat Transaksi</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                            <select 
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full sm:w-auto bg-admin-bg border border-admin-border rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest text-admin-text-main focus:outline-none focus:border-admin-primary shadow-sm min-w-[150px]"
                            >
                                <option value="all">Semua Jenis</option>
                                <option value="resort">Reservasi Resort</option>
                                <option value="addon">Fasilitas Tambahan</option>
                            </select>

                            <select 
                                value={resortFilter}
                                onChange={(e) => setResortFilter(e.target.value)}
                                className="w-full sm:w-auto bg-admin-bg border border-admin-border rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest text-admin-text-main focus:outline-none focus:border-admin-primary shadow-sm min-w-[150px]"
                            >
                                <option value="all">Semua Resort</option>
                                {uniqueResortNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                            <input
                                type="text"
                                placeholder="Cari ID atau pelanggan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all shadow-sm"
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-6 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all cursor-pointer shadow-sm uppercase"
                            >
                                <option value="all">Semua Status</option>
                                <option value="success">Berhasil</option>
                                <option value="paid">Dibayar</option>
                                <option value="pending">Menunggu</option>
                                <option value="failed">Gagal/Batal</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Transaksi</th>
                                <th>Pelanggan Utama</th>
                                <th>Tanggal Inap</th>
                                <th>Total Bersih</th>
                                <th>Info Kedatangan</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center text-admin-text-muted font-bold animate-pulse">
                                        Auditing registry records...
                                    </td>
                                </tr>
                            ) : filteredBookings.map(booking => (
                                <tr key={booking.id} className="group">
                                    <td>
                                        <div className="font-black text-admin-primary text-[10px] uppercase tracking-widest">#{booking.id}</div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-admin-bg border border-admin-border flex items-center justify-center text-admin-text-muted">
                                                <User size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="font-black text-admin-text-main text-sm uppercase tracking-tight">{booking.booker_name || booking.user?.name || 'Guest User'}</div>
                                                <span className="text-[10px] text-admin-text-muted font-bold tracking-wider">{booking.booker_email || booking.user?.email || 'No Email'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2.5 text-xs font-bold text-admin-text-muted">
                                            <div className="w-8 h-8 rounded-lg bg-admin-bg border border-admin-border flex items-center justify-center text-admin-primary">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <div className="leading-none">{new Date(booking.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                                {booking.booking_type === 'RESORT' && booking.check_out_date && (
                                                    <div className="text-[9px] opacity-50 font-black mt-1 uppercase tracking-tighter">s/d {new Date(booking.check_out_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                                )}
                                                {booking.booking_type !== 'RESORT' && (
                                                    <div className="text-[9px] opacity-50 font-black mt-1 uppercase tracking-tighter whitespace-nowrap">{booking.booking_type} PASS</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-admin-text-main">{formatRupiah(getGrandTotal(booking))}</span>
                                            <span className="text-[9px] font-bold text-admin-text-light uppercase tracking-widest mt-0.5">Payment Final</span>
                                        </div>
                                    </td>
                                    <td>
                                        {booking.stay_status === 'checked_in' ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 text-blue-600 rounded-xl border border-blue-100 animate-pulse-slow">
                                                <DoorOpen size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Sudah Check-in</span>
                                            </div>
                                        ) : booking.stay_status === 'checked_out' ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl border border-slate-200">
                                                <Check size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Selesai</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest italic opacity-30">Belum Datang</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex flex-col gap-1">
                                            <span className={`badge-status ${getStatusStyles(booking.status)}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusStyles(booking.status).includes('success') ? 'bg-success' : 'bg-warning'}`} />
                                                <span className="uppercase">{booking.status}</span>
                                            </span>
                                            {booking.stay_status && booking.stay_status !== 'pending' && (
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border self-start uppercase tracking-widest ${booking.stay_status === 'checked_in' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                    {booking.stay_status === 'checked_in' ? 'Resident' : 'Checked Out'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex justify-start gap-2">
                                            <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-main flex items-center justify-center hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all shadow-sm" title="Inspect Order" onClick={() => setSelectedBooking(booking)}><Eye size={16} /></button>
                                            <button 
                                                className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-main flex items-center justify-center hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all shadow-sm" 
                                                title="Download Invoice"
                                                onClick={() => handlePrint(booking)}
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredBookings.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-admin-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-admin-text-light/20">
                            <LayoutGrid size={40} />
                        </div>
                        <h4 className="text-sm font-black text-admin-text-muted uppercase tracking-widest">No matching records found</h4>
                    </div>
                )}
            </div>

            {/* Booking Detail Modal (High-Fidelity) via Portal */}
            {selectedBooking && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-8">
                    {/* Dark & Blurred Backdrop - Full Viewport */}
                    <div 
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl transition-all duration-500"
                        style={{ WebkitBackdropFilter: 'blur(20px)' }}
                        onClick={() => setSelectedBooking(null)}
                    ></div>

                    {/* Modal Card - Premium Shadow & Glassmorphism border */}
                    <div className="bg-white w-full max-w-5xl rounded-3xl lg:rounded-[2.5rem] overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row relative z-10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] animate-scale-up border border-white/20 max-h-[90vh]">
                        
                        {/* Close Button - Consistent mobile access */}
                        <button 
                            onClick={() => setSelectedBooking(null)} 
                            className="absolute top-4 right-4 lg:top-8 lg:right-8 z-[30] w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/90 backdrop-blur-sm hover:bg-red-800 hover:text-white text-admin-text-muted flex items-center justify-center transition-all shadow-lg border border-admin-border active:scale-90 group"
                        >
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        {/* Status Sidebar (Left) */}
                        <div className="lg:w-[32%] bg-admin-bg p-6 sm:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-admin-border flex flex-col">
                            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-admin-primary/10 text-admin-primary flex items-center justify-center mb-6 lg:mb-8 shadow-inner ring-1 ring-admin-primary/20">
                                <ShoppingCart size={28} />
                            </div>
                            
                            <div className="mb-6 lg:mb-8 font-black">
                                <span className="text-[10px] text-admin-text-muted uppercase tracking-[0.3em] mb-2 block leading-none text-left">ID Transaksi</span>
                                <h2 className="text-xl lg:text-2xl text-admin-text-main tracking-tighter uppercase drop-shadow-sm text-left">#{selectedBooking.id}</h2>
                            </div>

                            <div className="space-y-4 lg:space-y-6 flex-1">
                                <div className="p-4 lg:p-5 rounded-2xl bg-white border border-admin-border shadow-sm group hover:border-admin-primary/30 transition-all">
                                    <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest mb-2 block">Status Pembayaran</span>
                                    <div className={`px-4 py-3 rounded-xl border-2 border-dashed font-black uppercase text-center text-xs tracking-widest transition-all ${getStatusStyles(selectedBooking.status)}`}>
                                        {selectedBooking.status.toUpperCase()}
                                    </div>
                                </div>

                                <div className="p-4 lg:p-5 rounded-2xl bg-white border border-admin-border shadow-sm group hover:border-admin-primary/30 transition-all">
                                    <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest mb-2 block leading-none">Status Kehadiran</span>
                                    <div className={`px-4 py-3 rounded-xl font-black uppercase text-center text-[10px] tracking-widest transition-all ${
                                        selectedBooking.stay_status === 'checked_in' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
                                        selectedBooking.stay_status === 'checked_out' ? 'bg-slate-50 text-slate-500 border border-slate-200' : 
                                        'bg-admin-bg text-admin-text-muted border border-admin-border opacity-50'
                                    }`}>
                                        {selectedBooking.stay_status || 'Waiting'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-dashed border-admin-border space-y-4">
                                {(selectedBooking.status === 'success' || selectedBooking.status === 'paid') && (
                                    <button
                                        onClick={() => handlePrint(selectedBooking)}
                                        className="w-full py-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-2xl border border-emerald-100 transition-all duration-300 flex items-center justify-center gap-3 group shadow-sm"
                                    >
                                        <div className="p-2 rounded-lg bg-white/50 group-hover:bg-emerald-500 shadow-inner">
                                            <Download size={18} />
                                        </div>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Cetak Invoice</span>
                                            <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1">Struk Transaksi</span>
                                        </div>
                                    </button>
                                )}
                                
                                {selectedBooking.status === 'success' || selectedBooking.status === 'paid' ? (
                                    <div className="space-y-4">
                                        {selectedBooking.stay_status === 'pending' && (
                                            <button
                                                onClick={() => handleCheckAction('check-in')}
                                                className="group relative w-full h-20 lg:h-24 rounded-2xl lg:rounded-[2rem] bg-eling-green hover:bg-green-700 transition-all duration-500 shadow-xl overflow-hidden active:scale-95"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                                
                                                <div className="relative flex flex-col items-center justify-center h-full text-white">
                                                    <div className="p-1.5 rounded-full bg-white/20 mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                                        <DoorOpen size={24} />
                                                    </div>
                                                    <div className="flex flex-col items-center leading-none">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Check-In</span>
                                                        <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1">Konfirmasi Datang</span>
                                                    </div>
                                                </div>
                                            </button>
                                        )}
                                        {selectedBooking.stay_status === 'checked_in' && (
                                            <button
                                                onClick={() => handleCheckAction('check-out')}
                                                className="group relative w-full h-20 lg:h-24 rounded-2xl lg:rounded-[2rem] bg-slate-900 hover:bg-black transition-all duration-500 shadow-xl overflow-hidden active:scale-95"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                                                <div className="relative flex flex-col items-center justify-center h-full text-white">
                                                    <div className="p-1.5 rounded-full bg-white/10 mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                                        <DoorClosed size={24} />
                                                    </div>
                                                    <div className="flex flex-col items-center leading-none">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Check-Out</span>
                                                        <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest mt-1">Selesai Sesi</span>
                                                    </div>
                                                </div>
                                            </button>
                                        )}
                                        {selectedBooking.stay_status === 'checked_out' && (
                                            <div className="w-full py-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] flex flex-col items-center justify-center gap-2">
                                                <CheckCircle2 size={24} className="opacity-20" />
                                                <span>Session Selesai</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-2xl bg-danger/5 border border-danger/10 text-center">
                                        <Clock size={24} className="mx-auto text-danger mb-2 opacity-30" />
                                        <span className="text-[10px] font-black text-danger uppercase tracking-[0.2em]">Menunggu Pembayaran</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Area (Right) */}
                        <div className="lg:w-[68%] p-6 sm:p-8 lg:p-14 lg:overflow-y-auto bg-white custom-scrollbar relative">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-1.5 h-12 bg-admin-primary rounded-full" />
                                <div className="text-left">
                                    <h3 className="text-xl lg:text-2xl font-black text-admin-text-main uppercase tracking-tight">Rincian Reservasi</h3>
                                    <p className="text-[10px] text-admin-text-muted font-bold uppercase tracking-widest mt-1">Dibuat pada {new Date(selectedBooking.created_at).toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12 text-left items-start">
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4 flex items-center gap-2 leading-none"><User size={12}/> Informasi Pemesan</h4>
                                        <div className="p-6 rounded-2xl bg-admin-bg border border-admin-border shadow-inner">
                                            <p className="text-sm font-black text-admin-text-main uppercase mb-1 truncate">{selectedBooking.booker_name || selectedBooking.user?.name || 'Guest'}</p>
                                            <p className="text-[10px] text-admin-text-light font-bold uppercase tracking-widest truncate">{selectedBooking.booker_email || selectedBooking.user?.email || '-'}</p>
                                            {selectedBooking.booker_phone && (
                                                <div className="mt-3 pt-3 border-t border-admin-border flex items-center gap-2 leading-none">
                                                    <span className="text-[10px] font-black text-admin-primary tracking-widest uppercase">Telp: {selectedBooking.booker_phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {selectedBooking.booking_type === 'RESORT' && selectedBooking.stay_status !== 'checked_out' && (
                                        <div className="pt-2">
                                            <button 
                                                onClick={() => {
                                                    fetchAddonFacilities();
                                                    setIsAddingAddon(true);
                                                }}
                                                className="w-full py-3 bg-admin-primary/10 text-admin-primary rounded-xl border border-admin-primary/20 text-[10px] font-black uppercase tracking-widest hover:bg-admin-primary hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={14} /> Admin: Tambah Fasilitas
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4 flex items-center gap-2 leading-none"><Calendar size={12}/> Jadwal Kunjungan</h4>
                                        <div className="p-6 rounded-2xl bg-admin-bg border border-admin-border shadow-inner">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-tight">
                                                    <span className="text-admin-text-muted leading-none underline decoration-admin-primary/20">Check-In</span>
                                                    <span className="text-admin-text-main">{new Date(selectedBooking.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                </div>
                                                {selectedBooking.check_out_date && (
                                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-tight">
                                                        <span className="text-admin-text-muted leading-none underline decoration-eling-red/20">Check-Out</span>
                                                        <span className="text-admin-text-main">{new Date(selectedBooking.check_out_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                )}
                                                {selectedBooking.booking_type === 'RESORT' && selectedBooking.arrival_time && (
                                                    <div className="mt-2 pt-2 border-t border-admin-border flex justify-between items-center text-[10px] font-black uppercase text-admin-primary">
                                                        <span>Estimasi Tiba</span>
                                                        <span className="tracking-widest">{selectedBooking.arrival_time}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedBooking.special_requests && (
                                        <div>
                                            <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4 flex items-center gap-2 leading-none"><MessageSquare size={12}/> Permintaan Khusus</h4>
                                            <div className="p-8 rounded-[2rem] bg-amber-50 border-2 border-dashed border-amber-200 relative group">
                                                <div className="absolute top-4 right-6 opacity-5 select-none">
                                                    <Quote size={48} className="text-amber-900" />
                                                </div>
                                                <p className="text-sm font-bold text-amber-900 leading-relaxed italic relative z-10">
                                                    "{selectedBooking.special_requests}"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <section className="mb-12">
                                <h4 className="text-[10px] font-black text-admin-text-main uppercase tracking-widest mb-6 flex justify-between items-center text-left">
                                    Detail Item Pesanan
                                    <span className="w-12 h-px bg-admin-border" />
                                </h4>
                                <div className="space-y-4">
                                    {(selectedBooking.items || []).map((tItem, idx) => (
                                        <div key={idx} className="bg-admin-bg border border-admin-border rounded-2xl p-6 flex flex-col gap-4 group hover:bg-white transition-all text-left">
                                            <div className={`flex items-center justify-between ${selectedBooking.booking_type === 'RESORT' ? 'cursor-pointer hover:opacity-80' : ''}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-12 rounded-xl bg-white border border-admin-border flex items-center justify-center text-admin-primary shadow-sm overflow-hidden shrink-0">
                                                        {selectedBooking.booking_type === 'RESORT' && tItem.item?.gallery?.[0] ? (
                                                            <img src={tItem.item.gallery[0]} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            getItemIcon(tItem.item?.name || '')
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-black text-admin-text-main uppercase">{tItem.item?.name || 'Unknown Item'}</span>
                                                        {selectedBooking.booking_type === 'RESORT' && tItem.item && (
                                                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 opacity-70">
                                                                {tItem.item.bed_type && <span className="text-[8px] text-admin-text-muted font-bold uppercase italic">{tItem.item.bed_type}</span>}
                                                                <span className="text-[8px] text-admin-text-muted font-bold uppercase tracking-wide">• {tItem.item.capacity || 2} Tamu</span>
                                                                {tItem.item.room_size && <span className="text-[8px] text-admin-text-muted font-bold uppercase tracking-wide">• {tItem.item.room_size} m&sup2;</span>}
                                                            </div>
                                                        )}
                                                        <div className="text-[9px] font-bold text-admin-text-muted uppercase tracking-widest flex items-center gap-2 mt-1">
                                                            <span>{tItem.item_type.split('\\').pop()}</span>
                                                            <span className="w-1 h-1 bg-admin-border rounded-full" />
                                                            <span>{formatRupiah(tItem.price)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-admin-text-main leading-none">x{tItem.quantity}</div>
                                                    <div className="text-[10px] font-bold text-admin-text-muted mt-1 tabular-nums">{formatRupiah(tItem.subtotal)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Linked Addons Display */}
                                    {selectedBooking.addons?.length > 0 && selectedBooking.addons.map((addon, aIdx) => (
                                        addon.items?.map((aItem, aiIdx) => (
                                            <div key={`addon-${aIdx}-${aiIdx}`} className="bg-admin-bg border border-admin-border border-dashed rounded-2xl p-6 flex flex-col gap-4 group hover:bg-white transition-all text-left">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-12 rounded-xl bg-white border border-admin-border flex items-center justify-center text-admin-primary shadow-sm overflow-hidden shrink-0">
                                                            {getItemIcon(aItem.item?.name || '')}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-admin-text-main uppercase">{aItem.item?.name || 'Layanan Tambahan'}</span>
                                                                <span className="text-[8px] font-black bg-admin-primary text-white px-1.5 py-0.5 rounded italic">ADD-ON</span>
                                                            </div>
                                                            <div className="text-[9px] font-bold text-admin-text-muted uppercase tracking-widest flex items-center gap-2 mt-1">
                                                                <span className="font-black text-admin-primary">#{addon.id}</span>
                                                                <span className="w-1 h-1 bg-admin-border rounded-full" />
                                                                <span>{formatRupiah(aItem.price)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-black text-admin-text-main leading-none">x{aItem.quantity}</div>
                                                        <div className="text-[10px] font-bold text-admin-text-muted mt-1 tabular-nums">{formatRupiah(aItem.subtotal)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ))}
                                </div>
                            </section>

                            <section className="mb-10">
                                <h4 className="text-[10px] font-black text-admin-text-main uppercase tracking-widest mb-10 flex justify-between items-center text-left">
                                    Laporan Rekapitulasi Keuangan
                                    <span className="w-12 h-px bg-admin-border" />
                                </h4>
                                <div className="space-y-8 text-left">
                                    <div className="p-6 bg-admin-bg rounded-3xl border border-admin-border group hover:bg-white transition-all shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-1 h-4 bg-admin-primary rounded-full"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-main">1. Reservasi Utama (Awal)</span>
                                        </div>
                                        <div className="space-y-3">
                                            {/* Item & Facility Audit Breakdown */}
                                            <div className="space-y-3 mb-6">
                                                {(() => {
                                                    const hasDates = selectedBooking.check_in_date && selectedBooking.check_out_date;
                                                    const nights = (hasDates && selectedBooking.booking_type === 'RESORT')
                                                        ? Math.ceil(Math.abs(new Date(selectedBooking.check_out_date) - new Date(selectedBooking.check_in_date)) / (1000 * 60 * 60 * 24)) 
                                                        : 1;
                                                    const isResort = selectedBooking.booking_type === 'RESORT';
                                                    
                                                    const itemsList = selectedBooking.items?.map((tItem, i) => {
                                                        const visualSubtotal = (isResort && tItem.item_type?.includes('Resort')) 
                                                            ? Number(tItem.subtotal) * nights 
                                                            : Number(tItem.subtotal);

                                                        return (
                                                            <div key={`item-${i}`} className="flex justify-between text-[11px] font-bold text-admin-text-main border-b border-admin-border/20 pb-2">
                                                                <div className="flex flex-col">
                                                                    <span className="opacity-90">{tItem.item?.name || 'Item'} x{tItem.quantity}</span>
                                                                    {isResort && (
                                                                        <span className="text-[8px] text-admin-text-muted mt-1 italic flex items-center gap-1">
                                                                            <Clock size={10} /> {nights} Malam (Stay) • {formatRupiah(tItem.subtotal)} / malam
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="tabular-nums font-black text-admin-text-main">{formatRupiah(visualSubtotal)}</span>
                                                            </div>
                                                        );
                                                    });

                                                    let facilitiesRaw = selectedBooking.additional_facilities || selectedBooking.facilities || [];
                                                    if (typeof facilitiesRaw === 'string') {
                                                        try { facilitiesRaw = JSON.parse(facilitiesRaw); } catch(e) { facilitiesRaw = []; }
                                                    }
                                                    
                                                    const facilitiesList = (Array.isArray(facilitiesRaw) ? facilitiesRaw : []).map((fac, i) => {
                                                        const facPrice = Number(fac.price || fac.amount || 0);
                                                        const totalFacPrice = (isResort) ? facPrice * nights : facPrice;

                                                        return (
                                                            <div key={`fac-${i}`} className="flex justify-between text-[11px] font-bold text-admin-text-main border-b border-admin-border/20 pb-2">
                                                                <div className="flex flex-col">
                                                                    <span className="opacity-90">• {fac.name || fac.label || 'Fasilitas Tambahan'}</span>
                                                                    {isResort && (
                                                                        <span className="text-[8px] text-admin-text-muted mt-0.5 italic flex items-center gap-1">
                                                                            {nights} Malam • {formatRupiah(facPrice)} / malam
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="tabular-nums font-black text-admin-text-main">{formatRupiah(totalFacPrice)}</span>
                                                            </div>
                                                        );
                                                    });

                                                    return <>{itemsList}{facilitiesList}</>;
                                                })()}
                                            </div>

                                            <div className="pt-4 space-y-3 bg-gray-50/50 p-5 rounded-[1.5rem] border border-admin-border/50">
                                                <div className="flex justify-between text-xs font-bold text-admin-text-muted mb-2 border-b border-admin-border/30 pb-2">
                                                    <span className="uppercase tracking-widest text-[9px] opacity-60">Audit Keseimbangan Nilai</span>
                                                    <span className="tabular-nums">Nilai</span>
                                                </div>

                                                {(() => {
                                                    const totalPrice = Number(selectedBooking.total_price || 0);
                                                    const discountAmount = Number(selectedBooking.discount_amount || 0);
                                                    const hasDates = selectedBooking.check_in_date && selectedBooking.check_out_date;
                                                    const nights = (hasDates && selectedBooking.booking_type === 'RESORT')
                                                        ? Math.ceil(Math.abs(new Date(selectedBooking.check_out_date) - new Date(selectedBooking.check_in_date)) / (1000 * 60 * 60 * 24)) 
                                                        : 1;
                                                    const isResort = selectedBooking.booking_type === 'RESORT';

                                                    // Calculate explicit sums
                                                    const resortPriceSum = (selectedBooking.items?.reduce((acc, curr) => acc + ( (isResort && curr.item_type?.includes('Resort')) ? Number(curr.subtotal) * nights : Number(curr.subtotal) ), 0) || 0);
                                                    
                                                    let f = selectedBooking.additional_facilities || selectedBooking.facilities || [];
                                                    if (typeof f === 'string') try { f = JSON.parse(f); } catch(e) { f = []; }
                                                    const facilitiesSum = (Array.isArray(f) ? f : []).reduce((acc, curr) => acc + ( (isResort) ? Number(curr.price || curr.amount || 0) * nights : Number(curr.price || curr.amount || 0) ), 0);

                                                    // The rest is Tax (Total - (Resort + Fac - Discount))
                                                    const netBeforeTax = resortPriceSum + facilitiesSum - discountAmount;
                                                    const taxAmount = totalPrice - netBeforeTax;

                                                    return (
                                                        <>
                                                            <div className="flex justify-between text-xs font-bold text-admin-text-main">
                                                                <span className="opacity-60 font-medium tracking-tight">
                                                                    {isResort ? `Harga Unit Resort (${nights} Malam)` : 'Harga Layanan/Fasilitas'}
                                                                </span>
                                                                <span className="tabular-nums">{formatRupiah(resortPriceSum)}</span>
                                                            </div>

                                                            {facilitiesSum > 0 && (
                                                                <div className="flex justify-between text-xs font-bold text-admin-text-main">
                                                                    <span className="opacity-60 font-medium tracking-tight">Layanan & Fasilitas Tambahan</span>
                                                                    <span className="tabular-nums">{formatRupiah(facilitiesSum)}</span>
                                                                </div>
                                                            )}

                                                            <div className="flex justify-between text-xs font-bold text-admin-text-main pt-2 border-t border-admin-border/10">
                                                                <span className="opacity-60 font-medium">Pajak Pemerintah & Layanan (10%)</span>
                                                                <span className="tabular-nums">{formatRupiah(taxAmount)}</span>
                                                            </div>

                                                            {discountAmount > 0 && (
                                                                <div className="flex justify-between text-xs font-bold text-emerald-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/30 mt-2">
                                                                    <span className="font-bold uppercase tracking-widest text-[9px]">Potongan Promo / Diskon</span>
                                                                    <span className="tabular-nums">- {formatRupiah(discountAmount)}</span>
                                                                </div>
                                                            )}

                                                            <div className="flex justify-between pt-6 border-t border-admin-border/50 font-black text-admin-text-main">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase tracking-wider">Total Akhir Tagihan</span>
                                                                    <span className="text-[8px] opacity-40 font-bold uppercase tracking-widest mt-1">Metode: {selectedBooking.payment_method}</span>
                                                                </div>
                                                                <span className="text-emerald-600 text-3xl tabular-nums tracking-tighter">{formatRupiah(totalPrice)}</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. LAYANAN MENUNGGU PEMBAYARAN (PENDING EXTRA BILLS) */}
                                    {selectedBooking.addons?.some(a => a.status === 'pending') && (
                                        <div className="p-6 bg-amber-50/20 rounded-3xl border border-amber-100 group hover:bg-white transition-all shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">2. Layanan Menunggu Pembayaran (Unpaid)</span>
                                            </div>
                                            <div className="space-y-4">
                                                {selectedBooking.addons?.filter(a => a.status === 'pending').map(addon => (
                                                    <div key={addon.id} className="pb-3 border-b border-amber-50 last:border-0 last:pb-0">
                                                        <div className="flex justify-between text-[11px] font-black text-amber-700 mb-2">
                                                            <div className="flex flex-col">
                                                                <span className="opacity-60 text-[8px] uppercase tracking-widest mb-0.5">ID Tagihan: #{addon.id}</span>
                                                                <span className="text-amber-900 font-bold">
                                                                    {(() => {
                                                                        const rawItems = addon.items || [];
                                                                        const jsonItems = Array.isArray(addon.additional_facilities) ? addon.additional_facilities : [];
                                                                        const combined = [...rawItems, ...jsonItems];
                                                                        
                                                                        if (combined.length === 0 && addon.total_price > 0) return 'Layanan Tambahan (Diproses)';
                                                                        return combined.map(it => it.item?.name || addonFacilities.find(f => f.id === (it.item_id || it.id))?.name || it.name || 'Fasilitas').filter(Boolean).join(', ') || 'Pending Service';
                                                                    })()}
                                                                </span>
                                                            </div>
                                                            <span className="tabular-nums font-black">{formatRupiah(addon.total_price)}</span>
                                                        </div>
                                                        <div className="space-y-3 mt-4 border-t border-amber-100/50 pt-4">
                                                            {(() => {
                                                                const rawItems = addon.items || [];
                                                                const jsonItems = Array.isArray(addon.additional_facilities) ? addon.additional_facilities : [];
                                                                const combined = [...rawItems, ...jsonItems];

                                                                if (combined.length > 0) {
                                                                    return combined.map((it, idx) => (
                                                                        <div key={idx} className="flex flex-col gap-1">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-[11px] font-black text-amber-900 uppercase">
                                                                                    {it.item?.name || addonFacilities.find(f => f.id === (it.item_id || it.id))?.name || it.name || 'Fasilitas'}
                                                                                </span>
                                                                                <span className="text-[11px] font-black text-amber-900">{formatRupiah(it.subtotal || (it.price * (it.quantity || 1)))}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-700/50 uppercase tracking-widest">
                                                                                <ShoppingCart size={10} /> {it.quantity || 1} Unit • {formatRupiah(it.price || (addon.total_price / (it.quantity || 1)))} / unit
                                                                            </div>
                                                                        </div>
                                                                    ));
                                                                }
                                                                
                                                                return (
                                                                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/50">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-[10px] font-black text-amber-900 uppercase italic">Detail Otomatis (Rp {formatRupiah(addon.total_price)})</span>
                                                                            <span className="text-[10px] font-black text-amber-900">{formatRupiah(addon.total_price)}</span>
                                                                        </div>
                                                                        <div className="text-[9px] font-bold text-amber-700/60 mt-1 uppercase">Layanan diproses via Admin/User</div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. LAYANAN SUDAH TERBAYAR (LUNAS) */}
                                    {selectedBooking.addons?.some(a => ['paid', 'success'].includes(a.status)) && (
                                        <div className="p-6 bg-blue-50/10 rounded-3xl border border-blue-100 group hover:bg-white transition-all shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">3. Layanan Terbayar & Lunas (Extra)</span>
                                            </div>
                                            <div className="space-y-4">
                                                {selectedBooking.addons?.filter(a => ['paid', 'success'].includes(a.status)).map(addon => (
                                                    <div key={addon.id} className="pb-4 border-b border-blue-50 last:border-0 last:pb-0">
                                                        <div className="flex justify-between text-[11px] font-black text-admin-text-main mb-1">
                                                            <div className="flex flex-col text-left">
                                                                <span className="opacity-40 text-[8px] uppercase tracking-widest mb-0.5">ID Tagihan: #{addon.id}</span>
                                                                <span className="text-gray-900 font-bold">
                                                                    {(() => {
                                                                        const rawItems = addon.items || [];
                                                                        const jsonItems = Array.isArray(addon.additional_facilities) ? addon.additional_facilities : [];
                                                                        const combined = [...rawItems, ...jsonItems];
                                                                        
                                                                        if (combined.length === 0) return 'Layanan Lunas';
                                                                        return combined.map(it => it.item?.name || addonFacilities.find(f => f.id === (it.item_id || it.id))?.name || it.name || 'Fasilitas').filter(Boolean).join(', ') || 'Service Paid';
                                                                    })()}
                                                                </span>
                                                            </div>
                                                            <span className="text-blue-600 tabular-nums font-black">{formatRupiah(addon.total_price)}</span>
                                                        </div>
                                                        <div className="space-y-3 mt-4 border-t border-blue-100 pt-4">
                                                            {(() => {
                                                                const rawItems = addon.items || [];
                                                                const jsonItems = Array.isArray(addon.additional_facilities) ? addon.additional_facilities : [];
                                                                const combined = [...rawItems, ...jsonItems];

                                                                if (combined.length > 0) {
                                                                    return combined.map((it, idx) => (
                                                                        <div key={idx} className="flex flex-col gap-1">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-[11px] font-black text-admin-text-main uppercase">
                                                                                    {it.item?.name || addonFacilities.find(f => f.id === (it.item_id || it.id))?.name || it.name || 'Fasilitas'}
                                                                                </span>
                                                                                <span className="text-sm font-black text-admin-text-main">{formatRupiah(it.subtotal || (it.price * (it.quantity || 1)))}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-admin-text-muted uppercase tracking-widest">
                                                                                <Check size={12} className="text-blue-500" /> {it.quantity || 1} Unit x {formatRupiah(it.price || (addon.total_price / (it.quantity || 1)))}
                                                                            </div>
                                                                        </div>
                                                                    ));
                                                                }
                                                                
                                                                return (
                                                                    <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-[10px] font-black text-blue-800 uppercase italic">Detail Lunas (Rp {formatRupiah(addon.total_price)})</span>
                                                                            <span className="text-sm font-black text-blue-800">{formatRupiah(addon.total_price)}</span>
                                                                        </div>
                                                                        <div className="text-[9px] font-bold text-blue-600/70 mt-1 uppercase tracking-widest flex items-center gap-1">
                                                                            <Check size={10} /> Terbayar via Sistem
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedBooking.reschedules?.some(r => r.status === 'completed') && (
                                        <div className="p-6 bg-orange-50/10 rounded-3xl border border-orange-100 group hover:bg-white transition-all shadow-sm">
                                            <div className="flex items-center gap-3 mb-4"><div className="w-1 h-4 bg-orange-500 rounded-full"></div><span className="text-[10px] font-black uppercase tracking-widest text-orange-600">4. Biaya Perubahan Jadwal</span></div>
                                            <div className="space-y-4">
                                                {selectedBooking.reschedules?.filter(r => r.status === 'completed').map((r, i) => (
                                                    <div key={i} className="pb-3 border-b border-orange-50 last:border-0 last:pb-0">
                                                        <div className="flex justify-between text-[11px] font-black text-admin-text-main mb-2"><span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg text-[8px]">LUNAS</span><span className="text-orange-600 tabular-nums">{formatRupiah(r.final_charge)}</span></div>
                                                        <div className="space-y-1 opacity-70">
                                                            {r.price_diff > 0 && <div className="flex justify-between text-[10px] font-bold text-admin-text-muted"><span>Selisih Harga</span><span className="tabular-nums">{formatRupiah(r.price_diff)}</span></div>}
                                                            {r.admin_fee > 0 && <div className="flex justify-between text-[10px] font-bold text-admin-text-muted"><span>Biaya Admin</span><span className="tabular-nums">{formatRupiah(r.admin_fee)}</span></div>}
                                                            {r.penalty_fee > 0 && <div className="flex justify-between text-[10px] font-bold text-admin-text-muted"><span>Denda Dibatalkan</span><span className="tabular-nums">{formatRupiah(r.penalty_fee)}</span></div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. Total Akhir Keseluruhan (Grand Total) */}
                                    <div className="mt-12 bg-slate-950 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-admin-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-8 relative z-10 text-left">
                                            <div className="text-center sm:text-left">
                                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-2">Total Harga</p>
                                                <h5 className="text-[9px] font-black text-white/60 uppercase tracking-widest leading-none">Akumulasi Seluruh Pembayaran Lunas</h5>
                                            </div>
                                            <div className="text-center sm:text-right">
                                                <span className="text-5xl font-black tracking-tighter tabular-nums text-white drop-shadow-2xl">
                                                    {formatRupiah(getGrandTotal(selectedBooking))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Admin Addon Order Modal via Portal */}
            {isAddingAddon && createPortal(
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                    {/* Dark & Blurred Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl transition-all duration-500"
                        style={{ WebkitBackdropFilter: 'blur(20px)' }}
                        onClick={() => setIsAddingAddon(false)}
                    ></div>

                    {/* Modal Card */}
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 lg:p-10 relative z-10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] flex flex-col border border-white/20 animate-scale-up max-h-[90vh]">
                        <button 
                            onClick={() => setIsAddingAddon(false)} 
                            className="absolute top-8 right-8 text-admin-text-muted hover:text-admin-text-main hover:rotate-90 transition-all duration-300"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-8 text-left">
                            <div className="w-14 h-14 bg-admin-primary/10 text-admin-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-admin-primary/20">
                                <Plus size={24} />
                            </div>
                            <h3 className="text-xl font-black text-admin-text-main uppercase tracking-tight">Manual Add-on Order</h3>
                            <p className="text-[10px] font-bold text-admin-text-muted mt-2 uppercase tracking-widest opacity-60">Pilih fasilitas tambahan untuk bill tamu.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {addonFacilities.map(f => (
                                <div key={f.id} className="p-4 bg-admin-bg rounded-2xl border border-admin-border flex items-center justify-between group hover:bg-white hover:border-admin-primary/20 transition-all shadow-sm">
                                    <div className="flex-1 text-left">
                                        <h5 className="font-black text-admin-text-main text-xs uppercase tracking-tight">{f.name}</h5>
                                        <p className="text-[10px] font-black text-admin-primary mt-1 tabular-nums">{formatRupiah(f.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl border border-admin-border shadow-inner">
                                        <button 
                                            onClick={() => setAddonQuantities({...addonQuantities, [f.id]: Math.max(0, (addonQuantities[f.id] || 0) - 1)})}
                                            className="w-8 h-8 rounded-lg bg-admin-bg flex items-center justify-center text-admin-text-muted hover:bg-red-50 hover:text-danger transition-colors active:scale-90"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-5 text-center font-black text-xs text-admin-text-main tabular-nums">{addonQuantities[f.id] || 0}</span>
                                        <button 
                                            onClick={() => setAddonQuantities({...addonQuantities, [f.id]: (addonQuantities[f.id] || 0) + 1})}
                                            className="w-8 h-8 rounded-lg bg-admin-bg flex items-center justify-center text-admin-text-muted hover:bg-green-50 hover:text-success transition-colors active:scale-90"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-admin-border border-dashed">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.3em] opacity-60">Estimasi Tagihan</span>
                                <span className="text-2xl font-black text-admin-text-main tabular-nums underline underline-offset-8 decoration-admin-primary/20">
                                    {formatRupiah(addonFacilities.reduce((acc, f) => acc + (f.price * (addonQuantities[f.id] || 0)), 0))}
                                </span>
                            </div>
                            <button 
                                onClick={handleAddAddon}
                                disabled={isSubmittingAddon}
                                className="w-full py-5 bg-admin-primary text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-admin-primary/20 flex items-center justify-center gap-3 group disabled:opacity-50 text-[10px] uppercase tracking-[0.3em]"
                            >
                                <ShoppingCart size={16} className="group-hover:bounce" />
                                {isSubmittingAddon ? 'Memproses...' : 'Tambahkan Ke Bill'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
