export interface paths {
    "/api/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["health_api_v1_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ping": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ping_api_v1_ping_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/markets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_markets_api_v1_markets_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/snapshot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["market_snapshot_api_v1_market_snapshot_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["market_history_api_v1_market_history_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/offers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_offers_api_v1_offers_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/opportunities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_opportunities_api_v1_opportunities_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/opportunities/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["opportunities_history_api_v1_opportunities_history_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/calculator": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["deal_calculator_api_v1_calculator_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/collector/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["collector_status_api_v1_collector_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["register_user_api_v1_auth_register_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["login_user_api_v1_auth_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["refresh_tokens_api_v1_auth_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["logout_user_api_v1_auth_logout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/change-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["change_user_password_api_v1_auth_change_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["me_api_v1_me_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["patch_profile_api_v1_me_patch"];
        trace?: never;
    };
    "/api/v1/me/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["patch_settings_api_v1_me_settings_patch"];
        trace?: never;
    };
    "/api/v1/me/telegram": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["telegram_link_api_v1_me_telegram_post"];
        delete: operations["telegram_unlink_api_v1_me_telegram_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/notify-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["notify_email_request_api_v1_me_notify_email_post"];
        delete: operations["notify_email_clear_api_v1_me_notify_email_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/notify-email/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["notify_email_confirm_api_v1_me_notify_email_confirm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/notifications/test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["notification_test_api_v1_me_notifications_test_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/watchlist": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_items_api_v1_watchlist_get"];
        put?: never;
        post: operations["add_item_api_v1_watchlist_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/watchlist/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["delete_item_api_v1_watchlist__item_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/alerts/rules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_rules_api_v1_alerts_rules_get"];
        put?: never;
        post: operations["create_api_v1_alerts_rules_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/alerts/rules/{rule_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["delete_api_v1_alerts_rules__rule_id__delete"];
        options?: never;
        head?: never;
        patch: operations["patch_api_v1_alerts_rules__rule_id__patch"];
        trace?: never;
    };
    "/api/v1/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["notifications_api_v1_notifications_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["read_notifications_api_v1_notifications_read_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai/chat": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["assistant_chat_api_v1_ai_chat_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/assistant/conversations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_conversations_api_v1_assistant_conversations_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/assistant/conversations/{conversation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_conversation_api_v1_assistant_conversations__conversation_id__get"];
        put?: never;
        post?: never;
        delete: operations["delete_conversation_api_v1_assistant_conversations__conversation_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/assistant/chat": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["send_message_api_v1_assistant_chat_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/community/feed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_feed_api_v1_community_feed_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/community/trending-pairs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["trending_pairs_api_v1_community_trending_pairs_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/community/posts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["create_post_api_v1_community_posts_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/community/posts/{post_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_post_api_v1_community_posts__post_id__get"];
        put?: never;
        post?: never;
        delete: operations["delete_post_api_v1_community_posts__post_id__delete"];
        options?: never;
        head?: never;
        patch: operations["edit_post_api_v1_community_posts__post_id__patch"];
        trace?: never;
    };
    "/api/v1/community/posts/{post_id}/like": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["like_api_v1_community_posts__post_id__like_put"];
        post?: never;
        delete: operations["unlike_api_v1_community_posts__post_id__like_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/community/posts/{post_id}/repost": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["repost_api_v1_community_posts__post_id__repost_put"];
        post?: never;
        delete: operations["unrepost_api_v1_community_posts__post_id__repost_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/community/posts/{post_id}/comments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_comments_api_v1_community_posts__post_id__comments_get"];
        put?: never;
        post: operations["add_comment_api_v1_community_posts__post_id__comments_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/community/comments/{comment_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["delete_comment_api_v1_community_comments__comment_id__delete"];
        options?: never;
        head?: never;
        patch: operations["edit_comment_api_v1_community_comments__comment_id__patch"];
        trace?: never;
    };
    "/api/v1/community/users/{username}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_profile_api_v1_community_users__username__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/community/users/{username}/feed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_user_feed_api_v1_community_users__username__feed_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/community/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["create_report_api_v1_community_reports_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["stats_api_v1_admin_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_reports_api_v1_admin_reports_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/reports/{report_id}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["resolve_report_api_v1_admin_reports__report_id__resolve_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/posts/{post_id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["set_post_status_api_v1_admin_posts__post_id__status_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/comments/{comment_id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["set_comment_status_api_v1_admin_comments__comment_id__status_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/hidden": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["hidden_api_v1_admin_hidden_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/bans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_bans_api_v1_admin_bans_get"];
        put?: never;
        post: operations["ban_user_api_v1_admin_bans_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/bans/{user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["unban_user_api_v1_admin_bans__user_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_users_api_v1_admin_users_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{user_id}/role": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["change_role_api_v1_admin_users__user_id__role_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AdminUserView: {
            id: number;
            username: string;
            display_name: string | null;
            email: string;
            role: "user" | "admin" | "owner";
            status: string;
            created_at: string;
            posts: number;
            reports_against: number;
        };
        AttachedOpportunity: {
            id: number;
            kind: string;
            asset: string;
            fiat: string;
            buy_exchange: string;
            sell_exchange: string;
            buy_price: string;
            sell_price: string;
            spread_pct: string;
            net_spread_pct: string;
            estimated_profit: string;
            ai_score: number | null;
            detected_at: string;
            duration_sec: number | null;
        };
        AuthResponse: {
            access_token: string;
            refresh_token: string;
            token_type: "bearer";
            expires_in: number;
            refresh_expires_in: number;
            user: components["schemas"]["UserOut"];
        };
        Author: {
            id: number;
            username: string;
            is_admin: boolean;
            role: "user" | "admin" | "owner";
        };
        BanIn: {
            user_id: number;
            days?: number | null;
            reason: string;
        };
        BanView: {
            id: number;
            user: components["schemas"]["Author"];
            reason: string;
            until: string | null;
            banned_by: components["schemas"]["Author"] | null;
            created_at: string;
            lifted_at: string | null;
        };
        BansResponse: {
            count: number;
            items: components["schemas"]["BanView"][];
        };
        CalculatorRequest: {
            asset: string;
            fiat: string;
            investment: number | string;
            buy_exchange?: string | null;
            sell_exchange?: string | null;
            buy_price?: number | string | null;
            sell_price?: number | string | null;
            extra_fees: number | string;
            adverse_move_pct: number | string;
            payment?: string | null;
        };
        CalculatorResponse: {
            deal: components["schemas"]["Deal"];
            potential_loss: string;
            rr: string | null;
            buy_slippage_pct: string | null;
            sell_slippage_pct: string | null;
            fully_filled: boolean;
        };
        ChangePasswordRequest: {
            current_password: string;
            new_password: string;
        };
        ChatAction: {
            label: string;
            to: string;
        };
        "ChatMessage-Input": {
            role: "user" | "assistant";
            content: string;
        };
        "ChatMessage-Output": {
            id: string;
            role: "user" | "assistant";
            content: string;
            created_at: string;
            tool_calls: string[];
            actions: components["schemas"]["ChatAction"][];
        };
        ChatResponse: {
            conversation_id: string;
            title: string;
            user_message: components["schemas"]["ChatMessage-Output"];
            message: components["schemas"]["ChatMessage-Output"];
        };
        CollectorStatus: {
            exchange: string;
            rps: number;
            rps_ceiling: number;
            limiter_state: "ok" | "paused" | "cooldown";
            paused_for_sec: number;
            tasks: {
                [key: string]: number;
            };
            requests_ok: number;
            requests_failed: number;
            rows_written: number;
            started_at: string;
            updated_at: string;
        };
        CollectorStatusResponse: {
            time: string;
            exchanges: components["schemas"]["ExchangeCollectorStatus"][];
            tables: components["schemas"]["TableStatus"][];
            storage: components["schemas"]["StorageStatus"];
            merchants: number;
        };
        CommentIn: {
            text: string;
        };
        CommentView: {
            id: number;
            post_id: number;
            author: components["schemas"]["Author"];
            text: string;
            status: "visible" | "hidden" | "deleted";
            created_at: string;
            updated_at: string | null;
        };
        CommentsResponse: {
            count: number;
            items: components["schemas"]["CommentView"][];
        };
        ComponentHealth: {
            status: "ok" | "error";
            detail?: string | null;
        };
        ContentStatus: "visible" | "hidden" | "deleted";
        Conversation: {
            id: string;
            title: string;
            updated_at: string;
        };
        ConversationDetail: {
            id: string;
            title: string;
            updated_at: string;
            messages: components["schemas"]["ChatMessage-Output"][];
        };
        ConversationsResponse: {
            count: number;
            items: components["schemas"]["Conversation"][];
        };
        Deal: {
            investment: string;
            buy_price: string;
            sell_price: string;
            quantity: string;
            sell_quantity: string;
            buy_amount: string;
            sell_amount: string;
            fees: string;
            net_profit: string;
            spread_pct: string;
            net_spread_pct: string;
            roi_pct: string;
        };
        ExchangeCollectorStatus: {
            exchange: string;
            status: string;
            last_ok_at: string | null;
            pairs_total: number;
            pairs_collected: number;
            collector_running: boolean;
            collector: components["schemas"]["CollectorStatus"] | null;
        };
        ExchangeHealth: {
            exchange: string;
            status: string;
            last_ok_at: string | null;
            age_sec: number | null;
            rps: number | null;
            limiter_state: string | null;
        };
        FeedItem: {
            post: components["schemas"]["PostView"];
            reposted_by: components["schemas"]["Author"] | null;
            at: string;
        };
        FeedPage: {
            items: components["schemas"]["FeedItem"][];
            next_cursor: string | null;
        };
        Freshness: {
            exchange: string;
            buy_fetched_at?: string | null;
            sell_fetched_at?: string | null;
            age_sec?: number | null;
            stale: boolean;
        };
        HTTPValidationError: {
            detail?: components["schemas"]["ValidationError"][];
        };
        HealthResponse: {
            status: "ok" | "degraded";
            version: string;
            time: string;
            components: {
                [key: string]: components["schemas"]["ComponentHealth"];
            };
            exchanges: components["schemas"]["ExchangeHealth"][];
        };
        HiddenResponse: {
            posts: components["schemas"]["PostView"][];
            comments: components["schemas"]["CommentView"][];
        };
        HistoryItem: {
            time: string;
            buy_price: string | null;
            sell_price: string | null;
            spread_pct: string | null;
            volume: string;
            samples: number;
        };
        HistoryResponse: {
            exchange: string;
            asset: string;
            fiat: string;
            interval: "1m" | "5m" | "15m" | "1h" | "1d";
            count: number;
            items: components["schemas"]["HistoryItem"][];
        };
        LoginRequest: {
            login: string;
            password: string;
        };
        MarkReadRequest: {
            ids?: number[] | null;
        };
        MarkReadResponse: {
            updated: number;
        };
        MarketItem: {
            exchange: string;
            asset: string;
            fiat: string;
            payment_methods: string[];
            buy_fetched_at: string | null;
            sell_fetched_at: string | null;
        };
        MarketSnapshot: {
            exchange: string;
            asset: string;
            fiat: string;
            payment_method?: string | null;
            buy_price?: string | null;
            sell_price?: string | null;
            spread_pct?: string | null;
            volume: string;
            offers_count_buy: number;
            offers_count_sell: number;
            buy_volume?: string | null;
            sell_volume?: string | null;
            buy_min_amount?: string | null;
            buy_max_amount?: string | null;
            sell_min_amount?: string | null;
            sell_max_amount?: string | null;
            fetched_at: string;
        };
        MarketsResponse: {
            count: number;
            assets: string[];
            fiats: string[];
            items: components["schemas"]["MarketItem"][];
        };
        Merchant: {
            id: string;
            nickname: string;
            orders_30d: number;
            completion_rate: string;
        };
        ModerationStats: {
            reports_new: number;
            reports_pending: number;
            hidden: number;
            deleted_7d: number;
            banned: number;
        };
        NotificationOut: {
            id: number;
            rule_id: number | null;
            rule_title: string | null;
            text: string;
            channels: ("in_app" | "telegram" | "email")[];
            delivery: {
                [key: string]: string;
            };
            opportunity: components["schemas"]["Opportunity"] | null;
            read: boolean;
            created_at: string;
        };
        NotificationsResponse: {
            count: number;
            unread: number;
            items: components["schemas"]["NotificationOut"][];
        };
        NotifyEmailCode: {
            email: string;
            expires_in: number;
        };
        NotifyEmailConfirm: {
            code: string;
        };
        NotifyEmailRequest: {
            email: string;
        };
        Offer: {
            exchange: string;
            side: "BUY" | "SELL";
            asset: string;
            fiat: string;
            price: string;
            min_amount: string;
            max_amount: string;
            available: string;
            payment_methods: string[];
            merchant: components["schemas"]["Merchant"];
            fetched_at: string;
            external_id?: string | null;
        };
        OffersResponse: {
            asset: string;
            fiat: string;
            side: "BUY" | "SELL";
            count: number;
            freshness: components["schemas"]["Freshness"][];
            queued: boolean;
            items: components["schemas"]["Offer"][];
        };
        OpportunitiesResponse: {
            count: number;
            items: components["schemas"]["OpportunityItem"][];
        };
        Opportunity: {
            kind: "spread" | "cross_exchange" | "chain";
            asset: string;
            fiat: string;
            buy_exchange: string;
            sell_exchange: string;
            buy_price: string;
            sell_price: string;
            steps: components["schemas"]["Step"][];
            spread_pct: string;
            net_spread_pct: string;
            estimated_profit: string;
            max_volume: string;
            rr?: string | null;
            risk_score?: number | null;
            risk_level?: ("low" | "medium" | "high") | null;
            ai_score?: number | null;
            investment?: string | null;
            detected_at: string;
        };
        OpportunityHistoryItem: {
            kind: "spread" | "cross_exchange" | "chain";
            asset: string;
            fiat: string;
            buy_exchange: string;
            sell_exchange: string;
            buy_price: string;
            sell_price: string;
            steps: components["schemas"]["Step"][];
            spread_pct: string;
            net_spread_pct: string;
            estimated_profit: string;
            max_volume: string;
            rr?: string | null;
            risk_score?: number | null;
            risk_level?: ("low" | "medium" | "high") | null;
            ai_score?: number | null;
            investment?: string | null;
            detected_at: string;
            ai_category?: string | null;
            id: number;
            duration_sec: number | null;
        };
        OpportunityHistoryResponse: {
            count: number;
            items: components["schemas"]["OpportunityHistoryItem"][];
        };
        OpportunityItem: {
            kind: "spread" | "cross_exchange" | "chain";
            asset: string;
            fiat: string;
            buy_exchange: string;
            sell_exchange: string;
            buy_price: string;
            sell_price: string;
            steps: components["schemas"]["Step"][];
            spread_pct: string;
            net_spread_pct: string;
            estimated_profit: string;
            max_volume: string;
            rr?: string | null;
            risk_score?: number | null;
            risk_level?: ("low" | "medium" | "high") | null;
            ai_score?: number | null;
            investment?: string | null;
            detected_at: string;
            ai_category?: string | null;
        };
        PairIn: {
            asset: string;
            fiat: string;
        };
        PairRef: {
            asset: string;
            fiat: string;
        };
        PingResponse: {
            message: string;
            time: string;
        };
        PostIn: {
            text: string;
            pair?: components["schemas"]["PairIn"] | null;
            opportunity_id?: number | null;
        };
        PostPatch: {
            text?: string | null;
            pair?: components["schemas"]["PairIn"] | null;
            opportunity_id?: number | null;
        };
        PostView: {
            id: number;
            author: components["schemas"]["Author"];
            text: string;
            pair: components["schemas"]["PairRef"] | null;
            opportunity: components["schemas"]["AttachedOpportunity"] | null;
            status: "visible" | "hidden" | "deleted";
            likes: number;
            comments: number;
            reposts: number;
            liked_by_me: boolean;
            reposted_by_me: boolean;
            created_at: string;
            updated_at: string | null;
        };
        ProfilePatch: {
            display_name?: string | null;
            bio?: string | null;
        };
        ProfileView: {
            id: number;
            username: string;
            display_name?: string | null;
            bio?: string | null;
            is_admin: boolean;
            role: "user" | "admin" | "owner";
            status: string;
            joined_at: string;
            posts: number;
            likes_received: number;
            reposts_received: number;
            comments: number;
            ban_until?: string | null;
            ban_reason?: string | null;
        };
        RefreshRequest: {
            refresh_token: string;
        };
        RegisterRequest: {
            username: string;
            email: string;
            password: string;
        };
        ReportIn: {
            post_id?: number | null;
            comment_id?: number | null;
            reason: "spam" | "scam" | "abuse" | "misinformation" | "other";
            details?: string | null;
        };
        ReportStatus: "pending" | "resolved" | "rejected";
        ReportView: {
            id: number;
            target: "post" | "comment";
            post_id: number;
            comment_id: number | null;
            target_text: string;
            target_status: "visible" | "hidden" | "deleted";
            target_author: components["schemas"]["Author"];
            reporter: components["schemas"]["Author"];
            reason: "spam" | "scam" | "abuse" | "misinformation" | "other";
            details: string | null;
            status: "pending" | "resolved" | "rejected";
            created_at: string;
            resolved_at: string | null;
        };
        ReportsResponse: {
            count: number;
            items: components["schemas"]["ReportView"][];
        };
        ResolveIn: {
            action: "hide" | "delete" | "dismiss";
        };
        RoleIn: {
            role: "user" | "admin";
        };
        RuleIn: {
            title?: string | null;
            exchange?: string | null;
            payment?: string | null;
            min_spread?: number | string | null;
            min_net_spread?: number | string | null;
            min_ai_score?: number | null;
            min_rr?: number | string | null;
            min_net_profit?: number | string | null;
            asset: string;
            fiat: string;
            channels: ("in_app" | "telegram" | "email")[];
            enabled: boolean;
        };
        RuleOut: {
            id: number;
            title: string | null;
            asset: string;
            fiat: string;
            exchange: string | null;
            payment: string | null;
            min_spread: string | null;
            min_net_spread: string | null;
            min_ai_score: number | null;
            min_rr: string | null;
            min_net_profit: string | null;
            channels: ("in_app" | "telegram" | "email")[];
            enabled: boolean;
            created_at: string;
            last_triggered_at: string | null;
            triggered_today: number;
        };
        RulePatch: {
            title?: string | null;
            exchange?: string | null;
            payment?: string | null;
            min_spread?: number | string | null;
            min_net_spread?: number | string | null;
            min_ai_score?: number | null;
            min_rr?: number | string | null;
            min_net_profit?: number | string | null;
            asset?: string | null;
            fiat?: string | null;
            channels?: ("in_app" | "telegram" | "email")[] | null;
            enabled?: boolean | null;
        };
        RulesResponse: {
            count: number;
            items: components["schemas"]["RuleOut"][];
        };
        SnapshotResponse: {
            asset: string;
            fiat: string;
            freshness: components["schemas"]["Freshness"][];
            queued: boolean;
            cached: boolean;
            items: components["schemas"]["MarketSnapshot"][];
        };
        StatusIn: {
            status: components["schemas"]["ContentStatus"];
        };
        Step: {
            exchange: string;
            action: "BUY" | "SELL" | "TRANSFER";
            asset: string;
            fiat?: string | null;
            price?: string | null;
            payment_method?: string | null;
            amount_in?: string | null;
            amount_out?: string | null;
        };
        StorageStatus: {
            used_gb: number;
            budget_gb: number;
            per_exchange_gb: number;
            disk_free_gb: number;
            min_free_gb: number;
            full: boolean;
        };
        TableStatus: {
            table: string;
            rows: number;
            exact: boolean;
            size_mb: number;
        };
        TelegramLinkResponse: {
            url: string;
            expires_in: number;
        };
        TestNotificationRequest: {
            channel: "telegram" | "email";
        };
        TestNotificationResponse: {
            channel: "telegram" | "email";
            sent_to: string;
        };
        TrendingPair: {
            asset: string;
            fiat: string;
            posts: number;
            likes: number;
            comments: number;
            change_pct?: string | null;
        };
        TrendingResponse: {
            items: components["schemas"]["TrendingPair"][];
        };
        UserOut: {
            id: number;
            username: string;
            email: string;
            display_name: string | null;
            bio: string | null;
            role: components["schemas"]["UserRole"];
            status: components["schemas"]["UserStatus"];
            telegram_connected: boolean;
            notify_email: string | null;
            email_alerts_available: boolean;
            telegram_alerts_available: boolean;
            settings: components["schemas"]["UserSettings-Output"];
            created_at: string;
        };
        UserRole: "user" | "admin" | "owner";
        "UserSettings-Input": {
            default_asset?: string | null;
            default_fiat?: string | null;
            default_payment?: string | null;
            default_investment?: number | string | null;
            min_rr?: number | string | null;
            extra_fees?: number | string | null;
            hide_illiquid?: boolean | null;
            notify_comments?: boolean | null;
            notify_likes?: boolean | null;
            language?: ("uk" | "en") | null;
        };
        "UserSettings-Output": {
            default_asset?: string | null;
            default_fiat?: string | null;
            default_payment?: string | null;
            default_investment?: string | null;
            min_rr?: string | null;
            extra_fees?: string | null;
            hide_illiquid?: boolean | null;
            notify_comments?: boolean | null;
            notify_likes?: boolean | null;
            language?: ("uk" | "en") | null;
        };
        UserStatus: "active" | "suspended" | "banned";
        UsersResponse: {
            count: number;
            items: components["schemas"]["AdminUserView"][];
        };
        ValidationError: {
            loc: (string | number)[];
            msg: string;
            type: string;
            input?: unknown;
            ctx?: Record<string, never>;
        };
        WatchlistIn: {
            asset: string;
            fiat: string;
            exchange?: string | null;
        };
        WatchlistItemOut: {
            id: number;
            asset: string;
            fiat: string;
            exchange: string | null;
            created_at: string;
        };
        WatchlistResponse: {
            count: number;
            items: components["schemas"]["WatchlistItemOut"][];
        };
        app__api__v1__ai__ChatRequest: {
            messages: components["schemas"]["ChatMessage-Input"][];
        };
        app__api__v1__assistant__ChatRequest: {
            conversation_id?: string | null;
            message: string;
            asset?: string | null;
            fiat?: string | null;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    health_api_v1_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
    ping_api_v1_ping_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PingResponse"];
                };
            };
        };
    };
    list_markets_api_v1_markets_get: {
        parameters: {
            query?: {
                asset?: string | null;
                fiat?: string | null;
                exchange?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MarketsResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    market_snapshot_api_v1_market_snapshot_get: {
        parameters: {
            query: {
                asset: string;
                fiat: string;
                amount?: number | string | null;
                exchange?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SnapshotResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    market_history_api_v1_market_history_get: {
        parameters: {
            query: {
                asset: string;
                fiat: string;
                exchange?: string;
                from?: string | null;
                to?: string | null;
                interval?: "1m" | "5m" | "15m" | "1h" | "1d";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HistoryResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_offers_api_v1_offers_get: {
        parameters: {
            query: {
                asset: string;
                fiat: string;
                side: "BUY" | "SELL";
                payment?: string | null;
                amount?: number | string | null;
                exchange?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OffersResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_opportunities_api_v1_opportunities_get: {
        parameters: {
            query?: {
                asset?: string | null;
                fiat?: string | null;
                kind?: ("spread" | "cross_exchange" | "chain") | null;
                buy_exchange?: string | null;
                sell_exchange?: string | null;
                min_spread?: number | string | null;
                min_net_spread?: number | string | null;
                min_ai_score?: number | null;
                min_rr?: number | string | null;
                min_volume?: number | string | null;
                investment?: number | string | null;
                hide_illiquid?: boolean;
                single_fiat?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OpportunitiesResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    opportunities_history_api_v1_opportunities_history_get: {
        parameters: {
            query?: {
                asset?: string | null;
                fiat?: string | null;
                kind?: ("spread" | "cross_exchange" | "chain") | null;
                hours?: number;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OpportunityHistoryResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deal_calculator_api_v1_calculator_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CalculatorRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CalculatorResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    collector_status_api_v1_collector_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CollectorStatusResponse"];
                };
            };
        };
    };
    register_user_api_v1_auth_register_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterRequest"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    login_user_api_v1_auth_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    refresh_tokens_api_v1_auth_refresh_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    logout_user_api_v1_auth_logout_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshRequest"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    change_user_password_api_v1_auth_change_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangePasswordRequest"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    me_api_v1_me_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserOut"];
                };
            };
        };
    };
    patch_profile_api_v1_me_patch: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfilePatch"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserOut"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    patch_settings_api_v1_me_settings_patch: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserSettings-Input"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserOut"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    telegram_link_api_v1_me_telegram_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TelegramLinkResponse"];
                };
            };
        };
    };
    telegram_unlink_api_v1_me_telegram_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    notify_email_request_api_v1_me_notify_email_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NotifyEmailRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotifyEmailCode"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    notify_email_clear_api_v1_me_notify_email_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserOut"];
                };
            };
        };
    };
    notify_email_confirm_api_v1_me_notify_email_confirm_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NotifyEmailConfirm"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserOut"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    notification_test_api_v1_me_notifications_test_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TestNotificationRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TestNotificationResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_items_api_v1_watchlist_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WatchlistResponse"];
                };
            };
        };
    };
    add_item_api_v1_watchlist_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WatchlistIn"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WatchlistItemOut"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_item_api_v1_watchlist__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                item_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_rules_api_v1_alerts_rules_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RulesResponse"];
                };
            };
        };
    };
    create_api_v1_alerts_rules_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RuleIn"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuleOut"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_api_v1_alerts_rules__rule_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                rule_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    patch_api_v1_alerts_rules__rule_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                rule_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RulePatch"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuleOut"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    notifications_api_v1_notifications_get: {
        parameters: {
            query?: {
                unread_only?: boolean;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationsResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    read_notifications_api_v1_notifications_read_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MarkReadRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MarkReadResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    assistant_chat_api_v1_ai_chat_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["app__api__v1__ai__ChatRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                    "text/event-stream": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_conversations_api_v1_assistant_conversations_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversationsResponse"];
                };
            };
        };
    };
    get_conversation_api_v1_assistant_conversations__conversation_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                conversation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversationDetail"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_conversation_api_v1_assistant_conversations__conversation_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                conversation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    send_message_api_v1_assistant_chat_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["app__api__v1__assistant__ChatRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChatResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_feed_api_v1_community_feed_get: {
        parameters: {
            query?: {
                sort?: "new" | "popular";
                scope?: "all" | "mine";
                asset?: string | null;
                fiat?: string | null;
                cursor?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FeedPage"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    trending_pairs_api_v1_community_trending_pairs_get: {
        parameters: {
            query?: {
                hours?: number;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TrendingResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_post_api_v1_community_posts_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PostIn"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_post_api_v1_community_posts__post_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                post_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_post_api_v1_community_posts__post_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                post_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    edit_post_api_v1_community_posts__post_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                post_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PostPatch"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    like_api_v1_community_posts__post_id__like_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                post_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    unlike_api_v1_community_posts__post_id__like_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                post_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    repost_api_v1_community_posts__post_id__repost_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                post_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    unrepost_api_v1_community_posts__post_id__repost_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                post_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_comments_api_v1_community_posts__post_id__comments_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path: {
                post_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommentsResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    add_comment_api_v1_community_posts__post_id__comments_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                post_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommentIn"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommentView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_comment_api_v1_community_comments__comment_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                comment_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    edit_comment_api_v1_community_comments__comment_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                comment_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommentIn"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommentView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_profile_api_v1_community_users__username__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfileView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_user_feed_api_v1_community_users__username__feed_get: {
        parameters: {
            query?: {
                tab?: "posts" | "reposts" | "likes";
                cursor?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FeedPage"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_report_api_v1_community_reports_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportIn"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    stats_api_v1_admin_stats_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ModerationStats"];
                };
            };
        };
    };
    list_reports_api_v1_admin_reports_get: {
        parameters: {
            query?: {
                status?: components["schemas"]["ReportStatus"] | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportsResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    resolve_report_api_v1_admin_reports__report_id__resolve_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                report_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResolveIn"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    set_post_status_api_v1_admin_posts__post_id__status_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                post_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StatusIn"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    set_comment_status_api_v1_admin_comments__comment_id__status_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                comment_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StatusIn"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommentView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    hidden_api_v1_admin_hidden_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HiddenResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_bans_api_v1_admin_bans_get: {
        parameters: {
            query?: {
                active?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BansResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    ban_user_api_v1_admin_bans_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BanIn"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BanView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    unban_user_api_v1_admin_bans__user_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_users_api_v1_admin_users_get: {
        parameters: {
            query?: {
                query?: string | null;
                role?: components["schemas"]["UserRole"] | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UsersResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    change_role_api_v1_admin_users__user_id__role_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RoleIn"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminUserView"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
