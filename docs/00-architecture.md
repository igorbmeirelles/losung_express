# Architecture and Code Standards

This document defines the **architectural principles**, **code standards**, and **technical guidelines** that must guide the entire ERP development. It is a mandatory reference to ensure consistency, scalability, and long-term maintainability of the system.

---

## 1. General Architecture

### 1.1 Hexagonal Architecture (Ports & Adapters)

The application follows the **Hexagonal Architecture**, also known as **Ports and Adapters**, with the goals of:

* Isolating the domain from technical details
* Improving testability
* Allowing infrastructure and framework changes without impacting the core
* Avoiding tight coupling with databases, HTTP frameworks, message brokers, or external libraries

The **domain is the heart of the application** and must not depend on Express, Prisma, databases, or any infrastructure concern.

---

### 1.2 Recommended Folder Structure

The folder structure **must not expose architecture explicitly at the root level**. Instead, the codebase is organized by **business modules**, and **inside each module** the Hexagonal Architecture is applied.

Each module owns its own domain, application, and infrastructure layers.

```text
src/
├── users/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── enums/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── events/
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   ├── dto/
│   │   └── ports/
│   │       ├── input/
│   │       └── output/
│   │
│   └── infrastructure/
│       ├── http/
│       │   ├── controllers/
│       │   ├── routes/
│       │   └── middlewares/
│       ├── database/
│       │   └── repositories/
│       └── config/
│
├── products/
│   └── (same structure as users module)
│
├── orders/
│   └── (same structure as users module)
│
├── pdv/
│   └── (same structure as users module)
│
├── shared/
│   ├── result/          # Result pattern implementation
│   ├── errors/          # Technical (infrastructure) errors
│   ├── utils/
│   ├── types/
│   └── constants/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── server.ts
```

---

## 2. Domain-Driven Design (DDD)

The system modeling follows **Domain-Driven Design (DDD)** principles, aligned with the book *Implementing Domain-Driven Design*.

### 2.1 Principles

* The **domain must not depend on infrastructure**
* Business rules live in the domain, not in controllers
* Use cases orchestrate flows but do not contain complex business rules
* Entities are responsible for protecting their own invariants

---

### 2.2 Entities

* Have identity
* Contain business rules
* Do not expose unrestricted setters

Examples:

* Order
* Customer
* Product
* Stock

---

### 2.3 Value Objects

* Immutable
* Have no identity
* Represent domain concepts

Examples:

* Money
* Email
* Phone
* AddressSnapshot

---

### 2.4 Domain Services

Used when:

* A rule does not naturally belong to a single entity
* The logic spans multiple entities

Examples:

* Pricing calculation service
* Stock reservation service

---

## 3. Application Layer (Use Cases)

### 3.1 Use Cases

* Represent system actions
* One use case equals one user intention
* Must not depend on Express or HTTP concerns

Examples:

* CreateOrderUseCase
* RegisterCustomerUseCase
* AddProductUseCase

---

### 3.2 DTOs

* Used strictly for input and output
* Contain no business logic
* Prevent direct exposure of domain entities

---

### 3.3 Ports (Interfaces)

#### Input Ports

* Called by controllers
* Represent application capabilities

#### Output Ports

* Repositories
* External gateways
* Third-party services

---

## 4. Infrastructure

### 4.1 Express

* Express is strictly an HTTP adapter
* Controllers must not contain business logic
* Controllers are responsible only for:

  * Input validation
  * Calling use cases
  * Translating results to HTTP responses

---

### 4.2 Prisma

* Prisma is an infrastructure detail
* Repositories implement domain interfaces
* Prisma must never be imported into the domain
* Banco em produção: usar o provider do Supabase (Postgres gerenciado)
* Banco para testes: usar SQLite isolado
* Todo teste deve iniciar com o banco zerado (sem dados herdados de execuções anteriores)

---

### 4.3 Authentication and Authorization

* Authentication: JWT
* Authorization: RBAC based on roles
* The domain layer must not be aware of JWT
* Every private route must compose the correct middlewares: authentication (JWT validation) and authorization (RBAC guard) applied in that order.
* Refresh tokens issued during login must be stored in the Redis cache (Upstash-managed) to enable rotation and revocation; never persist them directly in controllers or long-lived storage.

---

## 5. Code Standards

### 5.1 General Principles

* SOLID
* Clean Code
* Low coupling
* High cohesion

---

### 5.2 Naming Conventions

* Classes: PascalCase
* Functions and methods: camelCase
* Interfaces: I + Name (e.g., IOrderRepository)
* Enums: **E + PascalCase** (e.g., EOrderStatus, EUserRole)
* Modules: kebab-case or camelCase (e.g., `users`, `products`, `pdv`)

---

### 5.3 Critical Rules

* Controllers must never access the database directly
* Use cases must not know Express
* The domain must not know Prisma
* No business logic in middlewares

---

## 6. Testing

### 6.1 Testing Strategy

The application must be **testable at all layers**.

#### Test Types

* Unit tests: domain and use cases
* Integration tests: repositories and Prisma
* E2E tests: core flows (PDV, orders, stock)

---

### 6.2 Rules

* Use cases must be testable without a database
* Domain tests must avoid heavy mocking
* Infrastructure may use a real database in test environments

---

## 7. Error Handling

### 7.1 Result Pattern (Success / Failure)

The application **must not use exceptions for business flow control**. Instead, it adopts the **Result pattern** to explicitly represent success or failure outcomes.

The domain and application layers **must not use `throw`**, except for unrecoverable technical failures (e.g., infrastructure issues).

---

### 7.2 Result Structure

Conceptual example:

* Result.Success<T>
* Result.Failure<E>

Where:

* `T` represents a successful value
* `E` represents a domain or validation error

---

### 7.3 Rules

* Use cases must return `Result`
* Controllers translate `Result` into HTTP responses
* The domain returns explicit failures, never exceptions
* Infrastructure may throw technical exceptions, but must convert them into `Result.Failure`

---

## 8. Observability

* Structured logging
* Request correlation via requestId
* No logging inside the domain layer

---

## 9. General Conventions

* Semantic commits
* Small pull requests
* No obvious comments
* Module-level README files kept up to date

---

## 10. Golden Rules

> **If the domain needs to import something external, the architecture is wrong.**
> **If an error can be represented as data, it must not be an exception.**

This document must be followed by the entire team and updated as the system evolves.
