"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, Navigation, ShieldAlert, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

type Props = {
  onLocationReady: (coords: { latitude: number; longitude: number }) => void;
};

type LocationState = "requesting" | "success" | "error";

export default function LocationStatus({ onLocationReady }: Props) {
  const [status, setStatus] = useState<LocationState>("requesting");
  const [errorMessage, setErrorMessage] = useState("");

  const getLocation = useCallback(() => {
    setStatus("requesting");
    setErrorMessage("");

    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Browser does not support location");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus("success");
        onLocationReady({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setStatus("error");
        setErrorMessage(
          error.code === 1 
            ? "Permission denied. Check settings." 
            : "Signal too weak. Try moving."
        );
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [onLocationReady]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return (
    /* mt-[5vh] provides a balanced gap from the header or previous element */
    <div className="mt-[5vh] px-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="w-full max-w-sm mx-auto bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 p-6">
        
        <div className="flex items-center gap-5">
          {/* Status Icon with Background Shimmer */}
          <div className="relative">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              status === "requesting" ? "bg-blue-50 text-blue-500 ring-4 ring-blue-50/50" :
              status === "success" ? "bg-emerald-50 text-emerald-500 ring-4 ring-emerald-50/50" :
              "bg-red-50 text-red-500 ring-4 ring-red-50/50"
            }`}>
              {status === "requesting" && <Navigation className="h-6 w-6 animate-pulse" />}
              {status === "success" && <CheckCircle2 className="h-6 w-6" />}
              {status === "error" && <ShieldAlert className="h-6 w-6" />}
            </div>
            
            {status === "requesting" && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
              </span>
            )}
          </div>

          {/* Text Information */}
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
             Class Location Proximity
            </h3>
            <p className="text-lg font-bold text-slate-900 leading-tight">
              {status === "requesting" && "Checking Location"}
              {status === "success" && "Arrival Confirmed"}
              {status === "error" && "Location Locked"}
            </p>
            <p className="text-sm text-slate-500 font-medium italic">
              {status === "requesting" && "Syncing with satellites..."}
              {status === "success" && "You're in the right spot."}
              {status === "error" && errorMessage}
            </p>
          </div>

          {/* Inline Action for Errors */}
          {status === "error" && (
            <button 
              onClick={getLocation}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Retry"
            >
              <RefreshCw size={20} />
            </button>
          )}
        </div>

        {/* Progress Bar (Visual Only) */}
        <div className="mt-6 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${
              status === "requesting" ? "w-1/2 bg-blue-400 animate-shimmer bg-[length:200%_100%]" :
              status === "success" ? "w-full bg-emerald-500" :
              "w-full bg-red-400"
            }`}
          />
        </div>
      </div>
    </div>
  );
}