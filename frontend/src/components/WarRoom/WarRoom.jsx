import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

export default function WarRoom({ active }) {
    const scores = useDashboardStore((s) => s.scores);
    const bss = scores?.bss || 0;

    return (
        <AnimatePresence>
            {active && (
                <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center">
                    {/* Pulsing Border */}
                    <motion.div
                        className="absolute inset-0 border-[4px] border-red-500/50"
                        initial={{ opacity: 0 }}
                        animate={{ 
                            opacity: [0.3, 0.7, 0.3],
                            boxShadow: ['inset 0 0 0px rgba(239,68,68,0)', 'inset 0 0 100px rgba(239,68,68,0.2)', 'inset 0 0 0px rgba(239,68,68,0)']
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        exit={{ opacity: 0 }}
                    />
                    
                    {/* Banner */}
                    <motion.div
                        className="relative mt-4 px-6 py-3 bg-red-500/20 border border-red-500/30 backdrop-blur-md rounded-full shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center gap-3"
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <AlertOctagon size={20} className="text-red-400 animate-pulse" />
                        <span className="text-red-100 font-bold tracking-wide text-sm uppercase">
                            War Room Active — BSS: {Math.round(bss)}
                        </span>
                        <AlertOctagon size={20} className="text-red-400 animate-pulse" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
