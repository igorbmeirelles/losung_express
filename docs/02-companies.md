# Company Module — Sprint 01 (Tenant Foundation)

This document defines the **Company module**, its **business rules**, and the **Sprint 01 backlog** responsible for tenant creation, branch management, and employee onboarding. It must be read together with `arquitetura.md` and `companies.md`.

---

## 1. Domain Overview

The **Company module** represents the tenant boundary of the system. A company groups:

* Branches
* BoardMembers (users associated with the company)
* Roles and permissions

A company **cannot exist without users**, and a user may belong to **multiple companies**.

---

## 2. Core Business Rules

### BR-01 — Company Creation Preconditions

* A company **can only be created by an existing authenticated user**.
* At the moment of creation, the user **must not already belong to the target company**.

---

### BR-02 — Company Creation Side Effects

When a company is created:

* A **default branch** must be created automatically
* The creating user must be:

  * Added to `BoardMembers`
  * Assigned the **COMPANY_OWNER** role
  * Associated with the newly created branch

---

### BR-03 — Token Refresh After Company Creation

* After company creation, a **new JWT must be issued** for the user
* The new token must include:

  * `companyId`
  * Updated `roles`
  * Updated `branchIds`

The old token becomes obsolete.

---

### BR-04 — Branch Visibility

* A user can list **only the branches** they are associated with
* Branch IDs are derived from:

  * `BoardMembers`
  * JWT context

---

### BR-05 — Access Control (Owner Privileges)

* **COMPANY_OWNER** has access to all Company module routes
* COMPANY_OWNER can act across all branches

---

## 3. Employee Management Rules

### BR-06 — Employee Creation Permissions

Only users with the following roles may create employees:

* COMPANY_OWNER
* COMPANY_ADMIN
* BRANCH_OWNER
* BRANCH_ADMIN

---

### BR-07 — Branch Scope Enforcement

* COMPANY_OWNER and COMPANY_ADMIN:

  * May create employees in **any branch** of the company

* BRANCH_OWNER and BRANCH_ADMIN:

  * May create employees **only in branches they belong to**

Branch access must be validated using the **branchIds present in the JWT**.

---

### BR-08 — Employee Creation Flow

When creating an employee:

* A new `User` is created (active by default)
* The user is added to `BoardMembers`
* Appropriate roles are assigned
* The user may belong to one or more branches

---

## 4. Exposed Routes

### 4.1 `POST /companies`

**Intent**

> As an authenticated user, I want to create a company so that I can start operating the system.

---

### 4.2 `GET /companies/branches`

**Intent**

> As a user, I want to list the branches I have access to.

---

### 4.3 `POST /companies/employees`

**Intent**

> As an authorized user, I want to add employees to the company.

---

## 5. Sprint 01 — Tasks Breakdown

### 5.1 Implement `POST /companies`

#### Description

Create a company and its initial branch.

#### Subtasks

* [ ] Create CompanyController

  * Extract authenticated user from request
  * Validate input using Zod

* [x] Create CreateCompanyUseCase

  * Validate user eligibility
  * Create company entity
  * Create default branch
  * Create BoardMembers entry
  * Assign COMPANY_OWNER role
  * Return updated identity context

* [x] Implement CompanyRepository (Prisma)

* [x] Implement BranchRepository (Prisma)

* [x] Implement BoardMembersRepository (Prisma)


---

### 5.2 Implement `GET /companies/branches`

#### Description

List branches accessible to the authenticated user.

#### Subtasks

* [x] Create ListBranchesController
* [x] Create ListBranchesUseCase

  * Read branchIds from JWT
  * Load branch details

---

### 5.3 Implement `POST /companies/employees`

#### Description

Add employees to a company with role-based access control.

#### Subtasks

* [x] Create CreateEmployeeController

  * Validate input with Zod
  * Extract roles and branchIds from JWT

* [x] Create CreateEmployeeUseCase

  * Validate creator role
  * Validate branch scope
  * Create user
  * Assign BoardMembers
  * Assign roles

---

## 6. Test Cases (Mandatory — Jest)

### 6.1 `POST /companies`

#### Unit Tests — CreateCompanyUseCase

* [x] Should create a company for an authenticated user
* [x] Should create a default branch
* [x] Should assign COMPANY_OWNER role
* [x] Should add user to BoardMembers

#### Integration Tests

* [x] Should return HTTP 201 on success
* [x] Should return updated JWT
* [x] Should persist company, branch, and board members

---

### 6.2 `GET /companies/branches`

#### Unit Tests — ListBranchesUseCase

* [x] Should list only branches from JWT context
* [x] Should not expose branches from other companies

#### Integration Tests

* [x] Should return HTTP 200 with branch list

---

### 6.3 `POST /companies/employees`

#### Unit Tests — CreateEmployeeUseCase

* [x] Should allow COMPANY_OWNER to create employees in any branch
* [x] Should allow COMPANY_ADMIN to create employees in any branch
* [x] Should restrict BRANCH_OWNER to own branches only
* [x] Should restrict BRANCH_ADMIN to own branches only
* [x] Should reject unauthorized roles

#### Integration Tests

* [x] Should return HTTP 201 on success
* [x] Should persist user and board membership
* [x] Should reject invalid branch assignment

---

## 7. Improvements and Recommendations (Tech Lead)

* Prefer **branchIds from JWT** over database queries for authorization
* Avoid implicit role escalation
* Keep company creation atomic (transactional)
* Log company creation as a domain event

---

This sprint establishes the **tenant foundation** of the ERP and unlocks all dependent modules (PDV, Orders, Stock, Finance).
