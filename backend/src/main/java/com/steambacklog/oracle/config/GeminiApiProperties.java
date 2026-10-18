package com.steambacklog.oracle.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "gemini.api")
public class GeminiApiProperties {

    private String baseUrl = "https://generativelanguage.googleapis.com";
    private String key = "dummy-dev-key";

    public GeminiApiProperties() {
    }

    public GeminiApiProperties(String baseUrl, String key) {
        this.baseUrl = baseUrl;
        this.key = key;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }
}
