import { Card, CardContent } from '@heroui/react';
import { motion } from 'motion/react';

export default function AccountTypeCard({ label, description, icon, isSelected, onSelect }) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      animate={{ scale: isSelected ? 1.01 : 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="w-full cursor-pointer"
    >
      <Card
        radius="lg"
        shadow="none"
        className={`
          relative text-left rounded-[2rem] border-2
          px-5 py-4 sm:px-6 sm:py-6 min-h-[178px] sm:min-h-[172px]
          ${isSelected
            ? 'border-[rgb(var(--azul))] bg-[#e8ebf8] shadow-[0_2px_8px_rgba(30,58,138,0.12)]'
            : 'border-transparent bg-[#e9e9f2] hover:border-[#c6d2ff]'
          }
        `}
      >
        <CardContent className="p-0">
          <div
            className={`
              absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${isSelected ? 'bg-[rgb(var(--azul))] border-[rgb(var(--azul))]' : 'bg-transparent border-[#b6b9ca]'}
            `}
          >
            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>

          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#c9d7ff] text-[rgb(var(--azul))] flex items-center justify-center text-lg mb-5">
            {icon}
          </div>
          <h3 className="font-semibold text-[#1f232b] text-[1.75rem] sm:text-[1.9rem] mb-2 leading-none">{label}</h3>
          <p className="text-[0.95rem] sm:text-[1rem] text-[#4f5663] leading-[1.45] max-w-[27ch]">{description}</p>
        </CardContent>
      </Card>
    </motion.button>
  );
}