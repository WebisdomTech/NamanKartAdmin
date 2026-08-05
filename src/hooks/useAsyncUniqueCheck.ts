import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/src/services/api";

export function useAsyncUniqueCheck(endpoint: string, field: string, value: string, excludeId?: string) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [existing, setExisting] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setChecking(false);
      setAvailable(null);
      setExisting(null);
      setSuggestions([]);
      return;
    }

    setChecking(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("nk_admin_token") : "";
        const url = new URL(`${API_BASE_URL}${endpoint}/check-unique`, window.location.origin);
        url.searchParams.set("field", field);
        url.searchParams.set("value", value);
        if (excludeId) url.searchParams.set("excludeId", excludeId);

        const res = await fetch(url.toString(), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setAvailable(data.available);
          setExisting(data.existing || null);
          setSuggestions(data.suggestions || []);
        } else {
          setAvailable(null);
        }
      } catch (err) {
        console.error("Async uniqueness check error:", err);
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [endpoint, field, value, excludeId]);

  return { checking, available, existing, suggestions };
}
