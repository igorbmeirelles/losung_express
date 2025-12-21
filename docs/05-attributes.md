# Attribute Module — Sprint 01 (Product Attributes)

This document defines the **Attribute module**, its **business rules**, **access control**, and the **Sprint 01 backlog**. Attributes and options are used to describe product variations and technical characteristics.

This document must be read together with:

* `arquitetura.md`
* `02-companies.md`
* `04-categories.md`

---

## 1. Domain Overview

An **Attribute**:

* Belongs to a **Company** (tenant-scoped)
* Represents a product characteristic (e.g., Color, Size, Material)
* Can have multiple **Options**

An **Option**:

* Belongs to exactly one Attribute
* Represents a selectable value (e.g., Red, Blue, XL)

Attributes are **company-level definitions**, reused across products and SKUs.

---

## 2. Core Business Rules

### BR-01 — Attribute Creation

* Attributes can only be created by **authenticated users**
* Attributes are always scoped by `companyId`

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

### BR-02 — Option Creation

* Options may be added only to **existing attributes**
* Attribute and options **must belong to the same company**
* Duplicate option names for the same attribute are forbidden

Authorization rules for option creation **are identical** to attribute creation.

---

### BR-03 — Attribute Visibility (Listing)

A user may list attributes and options according to their role:

| Role             | Visible Attributes                          |
| ---------------- | ------------------------------------------- |
| COMPANY_OWNER    | All company attributes                      |
| COMPANY_ADMIN    | All company attributes                      |
| BRANCH_OWNER     | Attributes for branches the user belongs to |
| BRANCH_ADMIN     | Attributes for branches the user belongs to |
| STOCK_ADMIN      | Attributes for branches the user belongs to |
| STOCK_DISPATCHER | Attributes for branches the user belongs to |
| SELLER           | Attributes for branches the user belongs to |

---

### BR-04 — Attribute Retrieval by ID

* It must be possible to retrieve an attribute by ID
* A query parameter `includeOptions` controls whether options are returned

  * `includeOptions=true` → attribute + options
  * `includeOptions=false` → attribute only

---

### BR-05 — Tenant Isolation

* Attributes and options are always isolated by `companyId`
* Cross-company access is strictly forbidden

---

## 3. Exposed Routes

### 3.1 `POST /attributes`

**Intent**

> As an authorized user, I want to create an attribute with optional initial options.

---

### 3.2 `POST /attributes/:attributeId/options`

**Intent**

> As an authorized user, I want to add options to an existing attribute.

---

### 3.3 `GET /attributes`

**Intent**

> As an authorized user, I want to list attributes and their options.

---

### 3.4 `GET /attributes/:attributeId`

**Intent**

> As an authorized user, I want to retrieve an attribute by ID, optionally including its options.

---

## 4. Sprint 01 — Tasks Breakdown

### 4.1 Implement `POST /attributes`

#### Description

Create a new attribute, optionally with initial options.

#### Subtasks

* [ ] Create CreateAttributeController

  * Validate input with Zod
  * Accept optional list of options
  * Extract roles and branchIds from JWT

* [ ] Create CreateAttributeUseCase

  * Validate user role
  * Validate branch scope via JWT
  * Create attribute entity
  * Create initial options (if provided)

* [ ] Implement AttributeRepository (Prisma)

* [ ] Implement OptionRepository (Prisma)

---

### 4.2 Implement `POST /attributes/:attributeId/options`

#### Description

Add options to an existing attribute.

#### Subtasks

* [ ] Create AddOptionController
* [ ] Create AddOptionUseCase

  * Validate attribute existence
  * Validate company ownership
  * Prevent duplicate option names

---

### 4.3 Implement `GET /attributes`

#### Description

List attributes visible to the authenticated user.

#### Subtasks

* [ ] Create ListAttributesController
* [ ] Create ListAttributesUseCase

  * Resolve visibility scope from roles and branchIds
  * Optionally include options

---

### 4.4 Implement `GET /attributes/:attributeId`

#### Description

Retrieve an attribute by ID.

#### Subtasks

* [ ] Create GetAttributeController
* [ ] Create GetAttributeUseCase

  * Validate attribute existence
  * Validate company ownership
  * Conditionally load options based on query param

---

## 5. Test Cases (Mandatory — Jest)

### 5.1 `POST /attributes`

#### Unit Tests — CreateAttributeUseCase

* [ ] Should create attribute for authorized roles
* [ ] Should reject unauthorized roles
* [ ] Should create attribute with initial options
* [ ] Should enforce company scoping

#### Integration Tests

* [ ] Should return HTTP 201 on success
* [ ] Should persist attribute and options

---

### 5.2 `POST /attributes/:attributeId/options`

#### Unit Tests — AddOptionUseCase

* [ ] Should add option to attribute
* [ ] Should reject duplicate option names
* [ ] Should reject cross-company attribute access

#### Integration Tests

* [ ] Should return HTTP 201 on success
* [ ] Should persist option correctly

---

### 5.3 `GET /attributes`

#### Unit Tests — ListAttributesUseCase

* [ ] Should list all attributes for COMPANY_OWNER
* [ ] Should list branch-scoped attributes for SELLER
* [ ] Should optionally include options

#### Integration Tests

* [ ] Should return HTTP 200 with attribute list
* [ ] Should not expose attributes from other companies

---

### 5.4 `GET /attributes/:attributeId`

#### Unit Tests — GetAttributeUseCase

* [ ] Should return attribute without options when includeOptions=false
* [ ] Should return attribute with options when includeOptions=true
* [ ] Should reject access to attribute from another company

#### Integration Tests

* [ ] Should return HTTP 200 with attribute data

---

## 6. Improvements and Recommendations (Tech Lead)

* Enforce unique `(companyId, attributeName)` constraint
* Enforce unique `(attributeId, optionName)` constraint
* Keep attribute creation idempotent where possible
* Consider caching attribute lists per company
* Avoid deleting attributes used by existing SKUs (future rule)

---

This sprint establishes the **attribute foundation** used by Products, SKUs, and variations.
