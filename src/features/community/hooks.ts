import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query'

import {
  banUser,
  createComment,
  createPost,
  deleteComment,
  deletePost,
  fetchComments,
  fetchFeed,
  fetchProfile,
  fetchTrendingPairs,
  fetchUserFeed,
  sendReport,
  setCommentStatus,
  setLike,
  setPostStatus,
  setRepost,
  unbanUser,
  updateComment,
  updatePost,
} from '@/features/community/api'
import type {
  CommentsResponse,
  CommentView,
  ContentState,
  FeedPage,
  FeedParams,
  PostPatch,
  PostView,
  ProfileTab,
} from '@/shared/api/community-types'
import { queryKeys } from '@/shared/api/queryKeys'
import { useAuthStore } from '@/store/useAuthStore'

const FEED_REFRESH_MS = 60_000
const TRENDING_HOURS = 24

type Feed = InfiniteData<FeedPage, unknown>

export function useCurrentUser() {
  const user = useAuthStore((state) => state.session?.user)
  return user ? { ...user, isAdmin: user.role === 'admin' } : null
}

function mapFeeds(client: QueryClient, map: (page: FeedPage) => FeedPage) {
  client.setQueriesData<Feed>(
    { queryKey: queryKeys.community.feeds() },
    (data) => data && { ...data, pages: data.pages.map(map) },
  )
}

export function patchPost(client: QueryClient, id: number, patch: (post: PostView) => PostView) {
  mapFeeds(client, (page) => ({
    ...page,
    items: page.items.map((item) =>
      item.post.id === id ? { ...item, post: patch(item.post) } : item,
    ),
  }))
}

function replacePost(client: QueryClient, post: PostView) {
  patchPost(client, post.id, () => post)
}

function removePost(client: QueryClient, id: number) {
  mapFeeds(client, (page) => ({ ...page, items: page.items.filter((item) => item.post.id !== id) }))
}

function refreshCommunity(client: QueryClient) {
  void client.invalidateQueries({ queryKey: queryKeys.community.all })
}

export function useFeed(params: FeedParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.community.feed(params),
    queryFn: ({ pageParam, signal }) => fetchFeed(params, pageParam, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.next_cursor,
    refetchInterval: FEED_REFRESH_MS,
    placeholderData: keepPreviousData,
  })
}

export function useUserFeed(username: string, tab: ProfileTab) {
  return useInfiniteQuery({
    queryKey: queryKeys.community.feed({ username, tab }),
    queryFn: ({ pageParam, signal }) => fetchUserFeed(username, tab, pageParam, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.next_cursor,
    placeholderData: keepPreviousData,
  })
}

export function useProfile(username: string | undefined) {
  return useQuery({
    queryKey: queryKeys.community.profile(username ?? ''),
    queryFn: ({ signal }) => fetchProfile(username!, signal),
    enabled: Boolean(username),
    meta: { silent: true },
  })
}

export function useTrendingPairs() {
  return useQuery({
    queryKey: queryKeys.community.trending(TRENDING_HOURS),
    queryFn: ({ signal }) => fetchTrendingPairs(TRENDING_HOURS, signal),
    refetchInterval: FEED_REFRESH_MS,
    meta: { silent: true },
  })
}

export function useCreatePost() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => refreshCommunity(client),
  })
}

export function useUpdatePost() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PostPatch }) => updatePost(id, input),
    onSuccess: (post) => replacePost(client, post),
  })
}

export function useDeletePost() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_, id) => {
      removePost(client, id)
      refreshCommunity(client)
    },
  })
}

export function useToggleLike() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ post }: { post: PostView }) => setLike(post.id, !post.liked_by_me),
    onMutate: ({ post }) => {
      const liked = !post.liked_by_me
      patchPost(client, post.id, (current) => ({
        ...current,
        liked_by_me: liked,
        likes: Math.max(0, current.likes + (liked ? 1 : -1)),
      }))
    },
    onSuccess: (post) => replacePost(client, post),
    onError: (_, { post }) => replacePost(client, post),
  })
}

export function useToggleRepost() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ post }: { post: PostView }) => setRepost(post.id, !post.reposted_by_me),
    onMutate: ({ post }) => {
      const reposted = !post.reposted_by_me
      patchPost(client, post.id, (current) => ({
        ...current,
        reposted_by_me: reposted,
        reposts: Math.max(0, current.reposts + (reposted ? 1 : -1)),
      }))
    },
    onSuccess: (post) => {
      replacePost(client, post)
      refreshCommunity(client)
    },
    onError: (_, { post }) => replacePost(client, post),
  })
}

export function useComments(postId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.community.comments(postId),
    queryFn: ({ signal }) => fetchComments(postId, signal),
    enabled,
  })
}

function patchComments(
  client: QueryClient,
  postId: number,
  map: (items: CommentView[]) => CommentView[],
) {
  client.setQueryData<CommentsResponse>(queryKeys.community.comments(postId), (data) => {
    if (!data) return data
    const items = map(data.items)
    return { count: items.length, items }
  })
}

function shiftComments(client: QueryClient, postId: number, delta: number) {
  patchPost(client, postId, (post) => ({ ...post, comments: Math.max(0, post.comments + delta) }))
}

export function useCreateComment(postId: number) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (text: string) => createComment(postId, text),
    onSuccess: (comment) => {
      patchComments(client, postId, (items) => [...items, comment])
      shiftComments(client, postId, 1)
    },
  })
}

export function useUpdateComment(postId: number) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => updateComment(id, text),
    onSuccess: (comment) =>
      patchComments(client, postId, (items) =>
        items.map((item) => (item.id === comment.id ? comment : item)),
      ),
  })
}

export function useRemoveComment(postId: number) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, moderate }: { id: number; moderate: ContentState | null }) =>
      moderate ? setCommentStatus(id, moderate).then(() => undefined) : deleteComment(id),
    onSuccess: (_, { id }) => {
      patchComments(client, postId, (items) => items.filter((item) => item.id !== id))
      shiftComments(client, postId, -1)
    },
  })
}

export function useReport() {
  return useMutation({ mutationFn: sendReport })
}

export function useModeratePost() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContentState }) => setPostStatus(id, status),
    onSuccess: (post) => {
      if (post.status === 'deleted') removePost(client, post.id)
      else replacePost(client, post)
      void client.invalidateQueries({ queryKey: queryKeys.community.trending(TRENDING_HOURS) })
    },
  })
}

export function useBanUser() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: banUser,
    onSuccess: () => refreshCommunity(client),
  })
}

export function useUnbanUser() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: unbanUser,
    onSuccess: () => refreshCommunity(client),
  })
}
