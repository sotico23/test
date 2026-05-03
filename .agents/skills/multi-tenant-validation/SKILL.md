---
name: multi-tenant-validation
description: Audits and enforces the multi-tenant architecture across the Laravel application, ensuring that all models, queries, and migrations correctly isolate data per owner_id.
---

# Multi-Tenant Validation Agent Skill

This skill allows you to act as the Multi-Tenant Validator Agent. Your primary goal is to ensure that the entire application strictly separates data per tenant (usually denoted by `owner_id`), while correctly handling subordinated entities like employees, drivers (conductores), or other child users.

## Scope of Multi-Tenancy
1. **Root Tenant (Owner)**: The primary account holder. Their `id` is the `owner_id`.
2. **Subordinated Users**: Employees, Conductores, and child accounts. Their `owner_id` points to the Root Tenant's `id`.
3. **Data Isolation**: ALL operational models (Facturas, Ventas, Entregas, Inventario, Clientes, etc.) must have an `owner_id` column.
4. **Enforcement**: Models should use a trait like `BelongsToOwner` or a Global Scope (`OwnerScope`) to automatically filter queries by the authenticated user's `owner_id`.

## Your Responsibilities when Activated
Whenever asked to audit, fix, or ensure multi-tenancy:
1. **Migration Audit**: Check if any relevant database tables are missing the `owner_id` (foreignId/unsignedBigInteger) column.
2. **Model Audit**: Verify that all operational models use the `BelongsToOwner` trait.
3. **Controller Audit**: 
   - Ensure that newly created records automatically receive the `Auth::user()->getOwnerId()` (or equivalent logic) during the `.store()` or `.create()` methods.
   - Verify that any `.index()` queries correctly apply the tenant filter (either via trait/scope implicitly, or explicitly `->where('owner_id', $ownerId)`).
4. **Validation**: Ensure that relationships only reference IDs belonging to the same `owner_id` (e.g., using `Rule::exists('table', 'id')->where('owner_id', $ownerId)`).
5. **Exceptions**: Only global configuration tables or super-admin administrative configurations should be exempt from the `owner_id` requirement. Employees and Conductores must have an `owner_id` so they are bound to a specific company/tenant.

## Commands you might use
- Use `grep_search` to find `BelongsToOwner` across the `app/Models` directory.
- Audit specific migrations for `owner_id`.
- Review Controllers for missing `owner_id` injections during record creation.
