import { useEffect } from "react";

function Toast({ message, type = "success", onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Disappears after 3 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
            <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
                type === "success" 
                ? "bg-white border-green-100 text-green-700" 
                : "bg-white border-blue-100 text-blue-700"
            }`}>
                <div className={`w-2 h-2 rounded-full ${type === "success" ? "bg-green-500" : "bg-blue-500"} animate-pulse`}></div>
                <span className="font-bold text-sm tracking-tight">{message}</span>
            </div>
        </div>
    );
}

export default Toast;