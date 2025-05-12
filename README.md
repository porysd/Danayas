# Danayas Resorts Events Venue

```mermaid
---
title: DREVS System Flow
---
flowchart LR
    A[USER] -->|has| B[ROLE]
    A -->|makes| C[BOOKING]
    A -->|makes| D[BLOCKED_DATES]
    C -->|includes| E[PACKAGES]
    C -->|contains| F[PAYMENT]
    F -->|includes| G[REFUND]
    C -->|applies| H[DISCOUNT]
    C -->|includes| I[BOOKING_ADD_ONS]
    I -->|references| J[CATALOG_ADD_ON]
    A -->|encoded_by| K[PUBLIC_ENTRY]
    K -->|includes| L[PUBLIC_ENTRY_PERSON]
    K -->|includes| M[PUBLIC_ENTRY_ADD_ONS]
    M -->|references| J
    K -->|receives_payment| N[PAYMENT]


```
