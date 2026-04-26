'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { motion } from 'motion/react';
import AccountTypeCard from '@/components/ui/AccountTypeCard';
import InlineNotice from '@/components/ui/InlineNotice';

// Selector de tipo de cuenta con validación y aviso reusable para flujos de auth.
export default function AccountTypeSelector({ options, onContinue }) {
  const [selected, setSelected] = useState(null);
  const [showSelectionWarning, setShowSelectionWarning] = useState(false);

  const handleContinue = () => {
    if (!selected) {
      setShowSelectionWarning(true);
      return;
    }

    setShowSelectionWarning(false);
    onContinue?.(selected);
  };

  return (
    <>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
      >
        {options.map((type) => (
          <AccountTypeCard
            key={type.id}
            {...type}
            isSelected={selected === type.id}
            onSelect={() => {
              setSelected(type.id);
              setShowSelectionWarning(false);
            }}
          />
        ))}
      </motion.div>

      <Button
        onPress={handleContinue}
        onClick={handleContinue}
        size="lg"
        radius="full"
        color="primary"
        variant="solid"
        className="auth-primary-button mt-12 sm:mt-14 mx-auto block sm:w-[280px] data-[hover=true]:bg-[#0a3e93] disabled:cursor-not-allowed enabled:cursor-pointer"
      >
        Continuar →
      </Button>

      <InlineNotice
        show={showSelectionWarning}
        message="Antes de continuar, elegí un tipo de cuenta."
        className="mt-5"
      />
      
    </>
  );
}
