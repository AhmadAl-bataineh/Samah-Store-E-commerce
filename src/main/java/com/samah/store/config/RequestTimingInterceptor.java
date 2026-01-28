package com.samah.store.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Request timing interceptor for performance monitoring.
 *
 * Behavior:
 * - Slow requests (>threshold): logged at INFO level
 * - Fast requests: logged at DEBUG level (disabled in prod)
 *
 * Configure threshold via: app.perf.slow-request-threshold-ms (default: 200ms)
 */
@Component
public class RequestTimingInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RequestTimingInterceptor.class);
    private static final String START_TIME_ATTR = "requestStartTime";

    @Value("${app.perf.slow-request-threshold-ms:200}")
    private long slowRequestThresholdMs;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START_TIME_ATTR, System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                 Object handler, Exception ex) {
        Long startTime = (Long) request.getAttribute(START_TIME_ATTR);
        if (startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            String uri = request.getRequestURI();

            // Only log API requests, skip static resources
            if (uri.startsWith("/api/")) {
                String query = request.getQueryString();
                String fullPath = query != null ? uri + "?" + truncateQuery(query) : uri;

                if (duration > slowRequestThresholdMs) {
                    // Slow request - log at WARN for visibility in prod
                    log.warn("[PERF-SLOW] {} {} took {}ms (status={}, threshold={}ms)",
                            request.getMethod(), fullPath, duration, response.getStatus(), slowRequestThresholdMs);
                } else if (log.isDebugEnabled()) {
                    // Fast request - only log at DEBUG (disabled in prod)
                    log.debug("[PERF] {} {} completed in {}ms (status={})",
                            request.getMethod(), fullPath, duration, response.getStatus());
                }
            }
        }
    }

    // Truncate long query strings to avoid log bloat
    private String truncateQuery(String query) {
        return query.length() > 100 ? query.substring(0, 100) + "..." : query;
    }
}
