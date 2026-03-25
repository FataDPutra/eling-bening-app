import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            return toast.error('Konfirmasi password tidak cocok.');
        }
        
        setIsLoading(true);
        try {
            await register({ 
                name, 
                email, 
                password, 
                password_confirmation: passwordConfirmation 
            });
            toast.success('Pendaftaran berhasil! Akun Anda siap digunakan.');
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Registration error', error);
            
            let message = 'Pendaftaran gagal. Silakan coba lagi.';
            
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors) {
                    // Get the first error message
                    const firstError = Object.values(errors)[0][0];
                    if (firstError.includes('already been taken')) {
                        message = 'Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.';
                    } else if (firstError.includes('at least 8 characters')) {
                        message = 'Password harus minimal 8 karakter.';
                    } else {
                        message = firstError;
                    }
                }
            }
            
            toast.error(message, {
                duration: 5000,
                style: {
                    borderRadius: '16px',
                    background: '#C62828',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        window.location.href = '/api/auth/google';
    };

    return (
        <div className="min-h-screen flex text-gray-900 bg-gray-50">
            {/* Left side: Image */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative">
                <img src="/images/generated/hero.png" className="w-full h-full object-cover opacity-60" alt="Register bg" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/50"></div>
                <div className="absolute bottom-20 left-20 right-20 text-white">
                    <h2 className="text-4xl font-bold font-serif leading-tight mb-4">Mulai Petualangan Anda</h2>
                    <p className="text-xl font-light opacity-90">Daftarkan diri Anda untuk mendapatkan akses eksklusif ke reservasi resort dan promo menarik.</p>
                </div>
                <Link to="/" className="absolute top-10 left-10 text-white font-bold flex items-center gap-2 hover:opacity-80 transition bg-black/20 px-6 py-3 rounded-full backdrop-blur-md">
                    <ArrowLeft size={20} /> Kembali
                </Link>
            </div>

            {/* Right side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
                <Link to="/" className="lg:hidden absolute top-8 left-8 text-gray-500 hover:text-gray-900 font-bold flex items-center gap-2 transition">
                    <ArrowLeft size={20} /> Beranda
                </Link>

                <div className="w-full max-w-md">
                    <div className="text-center lg:text-left mb-10">
                        <h1 className="text-4xl font-bold font-serif mb-4 text-gray-900">Buat Akun Baru</h1>
                        <p className="text-gray-500">Dapatkan kemudahan dalam merencanakan liburan Anda.</p>
                    </div>

                    <button 
                        onClick={handleGoogleRegister} 
                        className="group w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-4 px-4 rounded-2xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-300 mb-6"
                    >
                        <div className="group-hover:scale-110 transition-transform duration-300">
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        </div>
                        <span className="text-gray-600">Daftar dengan Google</span>
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <hr className="flex-1 border-gray-200" />
                        <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">atau email</span>
                        <hr className="flex-1 border-gray-200" />
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-eling-green/50 focus:border-eling-green focus:bg-white transition"
                                    placeholder="Budi Santoso"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-eling-green/50 focus:border-eling-green focus:bg-white transition"
                                    placeholder="nama@email.com"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-eling-green/50 focus:border-eling-green focus:bg-white transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Konfirmasi Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-eling-green/50 focus:border-eling-green focus:bg-white transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full text-white font-bold py-4 rounded-xl transition shadow-lg text-lg mt-6 flex items-center justify-center gap-2 ${isLoading ? 'bg-green-800 cursor-not-allowed' : 'bg-eling-green hover:bg-green-800'}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Daftar...
                                </>
                            ) : 'Daftar Sekarang'}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-gray-600">
                        Sudah punya akun? <Link to="/login" className="font-bold text-eling-green hover:underline underline-offset-4">Masuk di sini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
