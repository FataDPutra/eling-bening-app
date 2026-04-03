import { useState, useEffect } from 'react';

const CountdownTimer = ({ expiryDate, onExpire, className = "" }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        if (!expiryDate) return {};
        const difference = +new Date(expiryDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60))),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            setTimeLeft(left);
            if (Object.keys(left).length === 0) {
                clearInterval(timer);
                if (onExpire) onExpire();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [expiryDate]);

    return (
        <span className={`font-mono font-black ${className}`}>
            {timeLeft.minutes !== undefined ? (
                `${timeLeft.hours > 0 ? timeLeft.hours.toString().padStart(2, '0') + ':' : ''}${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`
            ) : (
                "00:00"
            )}
        </span>
    );
};

export default CountdownTimer;
