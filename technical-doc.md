# Spring Logging Traces — Complete Reference

> **Usage:** Activate any logger below via `application.yml`, Spring Cloud Config at runtime,
> or the Actuator endpoint without restarting the app.
> 
> ```bash
> # Toggle a logger at runtime (no restart required)
> curl -X POST http://<host>/actuator/loggers/<LOGGER_NAME> \
>   -H "Content-Type: application/json" \
>   -d '{"configuredLevel": "DEBUG"}'
> 
> # Revert after your investigation window
> curl -X POST http://<host>/actuator/loggers/<LOGGER_NAME> \
>   -H "Content-Type: application/json" \
>   -d '{"configuredLevel": "WARN"}'
> ```
> 
> ⚠️ **Prod safety rule:** Always scope activation to the shortest window possible.
> Revert immediately after capturing logs. Avoid TRACE on loggers that emit PII.

-----

## Table of Contents

1. [Database / JPA / Hibernate](#1-database--jpa--hibernate)
1. [Connection Pool (HikariCP)](#2-connection-pool-hikaricp)
1. [Spring Data & Specifications](#3-spring-data--specifications)
1. [Spring Batch](#4-spring-batch)
1. [HTTP Client (RestTemplate / WebClient / Feign)](#5-http-client-resttemplate--webclient--feign)
1. [Spring MVC — Controllers & Filters](#6-spring-mvc--controllers--filters)
1. [Spring Security](#7-spring-security)
1. [Spring WebFlux (Reactive)](#8-spring-webflux-reactive)
1. [Messaging — RabbitMQ / Kafka](#9-messaging--rabbitmq--kafka)
1. [Network & TLS / SSL](#10-network--tls--ssl)
1. [Spring Cloud & Service Discovery](#11-spring-cloud--service-discovery)
1. [Caching (Spring Cache / Redis)](#12-caching-spring-cache--redis)
1. [Transactions](#13-transactions)
1. [Spring Boot Startup & Auto-configuration](#14-spring-boot-startup--auto-configuration)
1. [Actuator & Micrometer Metrics](#15-actuator--micrometer-metrics)
1. [Datasource Proxy (JDBC-level tracing)](#16-datasource-proxy-jdbc-level-tracing)
1. [Quick-reference Summary Table](#17-quick-reference-summary-table)

-----

## 1. Database / JPA / Hibernate

```yaml
logging:
  level:

    # ── SQL statements (with ? placeholders) ──────────────────────────────────
    # Logs every SQL statement sent by Hibernate to the JDBC driver.
    # Use this first to confirm which queries are being executed.
    org.hibernate.SQL: DEBUG

    # ── Bound parameter values ────────────────────────────────────────────────
    # Logs the actual values bound to each ? placeholder.
    # ⚠️ PROD RISK: may expose PII / financial data. Activate on a short window only.
    org.hibernate.orm.jdbc.bind: TRACE

    # ── Legacy parameter logger (Hibernate 5 and below) ───────────────────────
    # Use this if your project has not yet migrated to Hibernate 6.
    org.hibernate.type.descriptor.sql: TRACE

    # ── SQL with parameters inline (Hibernate 5 only, deprecated in 6) ────────
    org.hibernate.type: TRACE

    # ── Statistics (N+1 detection, cache hit/miss counts) ────────────────────
    # Pair with spring.jpa.properties.hibernate.generate_statistics=true
    # Logs session-level stats: query count, entity fetch count, cache hits, etc.
    org.hibernate.stat: DEBUG

    # ── Entity state transitions (load, update, insert, delete) ──────────────
    # Useful to trace why an UPDATE is being triggered unexpectedly (dirty checking).
    org.hibernate.event.internal: TRACE

    # ── Second-level cache activity ───────────────────────────────────────────
    org.hibernate.cache: DEBUG

    # ── Schema generation (DDL) ───────────────────────────────────────────────
    # Logs CREATE / ALTER / DROP statements issued by Hibernate at startup.
    org.hibernate.tool.hbm2ddl: DEBUG

    # ── Criteria API query building ───────────────────────────────────────────
    # Useful when debugging complex Specification compositions.
    org.hibernate.query.criteria: DEBUG

    # ── JPQL / HQL parsing ───────────────────────────────────────────────────
    org.hibernate.hql: DEBUG

    # ── Liquibase migration execution ─────────────────────────────────────────
    liquibase: INFO   # or DEBUG to see each changeset applied

    # ── Flyway migration execution ────────────────────────────────────────────
    org.flywaydb: DEBUG
```

**Recommended `application.yml` properties to pair with the above:**

```yaml
spring:
  jpa:
    show-sql: false            # Use Hibernate logger above instead (better control)
    properties:
      hibernate:
        format_sql: true       # Pretty-prints multi-line SQL in logs
        generate_statistics: true  # Required for org.hibernate.stat
        use_sql_comments: true # Adds /* comment */ origin hints to each query
```

-----

## 2. Connection Pool (HikariCP)

```yaml
logging:
  level:

    # ── Pool lifecycle events ─────────────────────────────────────────────────
    # Logs pool creation, connection acquisition, connection retirement.
    com.zaxxer.hikari: DEBUG

    # ── Connection-level tracing (very verbose) ───────────────────────────────
    # Logs every borrow/return/timeout of individual connections.
    # Use only to diagnose connection leak or pool exhaustion.
    com.zaxxer.hikari.pool.HikariPool: DEBUG
    com.zaxxer.hikari.pool.PoolBase: DEBUG
```

**Properties to pair for pool diagnostics:**

```yaml
spring:
  datasource:
    hikari:
      leak-detection-threshold: 2000   # ms — warns if connection held > 2s
      connection-timeout: 30000        # ms — max wait for a connection from pool
      maximum-pool-size: 10
      minimum-idle: 2
```

-----

## 3. Spring Data & Specifications

```yaml
logging:
  level:

    # ── Spring Data JPA repository infrastructure ──────────────────────────────
    # Logs which repository method is being proxied and which query is derived.
    org.springframework.data.jpa: DEBUG

    # ── Query method derivation (derived query from method name) ──────────────
    # Logs the JPQL/SQL derived from method names like findByStatusAndCurrency.
    org.springframework.data.jpa.repository.query: DEBUG

    # ── Spring Data repository factory ───────────────────────────────────────
    org.springframework.data.repository: DEBUG
```

**Tip — debug Specification predicate building in code:**

```java
// Wrap your Specification temporarily to log the generated predicate tree.
Specification<YourEntity> debugSpec = (root, query, cb) -> {
    Predicate predicate = yourSpec.toPredicate(root, query, cb);
    log.debug("Spec predicate: {}", predicate);
    return predicate;
};
```

-----

## 4. Spring Batch

```yaml
logging:
  level:

    # ── Job and Step execution lifecycle ──────────────────────────────────────
    # Logs JobExecution start/end, StepExecution start/end, and exit status.
    org.springframework.batch.core: DEBUG

    # ── Chunk processing (read / process / write per item) ───────────────────
    # Logs each item read, processed, and written — very verbose for large datasets.
    org.springframework.batch.core.step.item: DEBUG

    # ── Repeat / retry / skip policies ───────────────────────────────────────
    org.springframework.batch.repeat: DEBUG
    org.springframework.batch.core.step.skip: DEBUG

    # ── Job repository (metadata persistence) ────────────────────────────────
    org.springframework.batch.core.repository: DEBUG

    # ── Listeners and partitioning ────────────────────────────────────────────
    org.springframework.batch.core.partition: DEBUG
```

-----

## 5. HTTP Client (RestTemplate / WebClient / Feign)

```yaml
logging:
  level:

    # ── RestTemplate request/response ────────────────────────────────────────
    # Logs full request URI, method, headers, and response status.
    # Must be paired with a ClientHttpRequestInterceptor or LoggingRequestInterceptor bean.
    org.springframework.web.client.RestTemplate: DEBUG

    # ── Apache HttpClient (if used under RestTemplate) ────────────────────────
    # Logs wire-level HTTP bytes — extremely verbose, use only on dev/staging.
    org.apache.http: DEBUG
    org.apache.http.wire: TRACE   # ⚠️ exposes full request/response body

    # ── WebClient (reactive, Spring WebFlux) ─────────────────────────────────
    # Logs request method, URI, and status code.
    org.springframework.web.reactive.function.client.ExchangeFunctions: DEBUG

    # ── WebClient wire logging (Netty) ────────────────────────────────────────
    # Logs raw bytes exchanged over the Netty channel.
    # ⚠️ Very verbose. Activate only on a targeted request.
    reactor.netty.http.client: DEBUG

    # ── Feign client (Spring Cloud OpenFeign) ─────────────────────────────────
    # Logs Feign request URL, method, headers, and response.
    feign.Logger: DEBUG
```

**Feign logger level must also be set in properties:**

```yaml
logging:
  level:
    feign.Logger: DEBUG           # Enable Feign's own logger first

feign:
  client:
    config:
      default:
        loggerLevel: FULL         # NONE | BASIC | HEADERS | FULL
        # BASIC  → method + URL + status
        # HEADERS → + request/response headers
        # FULL   → + request/response body (⚠️ exposes payload)
```

**WebClient request/response body logging bean (programmatic):**

```java
// Add this to log request + response body for WebClient without using TRACE on Netty
ExchangeFilterFunction loggingFilter = ExchangeFilterFunction.ofRequestProcessor(req -> {
    log.debug("WebClient → {} {}", req.method(), req.url());
    return Mono.just(req);
});

WebClient client = WebClient.builder()
    .filter(loggingFilter)
    .build();
```

-----

## 6. Spring MVC — Controllers & Filters

```yaml
logging:
  level:

    # ── DispatcherServlet — request dispatch lifecycle ────────────────────────
    # Logs which handler (controller method) is matched per incoming request.
    # Shows request mapping resolution, view resolution, and handler adapter selection.
    org.springframework.web.servlet.DispatcherServlet: DEBUG

    # ── Request mapping (which URL maps to which controller method) ───────────
    # Useful to debug 404s or ambiguous mapping conflicts.
    org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping: DEBUG

    # ── Handler adapter (method invocation, argument resolution) ─────────────
    # Logs argument binding, converter selection, and return value handling.
    org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter: DEBUG

    # ── Full request/response logging (CommonsRequestLoggingFilter) ───────────
    # Must also register the filter bean (see below). Logs URI, headers, payload.
    org.springframework.web.filter.CommonsRequestLoggingFilter: DEBUG

    # ── Exception resolution (which ExceptionHandler is invoked) ─────────────
    org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver: DEBUG

    # ── HTTP message converters (JSON serialization/deserialization) ──────────
    # Logs which HttpMessageConverter is chosen and the class being converted.
    org.springframework.http.converter: DEBUG

    # ── CORS filter ───────────────────────────────────────────────────────────
    org.springframework.web.filter.CorsFilter: DEBUG

    # ── Multipart file uploads ────────────────────────────────────────────────
    org.springframework.web.multipart: DEBUG
```

**Register `CommonsRequestLoggingFilter` to log request body and headers:**

```java
@Bean
public CommonsRequestLoggingFilter requestLoggingFilter() {
    CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
    filter.setIncludeQueryString(true);
    filter.setIncludePayload(true);       // ⚠️ logs request body — PII risk
    filter.setMaxPayloadLength(10000);
    filter.setIncludeHeaders(true);
    filter.setAfterMessagePrefix("REQUEST: ");
    return filter;
}
```

-----

## 7. Spring Security

```yaml
logging:
  level:

    # ── Full security filter chain execution ──────────────────────────────────
    # Logs every filter in the chain, the authentication result, and access decisions.
    # This is the most comprehensive security trace — start here for auth issues.
    org.springframework.security: DEBUG

    # ── Filter chain (which filters are invoked per request) ─────────────────
    org.springframework.security.web.FilterChainProxy: DEBUG

    # ── Authentication provider decisions ─────────────────────────────────────
    # Logs which AuthenticationProvider handled the token and why it succeeded/failed.
    org.springframework.security.authentication: DEBUG

    # ── JWT / OAuth2 token parsing and validation ─────────────────────────────
    org.springframework.security.oauth2: DEBUG

    # ── Method-level security (@PreAuthorize, @Secured) ───────────────────────
    # Logs the SpEL expression evaluated and the access granted/denied decision.
    org.springframework.security.access: DEBUG

    # ── CSRF filter ───────────────────────────────────────────────────────────
    org.springframework.security.web.csrf: DEBUG

    # ── Session management ────────────────────────────────────────────────────
    org.springframework.security.web.session: DEBUG
```

-----

## 8. Spring WebFlux (Reactive)

```yaml
logging:
  level:

    # ── WebFlux request dispatch (equivalent of DispatcherServlet) ────────────
    org.springframework.web.reactive.DispatcherHandler: DEBUG

    # ── Reactive handler mapping ──────────────────────────────────────────────
    org.springframework.web.reactive.result.method.annotation: DEBUG

    # ── Netty server I/O (connection accept, read, write) ────────────────────
    # ⚠️ Extremely verbose. Shows raw bytes. Use only for wire-level debugging.
    reactor.netty.http.server: DEBUG

    # ── Reactor operator chain (subscribe, onNext, onError, onComplete) ───────
    # ⚠️ Very verbose. Prefer using Hooks.onOperatorDebug() in code instead.
    reactor.core: DEBUG

    # ── WebFlux exception handling ───────────────────────────────────────────
    org.springframework.web.reactive.result.method.annotation.ResponseEntityExceptionHandler: DEBUG
```

**Enable Reactor debug mode programmatically (preferred over TRACE logging):**

```java
// In @PostConstruct or application startup — adds assembly-time stack traces
Hooks.onOperatorDebug();

// Or with BlockHound to detect illegal blocking calls in reactive threads
BlockHound.install();
```

-----

## 9. Messaging — RabbitMQ / Kafka

### RabbitMQ / AMQP

```yaml
logging:
  level:

    # ── AMQP template (send/receive operations) ───────────────────────────────
    # Logs each message sent or received via RabbitTemplate.
    org.springframework.amqp: DEBUG

    # ── Listener container (consumer thread lifecycle) ────────────────────────
    # Logs message consumption, acknowledgement, and requeue decisions.
    org.springframework.amqp.rabbit.listener: DEBUG

    # ── Connection and channel management ─────────────────────────────────────
    org.springframework.amqp.rabbit.connection: DEBUG

    # ── Message conversion (Java object → AMQP message body) ─────────────────
    org.springframework.amqp.support.converter: DEBUG
```

### Kafka

```yaml
logging:
  level:

    # ── Kafka consumer/producer client ────────────────────────────────────────
    # Logs offset commits, partition assignment, fetch requests.
    org.springframework.kafka: DEBUG

    # ── Kafka listener container (poll loop, error handling) ─────────────────
    org.springframework.kafka.listener: DEBUG

    # ── Kafka transaction manager ─────────────────────────────────────────────
    org.springframework.kafka.transaction: DEBUG

    # ── Low-level Kafka client logs (from Apache Kafka library) ───────────────
    # ⚠️ Very verbose. Prefer keeping this at WARN in prod.
    org.apache.kafka: WARN
    org.apache.kafka.clients.consumer: DEBUG   # narrow to consumer only if needed
    org.apache.kafka.clients.producer: DEBUG   # narrow to producer only if needed
```

-----

## 10. Network & TLS / SSL

```yaml
logging:
  level:

    # ── JDK TLS/SSL handshake (javax.net.ssl) ────────────────────────────────
    # Not a standard logger — activate via JVM system property:
    # -Djavax.net.debug=ssl:handshake
    # Values: ssl | ssl:handshake | ssl:record | ssl:all
    # Output goes to stdout, not SLF4J.

    # ── Apache HttpClient TLS ─────────────────────────────────────────────────
    org.apache.http.conn.ssl: DEBUG

    # ── OkHttp TLS (if used) ─────────────────────────────────────────────────
    okhttp3: DEBUG

    # ── Netty TLS handler (WebClient / WebFlux) ───────────────────────────────
    io.netty.handler.ssl: DEBUG

    # ── Spring LDAP / LDAPS connections ───────────────────────────────────────
    org.springframework.ldap: DEBUG
```

**JVM flags for TLS debugging (add to startup script):**

```bash
-Djavax.net.debug=ssl:handshake          # TLS handshake only (recommended for prod)
-Djavax.net.debug=ssl:all                # Full TLS record tracing (very verbose)
-Djava.security.debug=certpath           # Certificate chain validation
```

-----

## 11. Spring Cloud & Service Discovery

```yaml
logging:
  level:

    # ── Eureka client (registration and heartbeat) ────────────────────────────
    com.netflix.eureka: DEBUG
    com.netflix.discovery: DEBUG

    # ── Spring Cloud LoadBalancer (client-side load balancing) ────────────────
    org.springframework.cloud.loadbalancer: DEBUG

    # ── Spring Cloud Gateway (routing and filter chain) ───────────────────────
    org.springframework.cloud.gateway: DEBUG
    org.springframework.cloud.gateway.filter: TRACE   # per-filter trace

    # ── Spring Cloud Config client (property fetching) ────────────────────────
    org.springframework.cloud.config: DEBUG

    # ── Resilience4j (circuit breaker, retry, rate limiter) ───────────────────
    io.github.resilience4j: DEBUG

    # ── Hystrix (legacy — Netflix) ────────────────────────────────────────────
    com.netflix.hystrix: DEBUG
```

-----

## 12. Caching (Spring Cache / Redis)

```yaml
logging:
  level:

    # ── Spring Cache abstraction (@Cacheable, @CacheEvict, @CachePut) ─────────
    # Logs cache hit / miss decisions and which method triggered the operation.
    org.springframework.cache: DEBUG

    # ── Redis client (Lettuce — default) ──────────────────────────────────────
    # Logs Redis commands sent and replies received.
    io.lettuce.core: DEBUG

    # ── Lettuce connection pooling ────────────────────────────────────────────
    io.lettuce.core.resource: DEBUG

    # ── Jedis client (alternative Redis client) ───────────────────────────────
    redis.clients.jedis: DEBUG
```

-----

## 13. Transactions

```yaml
logging:
  level:

    # ── Transaction lifecycle (@Transactional — open, commit, rollback) ───────
    # Most important trace for diagnosing unexpected rollbacks or missing transactions.
    org.springframework.transaction: DEBUG

    # ── JPA transaction manager specifically ──────────────────────────────────
    # Logs EntityManager creation/binding and flushMode decisions.
    org.springframework.orm.jpa: DEBUG

    # ── Transaction interceptor (proxy invocation per @Transactional method) ──
    # Logs which method is intercepted and the transaction attribute applied.
    org.springframework.transaction.interceptor: TRACE

    # ── DataSource transaction manager ───────────────────────────────────────
    org.springframework.jdbc.datasource: DEBUG
```

-----

## 14. Spring Boot Startup & Auto-configuration

```yaml
logging:
  level:

    # ── Auto-configuration report ─────────────────────────────────────────────
    # Logs which auto-configurations were applied (+) or excluded (-) and why.
    # Equivalent to running with --debug flag but scoped to the logger.
    org.springframework.boot.autoconfigure: DEBUG

    # ── Bean definition loading ───────────────────────────────────────────────
    # Logs every bean registered in the ApplicationContext.
    # ⚠️ Very verbose. Use only on startup investigation.
    org.springframework.beans.factory: DEBUG

    # ── Condition evaluation (why a @ConditionalOn* matched or not) ───────────
    org.springframework.boot.autoconfigure.condition: DEBUG

    # ── Property sources loading order ────────────────────────────────────────
    # Logs which property file / env / cloud config source overrides which.
    org.springframework.boot.context.config: DEBUG

    # ── Application context refresh lifecycle ─────────────────────────────────
    org.springframework.context: DEBUG

    # ── Web server startup (Tomcat / Netty / Undertow port binding) ───────────
    org.springframework.boot.web: DEBUG
```

**Alternative — enable the full auto-configuration report at startup:**

```bash
java -jar your-app.jar --debug
```

-----

## 15. Actuator & Micrometer Metrics

```yaml
logging:
  level:

    # ── Actuator endpoint requests ────────────────────────────────────────────
    org.springframework.boot.actuate: DEBUG

    # ── Micrometer metric registry (meter registration, publishing) ───────────
    io.micrometer: DEBUG

    # ── Prometheus scrape endpoint ────────────────────────────────────────────
    io.micrometer.prometheus: DEBUG

    # ── Zipkin / Brave tracing (distributed trace export) ─────────────────────
    brave: DEBUG
    zipkin2: DEBUG

    # ── Micrometer Tracing (Spring Boot 3+) ──────────────────────────────────
    io.micrometer.tracing: DEBUG
    org.springframework.cloud.sleuth: DEBUG   # Spring Boot 2 / Sleuth

management:
  tracing:
    sampling:
      probability: 1.0  # 100% sampling — reduce to 0.1 in normal prod operation
```

-----

## 16. Datasource Proxy (JDBC-level tracing)

> This is the **recommended prod-safe approach** to capture the exact SQL and parameters
> sent to PostgreSQL without touching Hibernate internals. Zero app restart required
> once the bean is wired.

**Dependency:**

```xml
<dependency>
    <groupId>net.ttddyy</groupId>
    <artifactId>datasource-proxy</artifactId>
    <version>1.10</version>
</dependency>
```

**Configuration bean:**

```java
@Bean
@Primary
public DataSource dataSource(@Qualifier("originalDataSource") DataSource original) {
    return ProxyDataSourceBuilder
        .create(original)
        .name("App-DS")
        // Logs fully resolved SQL (values substituted for ?) to a dedicated logger
        .logQueryBySlf4j(SLF4JLogLevel.DEBUG, "sql.trace")
        .countQuery()      // Adds query count per execution — useful for N+1 detection
        .multiline()       // Pretty-prints multi-line SQL
        .build();
}
```

**Activate the dedicated logger only:**

```yaml
logging:
  level:
    sql.trace: DEBUG     # Only this logger — no Hibernate noise
```

**What you get:**

```
sql.trace | Name:App-DS, Time:12, Success:True
Type:Prepared, Batch:False, QuerySize:1, BatchSize:0
Query:["SELECT e.id, e.status, e.amount FROM ecash_transaction e WHERE e.status = ? AND e.currency = ?"]
Params:[(PENDING, EUR)]
```

-----

## 17. Quick-reference Summary Table

|Use Case                     |Logger                                                              |Level|Prod Safe?    |
|-----------------------------|--------------------------------------------------------------------|-----|--------------|
|SQL statements (no values)   |`org.hibernate.SQL`                                                 |DEBUG|✅ Yes         |
|SQL bound parameters         |`org.hibernate.orm.jdbc.bind`                                       |TRACE|⚠️ PII risk    |
|Full SQL + values (JDBC)     |`sql.trace` (datasource-proxy)                                      |DEBUG|✅ Best choice |
|N+1 / query count            |`org.hibernate.stat`                                                |DEBUG|✅ Yes         |
|Entity dirty check / updates |`org.hibernate.event.internal`                                      |TRACE|⚠️ Verbose     |
|Connection pool exhaustion   |`com.zaxxer.hikari`                                                 |DEBUG|✅ Yes         |
|Transaction open/rollback    |`org.springframework.transaction`                                   |DEBUG|✅ Yes         |
|`@Transactional` method trace|`org.springframework.transaction.interceptor`                       |TRACE|⚠️ Verbose     |
|Spring Data query derivation |`org.springframework.data.jpa.repository.query`                     |DEBUG|✅ Yes         |
|Specification predicate      |`org.hibernate.query.criteria`                                      |DEBUG|✅ Yes         |
|HTTP controller dispatch     |`org.springframework.web.servlet.DispatcherServlet`                 |DEBUG|✅ Yes         |
|Request/response body        |`CommonsRequestLoggingFilter` (bean)                                |DEBUG|⚠️ PII risk    |
|HTTP client (RestTemplate)   |`org.springframework.web.client.RestTemplate`                       |DEBUG|✅ Yes         |
|HTTP client body (wire)      |`org.apache.http.wire`                                              |TRACE|⚠️ Very verbose|
|WebClient requests           |`org.springframework.web.reactive.function.client.ExchangeFunctions`|DEBUG|✅ Yes         |
|Feign client                 |`feign.Logger` + `loggerLevel: FULL`                                |DEBUG|⚠️ Body exposed|
|TLS handshake                |`-Djavax.net.debug=ssl:handshake` (JVM flag)                        |—    |✅ Yes         |
|Spring Security auth         |`org.springframework.security`                                      |DEBUG|✅ Yes         |
|JWT / OAuth2                 |`org.springframework.security.oauth2`                               |DEBUG|✅ Yes         |
|RabbitMQ messages            |`org.springframework.amqp.rabbit.listener`                          |DEBUG|✅ Yes         |
|Kafka consumer               |`org.springframework.kafka.listener`                                |DEBUG|✅ Yes         |
|Cache hit/miss               |`org.springframework.cache`                                         |DEBUG|✅ Yes         |
|Redis commands               |`io.lettuce.core`                                                   |DEBUG|⚠️ Verbose     |
|Auto-config report           |`org.springframework.boot.autoconfigure`                            |DEBUG|✅ Startup only|
|Distributed tracing          |`io.micrometer.tracing`                                             |DEBUG|✅ Yes         |
|Spring Batch job/step        |`org.springframework.batch.core`                                    |DEBUG|✅ Yes         |
|API Gateway routing          |`org.springframework.cloud.gateway`                                 |DEBUG|✅ Yes         |
|Circuit breaker              |`io.github.resilience4j`                                            |DEBUG|✅ Yes         |

-----

> **Legend**
> 
> - ✅ **Prod Safe** — Low overhead, no sensitive data exposed. Safe to activate on a running prod pod.
> - ⚠️ **Use with caution** — May expose PII, financial data, or produce significant log volume.
>   Always activate on the shortest possible window and revert immediately.
