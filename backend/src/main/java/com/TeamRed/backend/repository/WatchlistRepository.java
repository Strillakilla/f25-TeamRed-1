package com.TeamRed.backend.repository;

import com.TeamRed.backend.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {


    List<Watchlist> findAllByUserUserId(Long userId);

    // Check if a specific media item is already in the user's watchlist
    boolean existsByUserUserIdAndMediaId(Long userId, Long mediaId);

    // Optional: delete an item from the user's watchlist
    void deleteByUserUserIdAndMediaId(Long userId, Long mediaId);
}
