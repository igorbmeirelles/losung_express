# Category Module — Sprint 01 (Product Classification)

This document defines the **Category module**, its **business rules**, **access control**, and the **Sprint 01 backlog**. Categories are used to organize products hierarchically within a company.

This document must be read together with:

* `arquitetura.md`
* `user-module-sprint-01.md`
* `company-module-sprint-01.md`

---

## 1. Domain Overview

A **Category**:

* Belongs to a **Company** (tenant-scoped)
* May be a **root (parent) category**
* May be a **child category** associated with exactly one parent
* Is used exclusively for **product classification**

Categories are **organizational structures** and do not contain pricing, stock, or sales logic.

---

## 2. Core Business Rules

### BR-01 — Category Creation (Root)

* A root category has `parentId = null`
* Categories can only be created by **authenticated users**

#### Authorization Rules

| Role             | Scope                             |
| ---------------- | --------------------------------- |
| COMPANY_OWNER    | Global (all branches)             |
| COMPANY_ADMIN    | Global (all branches)             |
| BRANCH_OWNER     | Only branches the user belongs to |
| BRANCH_ADMIN     | Only branches the user belongs to |
| STOCK_ADMIN      | Only branches the user belongs to |

Branch scope **must be validated using `branchIds` from the JWT**.

---

### BR-02 — Category Hierarchy (Parent → Child)

* A child category **must reference an existing parent category**
* Parent and child **must belong to the same company**
* A category **cannot be associated more than once in the same category tree**
* Cyclic category relationships are strictly forbidden

When creating or updating a category hierarchy, the system must:

* Traverse the category tree upwards (ancestors)
* Ensure the target category **does not already exist in the ancestry**
* Reject any operation that would create a cycle

Authorization rules for creating child categories **are identical** to root category creation.

---

### BR-03 — Category Visibility (Listing)

A user may list categories according to their role:

| Role             | Visible Categories                          |
| ---------------- | ------------------------------------------- |
| COMPANY_OWNER    | All company categories                      |
| COMPANY_ADMIN    | All company categories                      |
| BRANCH_OWNER     | Categories for branches the user belongs to |
| BRANCH_ADMIN     | Categories for branches the user belongs to |
| STOCK_ADMIN      | Categories for branches the user belongs to |
| STOCK_DISPATCHER | Categories for branches the user belongs to |
| SELLER           | Categories for branches the user belongs to |

---

### BR-04 — Tenant Isolation

* Categories are always isolated by `companyId`
* Cross-company access is strictly forbidden

---

## 3. Exposed Routes

### 3.1 `POST /categories`

**Intent**

> As an authorized user, I want to create a category (root or child).

---

### 3.2 `GET /categories`

**Intent**

> As an authorized user, I want to list categories available to me.

---

### 3.3 `GET /categories/:categoryId`

**Intent**

> As an authorized user, I want to retrieve a category and all of its descendants.

---

---

### 3.2 `GET /categories`

**Intent**

> As an authorized user, I want to list categories available to me.

---

## 4. Sprint 01 — Tasks Breakdown

### 4.1 Implement `POST /categories`

#### Description

Create a root or child category for the company.

#### Subtasks

* [ ] Create CreateCategoryController

  * Validate input with Zod
  * Accept optional `parentId`
  * Extract roles and branchIds from JWT

* [ ] Create CreateCategoryUseCase

  * Validate user role
  * Validate branch scope via JWT
  * Validate parent category existence (if provided)
  * Validate category is not already associated in the tree
  * Traverse ancestors to prevent cycles
  * Enforce same-com### 4.2 Implement `GET /categories`

#### Description

List categories visible to the authenticated user.

#### Subtasks

* [ ] Create ListCategoriesController
* [ ] Create ListCategoriesUseCase

  * Resolve visibility scope from roles and branchIds
  * Scope query by companyId
  * Optionally return hierarchical structure

---

### 4.3 Implement `GET /categories/:categoryId`

#### Description

Retrieve a category and all of its child categories.

#### Subtasks

* [ ] Create GetCategoryTreeController
* [ ] Create GetCategoryTreeUseCase

  * Validate category existence
  * Validate company ownership
  * Recursively load child categories

---uery by companyId

* Optionally return hierarchical structure

---

#### Description

List categories visible to the authenticated user.

#### Subtasks

* [ ] Create ListCategoriesController
* [ ] Create ListCategoriesUseCase

  * Resolve visibility scope from roles and branchIds
  * Scope query by companyId
  * Optionally return hierarchical structure

---

## 5. Test Cases (Mandatory — Jest)

### 5.1 `POST /categories`

#### Unit Tests — CreateCategoryUseCase

* [ ] Should create a root category
* [ ] Should create a child category with valid parent
* [ ] Should reject creation if category already exists in the tree
* [ ] Should reject creation with invalid parentId
* [ ] Should reject cross-company parent association
* [ ] Should reject unauthorized roles
* [ ] Should prevent cyclic category trees

#### Integration Tests

* [ ] Should return HTTP 201 on success
* [ ] Should persist category correctly

---

### 5.2 `GET /categories`

#### Unit Tests — ListCategoriesUseCase

* [ ] Should list all categories for COMPANY_OWNER
* [ ] Should list all categories for COMPANY_ADMIN
* [ ] Should list branch-scoped categories for BRANCH_OWNER
* [ ] Should list branch-scoped categories for SELLER
* [ ] Should not expose categories from other companies

#### Integration Tests

* [ ] Should return HTTP 200 with category list
* [ ] Should optionally return hierarchical structure

---

### 5.3 `GET /categories/:categoryId`

#### Unit Tests — GetCategoryTreeUseCase

* [ ] Should return category with all descendants
* [ ] Should reject access to category from another company
* [ ] Should return empty children list when category has no children

#### Integration Tests

* [ ] Should return HTTP 200 with category tree
* [ ] Should not expose categories from other companies

---

## 6. Improvements and Recommendations (Tech Lead)

* Prefer adjacency-list model (`parentId`) for simplicity
* Avoid deep category nesting (recommend max depth ≤ 5)
* Consider caching category trees per company
* Validate tree integrity at creation time only

---

This sprint establishes the **category foundation** used by Products, Navigation, Search, and PDV flows.
