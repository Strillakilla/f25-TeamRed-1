package com.TeamRed.backend.controller;

import com.TeamRed.backend.entity.User;
import com.TeamRed.backend.security.CustomUserDetails;
import com.TeamRed.backend.service.WatchlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Watchlist",
        description = "Endpoints for managing user watchlists"
)
@RestController
@RequestMapping("/api/watchlist")
@CrossOrigin(origins = "*")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @Operation(
            summary = "Get a user's watchlist",
            description = "Retrieves the full watchlist for a specific user."
    )

    @GetMapping
    public ResponseEntity<List<Object>> getUserWatchlist(@AuthenticationPrincipal CustomUserDetails currentUser) {
        List<Object> watchlist = watchlistService.getUserWatchlist(currentUser.getId());
        return ResponseEntity.ok(watchlist);
    }

    @Operation(summary = "Add to watchlist", description = "Adds a movie or TV show to the user's watchlist.")
    @PostMapping("/add")
    public ResponseEntity<Void> addToWatchlist(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam Long mediaId,
            @RequestParam String mediaType) {

        watchlistService.addToWatchlist(currentUser.getId(), mediaId, mediaType);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Remove from watchlist", description = "Removes an item from the user's watchlist.")
    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeFromWatchlist(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam Long mediaId,
            @RequestParam String mediaType) {

        watchlistService.removeFromWatchlist(currentUser.getId(), mediaId, mediaType);
        return ResponseEntity.noContent().build();
    }
}
