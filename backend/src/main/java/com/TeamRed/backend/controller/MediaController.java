package com.TeamRed.backend.controller;

import com.TeamRed.backend.external.tmdb.TmdbClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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

    // ================= SEARCH =================

    @Operation(
            summary = "Search Multi",
            description = "Searches movies, TV shows, and people."
    )
    @GetMapping("/search/multi")
    public ResponseEntity<Object> searchMulti(
            @RequestParam String query,
            @RequestParam(required = false) Boolean includeAdult,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Integer page) {

        String endpoint = "/search/multi";
        Map<String, Object> params = buildParams(
                "query", query,
                "include_adult", includeAdult,
                "language", language,
                "page", page
        );

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Search for movies",
            description = "Searches for movies by title and optional filters."
    )
    @GetMapping("/search/movies")
    public ResponseEntity<Object> searchMovies(
            @RequestParam String query,
            @RequestParam(required = false) Boolean includeAdult,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String year,
            @RequestParam(required = false, name = "primary_release_year") String primaryReleaseYear) {

        String endpoint = "/search/movie";
        Map<String, Object> params = buildParams(
                "query", query,
                "include_adult", includeAdult,
                "language", language,
                "page", page,
                "region", region,
                "year", year,
                "primary_release_year", primaryReleaseYear
        );

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    // ================= MOVIE CALLS =================

    @Operation(
            summary = "Now Playing",
            description = "Retrieves movies that are currently in theatres."
    )
    @GetMapping("/movies/now_playing")
    public ResponseEntity<Object> getNowPlayingMovies(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String region) {

        String endpoint = "/movie/now_playing";
        Map<String, Object> params = buildParams(
                "page", page,
                "language", language,
                "region", region
        );

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Popular",
            description = "Retrieves popular movies."
    )
    @GetMapping("/movies/popular")
    public ResponseEntity<Object> getPopularMovies(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String region) {

        String endpoint = "/movie/popular";
        Map<String, Object> params = buildParams(
                "page", page,
                "language", language,
                "region", region
        );

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Top Rated",
            description = "Retrieves top-rated movies."
    )
    @GetMapping("/movies/top_rated")
    public ResponseEntity<Object> getTopRatedMovies(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String region) {

        String endpoint = "/movie/top_rated";
        Map<String, Object> params = buildParams(
                "page", page,
                "language", language,
                "region", region
        );

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Upcoming",
            description = "Retrieves upcoming movies."
    )
    @GetMapping("/movies/upcoming")
    public ResponseEntity<Object> getUpcomingMovies(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String region) {

        String endpoint = "/movie/upcoming";
        Map<String, Object> params = buildParams(
                "page", page,
                "language", language,
                "region", region
        );

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Get movie details",
            description = "Retrieves detailed information about a specific movie by its TMDB ID."
    )
    @GetMapping("/movies/{tmdbId}")
    public ResponseEntity<Object> getMovieDetails(
            @PathVariable long tmdbId,
            @RequestParam(required = false) String language) {

        String endpoint = "/movie/" + tmdbId;
        Map<String, Object> params = buildParams("language", language);

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Get movie credits",
            description = "Retrieves cast and crew information for a specific movie."
    )
    @GetMapping("/movies/{tmdbId}/credits")
    public ResponseEntity<Object> getMovieCredits(
            @PathVariable long tmdbId,
            @RequestParam(required = false) String language) {

        String endpoint = "/movie/" + tmdbId + "/credits";
        Map<String, Object> params = buildParams("language", language);

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Get movie watch providers",
            description = "Returns a list of watch providers for a movie."
    )
    @GetMapping("/movies/{tmdbId}/watch/providers")
    public ResponseEntity<Object> getMovieWatchProviders(@PathVariable long tmdbId) {

        String endpoint = "/movie/" + tmdbId + "/watch/providers";
        return ResponseEntity.ok(tmdbClient.get(endpoint, new HashMap<>()));
    }

    // ================= TV SERIES CALLS =================

    @Operation(
            summary = "Airing Today",
            description = "Retrieves TV series airing today."
    )
    @GetMapping("/tv/airing_today")
    public ResponseEntity<Object> getAiringTodaySeries(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String timezone) {

        String endpoint = "/tv/airing_today";
        Map<String, Object> params = buildParams(
                "page", page,
                "language", language,
                "timezone", timezone
        );

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "On The Air",
            description = "Retrieves TV series currently on the air."
    )
    @GetMapping("/tv/on_the_air")
    public ResponseEntity<Object> getOnTheAirSeries(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String timezone) {

        String endpoint = "/tv/on_the_air";
        Map<String, Object> params = buildParams(
                "page", page,
                "language", language,
                "timezone", timezone
        );

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Popular Series",
            description = "Retrieves popular TV series."
    )
    @GetMapping("/tv/popular")
    public ResponseEntity<Object> getPopularSeries(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String language) {

        String endpoint = "/tv/popular";
        Map<String, Object> params = buildParams(
                "page", page,
                "language", language
        );

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Top Rated Series",
            description = "Retrieves top-rated TV series."
    )
    @GetMapping("/tv/top_rated")
    public ResponseEntity<Object> getTopRatedSeries(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String language) {

        String endpoint = "/tv/top_rated";
        Map<String, Object> params = buildParams(
                "page", page,
                "language", language
        );

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Get Series Details",
            description = "Retrieves detailed information about a specific TV series by its TMDB ID."
    )
    @GetMapping("/tv/{tmdbId}")
    public ResponseEntity<Object> getSeriesDetails(
            @PathVariable long tmdbId,
            @RequestParam(required = false) String language) {

        String endpoint = "/tv/" + tmdbId;
        Map<String, Object> params = buildParams("language", language);

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Get Series Aggregate Credits",
            description = "Retrieves cast and crew information for a specific TV series by its TMDB ID."
    )
    @GetMapping("/tv/{tmdbId}/aggregate_credits")
    public ResponseEntity<Object> getSeriesAggregateCredits(
            @PathVariable long tmdbId,
            @RequestParam(required = false) String language) {

        String endpoint = "/tv/" + tmdbId + "/aggregate_credits";
        Map<String, Object> params = buildParams("language", language);

        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
    }

    @Operation(
            summary = "Get TV Series Watch Providers",
            description = "Returns a list of watch providers for a specific TV series by region."
    )
    @GetMapping("/tv/{tmdbId}/watch/providers")
    public ResponseEntity<Object> getSeriesWatchProviders(@PathVariable long tmdbId) {

        String endpoint = "/tv/" + tmdbId + "/watch/providers";
        return ResponseEntity.ok(tmdbClient.get(endpoint, null));
    }


    // ================= HELPER =================

    private Map<String, Object> buildParams(Object... keyValuePairs) {
        Map<String, Object> map = new HashMap<>();
        for (int i = 0; i < keyValuePairs.length; i += 2) {
            String key = (String) keyValuePairs[i];
            Object value = keyValuePairs[i + 1];
            if (value != null && !value.toString().isBlank()) {
                map.put(key, value);
            }
        }
        return map;
    }
}
