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

    @GetMapping("/search/tv")
    public ResponseEntity<Object> searchSeries(
            @RequestParam String query,
            @RequestParam(required = false) Boolean includeAdult,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String year,
            @RequestParam(required = false, name = "first_air_date_year") String primaryReleaseYear) {

        String endpoint = "/search/tv";
        Map<String, Object> params = buildParams(
                "query", query,
                "include_adult", includeAdult,
                "language", language,
                "page", page,
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


    @Operation(
            summary = "Discover Movies",
            description = "Find movies using over 30 filters and sort options."
    )
    @GetMapping("/movies/discover/")
    public ResponseEntity<Object> discoverMovies(

            @RequestParam(required = false) String certification,
            @RequestParam(required = false, name = "certification.gte") String certificationGte,
            @RequestParam(required = false, name = "certification.lte") String certificationLte,
            @RequestParam(required = false) String certification_country,

            @RequestParam(required = false) Boolean include_adult,
            @RequestParam(required = false) Boolean include_video,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Integer page,

            @RequestParam(required = false) Integer primary_release_year,
            @RequestParam(required = false, name = "primary_release_date.gte") String primaryReleaseDateGte,
            @RequestParam(required = false, name = "primary_release_date.lte") String primaryReleaseDateLte,

            @RequestParam(required = false) String region,
            @RequestParam(required = false, name = "release_date.gte") String releaseDateGte,
            @RequestParam(required = false, name = "release_date.lte") String releaseDateLte,

            @RequestParam(required = false) String sort_by,

            @RequestParam(required = false, name = "vote_average.gte") Float voteAverageGte,
            @RequestParam(required = false, name = "vote_average.lte") Float voteAverageLte,
            @RequestParam(required = false, name = "vote_count.gte") Float voteCountGte,
            @RequestParam(required = false, name = "vote_count.lte") Float voteCountLte,

            @RequestParam(required = false) String watch_region,
            @RequestParam(required = false) String with_cast,
            @RequestParam(required = false) String with_companies,
            @RequestParam(required = false) String with_crew,
            @RequestParam(required = false) String with_genres,
            @RequestParam(required = false) String with_keywords,
            @RequestParam(required = false) String with_origin_country,
            @RequestParam(required = false) String with_original_language,
            @RequestParam(required = false) String with_people,
            @RequestParam(required = false) String with_release_type,

            @RequestParam(required = false, name = "with_runtime.gte") Integer withRuntimeGte,
            @RequestParam(required = false, name = "with_runtime.lte") Integer withRuntimeLte,

            @RequestParam(required = false) String with_watch_monetization_types,
            @RequestParam(required = false) String with_watch_providers,

            @RequestParam(required = false) String without_companies,
            @RequestParam(required = false) String without_genres,
            @RequestParam(required = false) String without_keywords,
            @RequestParam(required = false) String without_watch_providers,

            @RequestParam(required = false) Integer year
    ) {

        Map<String, Object> params = buildParams(
                "certification", certification,
                "certification.gte", certificationGte,
                "certification.lte", certificationLte,
                "certification_country", certification_country,
                "include_adult", include_adult,
                "include_video", include_video,
                "language", language,
                "page", page,
                "primary_release_year", primary_release_year,
                "primary_release_date.gte", primaryReleaseDateGte,
                "primary_release_date.lte", primaryReleaseDateLte,
                "region", region,
                "release_date.gte", releaseDateGte,
                "release_date.lte", releaseDateLte,
                "sort_by", sort_by,
                "vote_average.gte", voteAverageGte,
                "vote_average.lte", voteAverageLte,
                "vote_count.gte", voteCountGte,
                "vote_count.lte", voteCountLte,
                "watch_region", watch_region,
                "with_cast", with_cast,
                "with_companies", with_companies,
                "with_crew", with_crew,
                "with_genres", with_genres,
                "with_keywords", with_keywords,
                "with_origin_country", with_origin_country,
                "with_original_language", with_original_language,
                "with_people", with_people,
                "with_release_type", with_release_type,
                "with_runtime.gte", withRuntimeGte,
                "with_runtime.lte", withRuntimeLte,
                "with_watch_monetization_types", with_watch_monetization_types,
                "with_watch_providers", with_watch_providers,
                "without_companies", without_companies,
                "without_genres", without_genres,
                "without_keywords", without_keywords,
                "without_watch_providers", without_watch_providers,
                "year", year
        );


        String endpoint = "/discover/movie";
        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
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

    @Operation(
            summary = "Discover TV Series",
            description = "Find TV series using all available TMDB discover filters and sort options."
    )
    @GetMapping("/tv/discover")
    public ResponseEntity<Object> discoverSeries(

            @RequestParam(required = false, name = "air_date.gte") String airDateGte,
            @RequestParam(required = false, name = "air_date.lte") String airDateLte,

            @RequestParam(required = false) Integer first_air_date_year,
            @RequestParam(required = false, name = "first_air_date.gte") String firstAirDateGte,
            @RequestParam(required = false, name = "first_air_date.lte") String firstAirDateLte,

            @RequestParam(required = false) Boolean include_adult,
            @RequestParam(required = false) Boolean include_null_first_air_dates,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Boolean screened_theatrically,

            @RequestParam(required = false) String sort_by,
            @RequestParam(required = false) String timezone,

            @RequestParam(required = false, name = "vote_average.gte") Float voteAverageGte,
            @RequestParam(required = false, name = "vote_average.lte") Float voteAverageLte,
            @RequestParam(required = false, name = "vote_count.gte") Float voteCountGte,
            @RequestParam(required = false, name = "vote_count.lte") Float voteCountLte,

            @RequestParam(required = false) String watch_region,

            @RequestParam(required = false) String with_companies,
            @RequestParam(required = false) String with_genres,
            @RequestParam(required = false) String with_keywords,

            @RequestParam(required = false) Integer with_networks,
            @RequestParam(required = false) String with_origin_country,
            @RequestParam(required = false) String with_original_language,

            @RequestParam(required = false, name = "with_runtime.gte") Integer withRuntimeGte,
            @RequestParam(required = false, name = "with_runtime.lte") Integer withRuntimeLte,

            @RequestParam(required = false) String with_status,
            @RequestParam(required = false) String with_watch_monetization_types,
            @RequestParam(required = false) String with_watch_providers,

            @RequestParam(required = false) String without_companies,
            @RequestParam(required = false) String without_genres,
            @RequestParam(required = false) String without_keywords,
            @RequestParam(required = false) String without_watch_providers,

            @RequestParam(required = false) String with_type
    ) {

        Map<String, Object> params = buildParams(
                "air_date.gte", airDateGte,
                "air_date.lte", airDateLte,
                "first_air_date_year", first_air_date_year,
                "first_air_date.gte", firstAirDateGte,
                "first_air_date.lte", firstAirDateLte,
                "include_adult", include_adult,
                "include_null_first_air_dates", include_null_first_air_dates,
                "language", language,
                "page", page,
                "screened_theatrically", screened_theatrically,
                "sort_by", sort_by,
                "timezone", timezone,
                "vote_average.gte", voteAverageGte,
                "vote_average.lte", voteAverageLte,
                "vote_count.gte", voteCountGte,
                "vote_count.lte", voteCountLte,
                "watch_region", watch_region,
                "with_companies", with_companies,
                "with_genres", with_genres,
                "with_keywords", with_keywords,
                "with_networks", with_networks,
                "with_origin_country", with_origin_country,
                "with_original_language", with_original_language,
                "with_runtime.gte", withRuntimeGte,
                "with_runtime.lte", withRuntimeLte,
                "with_status", with_status,
                "with_watch_monetization_types", with_watch_monetization_types,
                "with_watch_providers", with_watch_providers,
                "without_companies", without_companies,
                "without_genres", without_genres,
                "without_keywords", without_keywords,
                "without_watch_providers", without_watch_providers,
                "with_type", with_type
        );

        String endpoint = "/discover/tv";
        return ResponseEntity.ok(tmdbClient.get(endpoint, params));
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
