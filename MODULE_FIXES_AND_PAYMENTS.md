# Mowdmin Mobile Backend - API Technical Reference & Fixes

This documentation serves as a complete guide for the fixed modules: Community/Groups, Notifications, Commerce (Orders), Donations, and Membership.

---

## 1. Community & Groups Module
Comprehensive management of social groups and messaging.

### Fixed Issues:
- **Missing Member Count**: Groups now return the `memberCount` integer.
- **Missing Member Names/Photos in Messages**: Message senders are now fully populated objects (`_id`, `name`, `photo`).
- **Missing Group/Member Images**: Verified and fixed URL generation for all image fields.
- **Leave Group Failure**: Corrected the ID type comparison logic to allow users to leave groups successfully.

### Endpoints:
- **Create Group**
    - `POST /api/v1/groups/create`
    - Body: `{"name": "Study Group", "description": "...", "image": "URL"}`
- **Get My Joined Groups** (Returns `memberCount`)
    - `GET /api/v1/groups/me`
- **Discover New Groups** (Returns `memberCount`)
    - `GET /api/v1/groups/discover`
- **Get Group Details** (Returns `memberCount` + populated `members` list)
    - `GET /api/v1/groups/:id`
- **Join a Group**
    - `POST /api/v1/groups/:id/join`
- **Leave a Group** (FIXED)
    - `DELETE /api/v1/groups/:id/leave`
- **Fetch Group Messages** (Populates sender `name` and `photo`)
    - `GET /api/v1/groups/:id/messages`
- **Send a Message**
    - `POST /api/v1/groups/:id/messages`
    - Body: `{"message": "Hello!", "type": "text"}`

---

## 2. Notifications Module
Reliable system alerts and messages.

### Fixed Issues:
- **Empty Data Bug**: Added missing `type` and `metadata` fields to the database.
- **Read Status Tracking**: Renamed field to `isRead` for consistency with implementation.

### Endpoints:
- **Fetch All My Notifications**
    - `GET /api/v1/notifications`
- **Mark as Read**
    - `PUT /api/v1/notifications/:id/read`
- **Create Notification**
    - `POST /api/v1/notifications/create`
    - Body: `{"title": "...", "message": "...", "type": "info", "metadata": {...}}`

---

## 3. Commerce (Orders) Module
End-to-end shopping experience and payments.

### Fixed Issue:
- **No Payment Options**: Users can now pay for any "Pending" order after creation.

### Endpoints:
- **Create Order**
    - `POST /api/v1/orders/create`
    - Body: `{"items": [{"productId": "...", "quantity": 1}], "totalAmount": 10.99}`
- **List My Orders**
    - `GET /api/v1/orders/user`
- **Get Single Order**
    - `GET /api/v1/orders/:id`
- **Initiate Order Payment** (STRIPE)
    - `POST /api/v1/orders/:id/pay`
    - **Description**: Returns `clientSecret`. Status moves to "Paid" once confirmed by Stripe webhook.

---

## 4. Donations Module
Secure charitable giving system.

### Fixed Issue:
- **Manual Status Updates**: Donations now transition automatically to "Success" upon Stripe payment confirmation.

### Endpoints:
- **Create Donation Record**
    - `POST /api/v1/donation`
    - Body: `{"amount": 20.00, "campaign": "CAMP_ID", "currency": "USD"}`
- **Initiate Donation Payment** (STRIPE)
    - `POST /api/v1/donation/:id/pay`
    - **Description**: Fetches the donation record and returns Stripe `clientSecret`. 
- **List Campaign Donations**
    - `GET /api/v1/donation/campaign/:campaignId`

---

## 5. Membership Module
Church member roster and interest tracking.

### Description:
Used for church membership applications (separate from groups). Tracks "Baptism interest", "Communion alerts", and "Approval status".

### Endpoints:
- **Apply for Membership**
    - `POST /api/v1/membership/create`
    - Body: `{"baptismInterest": true, "communionAlert": false}`
- **List Applications** (Admin)
    - `GET /api/v1/membership`

---
*Reference updated: 2026-03-03*
