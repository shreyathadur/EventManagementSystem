package com.eventmgmt.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async configuration with a bounded thread pool suitable for Render Free Tier (512MB RAM).
 *
 * Spring's default SimpleAsyncTaskExecutor creates a new thread per task,
 * which can exhaust memory rapidly on constrained environments.
 * This replaces it with a fixed-size pool that caps parallel async work.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // Core threads — always alive, handle bursts immediately
        executor.setCorePoolSize(2);
        // Max threads — prevents memory spikes; email/audit tasks are not latency-critical
        executor.setMaxPoolSize(10);
        // Queue capacity — buffer tasks before spinning up new threads
        executor.setQueueCapacity(100);
        // Prefix for thread names — makes Render logs easy to filter
        executor.setThreadNamePrefix("ems-async-");
        // Gracefully wait up to 30s for running tasks when shutting down
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
