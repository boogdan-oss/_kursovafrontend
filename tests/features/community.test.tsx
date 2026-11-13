import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { CommunityPage } from '@/features/community/CommunityPage'
import { feedItemKey, opportunityRoute, pairLabel } from '@/features/community/lib'
import { UserProfilePage } from '@/features/community/UserProfilePage'
import { ApiError, apiClient } from '@/shared/api/client'
import type {
  AttachedOpportunity,
  Author,
  FeedItem,
  PostView,
  ProfileView,
} from '@/shared/api/community-types'
import type { AuthResponse } from '@/shared/api/types'
import { useAuthStore } from '@/store/useAuthStore'
import { useFiltersStore } from '@/store/useFiltersStore'

const ME: Author = { id: 1, username: 'bohdan', is_admin: false }
const MAX: Author = { id: 101, username: 'max_p2p', is_admin: false }
const IRYNA: Author = { id: 102, username: 'iryna.crypto', is_admin: false }

const OPPORTUNITY: AttachedOpportunity = {
  id: 9001,
  kind: 'cross_exchange',
  asset: 'USDT',
  fiat: 'UAH',
  buy_exchange: 'bybit',
  sell_exchange: 'binance',
  buy_price: '41.05',
  sell_price: '41.62',
  spread_pct: '1.39',
  net_spread_pct: '1.40',
  estimated_profit: '284.68',
  ai_score: 91,
  detected_at: '2026-11-13T10:00:00Z',
  duration_sec: 2520,
}

function post(overrides: Partial<PostView> = {}): PostView {
  return {
    id: 1,
    author: MAX,
    text: 'USDT/UAH на Bybit тримається на рівні 41.05',
    pair: null,
    opportunity: OPPORTUNITY,
    status: 'visible',
    likes: 48,
    comments: 12,
    reposts: 6,
    liked_by_me: false,
    reposted_by_me: false,
    created_at: new Date(Date.now() - 15 * 60_000).toISOString(),
    updated_at: null,
    ...overrides,
  }
}

const MAX_POST = post()
const IRYNA_POST = post({
  id: 2,
  author: IRYNA,
  text: 'Порада новачкам: перевіряйте рейтинг продавця',
  opportunity: null,
  pair: { asset: 'USDT', fiat: 'EUR' },
  likes: 31,
  comments: 7,
  reposts: 9,
  reposted_by_me: true,
})
const MY_POST = post({ id: 3, author: ME, text: 'Тестую AI-оцінки в UPars', opportunity: null })

const item = (value: PostView, repostedBy: Author | null = null): FeedItem => ({
  post: value,
  reposted_by: repostedBy,
  at: value.created_at,
})

const FEED = [item(MAX_POST), item(IRYNA_POST, ME), item(MY_POST)]

const PROFILE: ProfileView = {
  id: 101,
  username: 'max_p2p',
  is_admin: false,
  status: 'active',
  joined_at: '2026-10-01T10:00:00Z',
  posts: 12,
  likes_received: 184,
  reposts_received: 9,
}

function signIn(role: 'user' | 'admin' = 'user') {
  const response = {
    access_token: 'token',
    refresh_token: 'refresh',
    token_type: 'bearer',
    expires_in: 900,
    refresh_expires_in: 2_592_000,
    user: {
      id: ME.id,
      username: ME.username,
      email: 'bohdan@example.com',
      role,
      status: 'active',
      telegram_connected: false,
      google_connected: false,
      settings: {},
      created_at: '2026-10-01T10:00:00Z',
    },
  } as AuthResponse
  useAuthStore.getState().signIn(response, true)
}

function mockApi(feed: FeedItem[] = FEED) {
  const get = vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
    if (url === '/community/feed' || url.endsWith('/feed')) {
      return { data: { items: feed, next_cursor: null } }
    }
    if (url === '/community/trending-pairs') {
      return {
        data: {
          items: [
            { asset: 'USDT', fiat: 'UAH', posts: 128, likes: 900, comments: 50, change_pct: '0.4' },
          ],
        },
      }
    }
    if (url.startsWith('/community/users/')) return { data: PROFILE }
    if (url.endsWith('/comments')) {
      return {
        data: {
          count: 1,
          items: [
            {
              id: 7,
              post_id: 1,
              author: IRYNA,
              text: 'Підтверджую, працює',
              status: 'visible',
              created_at: '2026-11-13T10:00:00Z',
              updated_at: null,
            },
          ],
        },
      }
    }
    if (url === '/admin/bans') return { data: { count: 0, items: [] } }
    if (url === '/opportunities/history') return { data: { count: 0, items: [] } }
    return { data: { count: 0, assets: ['USDT', 'BTC'], fiats: ['UAH'], items: [] } }
  })
  return { get }
}

function renderAt(path: string) {
  render(
    <Providers>
      <MemoryRouter
        initialEntries={[path]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/u/:username" element={<UserProfilePage />} />
          <Route path="/login" element={<p>Сторінка входу</p>} />
        </Routes>
      </MemoryRouter>
    </Providers>,
  )
}

function card(text: string) {
  return screen.getByText(text).closest('article')!
}

function openMenu(container: HTMLElement, label = 'Дії з публікацією') {
  fireEvent.keyDown(within(container).getAllByRole('button', { name: label })[0], { key: 'Enter' })
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useAuthStore.getState().signOut()
  useFiltersStore.getState().reset()
})

afterEach(() => vi.restoreAllMocks())

describe('community lib', () => {
  it('ключі стрічки розрізняють пост і його репост', () => {
    expect(feedItemKey(item(MAX_POST))).toBe('1:post')
    expect(feedItemKey(item(MAX_POST, ME))).toBe('1:1')
  })

  it('описує прикріплену можливість і пару', () => {
    expect(opportunityRoute({ ...OPPORTUNITY, buy_price: '41.05000000' })).toBe(
      'Купити на Bybit за 41,05 → продати на Binance за 41,62',
    )
    expect(pairLabel({ asset: 'BTC', fiat: 'EUR' })).toBe('BTC/EUR')
  })
})

describe('стрічка спільноти', () => {
  it('гостю показує стрічку, але не дає писати й реагувати', async () => {
    mockApi()
    renderAt('/community')

    expect(await screen.findByText(MAX_POST.text)).toBeInTheDocument()
    expect(
      screen.getByText('Купити на Bybit за 41,05 → продати на Binance за 41,62'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Увійдіть, щоб публікувати, вподобувати й коментувати.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Мої публікації' })).not.toBeInTheDocument()
    expect(within(card(MAX_POST.text)).getByRole('button', { name: 'Вподобати' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Дії з публікацією' })).not.toBeInTheDocument()
    expect(screen.getByText('USDT/UAH')).toBeInTheDocument()
    expect(screen.getByText('+0,4%')).toBeInTheDocument()
  })

  it('публікує текст із прикріпленою парою', async () => {
    signIn()
    mockApi()
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: MY_POST })
    renderAt('/community')

    await userEvent.type(screen.getByRole('textbox', { name: 'Текст публікації' }), '  Нова ідея  ')
    fireEvent.keyDown(screen.getByRole('button', { name: '+ Валютна пара' }), { key: 'Enter' })
    await userEvent.click(await screen.findByRole('menuitem', { name: 'USDT/UAH' }))
    await userEvent.click(screen.getByRole('button', { name: 'Опублікувати' }))

    expect(post).toHaveBeenCalledWith('/community/posts', {
      text: 'Нова ідея',
      pair: { asset: 'USDT', fiat: 'UAH' },
      opportunity_id: null,
    })
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Текст публікації' })).toHaveValue(''),
    )
  })

  it('вподобання змінюється одразу й відкочується при помилці', async () => {
    signIn()
    mockApi()
    const put = vi
      .spyOn(apiClient, 'put')
      .mockRejectedValue(new ApiError('Обліковий запис заблоковано', { status: 403 }))
    renderAt('/community')
    await screen.findByText(MAX_POST.text)

    const like = within(card(MAX_POST.text)).getByRole('button', { name: 'Вподобати' })
    expect(like).toHaveTextContent('48')
    await userEvent.click(like)

    expect(put).toHaveBeenCalledWith('/community/posts/1/like')
    expect(
      await within(card(MAX_POST.text)).findByText('Обліковий запис заблоковано'),
    ).toBeInTheDocument()
    expect(
      within(card(MAX_POST.text)).getByRole('button', { name: 'Вподобати' }),
    ).toHaveTextContent('48')
  })

  it('свій репост можна скасувати з банера', async () => {
    signIn()
    mockApi()
    const remove = vi
      .spyOn(apiClient, 'delete')
      .mockResolvedValue({ data: { ...IRYNA_POST, reposted_by_me: false, reposts: 8 } })
    renderAt('/community')

    expect(await screen.findByText('Ви поширили цю публікацію')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Скасувати репост' }))
    expect(remove).toHaveBeenCalledWith('/community/posts/2/repost')
  })

  it('власну публікацію можна редагувати й видалити', async () => {
    signIn()
    mockApi()
    const patch = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      data: { ...MY_POST, text: 'Оновлений текст', updated_at: MY_POST.created_at },
    })
    const remove = vi.spyOn(apiClient, 'delete').mockResolvedValue({ data: undefined })
    renderAt('/community')

    const own = await screen.findByText(MY_POST.text)
    expect(within(own.closest('article')!).getByText('Ви')).toBeInTheDocument()
    openMenu(own.closest('article')!)
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Редагувати' }))
    const editor = screen.getByRole('textbox', { name: 'Редагування публікації' })
    await userEvent.clear(editor)
    await userEvent.type(editor, 'Оновлений текст')
    await userEvent.click(screen.getByRole('button', { name: 'Зберегти' }))
    expect(patch).toHaveBeenCalledWith('/community/posts/3', { text: 'Оновлений текст' })
    expect(await screen.findByText('Оновлений текст')).toBeInTheDocument()
    expect(editor).not.toBeInTheDocument()

    openMenu(card('Оновлений текст'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Видалити' }))
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Видалити' }),
    )
    expect(remove).toHaveBeenCalledWith('/community/posts/3')
    await waitFor(() => expect(screen.queryByText('Оновлений текст')).not.toBeInTheDocument())
  })

  it('скарга на чужу публікацію з причиною і повтор — 409', async () => {
    signIn()
    mockApi()
    const post = vi
      .spyOn(apiClient, 'post')
      .mockRejectedValue(new ApiError('Ви вже поскаржилися на це', { status: 409 }))
    renderAt('/community')

    openMenu(card(await screen.findByText(MAX_POST.text).then((node) => node.textContent!)))
    expect(screen.queryByRole('menuitem', { name: 'Редагувати' })).not.toBeInTheDocument()
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Поскаржитися' }))
    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByLabelText('Спам або реклама'))
    await userEvent.click(within(dialog).getByRole('button', { name: 'Надіслати скаргу' }))

    expect(post).toHaveBeenCalledWith('/community/reports', { post_id: 1, reason: 'spam' })
    expect(await within(dialog).findByText('Ви вже поскаржилися на це')).toBeInTheDocument()
  })

  it('адмін бачить модерацію: приховати й заблокувати автора', async () => {
    signIn('admin')
    mockApi()
    const put = vi
      .spyOn(apiClient, 'put')
      .mockResolvedValue({ data: { ...MAX_POST, status: 'hidden' } })
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} })
    renderAt('/community')

    openMenu(card(await screen.findByText(MAX_POST.text).then((node) => node.textContent!)))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Приховати публікацію' }))
    expect(put).toHaveBeenCalledWith('/admin/posts/1/status', { status: 'hidden' })
    expect(await within(card(MAX_POST.text)).findByText('Приховано')).toBeInTheDocument()

    openMenu(card(MAX_POST.text))
    expect(
      await screen.findByRole('menuitem', { name: 'Відновити публікацію' }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Заблокувати автора' }))
    const dialog = screen.getByRole('dialog')
    await userEvent.type(within(dialog).getByRole('textbox'), 'Шахрайство')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Заблокувати' }))
    expect(post).toHaveBeenCalledWith('/admin/bans', {
      user_id: 101,
      days: 7,
      reason: 'Шахрайство',
    })
  })

  it('коментарі відкриваються й новий коментар збільшує лічильник', async () => {
    signIn()
    mockApi()
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        id: 8,
        post_id: 1,
        author: ME,
        text: 'Дякую!',
        status: 'visible',
        created_at: new Date().toISOString(),
        updated_at: null,
      },
    })
    renderAt('/community')

    const article = card(await screen.findByText(MAX_POST.text).then((node) => node.textContent!))
    await userEvent.click(within(article).getByRole('button', { name: 'Коментарі' }))
    expect(await within(article).findByText('Підтверджую, працює')).toBeInTheDocument()
    await userEvent.type(within(article).getByRole('textbox', { name: 'Новий коментар' }), 'Дякую!')
    await userEvent.click(within(article).getByRole('button', { name: 'Надіслати' }))

    expect(await within(article).findByText('Дякую!')).toBeInTheDocument()
    expect(within(article).getByRole('button', { name: 'Коментарі' })).toHaveTextContent('13')
  })

  it('клік на обговорювану пару фільтрує стрічку', async () => {
    const { get } = mockApi()
    renderAt('/community')

    await userEvent.click(await screen.findByRole('button', { name: /USDT\/UAH/ }))
    await waitFor(() =>
      expect(get).toHaveBeenCalledWith(
        '/community/feed',
        expect.objectContaining({
          params: expect.objectContaining({ asset: 'USDT', fiat: 'UAH' }),
        }),
      ),
    )
    expect(screen.getByRole('button', { name: /Пара: USDT\/UAH/ })).toBeInTheDocument()
  })
})

describe('профіль користувача', () => {
  it('показує статистику й вкладки, адміну — кнопку блокування', async () => {
    signIn('admin')
    const { get } = mockApi([item(MAX_POST)])
    renderAt('/community/u/max_p2p')

    expect(await screen.findByRole('heading', { name: 'max_p2p' })).toBeInTheDocument()
    expect(screen.getByText('184')).toBeInTheDocument()
    expect(screen.getByText('Учасник')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Заблокувати' })).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Вподобані' }))
    await waitFor(() =>
      expect(get).toHaveBeenCalledWith(
        '/community/users/max_p2p/feed',
        expect.objectContaining({ params: expect.objectContaining({ tab: 'likes' }) }),
      ),
    )
  })

  it('звичайний користувач не бачить кнопок модерації', async () => {
    signIn()
    mockApi([item(MAX_POST)])
    renderAt('/community/u/max_p2p')

    expect(await screen.findByRole('heading', { name: 'max_p2p' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Заблокувати' })).not.toBeInTheDocument()
  })
})
