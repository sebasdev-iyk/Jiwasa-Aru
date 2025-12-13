import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Lesson, UserProgress } from '../lib/supabase';
import { Heart, Lock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const mapBounds: L.LatLngBoundsExpression = [
  [-16.6428, -70.1134], // Southwest
  [-15.7764, -68.9502]  // Northeast
];

const LEVEL_COORDINATES = [
  { name: "Desaguadero", position: [-16.56652, -69.03727] as [number, number] },
  { name: "Juli", position: [-16.21550, -69.46046] as [number, number] },
  { name: "Ilave", position: [-16.08763, -69.63864] as [number, number] },
  { name: "Pomata", position: [-16.273655, -69.293153] as [number, number] }
];

export default function LearnTab() {
  const { profile, refreshProfile } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index');

      if (lessonsError) throw lessonsError;

      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*');

      if (progressError) throw progressError;

      setLessons(lessonsData || []);
      setProgress(progressData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = async (lesson: Lesson) => {
    if (!profile) return;

    if (profile.lives <= 0) {
      alert('¡No tienes vidas! Espera a que se recuperen.');
      return;
    }

    const lessonProgress = progress.find((p) => p.lesson_id === lesson.id);
    const isCompleted = lessonProgress?.completed || false;

    if (isCompleted) {
      alert('¡Ya completaste esta lección!');
      return;
    }

    const earnedStars = Math.floor(Math.random() * 3) + 1;
    const success = Math.random() > 0.3;

    if (success) {
      const newXp = profile.xp + lesson.xp_reward;
      const newLevel = Math.floor(newXp / 100) + 1;

      await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel })
        .eq('id', profile.id);

      if (lessonProgress) {
        await supabase
          .from('user_progress')
          .update({
            completed: true,
            stars: earnedStars,
            completed_at: new Date().toISOString(),
          })
          .eq('id', lessonProgress.id);
      } else {
        await supabase.from('user_progress').insert({
          user_id: profile.id,
          lesson_id: lesson.id,
          completed: true,
          stars: earnedStars,
          completed_at: new Date().toISOString(),
        });
      }

      alert(`¡Excelente! Ganaste ${earnedStars} estrellas y ${lesson.xp_reward} XP`);
      await refreshProfile();
      await fetchData();
    } else {
      const newLives = Math.max(0, profile.lives - 1);
      await supabase
        .from('profiles')
        .update({ lives: newLives })
        .eq('id', profile.id);

      alert('¡Intenta de nuevo! Perdiste una vida.');
      await refreshProfile();
    }
  };

  const isLessonUnlocked = (lesson: Lesson) => {
    if (lesson.order_index === 1) return true;

    const previousLesson = lessons.find(
      (l) => l.order_index === lesson.order_index - 1
    );
    if (!previousLesson) return false;

    const previousProgress = progress.find(
      (p) => p.lesson_id === previousLesson.id
    );
    return previousProgress?.completed || false;
  };

  const getLessonIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[
      iconName.charAt(0).toUpperCase() + iconName.slice(1)
    ] as React.ComponentType<any>;
    return Icon || LucideIcons.BookOpen;
  };

  const createCustomMarkerIcon = (lesson: Lesson, isUnlocked: boolean, isCompleted: boolean, stars: number) => {
    const Icon = getLessonIcon(lesson.icon);

    // Define colors based on status
    // Note: Tailwind dynamic classes might need safelisting or full mapping

    // Since we can't easily use dynamic tailwind classes in renderToStaticMarkup if they aren't safelisted, 
    // let's use inline styles or standard colors for simplicity in this generated HTML.
    // However, for the purpose of this task, we'll try to map a few common colors or use style attributes.

    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      green: '#22c55e',
      red: '#ef4444',
      purple: '#a855f7',
      yellow: '#eab308',
      gray: '#9ca3af'
    };

    const bgColor = isCompleted ? colorMap['yellow'] : (isUnlocked ? (colorMap[lesson.color] || colorMap['blue']) : colorMap['gray']);

    const iconMarkup = renderToStaticMarkup(
      <div className="relative flex flex-col items-center justify-center">
        <div
          style={{ backgroundColor: bgColor }}
          className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center border-4 border-white transition-transform hover:scale-110 ${!isUnlocked ? 'opacity-75' : ''}`}
        >
          {isUnlocked ? (
            <Icon size={32} color="white" />
          ) : (
            <Lock size={32} color="white" />
          )}
        </div>
        {isCompleted && (
          <div className="flex mt-1 space-x-0.5 bg-white/80 rounded-full px-2 py-0.5 shadow-sm">
            {[...Array(stars)].map((_, i) => (
              <div key={i} style={{ color: '#eab308' }}>★</div>
            ))}
          </div>
        )}
        <div className="mt-1 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-md whitespace-nowrap">
          {lesson.title}
        </div>
      </div>
    );

    return L.divIcon({
      html: iconMarkup,
      className: 'custom-marker-icon', // We'll need to ensure this class doesn't interfere
      iconSize: [80, 100],
      iconAnchor: [40, 50]
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600 text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-8">
      <div className="absolute top-6 right-6 bg-white rounded-2xl shadow-lg px-6 py-4 flex items-center space-x-3 z-10">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <span className="text-2xl font-bold text-gray-800">{profile?.lives || 0}</span>
      </div>

      <div className="max-w-4xl mx-auto pt-20">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">
          Tu Camino de Aprendizaje
        </h2>

        <div className="mb-8 h-[600px] w-full rounded-xl overflow-hidden shadow-lg border-4 border-white relative z-0">
          <MapContainer
            bounds={mapBounds}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {lessons.map((lesson, idx) => {
              // Map lesson to a coordinate if available
              const coordinate = LEVEL_COORDINATES[idx];
              if (!coordinate) return null; // Or handle overflow lessons differently

              const lessonProgress = progress.find((p) => p.lesson_id === lesson.id);
              const isUnlocked = isLessonUnlocked(lesson);
              const isCompleted = lessonProgress?.completed || false;
              const stars = lessonProgress?.stars || 0;

              return (
                <Marker
                  key={lesson.id}
                  position={coordinate.position}
                  icon={createCustomMarkerIcon(lesson, isUnlocked, isCompleted, stars)}
                  eventHandlers={{
                    click: () => {
                      if (isUnlocked) {
                        handleLessonClick(lesson);
                      } else {
                        alert("¡Esta lección está bloqueada! Completa la anterior primero.");
                      }
                    }
                  }}
                >
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Optional: Keep the list or hide it. The user implies the map IS the interface. 
            I'll hide the list for now to reduce clutter and focus on the map as requested. 
            If they want it back, it's easy to uncomment. */}
        {/* <div className="space-y-6">
          {lessons.map((lesson, index) => {
            const lessonProgress = progress.find((p) => p.lesson_id === lesson.id);
            const isUnlocked = isLessonUnlocked(lesson);
            const isCompleted = lessonProgress?.completed || false;
            const Icon = getLessonIcon(lesson.icon);

            return (
              <div
                key={lesson.id}
                className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
              >
                <button
                  onClick={() => isUnlocked && handleLessonClick(lesson)}
                  disabled={!isUnlocked}
                  className={`relative group ${!isUnlocked ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                >
                  <div
                    className={`w-24 h-24 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${isCompleted
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                      : isUnlocked
                        ? `bg-gradient-to-br from-${lesson.color}-400 to-${lesson.color}-600 hover:scale-110`
                        : 'bg-gray-400'
                      }`}
                  >
                    {isUnlocked ? (
                      <Icon className="w-12 h-12 text-white" />
                    ) : (
                      <Lock className="w-12 h-12 text-white" />
                    )}
                  </div>

                  {isCompleted && (
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                      <div className="flex space-x-1">
                        {[...Array(lessonProgress?.stars || 0)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 text-yellow-500 fill-yellow-500"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64">
                    <h3 className="font-bold text-gray-800 mb-1">{lesson.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                    <div className="text-xs text-gray-500">
                      Recompensa: {lesson.xp_reward} XP
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div> */}
      </div>
    </div>
  );
}
