import { useEffect, useState, useRef } from "react"; // Added useRef
import { authFetch } from "../../utils/auth";

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    
    // 1. The Gatekeeper: Strict boolean for the toast
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authFetch("http://127.0.0.1:8000/api/profile/");
            if (!res.ok) throw new Error("Could not fetch profile data.");
            const data = await res.json();
            setProfile(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setShowToast(false); // Force close any existing toast

        const formData = new FormData();
        formData.append("address", profile?.address || "");
        formData.append("phone_number", profile?.phone_number || "");
        
        const imageInput = document.querySelector('#avatar-input');
        if (imageInput.files[0]) formData.append("avatar", imageInput.files[0]);

        try {
            const response = await authFetch("http://127.0.0.1:8000/api/profile/", {
                method: "PATCH",
                body: formData,
            });
            if (response.ok) {
                const updatedData = await response.json();
                setProfile(updatedData);
                setPreview(null);
                
                // --- TRIGGER TOAST ONLY ON SUCCESSFUL BUTTON CLICK ---
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 relative">
            
            {/* --- REFINED TOAST --- */}
            {/* We only render the DIV if showToast is explicitly true */}
            {showToast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 animate-in fade-in slide-in-from-top-5">
                    <div className="bg-[#111827] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700">
                        <div className="bg-green-500 h-2 w-2 rounded-full animate-ping" />
                        <span className="font-bold">Profile updated successfully!</span>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100">
                {/* Form Content remains the same... */}
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex flex-col items-center mb-10">
                        <img 
                            src={preview || profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.username}`} 
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" 
                        />
                         <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) setPreview(URL.createObjectURL(file));
                         }} />
                         <label htmlFor="avatar-input" className="mt-2 text-blue-600 text-sm cursor-pointer font-bold">Change Photo</label>
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase">Phone</label>
                        <input 
                            type="text" 
                            value={profile?.phone_number || ""}
                            onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase">Address</label>
                        <textarea 
                            value={profile?.address || ""}
                            onChange={(e) => setProfile({...profile, address: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none h-32 resize-none"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={updating} 
                        className="w-full py-5 bg-[#111827] text-white font-extrabold rounded-2xl shadow-xl hover:bg-blue-600 transition-all disabled:bg-gray-300"
                    >
                        {updating ? "Saving Changes..." : "Save Profile Details"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;