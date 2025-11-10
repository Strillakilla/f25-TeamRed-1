package com.TeamRed.backend.service;

import com.TeamRed.backend.entity.User;
import com.TeamRed.backend.entity.Watchlist;
import com.TeamRed.backend.external.tmdb.TmdbClient;
import com.TeamRed.backend.repository.WatchlistRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final TmdbClient tmdbClient;

    public WatchlistService(WatchlistRepository watchlistRepository, TmdbClient tmdbClient) {
        this.watchlistRepository = watchlistRepository;
        this.tmdbClient = tmdbClient;
    }

    public void addToWatchlist(User user, Long mediaId, String mediaType) {
        if (!watchlistRepository.existsByUserUserIdAndMediaId(user.getUserId(), mediaId)) {
            watchlistRepository.save(new Watchlist(user, mediaId, mediaType));
        }
    }

    public void removeFromWatchlist(Long userId, Long mediaId) {
        watchlistRepository.deleteByUserUserIdAndMediaId(userId, mediaId);
    }

    public List<Object> getUserWatchlist(Long userId) {
        return watchlistRepository.findAllByUserUserId(userId).stream()
                .map(entry -> {
                    String endpoint = "/" + entry.getMediaType() + "/" + entry.getMediaId();
                    return tmdbClient.get(endpoint, null);
                })
                .toList();
    }
}

