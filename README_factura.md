# Factura

**Business management and traceability application**
Quote → Purchase Order → Delivery Note → Attachment → Invoice → Payment

---

## Table of Contents

1. [General Overview](#1-general-overview)
2. [The Document Workflow](#2-the-document-workflow)
3. [Detailed Features](#3-detailed-features)
   - [3.1 Dashboard](#31-dashboard)
   - [3.2 Clients](#32-clients)
   - [3.3 Companies](#33-companies)
   - [3.4 Quotes](#34-quotes)
   - [3.5 Purchase Orders (PO)](#35-purchase-orders-po)
   - [3.6 Delivery Notes (DN)](#36-delivery-notes-dn)
   - [3.7 Attachments](#37-attachments)
   - [3.8 Invoices](#38-invoices)
   - [3.9 Payments](#39-payments)
   - [3.10 Purchase Quotes](#310-purchase-quotes)
   - [3.11 Purchase Invoices](#311-purchase-invoices)
   - [3.12 Traceability](#312-traceability)
   - [3.13 Timeline](#313-timeline)
   - [3.14 Goals (KPIs)](#314-goals-kpis)
4. [Complete Workflow Example](#4-complete-workflow-example)
5. [Installation](#5-installation)
6. [Configuration](#6-configuration)
7. [Daily Use](#7-daily-use)
8. [Data Backup](#8-data-backup)
9. [Detailed Troubleshooting](#9-detailed-troubleshooting)
10. [Frequently Asked Questions](#10-frequently-asked-questions)
11. [Important Locations (quick reference)](#11-important-locations-quick-reference)
12. [Support](#12-support)

---

## 1. General Overview

Factura is a business management application designed for companies that need to
**precisely track every client file**, from the initial price quote to the final
payment collection, through every intermediate step (order, delivery, invoicing).

The problem Factura solves is simple to state but difficult to handle manually with
traditional tools: **when a client asks "where does my file stand?", or when you want
to know "which quotes were never followed by an order", you normally have to cross-
reference several files, several binders, several people**. Factura automatically links
all the documents of the same file together, so this answer is immediate.

The application is presented as Windows software installed locally on the workstation —
no internet connection is needed for daily use, and the data stays on your own
infrastructure (PostgreSQL database), not on an external server.

---

## 2. The Document Workflow

The core of Factura relies on a chain of documents, where each step can be linked to
the previous one:

```
   Client
     │
     ▼
   Quote  ─────────────────►  (accepted by the client)
     │
     ▼
Purchase Order (PO)  ────────►  (purchase confirmation)
     │
     ▼
Delivery Note (DN)  ─────────►  (goods/service delivered)
     │
     ▼
 Attachment  ───────────────►  (joint acknowledgment of receipt, commonly used
     │                          in construction/works to validate completed quantities)
     ▼
  Invoice  ───────────────────►  (payment request)
     │
     ▼
 Payment(s)  ────────────────►  (one or more settlements, until fully paid)
```

Each arrow represents a link kept in the database: from an invoice, you can trace back
to the original quote and the client, and conversely, from a quote, you can see whether
it led to an order, a delivery, an invoice, and whether it was paid.

A second, shorter chain exists on the **supplier purchasing** side:

```
Purchase Quote  ─────────────►  Purchase Invoice
```

---

## 3. Detailed Features

### 3.1 Dashboard

The application's home page, giving an at-a-glance view of the company's commercial
health:

- **Global counters**: number of clients, companies, quotes, purchase orders, delivery
  notes and invoices recorded in the system.
- **Financial indicators**: total amount invoiced, total amount collected, and remaining
  amount to be collected (the difference between the two — useful for tracking pending
  cash flow).
- **Files in progress**: number of commercial workflows that have not yet reached their
  end (full payment).
- **Monthly quote trend chart**: allows you to visualize seasonality or growth of
  commercial activity over recent months.
- **Quote breakdown by status chart**: see at a glance the proportion of quotes pending,
  accepted, or refused.
- **Invoiced / Collected / Remaining chart**: visual comparison of the three amounts.

### 3.2 Clients

Complete client record including:

- First name, last name, email, phone, address
- Tax ID
- Free-form notes
- An attachable PDF document (for example a master agreement or an ID document)

From the client record, you have direct access to the **complete history**: all quotes
for this client, and by extension (thanks to the document chain links) all associated
purchase orders, delivery notes, attachments, invoices and payments.

### 3.3 Companies

Similar to the client record, but for a legal entity, with additionally:

- Name of the referring contact
- Trade register number
- Tax ID

Useful for distinguishing files handled with companies (B2B) from those handled with
individuals (B2C), without duplicating the management logic.

### 3.4 Quotes

The starting point of the commercial chain. Each quote includes:

- Unique number (e.g. `DEV-0001`)
- Associated client (with their type, individual or company)
- Issue date and **expiration date** (to know when an offer is no longer valid)
- Description of the service or products
- Amount
- **Status**: `pending`, `accepted`, `refused`
- Free-form comments
- Generated or imported PDF document

### 3.5 Purchase Orders (PO)

Confirms that a quote is turned into a firm purchase commitment from the client. Each
purchase order references the original quote, carries over the client and the amount,
and has its own status: `preparing`, `validated`, `cancelled`.

### 3.6 Delivery Notes (DN)

Certifies that a delivery has taken place (goods, service performed). Each delivery note
references the corresponding purchase order. Possible statuses: `preparing`,
`delivered`, `partial`, `cancelled`.

### 3.7 Attachments

A concept borrowed from construction and works vocabulary: it is a **joint
acknowledgment** that precisely validates what was delivered or performed, before the
invoice is issued — useful when there can be a discrepancy between what was planned on
the delivery note and what is actually retained for invoicing. Each attachment
references the corresponding delivery note, with an **agreement date** in addition to
the document date. Statuses: `agreement`, `validated`, `contested`, `refused`.

### 3.8 Invoices

The payment request document. Each invoice can reference:

- The attachment it stems from (on the sales side)
- A corresponding purchase invoice (to calculate a margin/`gain`, very useful for
  tracking the actual profitability of a file, particularly when part of the service
  was outsourced)

Statuses: `unpaid`, `partial`, `paid`, `late`.

### 3.9 Payments

Each payment received is recorded individually (an invoice can have several successive
payments until fully settled). Each payment includes:

- Reference
- Related invoice
- Date, amount
- **Payment method**: `cash`, `check`, `transfer`, `card`
- Bank reference (check number, transfer reference...)

### 3.10 Purchase Quotes

The supplier-side counterpart of a quote: a price offer received from a supplier, with
supplier, date, expiration date, amount, and status (same values as client quotes:
pending, accepted, refused, validated).

### 3.11 Purchase Invoices

An invoice received from a supplier, optionally referencing the corresponding purchase
quote. Statuses identical to client invoices: unpaid, partial, paid, late. It is by
comparing a client invoice to its associated purchase invoice that Factura calculates
the actual **margin** (`gain`) of a file.

### 3.12 Traceability

This is the feature that gives the document chain its full meaning. From **any
reference** (`DEV-0001`, `BDC-0002`, `BL-0004`, `FAC-0010`...), you instantly obtain:

- The client concerned
- All linked documents in chronological order (quote → purchase order → delivery note →
  attachment → invoice → payments)
- The searched document is visually highlighted
- Ability to navigate directly to any document in the chain

It is the digital equivalent of "following the thread" of a file without having to open
six different files.

### 3.13 Timeline

Chronological view of all commercial activity, grouped by client, with filters:

- **All**: the entire set of files
- **In progress**: files not yet settled
- **Completed**: fully paid files
- **Blocked**: files with a document refused, contested, or cancelled somewhere in the
  chain

Each file can be expanded to see the detail of each step (number, date, status, amount,
description).

### 3.14 Goals (KPIs)

Allows you to define configurable monthly numeric goals (for example a margin target on
purchases) and track their achievement directly from the dashboard, without having to
maintain a separate spreadsheet.

---

## 4. Complete Workflow Example

To concretely illustrate how the modules fit together, here is a typical use case:

1. **A client contacts the company** → their record is created in **Clients**
2. **A quote is sent to them** → created in **Quotes**, status `pending`
3. **The client accepts** → the quote status changes to `accepted`, then a **Purchase
   Order** is created referencing this quote
4. **The service is delivered** → a **Delivery Note** is created, referencing the
   purchase order
5. **A joint acknowledgment is signed** → an **Attachment** is created, referencing the
   delivery note
6. **The invoice is issued** → references the attachment; if a supplier was involved,
   the corresponding **Purchase Invoice** is linked to calculate the margin
7. **The client pays in two installments** → two **Payments** are recorded on the
   invoice, which moves from `unpaid` to `partial` then to `paid`
8. **At any time**, typing the reference of the quote, purchase order, delivery note, or
   invoice into **Traceability** instantly displays this entire workflow

---

## 5. Installation

### 5.1 Prerequisites

- Windows 10 or 11 (64-bit)
- PostgreSQL installed and running, with a dedicated database created for Factura

> **Java and the runtime environment required are bundled into the installer.**
> No separate installation of Java, Node.js, or any other component is required on the
> target machine.

### 5.2 Steps

1. Run `Factura Setup 1.0.0.exe`
2. Follow the installation wizard (choice of installation folder, creation of Desktop
   and Start Menu shortcuts)
3. Do not launch the application right after installation completes — go first to the
   **Configuration** section below, otherwise the application will show a database
   connection error on first launch (which is normal as long as the configuration has
   not been filled in)

> If the antivirus on the machine flags the installer or temporarily blocks it on first
> run, this is a false positive related to the absence of a paid commercial code-signing
> certificate (common for internal/business software). Allow the execution to proceed.

---

## 6. Configuration

### 6.1 Connecting to PostgreSQL

On the very first launch, Factura automatically creates a configuration file:

```
%AppData%\Factura\config.properties
```

Open it with Notepad and enter your actual credentials:

```properties
DB_URL=jdbc:postgresql://localhost:5432/factura
DB_USER=postgres
DB_PASSWORD=your_password
SERVER_PORT=8080
```

- `DB_URL`: address and name of the database. Change `localhost:5432` if PostgreSQL runs
  on another machine or another port, and `factura` for the actual name of your
  database if different.
- `DB_USER` / `DB_PASSWORD`: the PostgreSQL connection credentials for the machine.
- `SERVER_PORT`: the port used locally by the application (8080 by default). Change it
  only if this port is already used by another program on the machine.

Save, then launch (or relaunch) Factura.

### 6.2 License

Factura requires a valid license file, provided separately by the software publisher.
Place it (replacing the existing one if needed) at:

```
%AppData%\Factura\license.lic
```

No restart is required after replacing it: validity is automatically rechecked on every
use. Without a valid license or after expiration, a blocking screen is displayed —
contact the publisher for a renewal.

---

## 7. Daily Use

- **Launch** the application via the "Factura" shortcut (Desktop or Start Menu). A
  splash screen is displayed for a few seconds while the application connects to the
  database.
- **Close** the application by simply closing its window — all associated processes stop
  automatically and cleanly.
- Documents (quotes, invoices, etc.) and their statuses are **saved in real time** to the
  database on every change; there is no global "save" button to remember to click at the
  end of the day.

---

## 8. Data Backup

Two types of data to back up regularly:

1. **The PostgreSQL database** (clients, quotes, invoices, payments, etc.) — include it
   in your usual PostgreSQL backup policy (`pg_dump`, scheduled backup, etc.). This is
   the most critical data.
2. **Attachments** stored locally in:
   ```
   %AppData%\Factura\data\uploads
   ```
   This folder contains the PDF files and documents attached to clients, quotes,
   invoices, etc. Be sure to include it in a regular file backup (external copy,
   corporate cloud backup...).

---

## 9. Detailed Troubleshooting

### "The backend server stopped unexpectedly (code 1)"

Open the diagnostic log:

```
%AppData%\Factura\backend.log
```

This file contains the exact detail of the error. The most frequent causes, in order of
likelihood:

1. **PostgreSQL is not running** on the machine → start the PostgreSQL service
2. **Incorrect password** in `config.properties` → check `DB_PASSWORD`
3. **The database does not exist yet** → create it (`CREATE DATABASE factura;`)
4. **Port 8080 is already in use** by another program → change `SERVER_PORT` in
   `config.properties`

### "Factura License Invalid"

The `license.lic` file is missing, expired, corrupted, or does not match the
verification key embedded in this version of the application. Check its presence in
`%AppData%\Factura\`, and contact the publisher if a renewal is needed.

### Pages remain empty or show no data

- Check that PostgreSQL is running and accessible
- Check `backend.log` for a possible database connection error
- Check that no old Factura process is already running in the background (Task Manager
  → look for `java.exe` / `javaw.exe`): two instances trying to use the same port can
  cause this type of issue

### The application does not fully close

If a process remains active after closing the window, check in Task Manager that no
leftover `java.exe`/`javaw.exe` remains, and terminate it manually if needed before
relaunching the application.

---

## 10. Frequently Asked Questions

**Does the application need internet to work?**
No. All data is stored locally (PostgreSQL on the machine or the company's local
network). No internet connection is required for daily use.

**Can I use Factura on several machines at the same time, with the same data?**
In the current setup, each machine runs its own local instance of the application.
Multi-machine use with a shared database is possible but requires specific network
configuration — check with the publisher if this need arises.

**What happens if my license expires?**
Access to features is blocked (warning screen), but no data is deleted. As soon as a new
valid license file is placed, access is restored immediately, with no data loss.

**Can I change the port or the database location after installation?**
Yes, at any time, by editing `%AppData%\Factura\config.properties` and then relaunching
the application.

**How do I know if a quote has already been invoiced?**
Use the **Traceability** feature with the quote number: it instantly displays all linked
documents, including the invoice if it exists.

---

## 11. Important Locations (quick reference)

| Item                    | Location                              |
| ----------------------- | ------------------------------------- |
| Database configuration  | `%AppData%\Factura\config.properties` |
| License file            | `%AppData%\Factura\license.lic`       |
| Diagnostic log          | `%AppData%\Factura\backend.log`       |
| Attachments / documents | `%AppData%\Factura\data\uploads`      |
| Installed program       | `C:\Program Files\Factura\`           |

---

## 12. Support:

For any question, installation difficulty, observed issue, or license renewal request,
contact the software publisher.
