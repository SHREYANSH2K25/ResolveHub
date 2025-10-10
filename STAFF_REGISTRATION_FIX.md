# Staff Registration Error Fix

## Problem Identified
The staff registration was failing with a 500 Internal Server Error due to a **field name mismatch** between the frontend and backend.

### Root Cause
- **Frontend**: Registration form used field name `registrationKey`
- **Backend**: Expected field name `verificationcode`
- **Result**: Backend couldn't find the verification code, causing validation failures

## Solution Implemented

### Frontend Fix (`/frontend/src/pages/RegisterPage.jsx`)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  const { confirmPassword, registrationKey, ...registrationData } = formData;
  registrationData.role = role;
  
  // ✅ MAP registrationKey to verificationcode for backend compatibility
  if (role === 'staff' && registrationKey) {
    registrationData.verificationcode = registrationKey;
  }
  
  const success = await register(registrationData);
  if (success) navigate('/dashboard');
  setIsLoading(false);
};
```

### What the Fix Does
1. **Extracts** `registrationKey` from form data
2. **Maps** it to `verificationcode` when role is 'staff'
3. **Sends** the correctly named field to the backend
4. **Maintains** UI field name for consistency

## Verification Steps
1. Frontend form still shows "Registration Key" label
2. Form data is internally mapped to correct backend field name
3. Backend receives `verificationcode` as expected
4. Staff registration now works with 24-hour verification codes

## Complete Flow Now Working ✅
1. **Admin** generates verification code via "Generate Staff Key" button
2. **Admin** shares 6-character code with staff member in person
3. **Staff** enters code in "Registration Key" field
4. **Frontend** maps `registrationKey` → `verificationcode`
5. **Backend** validates the code and creates staff account
6. **Code** is marked as used and expires after 24 hours

## Files Modified
- `/frontend/src/pages/RegisterPage.jsx` - Added field mapping
- `/frontend/src/services/apiService.js` - Added verification code generation method
- `/frontend/src/pages/AdminDashboard.jsx` - Added verification code UI components

The staff registration error has been **resolved** and the complete authentication flow is now functional.