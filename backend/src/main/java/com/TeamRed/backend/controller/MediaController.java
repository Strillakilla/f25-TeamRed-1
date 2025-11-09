package com.TeamRed.backend.controller;

import com.TeamRed.backend.external.tmdb.TmdbClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@Tag(
        name = "Media",
        description = "Endpoints for media interfacing with the TMDB"
)
@RestController
@RequestMapping("/api/media")
@CrossOrigin(origins = "*")

public class MediaController {

    private final TmdbClient tmdbClient;

    public MediaController(TmdbClient tmdbClient) {
        this.tmdbClient = tmdbClient;
    }
    @Operation(
            summary = "Search Multi",
            description = "Searches movies, TV shows, and people."
    )
    @GetMapping("/search/all")
    public ResponseEntity<String> searchAll(@RequestParam String query, @RequestParam(required = false) Boolean includeAdult, @RequestParam(required = false) String language, @RequestParam(required = false) Integer page) {
        return ResponseEntity.ok(tmdbClient.searchMulti(query, includeAdult, language, page));
    }

    @Operation(
            summary = "Search for movies",
            description = "Searches for movies by title and some optional filters.")
    @GetMapping("/search/movies")
    public ResponseEntity<String> searchMovies(@RequestParam String query, @RequestParam(required = false) Boolean includeAdult,
                                               @RequestParam(required = false) Integer page,
                                               @RequestParam(required = false) String language,
                                               @RequestParam(required = false) String region,
                                               @RequestParam(required = false) String year,
                                               @RequestParam(required = false) String primaryReleaseYear) {
        return ResponseEntity.ok(tmdbClient.searchMovies(query, includeAdult, page, language, region, year, primaryReleaseYear));
    }

    @Operation(
            summary = "Now Playing",
            description = "Retrieves movies that are currently in theatres")
    @GetMapping("/movies/now_playing")
    public ResponseEntity<String> getNowPlaying(@RequestParam(required = false) Integer page,
                                                   @RequestParam(required = false) String language,
                                                   @RequestParam(required = false) String region) {
        return ResponseEntity.ok(tmdbClient.getPopularMovies(page, language, region));
    }

    @Operation(
            summary = "Popular",
            description = "Retrieves popular movies.")
    @GetMapping("/movies/popular")
    public ResponseEntity<String> getPopularMovies(@RequestParam(required = false) Integer page,
                                                   @RequestParam(required = false) String language,
                                                   @RequestParam(required = false) String region) {
        return ResponseEntity.ok(tmdbClient.getPopularMovies(page, language, region));
    }

    @Operation(
            summary = "Top Rated",
            description = "Retrieves top rated movies.")
    @GetMapping("/movies/top_rated")
    public ResponseEntity<String> getTopRated(@RequestParam(required = false) Integer page,
                                                   @RequestParam(required = false) String language,
                                                   @RequestParam(required = false) String region) {
        return ResponseEntity.ok(tmdbClient.getPopularMovies(page, language, region));
    }

    @Operation(
            summary = "Upcoming",
            description = "Retrieves upcoming movies.")
    @GetMapping("/movies/upcoming")
    public ResponseEntity<String> getUpcoming(@RequestParam(required = false) Integer page,
                                                   @RequestParam(required = false) String language,
                                                   @RequestParam(required = false) String region) {
        return ResponseEntity.ok(tmdbClient.getPopularMovies(page, language, region));
    }

    @Operation(
            summary = "Get movie details",
            description = "Retrieves detailed information about a specific movie by its TMDB ID.")
    @GetMapping("/movies/{tmdbId}")
    public ResponseEntity<String> getMovieDetails(@PathVariable long tmdbId,
                                                  @RequestParam(required = false) String language) {
        return ResponseEntity.ok(tmdbClient.getMovieDetails(tmdbId, language));
    }
}
