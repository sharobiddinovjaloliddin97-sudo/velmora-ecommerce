import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  UploadCloud,
  Camera,
  X,
  RefreshCw,
  Palette,
  ArrowRight,
  SunMedium,
  Home,
  Info,
  Send,
} from "lucide-react";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

// 3 sample room images encoded as SVG data URLs for instantaneous 1-click testing
const PRESET_ROOMS = [
  {
    id: "scandinavian",
    title_uz: "Skandinaviya sokinligi",
    title_ru: "Скандинавское спокойствие",
    desc_uz: "Yorug‘, och yog‘och va oq-kulrang ohanglar",
    desc_ru: "Светлые тона, дерево и белый уют",
    color: "#E5DEC9",
    // Data URI of a minimalist modern bedroom illustration
    dataUrl: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f5efe6"/>
            <stop offset="100%" stop-color="#e8ded4"/>
          </linearGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#cbbba8"/>
            <stop offset="100%" stop-color="#baa692"/>
          </linearGradient>
          <linearGradient id="bed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#ded8cf"/>
          </linearGradient>
        </defs>
        <rect width="600" height="260" fill="url(#wall)"/>
        <rect y="260" width="600" height="140" fill="url(#floor)"/>
        <rect x="220" y="40" width="160" height="140" rx="8" fill="#ffffff" stroke="#cbbba8" stroke-width="4"/>
        <line x1="300" y1="40" x2="300" y2="180" stroke="#cbbba8" stroke-width="2"/>
        <line x1="220" y1="110" x2="380" y2="110" stroke="#cbbba8" stroke-width="2"/>
        <rect x="130" y="160" width="340" height="50" rx="12" fill="#5c4a3d"/>
        <rect x="150" y="200" width="300" height="140" rx="16" fill="url(#bed)" stroke="#baa692" stroke-width="3"/>
        <rect x="170" y="210" width="110" height="50" rx="8" fill="#ffffff" stroke="#d5c8b8" stroke-width="2"/>
        <rect x="320" y="210" width="110" height="50" rx="8" fill="#ffffff" stroke="#d5c8b8" stroke-width="2"/>
        <path d="M150,270 Q300,285 450,270 L450,340 L150,340 Z" fill="#8a735e" opacity="0.35"/>
        <rect x="80" y="220" width="50" height="70" rx="4" fill="#a89582"/>
        <rect x="470" y="220" width="50" height="70" rx="4" fill="#a89582"/>
        <circle cx="105" cy="205" r="14" fill="#fdfaf6" stroke="#8a735e" stroke-width="2"/>
        <circle cx="495" cy="205" r="14" fill="#fdfaf6" stroke="#8a735e" stroke-width="2"/>
      </svg>
    `),
  },
  {
    id: "modern_beige",
    title_uz: "Zamonaviy bej va oltin",
    title_ru: "Современный беж и золото",
    desc_uz: "Iliq bej devorlar, shinam yumshoq yorug‘lik",
    desc_ru: "Теплые бежевые стены, мягкое освещение",
    color: "#D4B996",
    dataUrl: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
          <linearGradient id="wall2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#dfd0be"/>
            <stop offset="100%" stop-color="#caa37f"/>
          </linearGradient>
          <linearGradient id="floor2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4a3b32"/>
            <stop offset="100%" stop-color="#2d221c"/>
          </linearGradient>
        </defs>
        <rect width="600" height="270" fill="url(#wall2)"/>
        <rect y="270" width="600" height="130" fill="url(#floor2)"/>
        <rect x="140" y="150" width="320" height="60" rx="14" fill="#3b2d24"/>
        <rect x="160" y="195" width="280" height="150" rx="14" fill="#faf7f2" stroke="#c1a27c" stroke-width="4"/>
        <rect x="180" y="210" width="105" height="45" rx="8" fill="#e8ded4"/>
        <rect x="315" y="210" width="105" height="45" rx="8" fill="#e8ded4"/>
        <rect x="160" y="280" width="280" height="65" fill="#c1a27c" opacity="0.45"/>
        <circle cx="300" cy="70" r="30" fill="#fef3c7" opacity="0.6"/>
      </svg>
    `),
  },
  {
    id: "classic_warm",
    title_uz: "Klassik shinam yotoqxona",
    title_ru: "Классическая теплая спальня",
    desc_uz: "Aristokratik ohanglar, sokin qahvarang",
    desc_ru: "Аристократичные оттенки, кофе с молоком",
    color: "#B39274",
    dataUrl: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="280" fill="#ece4db"/>
        <rect y="280" width="600" height="120" fill="#524339"/>
        <rect x="150" y="140" width="300" height="70" rx="10" fill="#241c16"/>
        <rect x="170" y="190" width="260" height="150" rx="12" fill="#ffffff" stroke="#8a735e" stroke-width="3"/>
        <rect x="185" y="205" width="95" height="40" rx="6" fill="#ded4c7"/>
        <rect x="320" y="205" width="95" height="40" rx="6" fill="#ded4c7"/>
        <rect x="170" y="265" width="260" height="75" fill="#8a735e" opacity="0.4"/>
      </svg>
    `),
  },
];

export default function AIInteriorModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const fileInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null); // File object or preset DataURL
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset state on close
  const handleClose = () => {
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        language === "ru"
          ? "Пожалуйста, выберите файл изображения (JPG, PNG, WebP)"
          : "Iltimos, rasm faylini tanlang (JPG, PNG, WebP)"
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        language === "ru"
          ? "Файл слишком большой. Максимальный размер: 10 МБ"
          : "Fayl juda katta. Maksimal hajm: 10 MB"
      );
      return;
    }

    setError("");
    setSelectedPresetId(null);
    setSelectedImage(file);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setSelectedImage(null);
    setPreviewUrl(preset.dataUrl);
    setError("");
    setAnalysisResult(null);
  };

  // Turn preset SVG dataURL into a File for multipart upload
  const dataUrlToFile = async (dataUrl, filename) => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: "image/jpeg" });
  };

  const handleStartAnalysis = async () => {
    if (!previewUrl) {
      setError(
        language === "ru"
          ? "Пожалуйста, загрузите фото вашей комнаты или выберите пример"
          : "Iltimos, xonangiz rasmini yuklang yoki tayyor namunani tanlang"
      );
      return;
    }

    setLoading(true);
    setError("");
    setScanStep(0);

    // Simulation animation steps while waiting for AI
    const stepInterval = setInterval(() => {
      setScanStep((curr) => (curr < 2 ? curr + 1 : curr));
    }, 1200);

    try {
      let uploadFile = selectedImage;
      if (!uploadFile && previewUrl) {
        uploadFile = await dataUrlToFile(previewUrl, "room_sample.jpg");
      }

      const formData = new FormData();
      formData.append("image", uploadFile);
      formData.append("lang", language);

      const res = await api.post("/ai-interior-advice/", formData, {
        params: { lang: language },
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 45000,
      });

      clearInterval(stepInterval);
      setAnalysisResult(res.data);
    } catch (err) {
      clearInterval(stepInterval);
      console.error("AI Interior analysis error:", err);
      const serverMsg =
        err?.response?.data?.error ||
        (language === "ru"
          ? "Не удалось проанализировать комнату. Пожалуйста, попробуйте другое фото."
          : "Xona rasmini tahlil qilib bo‘lmadi. Iltimos, boshqa sifatliroq rasm bilan urinib ko‘ring.");
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setSelectedPresetId(null);
    setAnalysisResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  const scanStepTexts = [
    language === "ru"
      ? "Анализ освещения и цветовых нюансов интерьера..."
      : "Xona yorug‘ligi va asosiy ranglari aniqlanmoqda...",
    language === "ru"
      ? "Определение стиля комнаты (минимализм, сканди, классика)..."
      : "Interyer uslubi va arxitekturasi aniqlanmoqda...",
    language === "ru"
      ? "Подбор идеальных комплектов из коллекции Velmora..."
      : "Velmora katalogidan eng mos to‘plamlar saralanmoqda...",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#faf7f2] dark:bg-[#191512] text-[#3b2d24] dark:text-[#ede4da] border border-[#d8c8b4] dark:border-[#382f27] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ebdcca] dark:border-[#2f2720] bg-[#faf7f2]/95 dark:bg-[#191512]/95 backdrop-blur-md px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8a735e] to-[#c1a27c] text-white shadow-xs">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide">
                  {language === "ru" ? "AI Интерьер-Консультант" : "AI Interyer Maslahatchisi"}
                </h3>
                <span className="rounded-full bg-[#c1a27c]/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#8a735e] dark:text-[#e5b378] uppercase">
                  Beta
                </span>
              </div>
              <p className="text-xs text-[#786352] dark:text-[#a69688]">
                {language === "ru"
                  ? "Умный подбор текстиля под цвета и стиль вашей спальни"
                  : "Xonangiz dizayniga mos shinam to‘plamlarni sun'iy intellekt tanlaydi"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c8b4] dark:border-[#3d342c] bg-white/70 dark:bg-[#25201c] text-[#5c4a3d] dark:text-[#c4b6a8] hover:bg-white dark:hover:bg-[#2d2621] transition"
            aria-label="Yopish"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 space-y-6">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/30 p-4 text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-start gap-3">
              <Info className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* VIEW 1: UPLOAD / SELECTION (when no results yet) */}
          {!analysisResult && (
            <div className="space-y-5">
              {/* DROPZONE / PREVIEW */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#cbbba8] dark:border-[#42372e] bg-white/70 dark:bg-[#211c18] p-8 text-center cursor-pointer transition-all hover:border-[#8a735e] dark:hover:border-[#c1a27c] hover:bg-white dark:hover:bg-[#27211c]"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#faf7f2] dark:bg-[#191512] border border-[#dfd2c0] dark:border-[#3a3028] text-[#8a735e] dark:text-[#c1a27c] shadow-xs group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <h4 className="font-medium text-base sm:text-lg mb-1">
                    {language === "ru"
                      ? "Загрузите фото спальни или комнаты"
                      : "Xonangiz yoki yotoqxonangiz rasmini yuklang"}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#786352] dark:text-[#a69688] max-w-sm mb-4">
                    {language === "ru"
                      ? "Перетащите файл сюда или нажмите для выбора (JPG, PNG до 10 МБ)"
                      : "Faylni bu yerga tashlang yoki tanlash uchun bosing (JPG, PNG 10 MB gacha)"}
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#3b2d24] dark:bg-[#e5b378] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#1c1917] shadow-xs transition hover:bg-[#5c4a3d] dark:hover:bg-[#f2c694]"
                  >
                    <Camera className="h-4 w-4" />
                    <span>{language === "ru" ? "Выбрать фото" : "Rasm tanlash"}</span>
                  </button>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-3xl border border-[#d8c8b4] dark:border-[#382f27] bg-[#201b17]">
                  <img
                    src={previewUrl}
                    alt="Room preview"
                    className={`w-full max-h-72 sm:max-h-80 object-cover transition-all ${
                      loading ? "brightness-75 blur-[1px]" : ""
                    }`}
                  />

                  {/* SCANNING LASER EFFECT */}
                  {loading && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#c1a27c] to-transparent shadow-[0_0_15px_#c1a27c] animate-bounce" />
                      <div className="absolute inset-0 bg-[#c1a27c]/10 mix-blend-overlay" />
                    </div>
                  )}

                  {/* CONTROLS OVER IMAGE */}
                  {!loading && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl bg-black/65 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white hover:bg-black/85 transition"
                      >
                        {language === "ru" ? "Заменить фото" : "Boshqa rasm"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PRESET SAMPLE ROOMS */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#786352] dark:text-[#a69688]">
                    {language === "ru" ? "Или протестируйте на примере:" : "Yoki tayyor namunada sinab ko‘ring:"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PRESET_ROOMS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        disabled={loading}
                        onClick={() => handleSelectPreset(preset)}
                        className={`text-left rounded-2xl p-3 border transition flex items-center gap-3 ${
                          isSelected
                            ? "border-[#8a735e] bg-[#8a735e]/15 dark:border-[#c1a27c] dark:bg-[#c1a27c]/15"
                            : "border-[#d8c8b4] dark:border-[#382f27] bg-white/60 dark:bg-[#211c18] hover:bg-white dark:hover:bg-[#28221d]"
                        }`}
                      >
                        <div
                          className="h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-[#d8c8b4] dark:border-[#3d342c] shadow-xs"
                          style={{ backgroundColor: preset.color }}
                        >
                          <img
                            src={preset.dataUrl}
                            alt={preset.title_uz}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">
                            {language === "ru" ? preset.title_ru : preset.title_uz}
                          </p>
                          <p className="text-[10px] text-[#786352] dark:text-[#a69688] truncate">
                            {language === "ru" ? preset.desc_ru : preset.desc_uz}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SCANNING PROGRESS OVERLAY */}
              {loading && (
                <div className="rounded-2xl border border-[#c1a27c]/40 bg-[#fbf6ee] dark:bg-[#201b16] p-5 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-[#8a735e] dark:text-[#c1a27c]">
                    <Sparkles className="h-5 w-5 animate-spin" />
                    <span className="font-semibold text-sm">
                      {language === "ru" ? "AI анализирует комнату..." : "AI xonani tahlil qilmoqda..."}
                    </span>
                  </div>
                  <p className="text-xs text-[#786352] dark:text-[#a69688] transition-all">
                    {scanStepTexts[scanStep]}
                  </p>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-[#ebdcca] dark:bg-[#342b23] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8a735e] to-[#c1a27c] transition-all duration-500 rounded-full"
                      style={{ width: `${((scanStep + 1) / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ACTION BUTTON */}
              {!loading && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartAnalysis}
                    disabled={!previewUrl || loading}
                    className={`w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 px-6 font-bold text-sm tracking-wide shadow-md transition-all ${
                      previewUrl && !loading
                        ? "bg-gradient-to-r from-[#3b2d24] via-[#5c4a3d] to-[#3b2d24] text-white hover:brightness-110 dark:from-[#c1a27c] dark:via-[#e5b378] dark:to-[#c1a27c] dark:text-[#1c1917]"
                        : "bg-stone-200 text-stone-400 dark:bg-stone-800 dark:text-stone-600 cursor-not-allowed"
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>
                      {language === "ru"
                        ? "Проанализировать и подобрать текстиль"
                        : "Xonani tahlil qilish va to‘plam tanlash"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: AI RESULTS VIEW */}
          {analysisResult && (
            <div className="space-y-6">
              {/* TOP HEADER: STYLE & LIGHTING */}
              <div className="rounded-3xl border border-[#ebdcca] dark:border-[#382f27] bg-white/80 dark:bg-[#211c18] p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#8a735e]/15 dark:bg-[#c1a27c]/20 text-[#8a735e] dark:text-[#e5b378]">
                      <Home className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8a735e] dark:text-[#c1a27c]">
                        {language === "ru" ? "Стиль интерьера" : "Interyer uslubi"}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base">
                        {language === "ru"
                          ? analysisResult.room_style_ru || analysisResult.room_style_uz
                          : analysisResult.room_style_uz}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      <SunMedium className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                        {language === "ru" ? "Освещение" : "Yorug‘lik"}
                      </span>
                      <p className="text-xs font-semibold">
                        {language === "ru"
                          ? analysisResult.lighting_ru || analysisResult.lighting_uz
                          : analysisResult.lighting_uz}
                      </p>
                    </div>
                  </div>
                </div>

                {/* EXTRACTED PALETTE */}
                {Array.isArray(analysisResult.palette) && analysisResult.palette.length > 0 && (
                  <div className="pt-2 border-t border-[#ebdcca] dark:border-[#2e261f]">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="h-3.5 w-3.5 text-[#8a735e] dark:text-[#c1a27c]" />
                      <span className="text-xs font-semibold">
                        {language === "ru" ? "Цветовая палитра комнаты:" : "Xonaning aniqlangan ranglar palitrasi:"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {analysisResult.palette.map((hex, idx) => {
                        const name =
                          language === "ru"
                            ? analysisResult.palette_names_ru?.[idx] || hex
                            : analysisResult.palette_names_uz?.[idx] || hex;
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 rounded-full border border-[#d8c8b4] dark:border-[#382f27] bg-[#faf7f2] dark:bg-[#1a1613] px-2.5 py-1 text-[11px] shadow-2xs"
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="font-mono text-[10px] text-stone-500 dark:text-stone-400">
                              {hex}
                            </span>
                            {name && name !== hex && (
                              <span className="text-[#3b2d24] dark:text-[#ede4da] font-medium truncate max-w-[90px]">
                                {name}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* DESIGNER ADVICE QUOTE */}
              <div className="relative rounded-3xl border-l-4 border-l-[#c1a27c] border border-[#ebdcca] dark:border-[#382f27] bg-[#fbf6ee] dark:bg-[#211b16] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="font-serif text-3xl text-[#c1a27c] leading-none">“</span>
                  <div className="flex-1 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8a735e] dark:text-[#e5b378]">
                      {language === "ru" ? "Совет дизайнера Velmora" : "Velmora dizayner maslahati"}
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#5c4a3d] dark:text-[#ded2c3] italic">
                      {language === "ru"
                        ? analysisResult.designer_advice_ru || analysisResult.designer_advice_uz
                        : analysisResult.designer_advice_uz}
                    </p>
                  </div>
                </div>
              </div>

              {/* MATCHED VELMORA PRODUCTS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base sm:text-lg font-bold">
                    {language === "ru"
                      ? "Рекомендуемые комплекты Velmora:"
                      : "Xonangizga eng mos Velmora to‘plamlari:"}
                  </h4>
                  <span className="text-xs text-[#786352] dark:text-[#a69688]">
                    {analysisResult.recommendations?.length || 0}{" "}
                    {language === "ru" ? "варианта" : "ta to‘plam"}
                  </span>
                </div>

                <div className="space-y-3">
                  {analysisResult.recommendations?.map((item, idx) => {
                    const name =
                      language === "ru"
                        ? item.name_ru || item.name_uz
                        : item.name_uz;
                    const why =
                      language === "ru"
                        ? item.why_matched_ru || item.why_matched_uz
                        : item.why_matched_uz;
                    const recColor =
                      language === "ru"
                        ? item.recommended_color_ru || item.recommended_color_uz
                        : item.recommended_color_uz;
                    const priceFormatted = item.price
                      ? `${Number(item.price).toLocaleString("uz-UZ")} so‘m`
                      : "";

                    return (
                      <div
                        key={item.product_id || idx}
                        className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-3xl border border-[#ebdcca] dark:border-[#382f27] bg-white dark:bg-[#201b17] p-3 sm:p-4 hover:border-[#8a735e] dark:hover:border-[#c1a27c] transition-all shadow-xs"
                      >
                        {/* PRODUCT THUMBNAIL */}
                        <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl bg-[#faf7f2] dark:bg-[#161311] border border-[#dfd2c0] dark:border-[#342b23]">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                              Velmora
                            </div>
                          )}
                        </div>

                        {/* PRODUCT DETAILS */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c1a27c] text-[10px] font-bold text-white">
                              {idx + 1}
                            </span>
                            <h5 className="font-serif font-bold text-sm sm:text-base text-[#3b2d24] dark:text-[#ede4da] truncate">
                              {name}
                            </h5>
                          </div>

                          {recColor && (
                            <p className="text-xs text-[#8a735e] dark:text-[#e5b378] font-medium">
                              🎨 {language === "ru" ? "Рекомендуемый цвет:" : "Mos rang:"}{" "}
                              <span className="font-semibold">{recColor}</span>
                            </p>
                          )}

                          <p className="text-xs text-[#6b584a] dark:text-[#b8a99a] line-clamp-2 leading-relaxed">
                            💡 {why}
                          </p>

                          {priceFormatted && (
                            <p className="font-bold text-sm text-[#3b2d24] dark:text-[#ede4da] pt-1">
                              {priceFormatted}
                            </p>
                          )}
                        </div>

                        {/* PRODUCT ACTION */}
                        <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
                          <Link
                            to={`/catalog/${item.slug}`}
                            onClick={handleClose}
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-[#3b2d24] dark:bg-[#e5b378] px-4 py-2.5 text-xs font-bold text-white dark:text-[#1c1917] hover:bg-[#5c4a3d] dark:hover:bg-[#f2c694] transition shadow-xs"
                          >
                            <span>{language === "ru" ? "Посмотреть" : "Tanlash"}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#ebdcca] dark:border-[#2e261f]">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#d8c8b4] dark:border-[#3d342c] bg-white dark:bg-[#25201c] px-4 py-2 text-xs font-semibold text-[#5c4a3d] dark:text-[#c4b6a8] hover:bg-[#f4efe6] dark:hover:bg-[#2d2621] transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>
                    {language === "ru"
                      ? "Проанализировать другое фото"
                      : "Boshqa xonani tahlil qilish"}
                  </span>
                </button>

                <a
                  href="https://t.me/velmora_silkbot"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-semibold text-[#8a735e] dark:text-[#e5b378] hover:underline"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {language === "ru"
                      ? "Telegram бот: @velmora_silkbot"
                      : "Telegram botimizda ham sinab ko‘ring"}
                  </span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
