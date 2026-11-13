import type { Schema } from '@/shared/api/types'

export type Author = Schema<'Author'>
export type PairRef = Schema<'PairRef'>
export type AttachedOpportunity = Schema<'AttachedOpportunity'>
export type PostView = Schema<'PostView'>
export type FeedItem = Schema<'FeedItem'>
export type FeedPage = Schema<'FeedPage'>
export type CommentView = Schema<'CommentView'>
export type CommentsResponse = Schema<'CommentsResponse'>
export type ProfileView = Schema<'ProfileView'>
export type ReportView = Schema<'ReportView'>
export type TrendingPair = Schema<'TrendingPair'>
export type TrendingPairsResponse = Schema<'TrendingResponse'>
export type BanView = Schema<'BanView'>
export type PostInput = Schema<'PostIn'>
export type PostPatch = Schema<'PostPatch'>
export type ReportInput = Schema<'ReportIn'>
export type BanInput = Schema<'BanIn'>

export type ContentState = PostView['status']
export type ReportReason = ReportInput['reason']
export type FeedSort = 'new' | 'popular'
export type FeedScope = 'all' | 'mine'
export type ProfileTab = 'posts' | 'reposts' | 'likes'

export interface FeedParams {
  sort: FeedSort
  scope: FeedScope
  asset?: string
  fiat?: string
}
