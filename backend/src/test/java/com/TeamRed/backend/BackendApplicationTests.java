package com.TeamRed.backend;

import com.TeamRed.backend.service.OpenAIService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class BackendApplicationTests {

    @MockitoBean
    private OpenAIService openAIService;

    @Test
    void contextLoads() {
    }

}
