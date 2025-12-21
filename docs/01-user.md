# User Module — Sprint 01 (Foundation)

This document describes the **User module**, its **business rules**, **user types**, and the **first sprint backlog** required to implement authentication and access foundations. It must be read together with `arquitetura.md`.

---

## 1. User Types (Domain Concepts)

A **User** represents anyone who can authenticate into the system. Depending on the context, a user may assume different roles and capabilities.

### 1.1 Company Owner

* First user to register in the platform
* Has **full access** to all modules
* Responsible for creating and managing the company (tenant)
* Automatically assigned on first signup

---

### 1.2 Worker

* A user invited or created by a Company Owner or Admin
* Has controlled access based on assigned roles
* Used to operate the system (PDV, stock, orders, etc.)

---

### 1.3 Customer (Site)

* A user who registers to buy products via the company website
* Can authenticate and place orders
* Linked to a `Customer` entity

---

### 1.4 General Customer (Non-authenticated)

* A customer registered only for order tracking and analytics
* Does not authenticate initially
* Created via PDV or administrative flows
* **May later be associated with a User account** (e.g., when the customer creates login credentials)

> This allows a customer to evolve into an authenticated user without losing historical order data.

---

## 2. Business Rules (User Module)

### BR-01 — Initial User Registration (No Company Yet)

* When a user registers via `/signup`, the user **does not yet own a company**.
* At signup time, **no Company Owner role is required or enforced**.
* The user is created as **active** and without any company association.

Company ownership is established **only after a company is created** and the user is linked via `BoardMembers`.

---

### BR-02 — Company Ownership Check

* The system must expose a mechanism to verify whether a user already owns or belongs to a company.
* This information is required to decide whether the user should:

  * Create a new company
  * Be redirected to an existing tenant

---

### BR-03 — Tenant Context Resolution

* Authentication must consider the **tenant (company)** based on the accessed URL.
* A user may exist without a company at signup time.

---

## 3. Exposed Routes

### 3.1 `POST /signup`

**Intent**

> As a Company Owner, I want to register in the system so that I can create and manage a company.

**Constraints**

* Only Company Owners can use this route
* Workers must be created from inside the platform

---

### 3.2 `POST /login`

**Intent**

> As a user, I want to authenticate and access the system based on the tenant I am accessing.

**Notes**

* The tenant is inferred from the URL or request context
* Access rights depend on user roles
* After authentication, the user may list all **branches** they belong to in order to select or inspect branch-specific data

> Branch listing and branch detail access are part of the **Company module** and not the responsibility of the User module.

---

### 3.3 `POST /logout`

**Intent**

> As a user, I want to log out of the system securely.

---

### 3.4 `GET /users/has-company`

**Intent**

> As the system, I want to know whether the authenticated user already owns or belongs to a company.

**Purpose**

* Decide whether to redirect the user to:

  * Company creation flow
  * Tenant dashboard

**Business Rule**

* A user **has a company** if and only if:

  * The user is listed in `BoardMembers`
* Role evaluation is **secondary** and must not be used alone

If the user is **not present in any `BoardMembers` record**, the system must treat the user as having **no company**.

---

## 4. Sprint 01 — Tasks Breakdown

### 4.1 Implement `POST /signup`

#### Description

Create the signup flow for new users.

> **Important:** The `/signup` route must **not** generate or return a JWT. Authentication tokens are issued **only** during the `/login` flow.

> **Important:** At signup time, the user **does not receive any company role**. Company ownership is assigned later, during company creation.

#### Password Rules

* Password **must have a maximum of 20 characters**
* Password **must never be persisted in plain text**
* Password **must be hashed using Argon2** before persistence

Plain-text passwords **must never reach the database layer**.

#### Subtasks

* [x] Create SignupController

  * Validate input using Zod
  * Enforce password length (max 20 characters)
  * Translate `Result` to HTTP responses

* [x] Create SignupUseCase

  * Create user as active
  * Do **not** assign company roles
  * Delegate password hashing to a dedicated service
  * Do **not** generate authentication tokens
  * Return `Result.Success` or `Result.Failure`

* [x] Implement PasswordHashService

  * Use **argon2** for hashing
  * Expose `hash(password)` and `verify(password, hash)` methods

* [x] Implement UserRepository (Prisma adapter)

  * Persist only **hashed passwords**
  * Reject persistence of plain-text passwords

---

### 4.2 Implement `POST /login`

#### Description

Authenticate users and issue access tokens.

> **Important:** JWT generation and identity context creation must happen **exclusively** in this route.

#### Password Verification Rules

* Password verification **must use Argon2**
* Password comparison **must never use string comparison**

#### Subtasks

* [x] Create LoginController

  * Validate credentials
  * Extract tenant from request

* [x] Create LoginUseCase

  * Validate credentials
  * Verify password using `PasswordHashService`
  * Load user roles and board memberships
  * Load associated company and branch IDs
  * Return authentication data wrapped in `Result`

* [x] Define JWT payload

  * userId
  * firstName
  * lastName
  * email
  * companyId
  * roles
  * branchIds

* [x] Implement AuthService

  * Password verification delegation
  * JWT generation

---

### 4.3 Implement `POST /logout`

#### Description

Handle user logout.

#### Subtasks

* [ ] Create LogoutController
* [ ] Invalidate token or session (strategy-dependent)

---

### 4.4 Implement `GET /users/has-company`

#### Description

Check whether the authenticated user is associated with any company.

#### Subtasks

* [ ] Create HasCompanyController
* [ ] Create HasCompanyUseCase

  * Query user memberships
  * Return boolean wrapped in `Result`

---

## 5. Acceptance Criteria

* All routes follow the Hexagonal Architecture
* No business logic exists in controllers
* No exceptions are used for business flow
* All use cases return `Result`
* **All code must be fully tested using Jest**
* Unit tests, integration tests, and negative scenarios are mandatory

---

## 6. Test Cases (Mandatory)

All functionalities described in this sprint **must be covered by Jest tests**. Tests are considered part of the delivery.

---

### 6.1 `/signup` — Test Cases

#### Unit Tests — SignupUseCase

* [x] Should create a user as active
* [x] Should hash password using Argon2
* [x] Should reject passwords longer than 20 characters
* [x] Should never persist plain-text passwords
* [x] Should return `Result.Success` on valid input
* [x] Should return `Result.Failure` on invalid input

#### Integration Tests — `/signup`

* [x] Should return HTTP 201 on successful signup
* [x] Should persist user with hashed password
* [x] Should not return JWT token in response
* [x] Should validate request payload with Zod

---

### 6.2 `/login` — Test Cases

#### Unit Tests — LoginUseCase

* [x] Should authenticate user with valid credentials
* [x] Should verify password using Argon2
* [x] Should reject invalid credentials
* [x] Should load user roles correctly
* [x] Should load associated companyId and branchIds
* [x] Should return authentication context as `Result.Success`

#### Integration Tests — `/login`

* [x] Should return HTTP 200 on valid login
* [x] Should return JWT token
* [x] JWT should contain userId, name, email, companyId, roles, branchIds
* [x] Should reject login with invalid password

---

### 6.3 `/logout` — Test Cases

#### Unit Tests

* [ ] Should invalidate token or session according to strategy

#### Integration Tests

* [ ] Should return HTTP 204 on logout

---

### 6.4 `/users/has-company` — Test Cases

#### Unit Tests — HasCompanyUseCase

* [ ] Should return false if user is not listed in any BoardMembers

* [ ] Should return true if user is listed in BoardMembers

* [ ] Should not infer company ownership from roles alone

* [ ] Should return true if user has Company Owner role

* [ ] Should return true only if user is listed in BoardMembers

* [ ] Should return false if user has no ownership

* [ ] Should not rely on User entity flags

#### Integration Tests — `/users/has-company`

* [ ] Should return correct ownership status for authenticated user

---

## 7. Notes for Future Sprints

* Worker invitation flow
* Customer-site registration
* Password recovery
* Multi-factor authentication
* Audit logs
