import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen flex text-gray-900 bg-gray-50">
            {/* Left side: Image */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative">
                <img src="/images/hero-bg.png" className="w-full h-full object-cover opacity-60" alt="Forgot Password bg" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/50"></div>
                <div className="absolute bottom-20 left-20 right-20 text-white text-center">
                    <h2 className="text-4xl font-bold font-serif leading-tight mb-4">Pulihkan Akun Anda</h2>
                    <p className="text-xl font-light opacity-90">Kami akan mengirimkan instruksi pemulihan ke email Anda.</p>
                </div>
                <Link to="/login" className="absolute top-10 left-10 text-white font-bold flex items-center gap-2 hover:opacity-80 transition bg-black/20 px-6 py-3 rounded-full backdrop-blur-md">
                    <ArrowLeft size={20} /> Kembali ke Login
                </Link>
            </div>

            {/* Right side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
                {/* Mobile back button */}
                <Link to="/login" className="lg:hidden absolute top-8 left-8 text-gray-500 hover:text-gray-900 font-bold flex items-center gap-2 transition">
                    <ArrowLeft size={20} /> Login
                </Link>

                <div className="w-full max-w-md">
                    {!isSubmitted ? (
                        <>
                            <div className="text-center lg:text-left mb-12">
                                <h1 className="text-4xl font-bold font-serif mb-4 text-gray-900">Lupa Password?</h1>
                                <p className="text-gray-500">Masukkan email Anda untuk menerima link pemulihan kata sandi.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Akun</label>
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

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-eling-green text-white font-bold py-4 rounded-xl hover:bg-green-800 transition shadow-lg text-lg flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            Mengirim...
                                        </>
                                    ) : (
                                        'Kirim Link Pemulihan'
                                    )}
                                </button>
                            </form>

                            <p className="text-center mt-8 text-gray-600">
                                Tiba-tiba ingat? <Link to="/login" className="font-bold text-eling-green hover:underline">Masuk kembali</Link>
                            </p>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-50 text-eling-green rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-bold font-serif mb-4 text-gray-900">Email Terkirim!</h2>
                            <p className="text-gray-500 mb-10 leading-relaxed">
                                Kami telah mengirimkan instruksi pemulihan ke <strong>{email}</strong>. Silakan periksa kotak masuk atau folder spam Anda.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-eling-green text-white font-bold py-4 rounded-xl hover:bg-green-800 transition shadow-lg"
                            >
                                Kembali ke Halaman Login
                            </button>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="mt-4 text-gray-400 font-bold hover:text-gray-600 transition text-sm"
                            >
                                Belum menerima email? Kirim ulang
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
