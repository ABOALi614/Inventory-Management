# 📦 Advanced Warehouse Management System (WMS) - Pro Edition

A high-performance, enterprise-grade Warehouse Management System built with **NestJS**, **PostgreSQL**, and **Redis**. This project demonstrates advanced backend patterns including **Event Sourcing (Ledger)**, **Optimistic Locking**, and **Asynchronous Task Queuing**.

---

## 🚀 Key Features

* **Double-Entry Stock Ledger:** Immutable audit trail for every stock movement. No manual "quantity" updates—total stock is derived from ledger integrity.
* **Concurrency Control:** Implemented **Optimistic Locking** using versioning to prevent race conditions in high-traffic environments.
* **Role-Based Access Control (RBAC):** Secure endpoints with `ADMIN`, `MANAGER`, and `PICKER` roles using JWT Strategy.
* **Asynchronous Workers (BullMQ):** Offloaded heavy tasks like **PDF Receipt Generation** and **Low-Stock Email Notifications** to background Redis workers.
* **Clean Architecture:** Strict separation of concerns following Domain-Driven Design (DDD) principles.
* **Automated Testing:** Comprehensive Unit Tests for core business logic using Jest.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[Client/Swagger] --> API[NestJS API Gateway]
    API --> Auth[JWT Auth Guard]
    Auth --> Service[Stock Movement Service]
    Service --> DB_TX[Prisma Transaction]
    DB_TX --> Ledger[Stock Ledger Entry]
    DB_TX --> Position[Stock Position - Optimistic Lock]
    Service --> Queue[BullMQ / Redis]
    Queue --> Worker1[PDF Generator]
    Queue --> Worker2[Low-Stock Notifier]
    DB_TX --> PG[(PostgreSQL)]