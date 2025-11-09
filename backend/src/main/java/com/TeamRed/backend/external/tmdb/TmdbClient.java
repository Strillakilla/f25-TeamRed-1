package com.TeamRed.backend.external.tmdb;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Optional;

@Component
public class TmdbClient {

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.base.url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();


    // MOVIE CALLS

    public String getNowPlaying(String language, Integer page, String region) {
        String url = UriComponentsBuilder.fromUriString(baseUrl + "/movie/now_playing")
                .queryParam("api_key", apiKey)
                .queryParamIfPresent("language", Optional.ofNullable(language))
                .queryParamIfPresent("page", Optional.ofNullable(page))
                .queryParamIfPresent("region", Optional.ofNullable(region))
                .toUriString();
        return restTemplate.getForObject(url, String.class);
    }


    public String getPopularMovies(Integer page, String language, String region) {
        String url = UriComponentsBuilder
                .fromUriString(baseUrl + "/movie/popular")
                .queryParam("api_key", apiKey)
                .queryParamIfPresent("language", Optional.ofNullable(language))
                .queryParamIfPresent("page", Optional.ofNullable(page))
                .queryParamIfPresent("region", Optional.ofNullable(region))
                .toUriString();

        return restTemplate.getForObject(url, String.class);
    }

    public String getTopRated(String language, Integer page, String region) {
        String url = UriComponentsBuilder.fromUriString(baseUrl + "/movie/top_rated")
                .queryParam("api_key", apiKey)
                .queryParamIfPresent("language", Optional.ofNullable(language))
                .queryParamIfPresent("page", Optional.ofNullable(page))
                .queryParamIfPresent("region", Optional.ofNullable(region))
                .toUriString();
        return restTemplate.getForObject(url, String.class);
    }

    public String getUpcoming(String language, Integer page, String region) {
        String url = UriComponentsBuilder.fromUriString(baseUrl + "/movie/upcoming")
                .queryParam("api_key", apiKey)
                .queryParamIfPresent("language", Optional.ofNullable(language))
                .queryParamIfPresent("page", Optional.ofNullable(page))
                .queryParamIfPresent("region", Optional.ofNullable(region))
                .toUriString();
        return restTemplate.getForObject(url, String.class);
    }



    public String searchMovies(String query, Boolean includeAdult, Integer page, String language, String region, String year, String primaryReleaseYear) {

        String url = UriComponentsBuilder.fromUriString(baseUrl + "/search/movie")
                .queryParam("api_key", apiKey)
                .queryParam("query", query)
                .queryParamIfPresent("include_adult", Optional.ofNullable(includeAdult))
                .queryParamIfPresent("language", Optional.ofNullable(language))
                .queryParamIfPresent("page", Optional.ofNullable(page))
                .queryParamIfPresent("region", Optional.ofNullable(region))
                .queryParamIfPresent("year", Optional.ofNullable(year))
                .queryParamIfPresent("primary_release_year", Optional.ofNullable(primaryReleaseYear))
                .toUriString();

        return restTemplate.getForObject(url, String.class);
    }


    public String getMovieDetails(long tmdbId, String language) {
        String url = UriComponentsBuilder.fromUriString(baseUrl + "/movie/" + tmdbId)
                .queryParam("api_key", apiKey)
                .queryParamIfPresent("language", Optional.ofNullable(language))
                .toUriString();

        return restTemplate.getForObject(url, String.class);
    }


    // TV SHOW CALLS

    // ACTOR CALLS

    // MULTI CALLS

    public String searchMulti(String query, Boolean includeAdult, String language, Integer page) {

        String url = UriComponentsBuilder.fromUriString(baseUrl + "/search/multi")
                .queryParam("api_key", apiKey)
                .queryParam("query", query)
                .queryParamIfPresent("include_adult", Optional.ofNullable(includeAdult))
                .queryParamIfPresent("language", Optional.ofNullable(language))
                .queryParamIfPresent("page", Optional.ofNullable(page))
                .toUriString();

        return restTemplate.getForObject(url, String.class);
    }

}
