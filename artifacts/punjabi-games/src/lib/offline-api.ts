import { useEffect, useState } from "react";

type Role = "user" | "admin" | "moderator";
type Difficulty = "easy" | "medium" | "hard";
type DisplayMode = "wheel" | "slot-vertical" | "slot-horizontal" | "flash";

type User = { id: number; clerkId: string; username: string; displayName: string | null; avatarUrl: string | null; role: Role; totalPoints: number; createdAt: string };
type EventPlayer = { id: number; name: string; place: string; createdAt: string; isActive: boolean };
type EventSettings = { attempts: Record<string, number> };
type SpinnerItem = { label: string; type: "text" | "image" | "number"; imageUrl?: string | null; color?: string | null; weight?: number | null };
type SpinnerConfig = { id: number; name: string; description?: string | null; items: SpinnerItem[]; isActive?: boolean; displayMode?: DisplayMode; createdAt: string };
type TongueTwister = { id: number; text: string; transliteration: string | null; translation?: string | null; difficulty: Difficulty; isActive?: boolean; createdAt: string };
type KnowledgeQuestion = { id: number; question: string; imageUrl?: string | null; options: string[]; correctAnswer: string; explanation?: string | null; category?: string | null; difficulty: Difficulty; isActive?: boolean; createdAt: string };
type PictureQuestion = { id: number; imageUrl: string; imageEmoji: string; answer: string; options: string[]; isActive?: boolean; createdAt: string };
type Session = { id: number; type: "spin" | "quiz" | "memory" | "tongue-twister" | "picture"; pointsEarned: number; createdAt: string; playerId?: number; playerName?: string; playerPlace?: string; [key: string]: unknown };
type Submission = { id: number; tongueTwisterId: number; userId: number; username?: string; audioUrl: string; status: "pending" | "approved" | "rejected"; score?: number | null; feedback?: string | null; pointsEarned?: number | null; createdAt: string; reviewedAt?: string | null };

const now = () => new Date().toISOString();
const keys = { user: "pk_user", players: "pk_players", currentPlayer: "pk_current_player", settings: "pk_event_settings", spinner: "pk_spinner", twisters: "pk_twisters", questions: "pk_questions", pictures: "pk_picture_questions", sessions: "pk_sessions", submissions: "pk_submissions" };

const seedUser: User = { id: 1, clerkId: "local", username: "little-player", displayName: "Little Player", avatarUrl: null, role: "admin", totalPoints: 0, createdAt: now() };
const PUNJABI_35_COLORS = [
  "#E8721A","#1A56E8","#FFB300","#4CAF50","#E91E63","#9C27B0","#00BCD4","#FF5722",
  "#3F51B5","#8BC34A","#FF9800","#009688","#F44336","#673AB7","#CDDC39","#2196F3",
  "#FFEB3B","#795548","#607D8B","#E91E8C","#03A9F4","#8E24AA","#FFC107","#4CAF50",
  "#F06292","#5E35B1","#FF7043","#29B6F6","#AB47BC","#FFA726","#66BB6A","#EF5350",
  "#42A5F5","#7CB342","#D81B60"
];

const PUNJABI_35_LETTERS = [
  "ੳ","ਅ","ੲ","ਸ","ਹ","ਕ","ਖ","ਗ","ਘ","ਙ","ਚ","ਛ","ਜ","ਝ","ਞ",
  "ਟ","ਠ","ਡ","ਢ","ਣ","ਤ","ਥ","ਦ","ਧ","ਨ","ਪ","ਫ","ਬ","ਭ","ਮ",
  "ਯ","ਰ","ਲ","ਵ","ੜ"
];

const seedSpinner: SpinnerConfig[] = [
  { id: 1, name: "ਪੈਂਤੀ ਅੱਖਰ (35 Letters)", description: "Spin and say the letter out loud! All 35 Punjabi letters.", isActive: true, displayMode: "wheel", createdAt: now(), items:
    PUNJABI_35_LETTERS.map((letter, i) => ({ label: letter, type: "text" as const, color: PUNJABI_35_COLORS[i], weight: 1 }))
  },
  { id: 2, name: "Fun Actions", description: "Do the action you land on", isActive: true, displayMode: "flash", createdAt: now(), items: [
    { label: "Clap", type: "text", color: "#E8721A", weight: 1 }, { label: "Jump", type: "text", color: "#1A56E8", weight: 1 }, { label: "Dance", type: "text", color: "#4CAF50", weight: 1 }, { label: "Roar", type: "text", color: "#E91E63", weight: 1 }
  ]}
];
const seedTwisters: TongueTwister[] = [
  { id: 1, text: "ਕੱਚਾ ਪਾਪੜ ਪੱਕਾ ਪਾਪੜ", transliteration: "Kacha papad pakka papad", translation: "Raw papad, cooked papad", difficulty: "easy", isActive: true, createdAt: now() },
  { id: 2, text: "ਚੰਦੂ ਦੇ ਚਾਚਾ ਨੇ ਚੰਦੂ ਦੀ ਚਾਚੀ ਨੂੰ", transliteration: "Chandu de chacha ne Chandu di chachi nu", translation: "A classic fast speaking challenge", difficulty: "medium", isActive: true, createdAt: now() },
  { id: 3, text: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਸਾਰਿਆਂ ਨੂੰ", transliteration: "Sat Sri Akal saareyan nu", translation: "Hello everyone", difficulty: "easy", isActive: true, createdAt: now() }
];
const seedQuestions: KnowledgeQuestion[] = [
  { id: 1, question: "Which letter is ਅ?", options: ["A", "B", "C", "D"], correctAnswer: "A", explanation: "ਅ is the first Gurmukhi vowel sound.", category: "Letters", difficulty: "easy", isActive: true, createdAt: now() },
  { id: 2, question: "What does ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ mean?", options: ["Goodbye", "Hello", "Thank you", "Sleep"], correctAnswer: "Hello", category: "Culture", difficulty: "easy", isActive: true, createdAt: now() },
  { id: 3, question: "Which one is a Punjabi food?", options: ["Pizza", "Sarson da saag", "Sushi", "Taco"], correctAnswer: "Sarson da saag", category: "Culture", difficulty: "easy", isActive: true, createdAt: now() },
  { id: 4, question: "What is the Punjabi word for water?", options: ["Paani", "Doodh", "Roti", "Khed"], correctAnswer: "Paani", category: "Words", difficulty: "easy", isActive: true, createdAt: now() },
  { id: 5, question: "Which script is used for Punjabi in Punjab, India?", options: ["Gurmukhi", "Latin", "Greek", "Cyrillic"], correctAnswer: "Gurmukhi", category: "Culture", difficulty: "medium", isActive: true, createdAt: now() }
];
const seedPictures: PictureQuestion[] = [
  { id: 1, imageUrl: "", imageEmoji: "🍎", answer: "ਸੇਬ", options: ["ਸੇਬ", "ਕੇਲਾ", "ਅੰਬ", "ਅੰਗੂਰ"], isActive: true, createdAt: now() },
  { id: 2, imageUrl: "", imageEmoji: "🐘", answer: "ਹਾਥੀ", options: ["ਸ਼ੇਰ", "ਹਾਥੀ", "ਘੋੜਾ", "ਕੁੱਤਾ"], isActive: true, createdAt: now() },
  { id: 3, imageUrl: "", imageEmoji: "🌻", answer: "ਫੁੱਲ", options: ["ਰੁੱਖ", "ਪੱਤਾ", "ਫੁੱਲ", "ਘਾਹ"], isActive: true, createdAt: now() },
  { id: 4, imageUrl: "", imageEmoji: "🏠", answer: "ਘਰ", options: ["ਸਕੂਲ", "ਘਰ", "ਦੁਕਾਨ", "ਖੇਤ"], isActive: true, createdAt: now() }
];
const seedSettings: EventSettings = { attempts: { spinner: 3, memory: 3, "tongue-twister": 2, picture: 3, quiz: 3 } };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event("pk-local-change")); }
function nextId(items: { id: number }[]) { return Math.max(0, ...items.map(i => i.id)) + 1; }
function sessions() { return read<Session[]>(keys.sessions, []); }
function currentPlayer() { const id = Number(localStorage.getItem(keys.currentPlayer) || 0); return read<EventPlayer[]>(keys.players, []).find(p => p.id === id && p.isActive) || null; }
function saveSession(session: Omit<Session, "id" | "createdAt">) {
  const player = currentPlayer();
  const newSession: Session = { id: nextId(sessions()), createdAt: now(), playerId: player?.id, playerName: player?.name, playerPlace: player?.place, ...session } as Session;
  const next = [...sessions(), newSession];
  write(keys.sessions, next);
  syncUserPoints();
  return newSession;
}
function syncUserPoints() { const user = read(keys.user, seedUser); user.totalPoints = sessions().reduce((sum, s) => sum + Number(s.pointsEarned || 0), 0); write(keys.user, user); }
function gameCount(type: Session["type"], playerId?: number) { return sessions().filter(s => s.type === type && (!playerId || s.playerId === playerId)).length; }
function useVersion() { const [v, setV] = useState(0); useEffect(() => { const h = () => setV((x: number) => x + 1); window.addEventListener("pk-local-change", h); return () => window.removeEventListener("pk-local-change", h); }, []); return v; }
function mutation<TArgs, TResult>(fn: (args: TArgs) => TResult) { return { isPending: false, mutate: (args: TArgs, opts?: { onSuccess?: (r: TResult) => void; onError?: () => void }) => { try { const r = fn(args); opts?.onSuccess?.(r); } catch { opts?.onError?.(); } }, mutateAsync: async (args: TArgs) => fn(args) }; }

export function useGetMe() { useVersion(); return { data: read<User>(keys.user, seedUser), isLoading: false }; }
export function useUpdateMe() { return mutation<{ data: Partial<User> }, User>(({ data }) => { const user = { ...read<User>(keys.user, seedUser), ...data }; write(keys.user, user); return user; }); }
export function useGetCurrentPlayer() { useVersion(); return { data: currentPlayer(), isLoading: false }; }
export function useStartEventPlayer() { return mutation<{ data: { name: string; place: string } }, EventPlayer>(({ data }) => { const list = read<EventPlayer[]>(keys.players, []); const item = { id: nextId(list), name: data.name.trim(), place: data.place.trim(), createdAt: now(), isActive: true }; write(keys.players, [...list, item]); localStorage.setItem(keys.currentPlayer, String(item.id)); window.dispatchEvent(new Event("pk-local-change")); return item; }); }
export function useResetCurrentPlayer() { return mutation<{}, void>(() => { const player = currentPlayer(); if (!player) return; write(keys.sessions, sessions().filter(s => s.playerId !== player.id)); syncUserPoints(); }); }
export function useNewEventPlayer() { return mutation<{}, void>(() => { localStorage.removeItem(keys.currentPlayer); window.dispatchEvent(new Event("pk-local-change")); }); }
export function useGetEventSettings() { useVersion(); return { data: read<EventSettings>(keys.settings, seedSettings), isLoading: false }; }
export function useGetGameProgress(game: Session["type"]) { useVersion(); const player = currentPlayer(); const settings = read<EventSettings>(keys.settings, seedSettings); const limit = settings.attempts[game] ?? 1; const used = player ? gameCount(game, player.id) : 0; return { data: { used, limit, remaining: Math.max(0, limit - used), isComplete: used >= limit }, isLoading: false }; }
export function useGetMyStats() { useVersion(); const player = currentPlayer(); const all = sessions().filter(s => !player || s.playerId === player.id); const totalPoints = all.reduce((s, x) => s + Number(x.pointsEarned || 0), 0); const topScore = all.length ? Math.max(...all.map(s => Number(s.pointsEarned || 0))) : 0; return { data: { totalPoints, topScore, spinsPlayed: all.filter(s => s.type === "spin").length, tongueTwisterSubmissions: all.filter(s => s.type === "tongue-twister").length, quizzesCompleted: all.filter(s => s.type === "quiz").length, rank: 1, recentActivity: all.slice(-5).reverse().map(s => ({ type: s.type === "memory" ? "quiz" : s.type, points: s.pointsEarned, createdAt: s.createdAt })) }, isLoading: false }; }
export function useListSpinnerConfigs() { useVersion(); return { data: read<SpinnerConfig[]>(keys.spinner, seedSpinner), isLoading: false }; }
export function useCreateSpinnerConfig() { return mutation<{ data: Omit<SpinnerConfig, "id" | "createdAt"> }, SpinnerConfig>(({ data }) => { const list = read<SpinnerConfig[]>(keys.spinner, seedSpinner); const item = { ...data, id: nextId(list), createdAt: now() }; write(keys.spinner, [...list, item]); return item; }); }
export function useUpdateSpinnerConfig() { return mutation<{ id: number; data: Partial<SpinnerConfig> }, SpinnerConfig>(({ id, data }) => { const list = read<SpinnerConfig[]>(keys.spinner, seedSpinner); const item = { ...list.find(x => x.id === id)!, ...data }; write(keys.spinner, list.map(x => x.id === id ? item : x)); return item; }); }
export function useDeleteSpinnerConfig() { return mutation<{ id: number }, void>(({ id }) => write(keys.spinner, read<SpinnerConfig[]>(keys.spinner, seedSpinner).filter(x => x.id !== id))); }
export function useRecordSpin() { return mutation<{ data: { configId: number; resultLabel: string; pointsEarned?: number } }, Session>(({ data }) => saveSession({ type: "spin", pointsEarned: data.pointsEarned ?? 10, ...data })); }
export function useListTongueTwisters() { useVersion(); return { data: read<TongueTwister[]>(keys.twisters, seedTwisters), isLoading: false }; }
export function useCreateTongueTwister() { return mutation<{ data: Omit<TongueTwister, "id" | "createdAt"> }, TongueTwister>(({ data }) => { const list = read<TongueTwister[]>(keys.twisters, seedTwisters); const item = { ...data, id: nextId(list), createdAt: now() }; write(keys.twisters, [...list, item]); return item; }); }
export function useUpdateTongueTwister() { return mutation<{ id: number; data: Partial<TongueTwister> }, TongueTwister>(({ id, data }) => { const list = read<TongueTwister[]>(keys.twisters, seedTwisters); const item = { ...list.find(x => x.id === id)!, ...data }; write(keys.twisters, list.map(x => x.id === id ? item : x)); return item; }); }
export function useDeleteTongueTwister() { return mutation<{ id: number }, void>(({ id }) => write(keys.twisters, read<TongueTwister[]>(keys.twisters, seedTwisters).filter(x => x.id !== id))); }
export function useSubmitTongueTwisterRecording() { return mutation<{ id: number; data: { audioUrl: string; durationSeconds?: number; pointsEarned?: number } }, Submission>(({ id, data }) => { const user = read<User>(keys.user, seedUser); const list = read<Submission[]>(keys.submissions, []); const item: Submission = { id: nextId(list), tongueTwisterId: id, userId: user.id, username: user.username, audioUrl: data.audioUrl, status: "pending", createdAt: now() }; write(keys.submissions, [...list, item]); saveSession({ type: "tongue-twister", pointsEarned: data.pointsEarned ?? 5, tongueTwisterId: id }); return item; }); }
export function useListTongueTwisterSubmissions(_opts?: unknown) { useVersion(); return { data: read<Submission[]>(keys.submissions, []), isLoading: false }; }
export function useReviewTongueTwisterSubmission() { return mutation<{ id: number; data: { status: "approved" | "rejected"; score: number; feedback?: string } }, Submission>(({ id, data }) => { const list = read<Submission[]>(keys.submissions, []); const item = { ...list.find(x => x.id === id)!, ...data, pointsEarned: data.status === "approved" ? Math.max(0, Math.round(data.score / 10)) : 0, reviewedAt: now() }; write(keys.submissions, list.map(x => x.id === id ? item : x)); return item; }); }
export function useListKnowledgeTests() { useVersion(); return { data: read<KnowledgeQuestion[]>(keys.questions, seedQuestions), isLoading: false }; }
export function useCreateKnowledgeQuestion() { return mutation<{ data: Omit<KnowledgeQuestion, "id" | "createdAt"> }, KnowledgeQuestion>(({ data }) => { const list = read<KnowledgeQuestion[]>(keys.questions, seedQuestions); const item = { ...data, id: nextId(list), createdAt: now() }; write(keys.questions, [...list, item]); return item; }); }
export function useUpdateKnowledgeQuestion() { return mutation<{ id: number; data: Partial<KnowledgeQuestion> }, KnowledgeQuestion>(({ id, data }) => { const list = read<KnowledgeQuestion[]>(keys.questions, seedQuestions); const item = { ...list.find(x => x.id === id)!, ...data }; write(keys.questions, list.map(x => x.id === id ? item : x)); return item; }); }
export function useDeleteKnowledgeQuestion() { return mutation<{ id: number }, void>(({ id }) => write(keys.questions, read<KnowledgeQuestion[]>(keys.questions, seedQuestions).filter(x => x.id !== id))); }
export function useGetRandomQuiz(opts?: { query?: { count?: number; difficulty?: Difficulty } }) { useVersion(); const count = opts?.query?.count ?? 5; const difficulty = opts?.query?.difficulty; const qs = read<KnowledgeQuestion[]>(keys.questions, seedQuestions).filter(q => q.isActive !== false && (!difficulty || q.difficulty === difficulty)).slice(0, count); return { data: { questions: qs }, isLoading: false }; }
export function useSubmitQuizAnswers() { return mutation<{ data: { answers: { questionId: number; selectedAnswer: string }[] } }, { score: number; totalQuestions: number; correctAnswers: number; pointsEarned: number; breakdown: unknown[] }>(({ data }) => { const qs = read<KnowledgeQuestion[]>(keys.questions, seedQuestions); const breakdown = data.answers.map(a => { const q = qs.find(x => x.id === a.questionId); return { questionId: a.questionId, correct: q?.correctAnswer === a.selectedAnswer, selectedAnswer: a.selectedAnswer, correctAnswer: q?.correctAnswer ?? "" }; }); const correctAnswers = breakdown.filter(b => b.correct).length; const totalQuestions = data.answers.length; const score = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0; const pointsEarned = correctAnswers * 20; saveSession({ type: "quiz", pointsEarned, score, correctAnswers, totalQuestions }); return { score, totalQuestions, correctAnswers, pointsEarned, breakdown }; }); }
export function useSubmitMemoryGameSession() { return mutation<{ data: { maxLevel: number; pointsEarned: number; bestTime?: number; avgTime?: number } }, Session>(({ data }) => saveSession({ type: "memory", ...data })); }
export function useListPictureQuestions() { useVersion(); return { data: read<PictureQuestion[]>(keys.pictures, seedPictures).filter(q => q.isActive !== false), isLoading: false }; }
export function useSubmitPictureAnswer() { return mutation<{ data: { questionId: number; selectedAnswer: string } }, { correct: boolean; pointsEarned: number; correctAnswer: string }>(({ data }) => { const q = read<PictureQuestion[]>(keys.pictures, seedPictures).find(x => x.id === data.questionId); const correct = q?.answer === data.selectedAnswer; const pointsEarned = correct ? 20 : 0; saveSession({ type: "picture", pointsEarned, questionId: data.questionId, selectedAnswer: data.selectedAnswer, correctAnswer: q?.answer, correct }); return { correct, pointsEarned, correctAnswer: q?.answer ?? "" }; }); }
export function useGetMemoryGameLeaderboard(_opts?: { params?: { limit?: number } }) {
  useVersion();
  const user = read<User>(keys.user, seedUser);
  const mem = sessions().filter(s => s.type === "memory");
  const bestLevel = Math.max(0, ...mem.map(s => Number(s.maxLevel || 0)));
  const bestTime = mem.length ? Math.min(...mem.map(s => Number(s.bestTime || 99999))) : 0;
  return { data: [{ rank: 1, userId: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl, bestLevel, bestTime, gamesPlayed: mem.length }], isLoading: false };
}
export function useResetScores() { return mutation<{}, void>(() => { write(keys.sessions, []); const user = read<User>(keys.user, seedUser); user.totalPoints = 0; write(keys.user, user); localStorage.removeItem("yaad-best-time"); }); }
export function useGetLeaderboard(_opts?: { query?: unknown; params?: { limit?: number; game?: string } }) {
  useVersion();
  const players = read<EventPlayer[]>(keys.players, []);
  const rows = players.map(player => {
    const all = sessions().filter(s => s.playerId === player.id);
    return { rank: 0, userId: player.id, username: player.name, displayName: player.name, place: player.place, avatarUrl: null, totalPoints: all.reduce((sum, s) => sum + Number(s.pointsEarned || 0), 0), gamesPlayed: all.length };
  }).filter(row => row.gamesPlayed > 0 || row.userId === currentPlayer()?.id).sort((a, b) => b.totalPoints - a.totalPoints).map((row, index) => ({ ...row, rank: index + 1 }));
  const user = read<User>(keys.user, seedUser);
  return { data: rows.length ? rows : [{ rank: 1, userId: user.id, username: user.username, displayName: user.displayName, place: "", avatarUrl: user.avatarUrl, totalPoints: user.totalPoints, gamesPlayed: sessions().length }], isLoading: false };
}
export function useListAdminUsers(_opts?: { params?: unknown }) { useVersion(); return { data: [read<User>(keys.user, seedUser)], isLoading: false }; }
export function useUpdateUserRole() { return mutation<{ id: string; data: { role: Role } }, User>(({ data }) => { const user = { ...read<User>(keys.user, seedUser), role: data.role }; write(keys.user, user); return user; }); }
export function useGetAdminDashboard() { useVersion(); const subs = read<Submission[]>(keys.submissions, []); const totalGamesPlayed = sessions().length; const user = read<User>(keys.user, seedUser); return { data: { totalUsers: 1, activeUsers: 1, pendingSubmissions: subs.filter(s => s.status === "pending").length, totalGamesPlayed, recentSubmissions: subs.slice(-5).reverse(), topPlayers: [{ rank: 1, userId: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl, totalPoints: user.totalPoints, gamesPlayed: totalGamesPlayed }] }, isLoading: false }; }
