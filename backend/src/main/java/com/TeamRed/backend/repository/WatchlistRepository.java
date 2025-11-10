package com.TeamRed.backend.repository;

import com.TeamRed.backend.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {


    List<Watchlist> findAllByUserUserId(Long userId);

    boolean existsByUserUserIdAndMediaId(Long userId, Long mediaId);

    void deleteByUserUserIdAndMediaIdAndMediaType(Long userId, Long mediaId, String mediaType);

}
