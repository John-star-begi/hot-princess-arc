'use client'; 
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUser, loadUserSettings, loadJournal, saveJournal, JournalForm } from '@/lib/journal';

export default function JournalModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<JournalForm>({
    mood: 5,
    energy: 5,
    stress: 5,
    warmth: 5,
    bloating: '',
    notes: '',
    photo_url: '',
  });
  const [userSettings, setUserSettings] = useState<{ start_date: string; cycle_length: number } | null>(null);
  const [message, setMessage] = useState('');
  const [isAlreadyLogged, setIsAlreadyLogged] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    (async () => {
      try {
        const user = await getUser();
        const settings = await loadUserSettings(user.id);
        if (settings) setUserSettings(settings);

        const existing = await loadJournal(user.id, today);
        if (existing) {
          setIsAlreadyLogged(true);
          setForm({
            mood: existing.mood ?? 5,
            energy: existing.energy ?? 5,
            stress: existing.stress ?? 5,
            warmth: existing.warmth ?? 5,
            bloating: existing.bloating ?? '',
            notes: existing.notes ?? '',
            photo_url: existing.photo_url ?? '',
          });
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [today]);

  async function handleSave() {
    try {
      const user = await getUser();
      const { message } = await saveJournal(user.id, today, form, userSettings ?? undefined);
      setMessage(message);
      setIsAlreadyLogged(true);
    } catch {
      setMessage('Error saving ❌');
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gradient-to-b from-[#FFF9F3] to-[#FFEAE3] rounded-t-3xl sm:rounded-3xl w-full max-w-md mx-auto p-6 shadow-[0_8px_30px_rgba(255,180,170,0.25)] overflow-y-auto max-h-[90vh]"
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-playfair italic text-rose-900">
              Log your journal ✍️
            </h2>
            <button onClick={onClose} className="text-rose-500 text-xl hover:text-rose-700">
              ✕
            </button>
          </div>

          {/* Already logged notice */}
          {isAlreadyLogged && (
            <p className="text-center text-rose-700 mb-4 italic">
              Already logged for today 💖
            </p>
          )}

          {/* Form */}
          <div className="space-y-3">
            {['mood', 'energy', 'stress', 'warmth'].map((key) => (
              <div key={key}>
                <label className="block text-sm text-rose-800 capitalize mb-1">
                  {key} (1–10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="w-full rounded-full bg-gradient-to-r from-[#FFF9F3] to-[#FFEAE3] px-4 py-2 text-rose-900 focus:ring-2 focus:ring-rose-200 focus:outline-none"
                  value={(form as any)[key]}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                    setForm({ ...form, [key]: value });
                  }}
                  disabled={isAlreadyLogged}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm text-rose-800 mb-1">Notes</label>
              <textarea
                className="w-full rounded-2xl bg-gradient-to-r from-[#FFF9F3] to-[#FFEAE3] p-3 text-rose-900 focus:ring-2 focus:ring-rose-200 focus:outline-none"
                placeholder="Reflect on how you feel today..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                disabled={isAlreadyLogged}
              />
            </div>
          </div>

          {/* Save button */}
          {!isAlreadyLogged && (
            <button
              onClick={handleSave}
              className="w-full mt-5 rounded-full bg-gradient-to-r from-[#FFD7C8] to-[#F7A7A7] text-white py-3 font-medium shadow-[0_8px_25px_rgba(255,180,170,0.4)] hover:brightness-105 transition"
            >
              Save Entry
            </button>
          )}

          {message && (
            <p className="text-center text-rose-700 mt-3 text-sm">{message}</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
