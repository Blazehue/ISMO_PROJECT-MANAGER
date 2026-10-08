import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

// Mirrors passwordSchema in packages/shared.
const rules = [
  { label: '8+ characters', test: (value: string) => value.length >= 8 },
  { label: 'A letter', test: (value: string) => /[A-Za-z]/.test(value) },
  { label: 'A number', test: (value: string) => /\d/.test(value) },
];

export function PasswordChecklist({ value }: { value: string }) {
  const passed = rules.filter((rule) => rule.test(value)).length;
  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex gap-1">
        {rules.map((rule, i) => (
          <div key={rule.label} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-brand-400"
              animate={{ width: i < passed ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {rules.map((rule) => {
          const ok = rule.test(value);
          return (
            <li
              key={rule.label}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                ok ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-3.5 items-center justify-center rounded-full border transition-colors',
                  ok && 'border-brand-500 bg-brand-500 text-white',
                )}
              >
                {ok && <Check className="size-2.5" strokeWidth={3} />}
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
