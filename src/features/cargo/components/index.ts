// src/features/cargo/components/index.ts (экспорт компонентов)
export * from './cargo-form';
export * from './cargo-page';
export * from './cargo-detail-page';

// src/components/app-sidebar.tsx (фрагмент для добавления в существующий файл)
// В импорты добавить:
import { Package } from 'lucide-react';

// В массив навигационных ссылок добавить:
const navigationLinks = [
    // ... существующие ссылки
    {
        title: 'Грузы',
        href: '/cargo',
        icon: Package,
        submenu: [
            {
                title: 'Список грузов',
                href: '/cargo',
            },
            {
                title: 'Добавить груз',
                href: '/cargo/create',
            }
        ]
    },
    // ... остальные ссылки
];