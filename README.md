# Learning Platform - Frontend

Frontend приложение для платформы совместного обучения на базе React.

## Технологический стек

- **Framework**: React 18
- **Language**: TypeScript 5
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **Server State**: TanStack Query
- **Routing**: React Router v6
- **Real-time**: Socket.IO Client
- **Forms**: React Hook Form + Zod
- **i18n**: i18next
- **Testing**: Vitest + Playwright

## Начало работы

### Требования

- Node.js >= 20.0.0
- pnpm (рекомендуется) или npm

### Установка

1. Установите зависимости:

```bash
pnpm install
```

2. Скопируйте файл окружения:

```bash
cp .env.example .env
```

3. Запустите сервер разработки:

```bash
pnpm dev
```

Приложение будет доступно по адресу: http://localhost:5173

## Основные команды

### Разработка

```bash
pnpm dev              # Запуск dev-сервера
pnpm build            # Сборка для продакшн
pnpm preview          # Предпросмотр продакшн сборки
```

### Тестирование

```bash
pnpm test             # Запуск unit тестов
pnpm test:watch       # Запуск в watch режиме
pnpm test:ui          # Запуск Vitest UI
pnpm test:e2e         # Запуск E2E тестов
```

### Код-стайл

```bash
pnpm lint             # Проверка кода
pnpm format           # Форматирование кода
```

## Структура проекта

```
src/
├── app/              # Роуты и layouts
├── components/       # Компоненты
│   ├── ui/          # shadcn/ui компоненты
│   ├── layout/      # Layout компоненты
│   ├── features/    # Feature-специфичные
│   └── shared/      # Общие компоненты
├── features/         # Feature модули
│   ├── auth/        # Аутентификация
│   ├── rooms/       # Комнаты
│   ├── video/       # Видео
│   ├── board/       # Доска
│   ├── chat/        # Чат
│   ├── voice/       # Голос
│   └── courses/     # Курсы
├── hooks/            # Custom hooks
├── lib/              # Утилиты
│   ├── api/         # API клиент
│   ├── socket/      # Socket.IO
│   └── utils/       # Утилиты
├── stores/           # Zustand stores
├── i18n/             # Интернационализация
├── types/            # TypeScript types
└── main.tsx          # Entry point
```

## Переменные окружения

См. `.env.example` для списка переменных окружения.

- `VITE_API_URL` - URL backend API
- `VITE_WS_URL` - URL WebSocket сервера

## Тема и стили

- Переключатель светлой и тёмной темы доступен на экранах входа и в шапке приложения. Выбор сохраняется в `localStorage`; при первом посещении используется системная тема.
- Для цветов используйте семантические Tailwind-токены (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`) вместо жёстко заданных цветов.
- Общие стили находятся в `src/index.css`: Tailwind-тема и базовые стили через `@apply`. Стили компонентов размещайте в классах JSX, не добавляя обычные CSS-селекторы.
- Для объединения условных классов используйте `cn(...)` из `src/lib/utils.ts` — он обрабатывает классы через `clsx` и `tailwind-merge`. Предпочитайте стандартные Tailwind-классы произвольным значениям в квадратных скобках.
- Переиспользуемые UI-компоненты находятся в `src/components/ui`; используйте существующие shadcn-компоненты или добавляйте только нужные, совместимые с текущими версиями Tailwind и Radix UI.

## Лицензия

MIT
