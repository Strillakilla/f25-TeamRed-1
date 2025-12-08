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
        String query = (String) intent.get("query");
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
            case "search":
                if (type.equals("movie")) endpoint = "/search/movie";
                else if (type.equals("tv")) endpoint = "/search/tv";
                else endpoint = "/search/multi";
                if (query != null) params.put("query", query);
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

        // Filter out people if using multi-search
        if ("/search/multi".equals(endpoint) && results != null) {
            results = results.stream()
                    .filter(item -> {
                        String mediaType = (String) item.get("media_type");
                        return "movie".equals(mediaType) || "tv".equals(mediaType);
                    })
                    .toList();
        }

        // Handle null or empty results
        if (results == null || results.isEmpty()) {
            return Map.of(
                    "success", true,
                    "message", "No results found. Try a different search or filter.",
                    "results", List.of(),
                    "count", 0
            );
        }

        // Format results into a nice list
        List<String> titles = results.stream()
                .limit(count)
                .map(item -> {
                    // For multi-search, determine type from media_type field
                    String itemType = type;
                    if ("/search/multi".equals(endpoint)) {
                        itemType = (String) item.get("media_type");
                    }

                    String title = "movie".equals(itemType)
                            ? (String) item.get("title")
                            : (String) item.get("name");
                    Double rating = (Double) item.get("vote_average");
                    return String.format("%s (⭐ %.1f)\n", title, rating != null ? rating : 0.0);
                })
                .toList();

        // Create response with AI-generated message
        return Map.of(
            "success", true,
            "message", aiMessage != null ? aiMessage + "\n" : "Here are your results:\n",
            "results", titles,
            "count", titles.size()
        );
    }

}
