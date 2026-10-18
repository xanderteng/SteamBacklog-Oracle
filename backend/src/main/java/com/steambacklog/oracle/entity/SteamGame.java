package com.steambacklog.oracle.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "steam_game",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_steam_game_user_app", columnNames = {"steam_id", "app_id"})
        },
        indexes = {
                @Index(name = "idx_steam_game_user_backlog", columnList = "steam_id, is_backlog")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class SteamGame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "steam_id", nullable = false, length = 32)
    private String steamId;

    @Column(name = "app_id", nullable = false)
    private Long appId;

    @Column(name = "name", nullable = false, length = 512)
    private String name;

    @Column(name = "playtime_forever_minutes", nullable = false)
    private Integer playtimeForeverMinutes;

    @Column(name = "img_icon_url", length = 255)
    private String imgIconUrl;

    @Column(name = "is_backlog", nullable = false)
    private Boolean isBacklog;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.isBacklog == null) {
            this.isBacklog = (this.playtimeForeverMinutes == null || this.playtimeForeverMinutes < 120);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public SteamGame(String steamId, Long appId, String name, Integer playtimeForeverMinutes, String imgIconUrl, Boolean isBacklog) {
        this.steamId = steamId;
        this.appId = appId;
        this.name = name;
        this.playtimeForeverMinutes = playtimeForeverMinutes;
        this.imgIconUrl = imgIconUrl;
        this.isBacklog = isBacklog;
    }
}
