export const EB_ROOMS_KEY = 'eb_rooms';
export const EB_TICKETS_KEY = 'eb_tickets';
export const EB_BOOKINGS_KEY = 'eb_bookings';
export const EB_PROMOS_KEY = 'eb_promos';
export const EB_RESCHEDULES_KEY = 'eb_reschedules';
export const EB_EXPENSES_KEY = 'eb_expenses';
export const EB_EVENTS_KEY = 'eb_events';

export const DEFAULT_ROOMS = [
    {
        id: 1,
        name: 'Deluxe Mountain View',
        price: 1250000,
        priceWeekend: 1500000,
        capacity: 2,
        stock: 5,
        bed: 'King Bed',
        size: 32,
        desc: 'Kamar dengan panorama gunung yang memukau, dirancang untuk pengalaman menginap yang tenang dan nyaman.',
        amenities: ['WiFi Kecepatan Tinggi', 'Smart TV 43"', 'Pembuat Kopi & Teh', 'AC', 'Kamar Mandi & Air Panas', 'Balkon Pribadi'],
        status: 'available',
        image: '/images/resort-room.png',
    },
    {
        id: 2,
        name: 'Executive Lake Suite',
        price: 1850000,
        priceWeekend: 2150000,
        capacity: 2,
        stock: 2,
        bed: 'King Bed',
        size: 45,
        desc: 'Suite premium menghadap Danau Rawa Pening dengan balkon pribadi dan fasilitas bintang lima.',
        amenities: ['WiFi Kecepatan Tinggi', 'Smart TV 55"', 'Mini Bar', 'Pembuat Kopi & Teh', 'AC', 'Kamar Mandi & Air Panas', 'Balkon Pribadi'],
        status: 'available',
        image: '/images/resort-room.png',
    },
    {
        id: 3,
        name: 'Grand Villa Family',
        price: 3500000,
        priceWeekend: 4200000,
        capacity: 4,
        stock: 0,
        bed: '2 King Bed',
        size: 90,
        desc: 'Villa luas cocok untuk keluarga besar, dengan ruang tamu, dapur kecil, dan pemandangan alam bebas.',
        amenities: ['WiFi Kecepatan Tinggi', 'Smart TV 65"', 'Private Pool', 'Full Kitchen', 'AC', 'Kamar Mandi & Air Panas', 'Balkon Pribadi'],
        status: 'full',
        image: '/images/resort-room.png',
    },
];

export const DEFAULT_TICKETS = [
    {
        id: 1,
        name: 'Tiket Masuk Reguler (Weekday)',
        price: 25000,
        priceWeekend: 30000,
        days: 'Weekday',
        desc: 'Akses penuh area wisata, wahana air, dan parkir gratis. Berlaku Senin – Jumat.',
        status: 'active',
    },
    {
        id: 2,
        name: 'Tiket Masuk Reguler (Weekend)',
        price: 30000,
        priceWeekend: 35000,
        days: 'Weekend',
        desc: 'Akses penuh area wisata, wahana air, dan parkir gratis. Berlaku Sabtu & Minggu.',
        status: 'active',
    },
    {
        id: 3,
        name: 'Paket Promo Rombongan (>20 org)',
        price: 20000,
        priceWeekend: 20000,
        days: 'Semua Hari',
        desc: 'Khusus grup ≥20 orang, termasuk pemandu wisata gratis dan area piknik eksklusif.',
        status: 'inactive',
    },
];

export const DEFAULT_BOOKINGS = [
    {
        id: 'EB-TICK-982134',
        itemName: 'Tiket Masuk Reguler (Weekend)',
        date: '2026-03-20T00:00:00.000Z',
        name: 'Budi Santoso',
        total: 120000,
        status: 'success'
    },
    {
        id: 'EB-RES-556123',
        itemName: 'Deluxe Mountain View',
        date: '2026-04-10T00:00:00.000Z',
        name: 'Budi Santoso',
        total: 1375000,
        status: 'success'
    },
    {
        id: 'EB-TICK-334211',
        itemName: 'Tiket Masuk Reguler (Weekday)',
        date: '2026-03-15T00:00:00.000Z',
        name: 'Siti Aminah',
        total: 50000,
        status: 'success'
    }
];

export const DEFAULT_EXPENSES = [
    {
        id: 1,
        date: '2026-03-10',
        title: 'Pembelian Bahan Makanan Resto',
        amount: 5000000,
        category: 'Operasional',
        note: 'Stok mingguan'
    },
    {
        id: 2,
        date: '2026-03-12',
        title: 'Maintenance Kolam Renang',
        amount: 2500000,
        category: 'Pemeliharaan',
        note: 'Pembersihan rutin'
    }
];

export const DEFAULT_PROMOS = [
    {
        id: 1,
        code: 'EBNEW2026',
        name: 'Promo Pengunjung Baru',
        discount: 15,
        type: 'percentage',
        minPurchase: 50000,
        status: 'active',
        expiry: '2026-12-31'
    },
    {
        id: 2,
        code: 'LIBURANSERU',
        name: 'Diskon Liburan Sekolah',
        discount: 25000,
        type: 'fixed',
        minPurchase: 200000,
        status: 'active',
        expiry: '2026-07-15'
    }
];

export const DEFAULT_RESCHEDULES = [
    {
        id: 1,
        bookingId: 'EB-TICK-982134',
        customerName: 'Budi Santoso',
        itemName: 'Tiket Masuk Reguler (Weekend)',
        oldDate: '2026-03-20',
        newDate: '2026-03-27',
        reason: 'Ada acara keluarga mendadak',
        status: 'pending',
        requestDate: '2026-03-12T10:30:00Z'
    },
    {
        id: 2,
        bookingId: 'EB-RES-556123',
        customerName: 'Siti Aminah',
        itemName: 'Deluxe Mountain View',
        oldDate: '2026-04-10',
        newDate: '2026-04-15',
        reason: 'Perubahan jadwal cuti kantor',
        status: 'approved',
        requestDate: '2026-03-11T14:20:00Z'
    }
];

export const DEFAULT_EVENTS = [
    {
        id: 1,
        name: 'Wedding: Sunset Romance',
        category: 'Wedding',
        date: '2026-06-15',
        price: 'Mulai Rp 25jt',
        image: '/images/generated/event.png',
        desc: 'Paket pernikahan eksklusif dengan latar belakang Danau Rawa Pening saat matahari terbenam.',
        status: 'active'
    },
    {
        id: 2,
        name: 'Corporate Gathering Package',
        category: 'Gathering',
        date: 'Available Daily',
        price: 'Rp 150rb / pax',
        image: '/images/generated/event.png',
        desc: 'Fasilitas lengkap untuk gathering perusahaan, outbound, dan team building.',
        status: 'active'
    },
    {
        id: 3,
        name: 'Music Festival: Eling Harmony',
        category: 'Concert',
        date: '2026-08-20',
        price: 'Rp 100.000',
        image: '/images/generated/event.png',
        desc: 'Konser musik tahunan yang menghadirkan artis nasional di panggung terbuka.',
        status: 'active'
    }
];

export function getRooms() {
    try {
        const stored = localStorage.getItem(EB_ROOMS_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_ROOMS;
    } catch { return DEFAULT_ROOMS; }
}

export function saveRooms(rooms) {
    localStorage.setItem(EB_ROOMS_KEY, JSON.stringify(rooms));
}

export function getTickets() {
    try {
        const stored = localStorage.getItem(EB_TICKETS_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_TICKETS;
    } catch { return DEFAULT_TICKETS; }
}

export function saveTickets(tickets) {
    localStorage.setItem(EB_TICKETS_KEY, JSON.stringify(tickets));
}

export function getBookings() {
    try {
        const stored = localStorage.getItem(EB_BOOKINGS_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_BOOKINGS;
    } catch { return DEFAULT_BOOKINGS; }
}

export function saveBookings(bookings) {
    localStorage.setItem(EB_BOOKINGS_KEY, JSON.stringify(bookings));
}

export function getPromos() {
    try {
        const stored = localStorage.getItem(EB_PROMOS_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_PROMOS;
    } catch { return DEFAULT_PROMOS; }
}

export function savePromos(promos) {
    localStorage.setItem(EB_PROMOS_KEY, JSON.stringify(promos));
}

export function getReschedules() {
    try {
        const stored = localStorage.getItem(EB_RESCHEDULES_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_RESCHEDULES;
    } catch { return DEFAULT_RESCHEDULES; }
}

export function saveReschedules(reschedules) {
    localStorage.setItem(EB_RESCHEDULES_KEY, JSON.stringify(reschedules));
}

export function getExpenses() {
    try {
        const stored = localStorage.getItem(EB_EXPENSES_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_EXPENSES;
    } catch { return DEFAULT_EXPENSES; }
}

export function saveExpenses(expenses) {
    localStorage.setItem(EB_EXPENSES_KEY, JSON.stringify(expenses));
}

export function getEvents() {
    try {
        const stored = localStorage.getItem(EB_EVENTS_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_EVENTS;
    } catch { return DEFAULT_EVENTS; }
}

export function saveEvents(events) {
    localStorage.setItem(EB_EVENTS_KEY, JSON.stringify(events));
}

export function formatRupiah(n) {
    return 'Rp ' + Number(n).toLocaleString('id-ID');
}
