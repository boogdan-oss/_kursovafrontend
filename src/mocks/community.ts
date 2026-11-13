import { bypass, delay, http, HttpResponse } from 'msw'

import type {
  Author,
  BanView,
  CommentView,
  FeedItem,
  PostInput,
  PostView,
  ReportInput,
  ReportView,
} from '@/shared/api/community-types'
import { endpoints } from '@/shared/api/endpoints'
import { useAuthStore } from '@/store/useAuthStore'

const url = (path: string) => `*/api/v1${path}`
const LATENCY_MS = 200
const HOUR_MS = 3_600_000
const POPULAR_WINDOW_MS = 7 * 24 * HOUR_MS
const MISSING_ROUTE = new Set(['Not Found', 'Method Not Allowed'])

interface StoredPost {
  id: number
  authorId: number
  text: string
  pair: PostView['pair']
  opportunity: PostView['opportunity']
  status: PostView['status']
  likes: Set<number>
  reposts: Map<number, number>
  createdAt: number
  updatedAt: number | null
}

const now = Date.now()
const ago = (hours: number) => now - hours * HOUR_MS

const users = new Map<
  number,
  Author & { joined: number; status: 'active' | 'suspended' | 'banned' }
>([
  [101, { id: 101, username: 'max_p2p', is_admin: false, joined: ago(900), status: 'active' }],
  [
    102,
    { id: 102, username: 'iryna.crypto', is_admin: false, joined: ago(1500), status: 'active' },
  ],
  [103, { id: 103, username: 'olena_trader', is_admin: false, joined: ago(700), status: 'active' }],
  [
    104,
    { id: 104, username: 'crypto_bonus_24', is_admin: false, joined: ago(48), status: 'active' },
  ],
])

const posts: StoredPost[] = [
  {
    id: 1,
    authorId: 101,
    text: 'USDT/UAH на Bybit сьогодні тримається на рівні 41.05 ₴ — найнижча ціна за тиждень. Хто ще помітив, що спред між Bybit і Binance виріс до 1.4%? Схоже на гарну зв’язку для арбітражу.',
    pair: null,
    opportunity: {
      id: 9001,
      kind: 'cross_exchange',
      asset: 'USDT',
      fiat: 'UAH',
      buy_exchange: 'bybit',
      sell_exchange: 'binance',
      buy_price: '41.05',
      sell_price: '41.62',
      spread_pct: '1.3885',
      net_spread_pct: '1.4000',
      estimated_profit: '284.68',
      ai_score: 91,
      detected_at: new Date(ago(0.3)).toISOString(),
      duration_sec: 2520,
    },
    status: 'visible',
    likes: new Set([102, 103, ...Array.from({ length: 46 }, (_, index) => 1000 + index)]),
    reposts: new Map(Array.from({ length: 6 }, (_, index) => [2000 + index, ago(0.2)])),
    createdAt: ago(0.25),
    updatedAt: null,
  },
  {
    id: 2,
    authorId: 102,
    text: 'Порада новачкам: перед P2P-обміном перевіряйте рейтинг продавця та кількість завершених угод. AI-оцінка нижче 70 — привід придивитися до оголошення уважніше.',
    pair: null,
    opportunity: null,
    status: 'visible',
    likes: new Set(Array.from({ length: 31 }, (_, index) => 1100 + index)),
    reposts: new Map(Array.from({ length: 8 }, (_, index) => [2100 + index, ago(0.9)])),
    createdAt: ago(1),
    updatedAt: null,
  },
  {
    id: 3,
    authorId: 103,
    text: 'Зафіксувала прибуток на USDT/EUR. Ділюся парою — ціна тримається стабільно вже третій день, обсяги на OKX зростають.',
    pair: { asset: 'USDT', fiat: 'EUR' },
    opportunity: null,
    status: 'visible',
    likes: new Set(Array.from({ length: 22 }, (_, index) => 1200 + index)),
    reposts: new Map([
      [2200, ago(1.5)],
      [2201, ago(1.4)],
    ]),
    createdAt: ago(2),
    updatedAt: null,
  },
  {
    id: 4,
    authorId: 104,
    text: 'Швидкий обмін USDT за найкращим курсом! Пишіть у Telegram, переказ на картку, бонус +5% до суми обміну.',
    pair: { asset: 'USDT', fiat: 'UAH' },
    opportunity: null,
    status: 'visible',
    likes: new Set(),
    reposts: new Map(),
    createdAt: ago(5),
    updatedAt: null,
  },
]

const comments: CommentView[] = [
  {
    id: 1,
    post_id: 1,
    author: { id: 102, username: 'iryna.crypto', is_admin: false },
    text: 'Підтверджую, з monobank на privatbank працює. Але вивід з Bybit іноді затримується.',
    status: 'visible',
    created_at: new Date(ago(0.2)).toISOString(),
    updated_at: null,
  },
  {
    id: 2,
    post_id: 1,
    author: { id: 103, username: 'olena_trader', is_admin: false },
    text: 'Скільки тримався спред? У мене за годину звузився до 0.6%.',
    status: 'visible',
    created_at: new Date(ago(0.1)).toISOString(),
    updated_at: null,
  },
]

const reports: ReportView[] = []
const bans: BanView[] = []
let nextPostId = 100
let nextCommentId = 100
let nextReportId = 1042
let nextBanId = 1
let seededFor: number | null = null

function me() {
  const user = useAuthStore.getState().session?.user
  if (!user) return null
  if (!users.has(user.id)) {
    users.set(user.id, {
      id: user.id,
      username: user.username,
      is_admin: user.role === 'admin',
      joined: new Date(user.created_at).getTime(),
      status: 'active',
    })
  }
  if (seededFor !== user.id) {
    seededFor = user.id
    posts.push({
      id: nextPostId++,
      authorId: user.id,
      text: 'Тестую AI-оцінки в UPars: маршрут Bybit → Binance тримав спред понад 1% майже годину. Хто ще ловив такі зв’язки — які у вас результати?',
      pair: null,
      opportunity: null,
      status: 'visible',
      likes: new Set([101, 102]),
      reposts: new Map([[103, ago(2.5)]]),
      createdAt: ago(3),
      updatedAt: null,
    })
    posts.find((post) => post.id === 2)?.reposts.set(user.id, ago(0.8))
  }
  return { id: user.id, admin: user.role === 'admin' }
}

function author(id: number): Author {
  const user = users.get(id)
  return { id, username: user?.username ?? `user${id}`, is_admin: user?.is_admin ?? false }
}

function view(post: StoredPost, viewer: number | null): PostView {
  return {
    id: post.id,
    author: author(post.authorId),
    text: post.text,
    pair: post.pair,
    opportunity: post.opportunity,
    status: post.status,
    likes: post.likes.size,
    comments: comments.filter((item) => item.post_id === post.id && item.status === 'visible')
      .length,
    reposts: post.reposts.size,
    liked_by_me: viewer !== null && post.likes.has(viewer),
    reposted_by_me: viewer !== null && post.reposts.has(viewer),
    created_at: new Date(post.createdAt).toISOString(),
    updated_at: post.updatedAt === null ? null : new Date(post.updatedAt).toISOString(),
  }
}

function visibleTo(post: StoredPost, admin: boolean) {
  return post.status === 'visible' || (admin && post.status === 'hidden')
}

function detail(message: string, status: number) {
  return HttpResponse.json({ detail: message }, { status })
}

function page(items: FeedItem[], request: Request) {
  const query = new URL(request.url).searchParams
  const offset = Number(query.get('cursor') ?? 0) || 0
  const limit = Math.min(50, Math.max(1, Number(query.get('limit') ?? 20) || 20))
  const slice = items.slice(offset, offset + limit)
  const next = offset + limit < items.length ? String(offset + limit) : null
  return HttpResponse.json({ items: slice, next_cursor: next })
}

async function realOrMock(request: Request, mock: () => Promise<Response> | Response) {
  try {
    const response = await fetch(bypass(request.clone()))
    const body = await response
      .clone()
      .json()
      .catch(() => null)
    const missing = MISSING_ROUTE.has((body as { detail?: unknown } | null)?.detail as string)
    if (!missing && !(response.status >= 500 && body === null)) return response
  } catch {
    return mock()
  }
  await delay(LATENCY_MS)
  return mock()
}

function findPost(id: unknown) {
  return posts.find((post) => post.id === Number(id))
}

function postFeed(viewer: ReturnType<typeof me>, filter: (post: StoredPost) => boolean) {
  return posts
    .filter((post) => visibleTo(post, viewer?.admin ?? false) && filter(post))
    .map((post) => ({
      post: view(post, viewer?.id ?? null),
      reposted_by: null,
      at: view(post, null).created_at,
    }))
}

function repostFeed(viewer: ReturnType<typeof me>, byUser: number | null) {
  return posts.flatMap((post) =>
    visibleTo(post, viewer?.admin ?? false)
      ? [...post.reposts]
          .filter(([userId]) => byUser === null || userId === byUser)
          .filter(([userId]) => users.has(userId))
          .map(([userId, at]) => ({
            post: view(post, viewer?.id ?? null),
            reposted_by: author(userId),
            at: new Date(at).toISOString(),
          }))
      : [],
  )
}

const byTime = (a: FeedItem, b: FeedItem) => b.at.localeCompare(a.at)

export const communityHandlers = [
  http.get(url(endpoints.communityFeed), ({ request }) =>
    realOrMock(request, () => {
      const viewer = me()
      const query = new URL(request.url).searchParams
      const asset = query.get('asset')
      const fiat = query.get('fiat')
      const mine = query.get('scope') === 'mine'
      if (mine && !viewer) return detail('Потрібно увійти в акаунт', 401)
      const matchesPair = (post: StoredPost) =>
        !asset || (post.pair?.asset === asset && post.pair.fiat === fiat)
      const own = (post: StoredPost) => !mine || post.authorId === viewer?.id

      if (query.get('sort') === 'popular') {
        const score = (post: PostView) => post.likes + 2 * post.comments + 3 * post.reposts
        const items = postFeed(
          viewer,
          (post) => matchesPair(post) && own(post) && post.createdAt > now - POPULAR_WINDOW_MS,
        ).sort((a, b) => score(b.post) - score(a.post))
        return page(items, request)
      }
      const reposts = repostFeed(viewer, mine ? (viewer?.id ?? null) : null).filter(
        (item) => !asset || (item.post.pair?.asset === asset && item.post.pair.fiat === fiat),
      )
      const items = [...postFeed(viewer, (post) => matchesPair(post) && own(post)), ...reposts]
      return page(items.sort(byTime), request)
    }),
  ),

  http.post(url(endpoints.communityPosts), ({ request }) =>
    realOrMock(request, async () => {
      const viewer = me()
      if (!viewer) return detail('Потрібно увійти в акаунт', 401)
      const input = (await request.json()) as PostInput
      const text = input.text?.trim() ?? ''
      if (!text || text.length > 2000)
        return detail('Текст публікації — від 1 до 2000 символів', 422)
      const post: StoredPost = {
        id: nextPostId++,
        authorId: viewer.id,
        text,
        pair: input.pair ?? null,
        opportunity: null,
        status: 'visible',
        likes: new Set(),
        reposts: new Map(),
        createdAt: Date.now(),
        updatedAt: null,
      }
      posts.push(post)
      return HttpResponse.json(view(post, viewer.id), { status: 201 })
    }),
  ),

  http.patch(url('/community/posts/:id'), ({ request, params }) =>
    realOrMock(request, async () => {
      const viewer = me()
      const post = findPost(params.id)
      if (!viewer) return detail('Потрібно увійти в акаунт', 401)
      if (!post) return detail('Публікацію не знайдено', 404)
      if (post.authorId !== viewer.id) return detail('Редагувати можна лише власні публікації', 403)
      const input = (await request.json()) as Partial<PostInput>
      if (input.text !== undefined) post.text = input.text.trim()
      if (input.pair !== undefined) post.pair = input.pair
      if (input.opportunity_id === null) post.opportunity = null
      post.updatedAt = Date.now()
      return HttpResponse.json(view(post, viewer.id))
    }),
  ),

  http.delete(url('/community/posts/:id'), ({ request, params }) =>
    realOrMock(request, () => {
      const viewer = me()
      const index = posts.findIndex((post) => post.id === Number(params.id))
      if (!viewer) return detail('Потрібно увійти в акаунт', 401)
      if (index < 0) return detail('Публікацію не знайдено', 404)
      if (posts[index].authorId !== viewer.id) return detail('Видаляти можна лише власні', 403)
      posts.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    }),
  ),

  ...(['like', 'repost'] as const).flatMap((action) =>
    (['put', 'delete'] as const).map((method) =>
      http[method](url(`/community/posts/:id/${action}`), ({ request, params }) =>
        realOrMock(request, () => {
          const viewer = me()
          const post = findPost(params.id)
          if (!viewer) return detail('Потрібно увійти в акаунт', 401)
          if (!post) return detail('Публікацію не знайдено', 404)
          if (action === 'like') {
            if (method === 'put') post.likes.add(viewer.id)
            else post.likes.delete(viewer.id)
          } else {
            if (post.authorId === viewer.id)
              return detail('Власну публікацію поширити не можна', 400)
            if (method === 'put') post.reposts.set(viewer.id, Date.now())
            else post.reposts.delete(viewer.id)
          }
          return HttpResponse.json(view(post, viewer.id))
        }),
      ),
    ),
  ),

  http.get(url('/community/posts/:id/comments'), ({ request, params }) =>
    realOrMock(request, () => {
      const admin = me()?.admin ?? false
      const items = comments.filter(
        (item) =>
          item.post_id === Number(params.id) &&
          (item.status === 'visible' || (admin && item.status === 'hidden')),
      )
      return HttpResponse.json({ count: items.length, items })
    }),
  ),

  http.post(url('/community/posts/:id/comments'), ({ request, params }) =>
    realOrMock(request, async () => {
      const viewer = me()
      if (!viewer) return detail('Потрібно увійти в акаунт', 401)
      const { text } = (await request.json()) as { text: string }
      const comment: CommentView = {
        id: nextCommentId++,
        post_id: Number(params.id),
        author: author(viewer.id),
        text: text.trim(),
        status: 'visible',
        created_at: new Date().toISOString(),
        updated_at: null,
      }
      comments.push(comment)
      return HttpResponse.json(comment, { status: 201 })
    }),
  ),

  http.patch(url('/community/comments/:id'), ({ request, params }) =>
    realOrMock(request, async () => {
      const comment = comments.find((item) => item.id === Number(params.id))
      if (!comment) return detail('Коментар не знайдено', 404)
      const { text } = (await request.json()) as { text: string }
      comment.text = text.trim()
      comment.updated_at = new Date().toISOString()
      return HttpResponse.json(comment)
    }),
  ),

  http.delete(url('/community/comments/:id'), ({ request, params }) =>
    realOrMock(request, () => {
      const index = comments.findIndex((item) => item.id === Number(params.id))
      if (index < 0) return detail('Коментар не знайдено', 404)
      comments.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    }),
  ),

  http.get(url('/community/users/:username'), ({ request, params }) =>
    realOrMock(request, () => {
      me()
      const user = [...users.values()].find((item) => item.username === params.username)
      if (!user) return detail('Користувача не знайдено', 404)
      const own = posts.filter((post) => post.authorId === user.id && post.status === 'visible')
      return HttpResponse.json({
        id: user.id,
        username: user.username,
        is_admin: user.is_admin,
        status: user.status,
        joined_at: new Date(user.joined).toISOString(),
        posts: own.length,
        likes_received: own.reduce((sum, post) => sum + post.likes.size, 0),
        reposts_received: own.reduce((sum, post) => sum + post.reposts.size, 0),
      })
    }),
  ),

  http.get(url('/community/users/:username/feed'), ({ request, params }) =>
    realOrMock(request, () => {
      const viewer = me()
      const user = [...users.values()].find((item) => item.username === params.username)
      if (!user) return detail('Користувача не знайдено', 404)
      const tab = new URL(request.url).searchParams.get('tab') ?? 'posts'
      const items =
        tab === 'reposts'
          ? repostFeed(viewer, user.id)
          : tab === 'likes'
            ? postFeed(viewer, (post) => post.likes.has(user.id))
            : postFeed(viewer, (post) => post.authorId === user.id)
      return page(items.sort(byTime), request)
    }),
  ),

  http.post(url(endpoints.communityReports), ({ request }) =>
    realOrMock(request, async () => {
      const viewer = me()
      if (!viewer) return detail('Потрібно увійти в акаунт', 401)
      const input = (await request.json()) as ReportInput
      const duplicate = reports.some(
        (item) =>
          item.reporter.id === viewer.id &&
          item.status === 'pending' &&
          (item.post_id === input.post_id || item.comment_id === input.comment_id),
      )
      if (duplicate) return detail('Ви вже поскаржилися на це, скарга розглядається', 409)
      const post = findPost(input.post_id)
      const report: ReportView = {
        id: nextReportId++,
        target: input.comment_id ? 'comment' : 'post',
        post_id: input.post_id ?? 0,
        comment_id: input.comment_id ?? null,
        target_text: post?.text ?? '',
        target_status: 'visible',
        target_author: author(post?.authorId ?? 0),
        reporter: author(viewer.id),
        reason: input.reason,
        details: input.details ?? null,
        status: 'pending',
        created_at: new Date().toISOString(),
        resolved_at: null,
      }
      reports.push(report)
      return HttpResponse.json(report, { status: 201 })
    }),
  ),

  http.get(url(endpoints.communityTrendingPairs), ({ request }) =>
    realOrMock(request, () => {
      const counts = new Map<
        string,
        { asset: string; fiat: string; posts: number; likes: number; comments: number }
      >()
      for (const post of posts) {
        if (!post.pair || post.status !== 'visible') continue
        const key = `${post.pair.asset}/${post.pair.fiat}`
        const entry = counts.get(key) ?? { ...post.pair, posts: 0, likes: 0, comments: 0 }
        entry.posts += 1
        entry.likes += post.likes.size
        counts.set(key, entry)
      }
      const changes: Record<string, string> = { 'USDT/UAH': '0.4', 'USDT/EUR': '0.1' }
      const items = [...counts.entries()]
        .map(([key, entry]) => ({ ...entry, change_pct: changes[key] ?? null }))
        .sort((a, b) => b.posts - a.posts)
      return HttpResponse.json({ items })
    }),
  ),

  http.put(url('/admin/posts/:id/status'), ({ request, params }) =>
    realOrMock(request, async () => {
      const viewer = me()
      if (!viewer?.admin) return detail('Лише для адміністраторів', 403)
      const post = findPost(params.id)
      if (!post) return detail('Публікацію не знайдено', 404)
      const { status } = (await request.json()) as { status: PostView['status'] }
      post.status = status
      return HttpResponse.json(view(post, viewer.id))
    }),
  ),

  http.put(url('/admin/comments/:id/status'), ({ request, params }) =>
    realOrMock(request, async () => {
      if (!me()?.admin) return detail('Лише для адміністраторів', 403)
      const comment = comments.find((item) => item.id === Number(params.id))
      if (!comment) return detail('Коментар не знайдено', 404)
      const { status } = (await request.json()) as { status: CommentView['status'] }
      comment.status = status
      return HttpResponse.json(comment)
    }),
  ),

  http.get(url(endpoints.adminBans), ({ request }) =>
    realOrMock(request, () => {
      if (!me()?.admin) return detail('Лише для адміністраторів', 403)
      const items = bans.filter((ban) => ban.lifted_at === null)
      return HttpResponse.json({ count: items.length, items })
    }),
  ),

  http.post(url(endpoints.adminBans), ({ request }) =>
    realOrMock(request, async () => {
      const viewer = me()
      if (!viewer?.admin) return detail('Лише для адміністраторів', 403)
      const input = (await request.json()) as {
        user_id: number
        days: number | null
        reason: string
      }
      const user = users.get(input.user_id)
      if (!user) return detail('Користувача не знайдено', 404)
      user.status = input.days === null ? 'banned' : 'suspended'
      const ban: BanView = {
        id: nextBanId++,
        user: author(user.id),
        reason: input.reason,
        until:
          input.days === null
            ? null
            : new Date(Date.now() + input.days * 24 * HOUR_MS).toISOString(),
        banned_by: author(viewer.id),
        created_at: new Date().toISOString(),
        lifted_at: null,
      }
      bans.push(ban)
      return HttpResponse.json(ban, { status: 201 })
    }),
  ),

  http.delete(url('/admin/bans/:userId'), ({ request, params }) =>
    realOrMock(request, () => {
      if (!me()?.admin) return detail('Лише для адміністраторів', 403)
      const user = users.get(Number(params.userId))
      if (user) user.status = 'active'
      for (const ban of bans)
        if (ban.user.id === Number(params.userId)) ban.lifted_at = new Date().toISOString()
      return new HttpResponse(null, { status: 204 })
    }),
  ),
]
