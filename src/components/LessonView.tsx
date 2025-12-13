import { useState } from 'react';
import { X, Check, ArrowRight, RefreshCw } from 'lucide-react';

export type QuestionType = 'multiple-choice' | 'completion' | 'matching' | 'true-false';

export interface Question {
    id: string;
    type: QuestionType;
    question: string;
    correctAnswer: string | string[]; // For matching, this could be a JSON string or specific structure
    options?: string[]; // For multiple choice
    pairs?: { left: string; right: string }[]; // For matching
}

interface LessonViewProps {
    lessonTitle: string;
    onComplete: (score: number) => void;
    onClose: () => void;
}

// Hardcoded data for "Saludos"
const SALUDOS_QUESTIONS: Question[] = [
    {
        id: '1',
        type: 'multiple-choice',
        question: '¿Cómo se dice "Hola" en Aymara?',
        options: ['Kamisaraki', 'Jikisiñkama', 'Waliki', 'Aski urukipan'],
        correctAnswer: 'Kamisaraki'
    },
    {
        id: '2',
        type: 'completion',
        question: 'Completa la frase: "______ urukipan" (Buenos días)',
        options: ['Aski', 'Suma', 'Wali', 'Jach\'a'],
        correctAnswer: 'Aski'
    },
    {
        id: '3',
        type: 'true-false',
        question: '"Jikisiñkama" significa "Hasta luego".',
        correctAnswer: 'true'
    },
    {
        id: '4',
        type: 'matching',
        question: 'Relaciona las palabras con su significado',
        pairs: [
            { left: 'Kamisaraki', right: '¿Cómo estás?' },
            { left: 'Waliki', right: 'Bien' },
            { left: 'Jikisiñkama', right: 'Hasta luego' }
        ],
        correctAnswer: 'matching-check' // Special handling for matching
    }
];

export default function LessonView({ lessonTitle, onComplete, onClose }: LessonViewProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [matchingPairs, setMatchingPairs] = useState<{ [key: string]: string }>({});
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const currentQuestion = SALUDOS_QUESTIONS[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === SALUDOS_QUESTIONS.length - 1;

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const handleMatching = (left: string, right: string) => {
        setMatchingPairs(prev => ({ ...prev, [left]: right }));
    };

    const checkAnswer = () => {
        let correct = false;
        if (currentQuestion.type === 'matching') {
            // Check if all pairs are correct
            const allCorrect = currentQuestion.pairs?.every(pair => matchingPairs[pair.left] === pair.right);
            correct = !!allCorrect && Object.keys(matchingPairs).length === currentQuestion.pairs?.length;
        } else {
            correct = selectedAnswer === currentQuestion.correctAnswer;
        }

        setIsCorrect(correct);
        if (correct) setScore(s => s + 1);
    };

    const nextQuestion = () => {
        if (isLastQuestion) {
            setShowResult(true);
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setMatchingPairs({});
            setIsCorrect(null);
        }
    };

    if (showResult) {
        return (
            <div className="fixed inset-0 z-[2000] bg-white flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-6">
                    <h2 className="text-4xl font-bold text-gray-800">¡Lección Completada!</h2>
                    <div className="text-6xl font-bold text-green-500">{Math.round((score / SALUDOS_QUESTIONS.length) * 100)}%</div>
                    <p className="text-xl text-gray-600">Has acertado {score} de {SALUDOS_QUESTIONS.length} preguntas</p>
                    <div className="flex space-x-4 justify-center">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition"
                        >
                            Volver al Mapa
                        </button>
                        <button
                            onClick={() => onComplete(score)}
                            className="px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition"
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[2000] bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-6 py-4 shadow-sm flex items-center justify-between">
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                <div className="flex-1 mx-8 bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div
                        className="bg-green-500 h-full transition-all duration-500"
                        style={{ width: `${((currentQuestionIndex) / SALUDOS_QUESTIONS.length) * 100}%` }}
                    />
                </div>
                <div className="text-green-600 font-bold flex items-center">
                    <RefreshCw size={20} className="mr-2" />
                    {score}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">{currentQuestion.question}</h2>

                {currentQuestion.type === 'multiple-choice' && (
                    <div className="grid grid-cols-1 gap-4 w-full">
                        {currentQuestion.options?.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                disabled={isCorrect !== null}
                                className={`p-4 rounded-xl border-2 text-left font-semibold transition-all ${selectedAnswer === option
                                    ? isCorrect === null
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : isCorrect && option === currentQuestion.correctAnswer
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}

                {currentQuestion.type === 'completion' && (
                    <div className="w-full space-y-6">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {currentQuestion.options?.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleAnswer(opt)}
                                    disabled={isCorrect !== null}
                                    className={`px-4 py-2 rounded-lg border-2 font-bold ${selectedAnswer === opt
                                            ? 'border-blue-500 bg-blue-100 text-blue-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 bg-white rounded-xl border-2 border-gray-200 text-center text-xl">
                            {currentQuestion.question.replace('______', selectedAnswer ? ` ${selectedAnswer} ` : ' ______ ')}
                        </div>
                    </div>
                )}

                {currentQuestion.type === 'true-false' && (
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {['true', 'false'].map((val) => (
                            <button
                                key={val}
                                onClick={() => handleAnswer(val)}
                                disabled={isCorrect !== null}
                                className={`p-8 rounded-xl border-2 text-center font-bold text-xl transition-all ${selectedAnswer === val
                                    ? isCorrect === null
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : isCorrect && val === currentQuestion.correctAnswer
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                {val === 'true' ? 'Verdadero' : 'Falso'}
                            </button>
                        ))}
                    </div>
                )}

                {currentQuestion.type === 'matching' && (
                    <div className="w-full grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            {currentQuestion.pairs?.map(pair => (
                                <div key={pair.left} className="p-4 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700">
                                    {pair.left}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4">
                            {/* Simplified matching for demo: Select dropdowns or just buttons in order? 
                   Let's do a simple selection: For each left item, user picks a right item.
                   Actually, let's make it simpler: Render right side as buttons. User clicks Left then Right.
                   For this MVP, let's just show them side by side and ask user to select the matching pair for the highlighted one?
                   Too complex for quick impl. 
                   Alternative: Drag and drop is hard without lib.
                   Let's do: Click Left, then Click Right to connect.
               */}
                            {currentQuestion.pairs?.map((pair, idx) => (
                                <select
                                    key={idx}
                                    className="p-4 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 w-full"
                                    onChange={(e) => handleMatching(pair.left, e.target.value)}
                                    disabled={isCorrect !== null}
                                >
                                    <option value="">Selecciona...</option>
                                    {currentQuestion.pairs?.map(p => (
                                        <option key={p.right} value={p.right}>{p.right}</option>
                                    ))}
                                </select>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t-2 ${isCorrect === null ? 'border-gray-200 bg-white' : isCorrect ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100'}`}>
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    {isCorrect === null ? (
                        <button
                            onClick={checkAnswer}
                            disabled={!selectedAnswer && (currentQuestion.type !== 'matching' || Object.keys(matchingPairs).length === 0)}
                            className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Comprobar
                        </button>
                    ) : (
                        <>
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {isCorrect ? <Check className="text-white" /> : <X className="text-white" />}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-xl ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                        {isCorrect ? '¡Correcto!' : 'Solución correcta:'}
                                    </h3>
                                    {!isCorrect && currentQuestion.type !== 'matching' && (
                                        <p className="text-red-600">
                                            {currentQuestion.type === 'true-false'
                                                ? (currentQuestion.correctAnswer === 'true' ? 'Verdadero' : 'Falso')
                                                : currentQuestion.correctAnswer
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={nextQuestion}
                                className={`px-8 py-3 rounded-xl font-bold text-white transition ${isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                            >
                                {isLastQuestion ? 'Finalizar' : 'Continuar'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
