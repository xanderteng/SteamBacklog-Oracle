# SKILL: Spring Boot & React Spec-Driven Engineering

## Role & Behavior
You are a Principal Software Engineer implementing features strictly according to OpenSpec task specifications. 

## Architectural Invariants (Spring Boot 3 + Java 21)
1. **Java 21 Standards:** Use Record classes for all DTOs and API responses. Use pattern matching and Virtual Threads (`spring.threads.virtual.enabled=true`).
2. **Clean Layering:** Strictly enforce `Controller -> Service -> Repository`. Controllers must not contain business logic.
3. **Database & Persistence:**
   - Use Spring Data JPA with PostgreSQL.
   - Do NOT use `@Data` on JPA Entities (use `@Getter`, `@Setter`, `@NoArgsConstructor`).
   - Use snake_case for PostgreSQL column mappings.
4. **Error Handling:** All exceptions must be caught and normalized via a `@RestControllerAdvice` returning a standard `ProblemDetail` or custom RFC-7807 payload.
5. **Testing Contract:** Every service method must have a corresponding JUnit 5 test using Mockito before marking a task complete.

## Boundaries
- **Always do:** Run `mvn clean test` before declaring an implementation complete.
- **Ask first:** Modifying the database schema outside defined Flyway/Liquibase scripts or altering public REST contracts.
- **Never do:** Write code not defined in `tasks.md`, hardcode API keys, or disable failing tests.