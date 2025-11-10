package com.TeamRed.backend.external.tmdb;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;
import java.util.Optional;

@Component
public class TmdbClient {

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.base.url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Object get(String endpoint, Map<String, Object> params) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(baseUrl + endpoint)
                .queryParam("api_key", apiKey);

        if (params != null) {
            params.forEach(builder::queryParam);
        }

        return restTemplate.getForObject(builder.toUriString(), Object.class);
    }
//    // MOVIE CALLS
//
//    public Object getNowPlayingMovies(Integer page, String language, String region) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/movie/now_playing")
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .queryParamIfPresent("page", Optional.ofNullable(page))
//                .queryParamIfPresent("region", Optional.ofNullable(region))
//                .toUriString();
//        return fetch(url);
//    }
//
//
//    public Object getPopularMovies(Integer page, String language, String region) {
//        String url = UriComponentsBuilder
//                .fromUriString(baseUrl + "/movie/popular")
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .queryParamIfPresent("page", Optional.ofNullable(page))
//                .queryParamIfPresent("region", Optional.ofNullable(region))
//                .toUriString();
//
//        return fetch(url);
//    }
//
//    public Object getTopRatedMovies(Integer page, String language, String region) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/movie/top_rated")
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .queryParamIfPresent("page", Optional.ofNullable(page))
//                .queryParamIfPresent("region", Optional.ofNullable(region))
//                .toUriString();
//        return fetch(url);
//    }
//
//    public Object getUpcomingMovies(Integer page, String language, String region) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/movie/upcoming")
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .queryParamIfPresent("page", Optional.ofNullable(page))
//                .queryParamIfPresent("region", Optional.ofNullable(region))
//                .toUriString();
//
//        return fetch(url);
//    }
//
//
//
//    public Object searchMovies(String query, Boolean includeAdult, Integer page, String language, String region, String year, String primaryReleaseYear) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/search/movie")
//                .queryParam("api_key", apiKey)
//                .queryParam("query", query)
//                .queryParamIfPresent("include_adult", Optional.ofNullable(includeAdult))
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .queryParamIfPresent("page", Optional.ofNullable(page))
//                .queryParamIfPresent("region", Optional.ofNullable(region))
//                .queryParamIfPresent("year", Optional.ofNullable(year))
//                .queryParamIfPresent("primary_release_year", Optional.ofNullable(primaryReleaseYear))
//                .toUriString();
//
//        return fetch(url);
//    }
//
//
//    public Object getMovieDetails(long tmdbId, String language) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/movie/" + tmdbId)
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .toUriString();
//
//        return fetch(url);
//    }
//
//    public Object getMovieCredits(long tmdbId, String language) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/movie/" + tmdbId + "/credits")
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .toUriString();
//
//        return fetch(url);
//    }
//
//    public Object getMovieWatchProviders(long tmdbId) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/movie/" + tmdbId + "/watch/providers")
//                .queryParam("api_key", apiKey)
//                .toUriString();
//
//        return fetch(url);
//    }
//
//
//    // TV SERIES CALLS
//
//    public Object getAiringTodaySeries(Integer page, String language, String timezone) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/tv/airing_today")
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .queryParamIfPresent("page", Optional.ofNullable(page))
//                .queryParamIfPresent("timezone", Optional.ofNullable(timezone))
//                .toUriString();
//        return fetch(url);
//    }
//
//    public Object getOnTheAirSeries(Integer page, String language, String timezone) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/tv/on_the_air")
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .queryParamIfPresent("page", Optional.ofNullable(page))
//                .queryParamIfPresent("timezone", Optional.ofNullable(timezone))
//                .toUriString();
//        return fetch(url);
//    }
//
//    public Object getPopularSeries(Integer page, String language) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/tv/popular")
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .queryParamIfPresent("page", Optional.ofNullable(page))
//                .toUriString();
//        return fetch(url);
//    }
//
//    public Object getTopRatedSeries(Integer page, String language) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/tv/top_rated")
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .queryParamIfPresent("page", Optional.ofNullable(page))
//                .toUriString();
//        return fetch(url);
//    }
//
//    public Object getSeriesDetails(long tmdbId, String language) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/tv/" + tmdbId)
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .toUriString();
//
//        return fetch(url);
//    }
//
//    public Object getSeriesAggregateCredits(long tmdbId, String language) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/tv/" + tmdbId + "/aggregate_credits")
//                .queryParam("api_key", apiKey)
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .toUriString();
//
//        return fetch(url);
//    }
//
//    public Object getSeriesWatchProviders(long tmdbId) {
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/tv/" + tmdbId + "/watch/providers")
//                .queryParam("api_key", apiKey)
//                .toUriString();
//
//        return fetch(url);
//    }
//
//
//
//
//    // ACTOR CALLS
//
//    // MULTI CALLS
//
//    public Object searchMulti(String query, Boolean includeAdult, String language, Integer page) {
//
//        String url = UriComponentsBuilder.fromUriString(baseUrl + "/search/multi")
//                .queryParam("api_key", apiKey)
//                .queryParam("query", query)
//                .queryParamIfPresent("include_adult", Optional.ofNullable(includeAdult))
//                .queryParamIfPresent("language", Optional.ofNullable(language))
//                .queryParamIfPresent("page", Optional.ofNullable(page))
//                .toUriString();
//
//        return fetch(url);
//    }
//
//
//    // HELPERS
//    private Object fetch(String url) {
//        return restTemplate.getForObject(url, Object.class);
//    }

}
