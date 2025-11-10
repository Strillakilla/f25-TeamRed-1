package com.TeamRed.backend.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "watchlists")
public class Watchlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long watchlistId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Long mediaId;
    private String mediaType;

    public Watchlist(User user, Long mediaId, String mediaType) {
        this.user = user;
        this.mediaId = mediaId;
        this.mediaType = mediaType;
    }

}
