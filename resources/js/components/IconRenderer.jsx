import React from 'react';
import {
    Plus, Edit, Trash2, Search, ConciergeBell, LayoutGrid, X,
    Package, ShoppingBasket, Check, ChevronDown, Loader2,
    Bed, Bath, ShowerHead, Wind, Tv, Wifi, Lightbulb, Lamp, DoorOpen, Lock,
    Coffee, Utensils, Soup, Pizza, GlassWater, Wine, Beer, IceCream, Cake,
    Waves, Trees, Mountain, Flame, Tent, Flower, Sun, Moon, Cloud, Fish,
    Dumbbell, Trophy, Gamepad2, Music, Mic2, Puzzle, Bike, Clover,
    Car, ParkingCircle, Bus, Bike as BikeIcon, Building2, Stethoscope, Zap, Contact, MapPin, Compass, Sparkles,
    UtensilsCrossed, Monitor, AirVent, Fan, Refrigerator, Smartphone, Tablet, Laptop,
    Mic, Music2, Camera, Video, MonitorPlay, Heart, Brain, Library,
    Droplet, Brush,
    Users, Maximize, User, UserCircle, Square
} from 'lucide-react';

// ─── CUSTOM ICONS (For missing ones in older Lucide versions) ───────────────
const CustomSoap = ({ size, className }) => (
    <svg 
        width={size} height={size} viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
        className={className}
    >
        <path d="M7 11c.88 0 1.6-.72 1.6-1.6 0-.88-.72-1.6-1.6-1.6s-1.6.72-1.6 1.6c0 .88.72 1.6 1.6 1.6Z" />
        <path d="M12 7c.88 0 1.6-.72 1.6-1.6 0-.88-.72-1.6-1.6-1.6s-1.6.72-1.6 1.6c0 .88.72 1.6 1.6 1.6Z" />
        <rect x="2" y="11" width="20" height="10" rx="3" />
    </svg>
);

// ─── ICON MAPPING ───────────────────────────────────────────────────────────
const ICON_MAP = {
    Bed, Bath, ShowerHead, Wind, Tv, Wifi, Lightbulb, Lamp, DoorOpen, Lock,
    Coffee, Utensils, Soup, Pizza, GlassWater, Wine, Beer, IceCream, Cake,
    Waves, Trees, Mountain, Flame, Tent, Flower, Sun, Moon, Cloud, Fish,
    Dumbbell, Trophy, Gamepad2, Music, Mic2, Puzzle, Bike, Clover,
    Car, ParkingCircle, Bus, BikeIcon, Building2, Stethoscope, Zap, Contact, MapPin, Compass, Sparkles,
    UtensilsCrossed, Monitor, AirVent, Fan, Refrigerator, Smartphone, Tablet, Laptop,
    Mic, Music2, Camera, Video, MonitorPlay, Heart, Brain, Library,
    Droplet, Brush, Soap: CustomSoap,
    Users, Maximize, User, UserCircle, Square
};

// ─── Icon Renderer Helper ──────────────────────────────────────────────────
const IconRenderer = ({ icon, size = 20, className = "" }) => {
    if (!icon) return <Sparkles size={size} className={className} />;
    
    // Check if it's a known Lucide Icon name
    const IconComp = ICON_MAP[icon];
    if (IconComp) return <IconComp size={size} className={className} />;
    
    // If not found in map, it might be an emoji or custom text
    return <span style={{ fontSize: `${size}px`, lineHeight: 1 }} className={className}>{icon}</span>;
};

export default IconRenderer;
