import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    theme: { colors: ['tertiary'] },
    classGroups: {
      'font-size': [
        {
          text: [
            'display',
            'h1',
            'h2',
            'h3',
            'body',
            'caption',
            'small',
            'num',
            'num-lg',
            'label',
            'meta',
            'ui',
            'ui-lg',
            'data',
            'kpi',
            'kpi-lg',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
