import { X } from 'lucide-react';

interface CulturaVivaCardProps {
    onClose: () => void;
}

export default function CulturaVivaCard({ onClose }: CulturaVivaCardProps) {
    return (
        <div className="absolute bottom-4 left-4 z-[1000] w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-yellow-400 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-yellow-400 p-3 flex justify-between items-center">
                <h3 className="font-bold text-yellow-900 text-sm">¿Qué hay dentro de “Cultura Viva”?</h3>
                <button onClick={onClose} className="text-yellow-900 hover:bg-yellow-500/20 rounded-full p-1">
                    <X size={16} />
                </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <p className="text-xs text-gray-600 mb-4">
                    Cada lugar tiene una ficha cultural, sencilla y clara.
                </p>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-bold text-gray-800 text-xs mb-2 uppercase tracking-wider">Estructura de una ficha</h4>
                        <ul className="space-y-1 text-xs text-gray-600">
                            <li className="flex items-center gap-2"><span className="text-lg">🖼️</span> Imagen / ilustración</li>
                            <li className="flex items-center gap-2"><span className="text-lg">🎉</span> Festividad principal</li>
                            <li className="flex items-center gap-2"><span className="text-lg">🗓️</span> Cuándo se celebra</li>
                            <li className="flex items-center gap-2"><span className="text-lg">🗣️</span> 3–5 palabras o expresiones</li>
                            <li className="flex items-center gap-2"><span className="text-lg">🧠</span> Explicación corta</li>
                        </ul>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <h4 className="font-bold text-gray-800 text-xs mb-2 flex items-center gap-1">
                            <span>📍</span> Ejemplo concreto: Ilave
                        </h4>

                        <div className="bg-gray-50 rounded-xl p-3 space-y-3 border border-gray-100">
                            <div className="text-center font-bold text-blue-600 text-sm">Cultura Viva → Ilave</div>

                            <div className="space-y-1 text-xs">
                                <div className="flex items-start gap-2">
                                    <span className="text-base">🎉</span>
                                    <span className="font-medium text-gray-800">Anata Andina</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-base">🗓️</span>
                                    <span className="text-gray-600">Febrero – marzo</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base">🗣️</span>
                                    <span className="font-bold text-gray-800 text-xs">Palabras clave:</span>
                                </div>
                                <ul className="pl-6 space-y-1 text-xs text-gray-600 list-disc">
                                    <li><span className="font-medium text-blue-600">Anata</span> → fiesta</li>
                                    <li><span className="font-medium text-blue-600">Jiwasa</span> → nosotros</li>
                                    <li><span className="font-medium text-blue-600">Kusisiña</span> → alegría</li>
                                </ul>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base">🧠</span>
                                    <span className="font-bold text-gray-800 text-xs">Texto corto:</span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed italic">
                                    "La Anata Andina es una celebración comunitaria donde la música, la danza y la reciprocidad fortalecen la identidad aymara."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
