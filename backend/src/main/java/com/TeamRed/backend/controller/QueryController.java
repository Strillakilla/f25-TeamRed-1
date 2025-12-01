package com.TeamRed.backend.controller;

import com.TeamRed.backend.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/query")
@RequiredArgsConstructor
public class QueryController {

    private final ChatbotService chatbotService;

    @PostMapping("/classify")
    public Map<String, Object> classifyQuery(@RequestBody Map<String, String> request) {
        String userInput = request.get("query");
        return chatbotService.handle(userInput);
    }
}