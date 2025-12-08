package com.TeamRed.backend.external.tmdb;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;


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

}
