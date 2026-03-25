import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

const defaultContent = {
    home: {
        heroImage: '/images/hero-bg.png',
        heroBadge: 'WISATA ALAM & RESORT',
        heroTitleLine1: 'Nikmati Keindahan Alam',
        heroTitleLine2: 'Terbaik di Ambarawa',
        heroSubtitle: 'Eling Bening menawarkan pemandangan Rawa Pening yang menakjubkan dengan fasilitas resort mewah, kolam renang, dan restoran berkualitas untuk liburan keluarga Anda.',
        ctaPrimary: 'Pesan Tiket',
        ctaSecondary: 'Pesan Resort',
        // New sections
        discoveryBadge: 'Discovery',
        discoveryTitle: 'Eling Bening: Harmoni Keindahan Alam & Kemewahan',
        discoveryText: 'Eling Bening menghadirkan harmoni antara arsitektur modern yang elegan dengan ketenangan alam pegunungan Ambarawa. Destinasi yang dirancang untuk membangkitkan panca indera dan menenangkan jiwa.',
        
        testimonialBadge: 'Guest Reviews',
        testimonialTitle: 'Apa Kata Mereka?',
        testimonials: [
            { name: "Andi Saputra", quote: "Pemandangannya luar biasa, sangat cocok untuk liburan keluarga. Pelayanannya ramah sekali.", rating: 5 },
            { name: "Siti Rahma", quote: "Tempat favorit saya di Semarang. Makanannya enak dan spot fotonya banyak banget.", rating: 5 },
            { name: "Jessica Lim", quote: "Kolam renangnya keren banget, view-nya nggak kalah sama di Bali. Sangat worth it!", rating: 4 }
        ],
        
        finalCtaTitle: 'Siap Mengunjungi Eling Bening?',
        finalCtaSubtitle: 'Ajak keluarga dan teman Anda untuk menciptakan momen berharga bersama kami. Pesan tiket Anda sekarang untuk menghindari antrian.',
        finalCtaPrimary: 'Beli Tiket Sekarang',
        finalCtaSecondary: 'Reservasi Event',
        finalCtaImage: '/images/hero-bg.png'
    },
    about: {
        heroImage: '/images/hero-bg.png',
        heroTitle: 'Tentang Eling Bening',
        heroDesc: 'Destinasi wisata terpadu yang menggabungkan keindahan pemandangan Rawa Pening dengan fasilitas modern.',
        storyImage: '/images/hero-bg.png',
        storyTitle: 'Sejarah & Visi Kami',
        storyP1: 'Berawal dari kecintaan akan keindahan alam Ambarawa, Eling Pening dibangun untuk menjadi ikon wisata Jawa Tengah yang ramah keluarga.',
        storyP2: 'Kami terus berkomitmen memberikan pelayanan terbaik dan menjaga kelestarian alam sekitar untuk dinikmati generasi mendatang.',
        
        valuesBadge: 'Nilai-Nilai Kami',
        valuesTitle: 'Apa yang Membuat Kami Berbeda',
        values: [
            { icon: "mountain", title: "Pemandangan Megah", desc: "Berada di dataran tinggi memberi kami keuntungan panorama alam yang tidak tertandingi." },
            { icon: "utensils", title: "Kuliner Nusantara", desc: "Matahari terbenam paling indah dinikmati bersama makanan lezat." },
            { icon: "bed-double", title: "Resort Berbintang", desc: "Kami menawarkan akomodasi premium bagi keluarga yang ingin menginap." },
            { icon: "waves", title: "Rekreasi Segala Usia", desc: "Kolam renang infinity, outbound, dan playland anak." }
        ]
    },
    gallery: [
        { src: '/images/hero-bg.png', title: 'Restoran', desc: 'Suasana makan malam romantis.', date: '21/03/2026' },
        { src: '/images/hero-bg.png', title: 'Kolam Renang', desc: 'Kesegaran infinity pool.', date: '22/03/2026' },
        { src: '/images/hero-bg.png', title: 'Garden Party', desc: 'Momen spesial di taman.', date: '23/03/2026' }
    ],
    galleryHeroImage: '/images/hero-bg.png',
    contact: {
        heroImage: '/images/hero-bg.png',
        title: 'Hubungi Kami',
        subtitle: 'Tim kami siap membantu kebutuhan informasi dan reservasi Anda.',
        email: 'info@elingbening.com',
        phone: '+62 812 3456 7890',
        address: 'Jl. Sarjono, Ambarawa, Jawa Tengah, Indonesia',
        supportBadge: 'Informasi Kontak',
        supportTitle: 'Sapa Kami Kapan Saja',
        supportDesc: 'Apakah Anda memiliki pertanyaan? Jangan ragu untuk menghubungi tim layanan pelanggan kami.'
    },
    facilities: [
        { id: 1, name: 'Kolam Renang Infinity', desc: 'Kolam renang dengan pemandangan pegunungan yang menakjubkan.', icon: 'swimming-pool', image: '/images/hero-bg.png' },
        { id: 2, name: 'Restoran & Cafe', desc: 'Hidangan lezat dengan bahan lokal segar dan suasana nyaman.', icon: 'utensils', image: '/images/hero-bg.png' },
        { id: 3, name: 'Taman Bermain', desc: 'Area aman dan menyenangkan untuk aktifitas anak-anak.', icon: 'child', image: '/images/hero-bg.png' },
        { id: 4, name: 'Spot Foto Skydeck', desc: 'Sudut terbaik untuk mengabadikan momen dengan latar Rawa Pening.', icon: 'camera', image: '/images/hero-bg.png' }
    ],
    mapImage: '/images/hero-bg.png',
    eventHeroImage: '/images/hero-bg.png'
};

export const ContentProvider = ({ children }) => {
    const [content, setContent] = useState(defaultContent);
    const [isLoading, setIsLoading] = useState(true);

    const fetchContent = async () => {
        try {
            setIsLoading(true);
            const { data: dbItems } = await axios.get('/api/contents');
            
            // Deep clone to avoid mutating defaultContent reference
            const newContent = JSON.parse(JSON.stringify(defaultContent));
            
            // Map flat DB items to nested context structure
            dbItems.forEach(item => {
                if (item.key === 'home_hero_image') newContent.home.heroImage = item.content;
                if (item.key === 'home_hero_badge') newContent.home.heroBadge = item.content;
                if (item.key === 'home_hero_title_1') newContent.home.heroTitleLine1 = item.content;
                if (item.key === 'home_hero_title_2') newContent.home.heroTitleLine2 = item.content;
                if (item.key === 'home_hero_subtitle') newContent.home.heroSubtitle = item.content;
                if (item.key === 'home_cta_primary') newContent.home.ctaPrimary = item.content;
                if (item.key === 'home_cta_secondary') newContent.home.ctaSecondary = item.content;
                if (item.key === 'home_discovery_badge') newContent.home.discoveryBadge = item.content;
                if (item.key === 'home_discovery_title') newContent.home.discoveryTitle = item.content;
                if (item.key === 'home_discovery_text') newContent.home.discoveryText = item.content;
                if (item.key === 'home_testimonial_badge') newContent.home.testimonialBadge = item.content;
                if (item.key === 'home_testimonial_title') newContent.home.testimonialTitle = item.content;
                if (item.key === 'home_testimonials') newContent.home.testimonials = item.data;
                if (item.key === 'home_final_cta_title') newContent.home.finalCtaTitle = item.content;
                if (item.key === 'home_final_cta_subtitle') newContent.home.finalCtaSubtitle = item.content;
                if (item.key === 'home_final_cta_primary') newContent.home.finalCtaPrimary = item.content;
                if (item.key === 'home_final_cta_secondary') newContent.home.finalCtaSecondary = item.content;
                if (item.key === 'home_final_cta_image') newContent.home.finalCtaImage = item.content;
                
                if (item.key === 'about_hero_image') newContent.about.heroImage = item.content;
                if (item.key === 'about_hero_title') newContent.about.heroTitle = item.content;
                if (item.key === 'about_hero_desc') newContent.about.heroDesc = item.content;
                if (item.key === 'about_story_image') newContent.about.storyImage = item.content;
                if (item.key === 'about_story_title') newContent.about.storyTitle = item.content;
                if (item.key === 'about_story_p1') newContent.about.storyP1 = item.content;
                if (item.key === 'about_story_p2') newContent.about.storyP2 = item.content;
                if (item.key === 'about_values_badge') newContent.about.valuesBadge = item.content;
                if (item.key === 'about_values_title') newContent.about.valuesTitle = item.content;
                if (item.key === 'about_values') newContent.about.values = item.data;
                
                if (item.key === 'contact_hero_image') newContent.contact.heroImage = item.content;
                if (item.key === 'contact_title') newContent.contact.title = item.content;
                if (item.key === 'contact_subtitle') newContent.contact.subtitle = item.content;
                if (item.key === 'contact_email') newContent.contact.email = item.content;
                if (item.key === 'contact_phone') newContent.contact.phone = item.content;
                if (item.key === 'contact_address') newContent.contact.address = item.content;
                if (item.key === 'contact_support_badge') newContent.contact.supportBadge = item.content;
                if (item.key === 'contact_support_title') newContent.contact.supportTitle = item.content;
                if (item.key === 'contact_support_desc') newContent.contact.supportDesc = item.content;
                
                if (item.key === 'global_gallery') newContent.gallery = item.data;
                if (item.key === 'gallery_hero_image') newContent.galleryHeroImage = item.content;
                if (item.key === 'global_facilities') newContent.facilities = item.data;
                if (item.key === 'global_map_image') newContent.mapImage = item.content;
                if (item.key === 'event_hero_image') newContent.eventHeroImage = item.content;
            });
            
            setContent(newContent);
        } catch (error) {
            console.error('Failed to fetch CMS content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const updateContent = (tab, key, value) => {
        setContent(prev => {
            if (!tab) {
                return { ...prev, [key]: value };
            }
            return {
                ...prev,
                [tab]: {
                    ...prev[tab],
                    [key]: value
                }
            };
        });
    };

    const saveToBackend = async () => {
        const loadingToast = toast.loading('Memublikasikan perubahan...');
        try {
            // Flatten nested content to match DB schema
            const bulkPayload = [
                { key: 'home_hero_image', content: content.home.heroImage, type: 'image', page: 'home' },
                { key: 'home_hero_badge', content: content.home.heroBadge, type: 'text', page: 'home' },
                { key: 'home_hero_title_1', content: content.home.heroTitleLine1, type: 'text', page: 'home' },
                { key: 'home_hero_title_2', content: content.home.heroTitleLine2, type: 'text', page: 'home' },
                { key: 'home_hero_subtitle', content: content.home.heroSubtitle, type: 'text', page: 'home' },
                { key: 'home_cta_primary', content: content.home.ctaPrimary, type: 'text', page: 'home' },
                { key: 'home_cta_secondary', content: content.home.ctaSecondary, type: 'text', page: 'home' },
                { key: 'home_discovery_badge', content: content.home.discoveryBadge, type: 'text', page: 'home' },
                { key: 'home_discovery_title', content: content.home.discoveryTitle, type: 'text', page: 'home' },
                { key: 'home_discovery_text', content: content.home.discoveryText, type: 'text', page: 'home' },
                { key: 'home_testimonial_badge', content: content.home.testimonialBadge, type: 'text', page: 'home' },
                { key: 'home_testimonial_title', content: content.home.testimonialTitle, type: 'text', page: 'home' },
                { key: 'home_testimonials', data: content.home.testimonials, type: 'json', page: 'home' },
                { key: 'home_final_cta_title', content: content.home.finalCtaTitle, type: 'text', page: 'home' },
                { key: 'home_final_cta_subtitle', content: content.home.finalCtaSubtitle, type: 'text', page: 'home' },
                { key: 'home_final_cta_primary', content: content.home.finalCtaPrimary, type: 'text', page: 'home' },
                { key: 'home_final_cta_secondary', content: content.home.finalCtaSecondary, type: 'text', page: 'home' },
                { key: 'home_final_cta_image', content: content.home.finalCtaImage, type: 'image', page: 'home' },
                
                { key: 'about_hero_image', content: content.about.heroImage, type: 'image', page: 'about' },
                { key: 'about_hero_title', content: content.about.heroTitle, type: 'text', page: 'about' },
                { key: 'about_hero_desc', content: content.about.heroDesc, type: 'text', page: 'about' },
                { key: 'about_story_image', content: content.about.storyImage, type: 'image', page: 'about' },
                { key: 'about_story_title', content: content.about.storyTitle, type: 'text', page: 'about' },
                { key: 'about_story_p1', content: content.about.storyP1, type: 'text', page: 'about' },
                { key: 'about_story_p2', content: content.about.storyP2, type: 'text', page: 'about' },
                { key: 'about_values_badge', content: content.about.valuesBadge, type: 'text', page: 'about' },
                { key: 'about_values_title', content: content.about.valuesTitle, type: 'text', page: 'about' },
                { key: 'about_values', data: content.about.values, type: 'json', page: 'about' },
                
                { key: 'contact_hero_image', content: content.contact.heroImage, type: 'image', page: 'contact' },
                { key: 'contact_title', content: content.contact.title, type: 'text', page: 'contact' },
                { key: 'contact_subtitle', content: content.contact.subtitle, type: 'text', page: 'contact' },
                { key: 'contact_email', content: content.contact.email, type: 'text', page: 'contact' },
                { key: 'contact_phone', content: content.contact.phone, type: 'text', page: 'contact' },
                { key: 'contact_address', content: content.contact.address, type: 'text', page: 'contact' },
                { key: 'contact_support_badge', content: content.contact.supportBadge, type: 'text', page: 'contact' },
                { key: 'contact_support_title', content: content.contact.supportTitle, type: 'text', page: 'contact' },
                { key: 'contact_support_desc', content: content.contact.supportDesc, type: 'text', page: 'contact' },
                
                { key: 'global_gallery', data: content.gallery, type: 'json', page: 'gallery' },
                { key: 'gallery_hero_image', content: content.galleryHeroImage, type: 'image', page: 'gallery' },
                { key: 'global_facilities', data: content.facilities, type: 'json', page: 'facilities' },
                { key: 'global_map_image', content: content.mapImage, type: 'image', page: 'facilities' },
            ];

            await axios.post('/api/contents/bulk', { contents: bulkPayload });
            toast.success('Website berhasil dipublikasikan!', { id: loadingToast });
        } catch (error) {
            toast.error('Gagal memublikasikan perubahan.', { id: loadingToast });
            console.error(error);
        }
    };

    return (
        <ContentContext.Provider value={{ content, updateContent, isLoading, saveToBackend, refreshContent: fetchContent }}>
            {children}
        </ContentContext.Provider>
    );
};
