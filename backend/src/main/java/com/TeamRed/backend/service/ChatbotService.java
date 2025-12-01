package com.TeamRed.backend.service;

import com.TeamRed.backend.external.tmdb.TmdbClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private final OpenAIService ai;
    private final TmdbClient tmdb;

    public ChatbotService(OpenAIService ai, TmdbClient tmdb) {
        this.ai = ai;
        this.tmdb = tmdb;
    }

    public Map<String, Object> handle(String userText) {
        // Get classification from OpenAI
        Map<String, Object> intent = ai.classifyQuery(userText);
        
        // DEBUG: Print what AI returned
        System.out.println("AI Response: " + intent);

        // Check if valid
        if (!(boolean) intent.get("isValid")) {
            String aiMessage = (String) intent.get("message");
            return Map.of(
                "success", false,
                "message", aiMessage != null ? aiMessage : "Sorry, I couldn't understand your request. Try asking for popular movies or top-rated TV shows."
            );
        }

        // Extract intent fields
        String type = (String) intent.get("type");
        String genre = (String) intent.get("genre");
        String sort = (String) intent.get("sort");
        Number countNum = (Number) intent.get("count");
        int count = countNum != null ? countNum.intValue() : 10;
        String region = (String) intent.get("region");
        String aiMessage = (String) intent.get("message");
        
        // DEBUG: Print the message
        System.out.println("AI Message: " + aiMessage);

        // Build TMDB endpoint and params based on sort type
        String endpoint;
        Map<String, Object> params = new HashMap<>();

        switch (sort) {
            case "popular":
                endpoint = "/" + type + "/popular";
                break;
            case "top_rated":
                endpoint = "/" + type + "/top_rated";
                break;
            case "trending":
                endpoint = "/trending/" + type + "/week";
                break;
            case "now_playing":
                endpoint = "/movie/now_playing";
                break;
            case "upcoming":
                endpoint = "/movie/upcoming";
                break;
            case "airing_today":
                endpoint = "/tv/airing_today";
                break;
            case "on_the_air":
                endpoint = "/tv/on_the_air";
                break;
            case "discover":
            default:
                endpoint = "/discover/" + type;
                if (genre != null) params.put("with_genres", genre);
                params.put("sort_by", "popularity.desc");
                break;
        }

        if (region != null) params.put("region", region);

        // Call TMDB
        Map<String, Object> raw = (Map<String, Object>) tmdb.get(endpoint, params);
        List<Map<String, Object>> results = (List<Map<String, Object>>) raw.get("results");

        // Format results into a nice list
        List<String> titles = results.stream()
                .limit(count)
                .map(item -> {
                    String title = type.equals("movie") 
                        ? (String) item.get("title") 
                        : (String) item.get("name");
                    Double rating = (Double) item.get("vote_average");
                    return String.format("%s (⭐ %.1f)", title, rating != null ? rating : 0.0);
                })
                .collect(Collectors.toList());

        // Create response with AI-generated message
        return Map.of(
            "success", true,
            "message", aiMessage != null ? aiMessage : "Here are your results:",
            "results", titles,
            "count", titles.size()
        );
    }

    private String getCategoryLabel(String sort, String type) {
        String mediaType = type.equals("movie") ? "Movies" : "TV Shows";
        return switch (sort) {
            case "popular" -> "Popular " + mediaType;
            case "top_rated" -> "Top Rated " + mediaType;
            case "trending" -> "Trending " + mediaType;
            case "now_playing" -> "Now Playing Movies";
            case "upcoming" -> "Upcoming Movies";
            case "airing_today" -> "Airing Today";
            case "on_the_air" -> "On The Air";
            default -> mediaType;
        };
    }
}
