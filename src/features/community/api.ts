import { apiClient } from '@/shared/api/client'
import type {
  BanInput,
  BanView,
  CommentsResponse,
  CommentView,
  ContentState,
  FeedPage,
  FeedParams,
  PostInput,
  PostPatch,
  PostView,
  ProfileTab,
  ProfileView,
  ReportInput,
  ReportView,
  TrendingPairsResponse,
} from '@/shared/api/community-types'
import { endpoints } from '@/shared/api/endpoints'

export const FEED_PAGE_SIZE = 20
const COMMENTS_LIMIT = 100

export async function fetchFeed(params: FeedParams, cursor: string | null, signal?: AbortSignal) {
  const { data } = await apiClient.get<FeedPage>(endpoints.communityFeed, {
    params: { ...params, cursor: cursor ?? undefined, limit: FEED_PAGE_SIZE },
    signal,
  })
  return data
}

export async function fetchUserFeed(
  username: string,
  tab: ProfileTab,
  cursor: string | null,
  signal?: AbortSignal,
) {
  const { data } = await apiClient.get<FeedPage>(endpoints.communityUserFeed(username), {
    params: { tab, cursor: cursor ?? undefined, limit: FEED_PAGE_SIZE },
    signal,
  })
  return data
}

export async function fetchProfile(username: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<ProfileView>(endpoints.communityUser(username), { signal })
  return data
}

export async function fetchTrendingPairs(hours: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<TrendingPairsResponse>(endpoints.communityTrendingPairs, {
    params: { hours, limit: 5 },
    signal,
  })
  return data
}

export async function createPost(input: PostInput) {
  const { data } = await apiClient.post<PostView>(endpoints.communityPosts, input)
  return data
}

export async function updatePost(id: number, input: PostPatch) {
  const { data } = await apiClient.patch<PostView>(endpoints.communityPost(id), input)
  return data
}

export async function deletePost(id: number) {
  await apiClient.delete(endpoints.communityPost(id))
}

export async function setLike(id: number, liked: boolean) {
  const url = endpoints.communityPostLike(id)
  const { data } = liked
    ? await apiClient.put<PostView>(url)
    : await apiClient.delete<PostView>(url)
  return data
}

export async function setRepost(id: number, reposted: boolean) {
  const url = endpoints.communityPostRepost(id)
  const { data } = reposted
    ? await apiClient.put<PostView>(url)
    : await apiClient.delete<PostView>(url)
  return data
}

export async function fetchComments(postId: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<CommentsResponse>(endpoints.communityPostComments(postId), {
    params: { limit: COMMENTS_LIMIT },
    signal,
  })
  return data
}

export async function createComment(postId: number, text: string) {
  const { data } = await apiClient.post<CommentView>(endpoints.communityPostComments(postId), {
    text,
  })
  return data
}

export async function updateComment(id: number, text: string) {
  const { data } = await apiClient.patch<CommentView>(endpoints.communityComment(id), { text })
  return data
}

export async function deleteComment(id: number) {
  await apiClient.delete(endpoints.communityComment(id))
}

export async function sendReport(input: ReportInput) {
  const { data } = await apiClient.post<ReportView>(endpoints.communityReports, input)
  return data
}

export async function setPostStatus(id: number, status: ContentState) {
  const { data } = await apiClient.put<PostView>(endpoints.adminPostStatus(id), { status })
  return data
}

export async function setCommentStatus(id: number, status: ContentState) {
  const { data } = await apiClient.put<CommentView>(endpoints.adminCommentStatus(id), { status })
  return data
}

export async function banUser(input: BanInput) {
  const { data } = await apiClient.post<BanView>(endpoints.adminBans, input)
  return data
}

export async function unbanUser(userId: number) {
  await apiClient.delete(endpoints.adminBan(userId))
}
