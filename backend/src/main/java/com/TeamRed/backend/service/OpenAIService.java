package com.TeamRed.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.*;
import com.openai.models.chat.completions.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    @Value("${openai.api.key}")
    private String apiKey;

    private OpenAIClient client;
    private final ObjectMapper mapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        try {
            client = OpenAIOkHttpClient.builder()
                    .apiKey(apiKey)
                    .build();
        } catch (Exception e) {
            // Log the error but don't fail - useful for tests
            System.err.println("Warning: Could not initialize OpenAI client: " + e.getMessage());
        }
    }

    public Map<String, Object> classifyQuery(String userInput) {
        if (client == null) {
            throw new IllegalStateException("OpenAI client not initialized");
        }
        List<ChatCompletionMessageParam> messages = List.of(
            ChatCompletionMessageParam.ofSystem(
                ChatCompletionSystemMessageParam.builder()
                    .content(SYSTEM_PROMPT)
                    .build()
            ),
            ChatCompletionMessageParam.ofUser(
                ChatCompletionUserMessageParam.builder()
                    .content(userInput)
                    .build()
            )
        );

        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                .model("gpt-4o-mini")
                .messages(messages)
                .build();

        ChatCompletion response = client.chat().completions().create(params);
        
        String json = response.choices().get(0).message().content().orElse("{}");

        try {
            return mapper.readValue(json, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Could not parse model output: " + json, e);
        }
    }

    private static final String SYSTEM_PROMPT =
            """
            Convert the user's message into STRICT JSON following this schema.
            Output ONLY JSON.

            Schema:
            {
              "type": "movie | tv | both",
              "sort": "popular | top_rated | trending | now_playing | upcoming | airing_today | on_the_air | discover | search",
              "query": "Used only in search sorts to search for specific strings that the user types"
              "genre": "TMDB genre ID or null",
              "region": "ISO region code or null",
              "count": number,
              "isValid": boolean,
              "message": "A friendly response message describing what you're showing"
            }

            IMPORTANT RULES:
            1. If user mentions a genre (action, comedy, horror, sci-fi, drama, etc.), set sort="discover" and include the genre ID
            2. If user wants filtering by genre AND another category (e.g., "popular action movies"), use sort="discover"
            3. Count defaults to 10 if not specified
            4. If the request doesn't make sense or isn't about movies/TV, set isValid=false
            5. Generate a natural, friendly message that describes what results you're showing (e.g., "Here are the most popular action movies", "Here's a list of top-rated sci-fi shows") you dont (and mostly shouldn't) need to use the default messages in the examples remember you are an ai robot persona so get creative
            6. "query" is ONLY for search requests otherwise it is null
            
                    For SEARCH requests (when user wants to find specific titles):
                       - Set sort="search"
                       - Set type="movie" if they specifically say "movies"
                       - Set type="tv" if they specifically say "shows", "series", or "TV"
                       - Set type="both" if neither is specified or both could apply
                       - Extract the search term into "query" field
                       - genre and region should be null for searches
            
            MOVIE GENRE IDs:
            Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80, Documentary=99, Drama=18, 
            Family=10751, Fantasy=14, History=36, Horror=27, Music=10402, Mystery=9648, Romance=10749, 
            Science Fiction=878, TV Movie=10770, Thriller=53, War=10752, Western=37

            TV SHOW GENRE IDs:
            Action & Adventure=10759, Animation=16, Comedy=35, Crime=80, Documentary=99, Drama=18, 
            Family=10751, Kids=10762, Mystery=9648, News=10763, Reality=10764, Sci-Fi & Fantasy=10765, 
            Soap=10766, Talk=10767, War & Politics=10768, Western=37

            Examples:
            - "show me action movies" → {"type":"movie","sort":"discover","query":null,"genre":"28","region":null,"count":10,"isValid":true,"message":"Here are the top action movies for you:"}
            - "popular action movies" → {"type":"movie","sort":"discover","query":null,"genre":"28","region":null,"count":10,"isValid":true,"message":"Here are the most popular action movies:"}
            - "top rated movies" → {"type":"movie","sort":"top_rated","query":null,"genre":null,"region":null,"count":10,"isValid":true,"message":"Here are the top-rated movies:"}
            - "trending sci-fi shows" → {"type":"tv","sort":"discover","query":null,"genre":"10765","region":null,"count":10,"isValid":true,"message":"Here are the trending sci-fi & fantasy shows:"}
            - "top 5 horror movies" → {"type":"movie","sort":"discover","query":null,"genre":"27","region":null,"count":5,"isValid":true,"message":"Here are 5 terrifying horror movies:"}
            - "what's the weather" → {"type":"movie","sort":"popular","query":null,"genre":null,"region":null,"count":10,"isValid":false,"message":"Sorry, I can only help with movies and TV shows:"}
            - "show me movies that start with the letter r" → {"type":"movie","sort":"search","query":"r","genre":null,"region":null,"count":10,"isValid":true,"message":"Here are some movies starting with 'r':"}
            - "show me star wars shows" → {"type":"tv","sort":"search","query":"star wars","genre":null,"region":null,"count":10,"isValid":true,"message":"Here are Star Wars shows:"}
            - "find the matrix" → {"type":"both","sort":"search","query":"matrix","genre":null,"region":null,"count":10,"isValid":true,"message":"I searched for 'matrix' in movies and shows:"}
            - "search for avatar" → {"type":"both","sort":"search","query":"avatar","genre":null,"region":null,"count":10,"isValid":true,"message":"Here's what I found for 'avatar':"}
            - "search movies" → {"type":"movie","sort":"popular","query":null,"genre":null,"region":null,"count":10,"isValid":true,"message":"Here are the most popular movies:"}
                                
            """;
}
