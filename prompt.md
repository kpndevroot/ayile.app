Refactor @Forks/app/(staff)/add-menu-item.tsx to use react-hook-form with best practices and improve the overall UX.

🎯 Goals

Replace current form handling with react-hook-form

Implement clean validation + error handling

Improve UI/UX (loading, disabled states, feedback messages)

Use the same form component for both:

Create menu item

Edit menu item

🧩 API Integration Requirements
1️⃣ Create Menu Item API

POST {{base_url}}/menu-items/

Payload format:

{
  "restaurantId": "bb1f1a88-4139-4073-bcef-0e72a58cf54c",
  "categoryId": "5a8d54e2-9052-4fa5-a250-9f6fbc3eb77e",
  "name": "Honey Shawaya Only",
  "description": "Honey-glazed sweet–spicy shawaya chicken without rice.",
  "dietaryTypes": ["NON_VEG"],
  "isSpicy": false,
  "spicyLevel": 1,
  "prepTimeMinutes": 10,
  "basePrice": 550,
  "quantityOptions": [
    {
      "quantityTypeId": "fd9914cb-feb7-4a0a-93c9-4697baaa216c",
      "value": 0.25,
      "displayLabel": "Q (Quarter)",
      "price": 150,
      "isDefault": false
    }
  ]
}

2️⃣ Upload Image API (Only After Create Success)

POST {{base_url}}/menu-items/{{menu_item_id}}/upload-image

Payload:

FormData { image: file }


⚠️ Important:

Image upload must happen only after menu item is successfully created

Show upload progress/loading UI

If upload fails, show retry option without losing created menu item

📥 Data Fetching Requirements
Categories

GET {{base_url}}/categories?restaurantId={{restaurantId}}

Use this to populate category dropdown.

Quantity Types

GET {{base_url}}/quantity-types

Use this to build quantity options section.

🧱 Form Architecture Requirements
Create a reusable component

Extract the form UI + logic into a reusable component like:

MenuItemForm.tsx


🧾 react-hook-form Implementation
Use RHF features properly:

useForm

Controller for dropdowns/switches

useFieldArray for quantityOptions[]

Form validation rules

Minimum validation required:

name required

categoryId required

basePrice required, must be > 0

prepTimeMinutes required

if isSpicy=true, spicyLevel must be 1-5

quantityOptions:

must have at least 1 option

price must be valid

exactly 1 item must be marked isDefault=true

🌟 UX Improvements (Must Implement)
Loading + Disabled State

Disable submit button while saving

Disable form while API call running

Show skeleton / loading state for categories and quantity types

Better User Feedback

Toast or inline success/error message

If create success → navigate back or show "Menu Item Created"

If upload image fails → show warning + retry

Form Flow

Step-like experience (optional but preferred UX):

Fill details

Add quantity options

Create item

Upload image

✏️ Edit Mode Support
Edit form should:

Prefill all fields using existing menu item data

Allow updating fields and quantity options

Allow replacing image (optional but preferred)

Use same form component with props like:

mode: "create" | "edit"
initialValues?: MenuItemFormValues

🧼 Code Quality Expectations

Keep code modular and clean

Use TypeScript types for payload

Extract API calls into separate service file if needed

Avoid duplicated UI logic

Follow React Native best practices

