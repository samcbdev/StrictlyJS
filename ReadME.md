# StrictlyJS: Modern, Extensible, HTML-Driven Form Validation

## Introduction
StrictlyJS is a robust, extensible JavaScript library for client-side form validation. Define rules directly in your HTML using `data-strictly-*` attributes, get real-time or on-submit validation, and extend with custom (sync or async) rules. No dependencies required.

---

## Installation
**CDN:**
```html
<script src="https://cdn.jsdelivr.net/gh/samcbdev/StrictlyJS/strictly.js"></script>
<!-- or -->
<script src="https://cdn.jsdelivr.net/npm/strictlyjs/strictly.js"></script>
```
**Minified:**
```html
<script src="https://cdn.jsdelivr.net/gh/samcbdev/StrictlyJS/strictly.min.js"></script>
<!-- or -->
<script src="https://cdn.jsdelivr.net/npm/strictlyjs/strictly.min.js"></script>
```
**CSS:**
```html
<link rel="stylesheet" href="strictly.css">
```

---

## Quick Start
```html
<form id="my-form">
  <input type="email" name="email" required>
  <button type="submit">Submit</button>
</form>
<script src="strictly.js"></script>
<script>
  new Strictly('#my-form');
</script>
```

---

## API Reference

### Constructor
```js
new Strictly(target, options?)
```
- **target**: CSS selector for a form, field, or container (e.g. `#form`, `.my-form`, `input[name=email]`).
- **options** (optional):
  - `restrict`: `'showerror'` (default) or `'oninput'` (restricts invalid input as you type)
  - `errorReturnType`: `'first'` (default) or `'all'`
  - `errorMessagePosition`: `'down'`, `'up'`, or `'custom'`
  - `errorTag`: `'p'` (default) or `'div'`
  - `errorCustomClass`: CSS class for custom error placement
  - `initError`: `true` (default, show errors on input) or `false` (show only after submit)
  - `debounce`: `0` (default, no debounce) — debounce time in ms for live validation (e.g. `debounce: 300` for 300ms delay)
  - `errorPlacement`: `function(field, errorElement, errorMessage)` - Allows full control over error message placement.

**Example:**
```js
const strictly = new Strictly('#my-form', { restrict: 'oninput', errorReturnType: 'all' });
```

### validate(options = {})
- **Returns:** Always a Promise resolving to `{ isValid, values, errors }`.
- **options:**
  - `formError`: `true` (default: show errors in UI), `false` (silent validation)

**Example:**
```js
const strictly = new Strictly('#my-form');
const result = await strictly.validate();
console.log(result.isValid, result.errors, result.values);
```

### Static: registerValidator(ruleName, fn)
- **Registers a global custom validator.**
- **fn**: `(value, field, options) => boolean | { valid, corrected } | Promise<boolean|{valid,corrected}>`

**Example:**
```js
Strictly.registerValidator('even', value => Number(value) % 2 === 0);
```

### Static: registerErrorMessage(ruleName, msg)
- **Registers a global custom error message for a rule.**

**Example:**
```js
Strictly.registerErrorMessage('even', 'Value must be an even number!');
```

### Form-Level Callbacks: onValidate, onSuccess, onError
- **onValidate(result):** Called after every validation (manual or automatic), with `{ isValid, values, errors }`.
- **onSuccess(result):** Called if the form is valid. **StrictlyJS never submits the form natively.** Use this callback to send data via AJAX or custom logic. If you want native submission, call `form.submit()` manually (not recommended for AJAX flows).
- **onError(result):** Called if the form is invalid.

**Example (AJAX in onSuccess):**
```js
const form = document.getElementById('my-form');
const strictly = new Strictly('#my-form', {
  onSuccess: (result) => {
    // Send data via AJAX
    fetch('/your-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.values)
    })
    .then(res => res.json())
    .then(data => {
      // handle success
    })
    .catch(err => {
      // handle error
    });
    // If you want native submission (not recommended for AJAX):
    // form.submit();
  }
});
```

---

## Validation Rules (HTML Attribute Reference)
| Attribute | Description | Example |
|-----------|-------------|---------|
| `required` / `data-strictly-required` | Field is required | `<input required>` |
| `data-strictly-type="email"` | Email format | `<input data-strictly-type="email">` |
| `data-strictly-type="number"` | Number (decimals allowed) | `<input data-strictly-type="number">` |
| `data-strictly-type="integer"` | Integer only | `<input data-strictly-type="integer">` |
| `data-strictly-type="digits"` | Digits only | `<input data-strictly-type="digits">` |
| `data-strictly-type="alphanum"` | Letters and numbers | `<input data-strictly-type="alphanum">` |
| `data-strictly-type="alphanumspace"` | Letters, numbers, spaces | `<input data-strictly-type="alphanumspace">` |
| `data-strictly-type="alphanumstrict"` | Must contain both letters and numbers | `<input data-strictly-type="alphanumstrict">` |
| `data-strictly-type="url"` | URL or mailto: | `<input data-strictly-type="url">` |
| `type="date"` | Date | `<input type="date">` |
| `type="time"` | Time | `<input type="time">` |
| `data-strictly-datetime` | Custom date/time format | `<input data-strictly-datetime="YYYY-MM-DD HH:mm">` |
| `minlength` / `data-strictly-minlength` | Minimum length | `<input data-strictly-minlength="5">` |
| `maxlength` / `data-strictly-maxlength` | Maximum length | `<input data-strictly-maxlength="20">` |
| `data-strictly-length="[min,max]"` | Length range | `<input data-strictly-length="[3,8]">` |
| `min` / `data-strictly-min` | Minimum value | `<input data-strictly-min="5">` |
| `max` / `data-strictly-max` | Maximum value | `<input data-strictly-max="100">` |
| `data-strictly-range="[min,max]"` | Value range | `<input data-strictly-range="[10,50]">` |
| `data-strictly-pattern` | Regex pattern | `<input data-strictly-pattern="^\d{3}-\d{2}-\d{4}$">` |
| `data-strictly-password` | Password rules | `<input data-strictly-password="alpha:caps,num,min=6">` |
| `data-strictly-mincheck` | Min checked checkboxes | `<input type="checkbox" name="group" data-strictly-mincheck="2">` |
| `data-strictly-maxcheck` | Max checked checkboxes | `<input type="checkbox" name="group" data-strictly-maxcheck="3">` |
| `data-strictly-check="[min,max]"` | Checkbox range | `<input type="checkbox" name="group" data-strictly-check="[1,3]">` |
| `data-strictly-equalto` | Must match another field | `<input data-strictly-equalto="#other">` |
| `data-strictly-minwords` | Min word count | `<input data-strictly-minwords="3">` |
| `data-strictly-maxwords` | Max word count | `<input data-strictly-maxwords="10">` |
| `data-strictly-words="[min,max]"` | Word count range | `<input data-strictly-words="[2,5]">` |
| `data-strictly-mincharacters` | Min characters | `<input data-strictly-mincharacters="3">` |
| `data-strictly-maxcharacters` | Max characters | `<input data-strictly-maxcharacters="12">` |
| `data-strictly-characters="[min,max]"` | Character range | `<input data-strictly-characters="[5,20]">` |
| `data-strictly-minselect` | Min select options | `<select multiple data-strictly-minselect="2">` |
| `data-strictly-maxselect` | Max select options | `<select multiple data-strictly-maxselect="5">` |
| `data-strictly-select="[min,max]"` | Select range | `<select multiple data-strictly-select="[1,3]">` |
| `data-strictly-custom` | Custom validator | `<input data-strictly-custom="even">` |
| `data-strictly-initialnospace` | Must not start with a space | `<input data-strictly-initialnospace>` |
| `data-strictly-singlespace` | Only single spaces allowed between words | `<input data-strictly-singlespace>` |
| `data-strictly-filetype` | Allowed file types/extensions (comma-separated, e.g. image/png,.jpg) | `<input type="file" data-strictly-filetype="image/png,.jpg">` |
| `data-strictly-filesize` | Max file size in bytes | `<input type="file" data-strictly-filesize="1048576">` |
| `data-strictly-filecount` | Min/max number of files (multi) | `<input type="file" multiple data-strictly-filecount="[1,3]">` |

---

## Error Handling & Display
- **First error only:** Default, shows only the first error per field.
- **All errors:** Set `errorReturnType: 'all'` to show all errors (joined by `<br>` in UI, array in API).
- **Custom error placement:** Use `errorMessagePosition` and `errorTag` for full control.
- **Per-field custom error message:** Use `data-strictly-message="Your message"` on any field.
- **Styling:**
  ```css
  .strictly-validation-error { border: 1px solid #e74c3c; }
  .strictly-validation-success { border: 1px solid #2ecc71; }
  .strictly-error-message.filled { color: #e74c3c; font-size: 0.95em; }
  ```

---

## Micro-Examples

### 1. Validate a form and get errors (async/await)
```js
const strictly = new Strictly('#form');
const result = await strictly.validate();
console.log(result.errors);
```

### 2. Validate a form and get errors (.then())
```js
const strictly = new Strictly('#form');
strictly.validate().then(result => {
  console.log(result.errors);
});
```

### 3. Register a synchronous custom validator
```js
Strictly.registerValidator('even', value => Number(value) % 2 === 0);
Strictly.registerErrorMessage('even', 'Value must be an even number!');
```

### 4. Register an async custom validator
```js
Strictly.registerValidator('username-available', async value => {
  await new Promise(res => setTimeout(res, 500));
  return value !== 'taken';
});
Strictly.registerErrorMessage('username-available', 'Username is already taken!');
```

### 5. Use custom validator in HTML
```html
<input type="text" data-strictly-custom="even" required>
<input type="text" data-strictly-custom="username-available" required>
```

### 6. Validate and show all errors per field
```js
const strictly = new Strictly('#form', { errorReturnType: 'all' });
const result = await strictly.validate();
console.log(result.errors); // errors.message is an array
```

### 7. Use restrict: 'oninput' for live correction
```js
const strictly = new Strictly('#form', { restrict: 'oninput' });
```

### 8. Custom error message per field
```html
<input type="text" name="username" required data-strictly-message="Please enter your username!">
```

### 9. Debounced live validation (smoother UX)
```js
const strictly = new Strictly('#form', { restrict: 'oninput', debounce: 300 }); // 300ms debounce
```

### 10. File input validation
```html
<input type="file" name="avatar" data-strictly-filetype="image/png,.jpg" data-strictly-filesize="1048576" required>
<input type="file" name="docs" multiple data-strictly-filecount="[1,3]" data-strictly-filetype="application/pdf" data-strictly-filesize="2097152">
```
- `data-strictly-filetype`: Allowed MIME types (e.g. image/png) or extensions (e.g. .jpg), comma-separated.
- `data-strictly-filesize`: Max file size in bytes (e.g. 1048576 for 1MB).
- `data-strictly-filecount`: Min/max number of files (e.g. [1,3] for 1 to 3 files).

### 11. Custom error placement (summary at top)
```js
const summaryDiv = document.getElementById('summary-errors');
const strictly = new Strictly('#form', {
  errorPlacement: (field, errorEl, msg) => {
    if (errorEl.parentElement && errorEl.parentElement !== summaryDiv) {
      errorEl.parentElement.removeChild(errorEl);
    }
    if (msg) {
      errorEl.innerHTML = msg;
      if (!summaryDiv.contains(errorEl)) summaryDiv.appendChild(errorEl);
    } else {
      if (summaryDiv.contains(errorEl)) summaryDiv.removeChild(errorEl);
    }
  }
});
```

---

## Cheat Sheet
- **Validate form (async):** `await strictly.validate()`
- **Register custom validator:** `Strictly.registerValidator('rule', fn)`
- **Register custom error message:** `Strictly.registerErrorMessage('rule', msg)`
- **Show all errors:** `new Strictly('#form', { errorReturnType: 'all' })`
- **Live restrict input:** `new Strictly('#form', { restrict: 'oninput' })`
- **Custom error per field:** `data-strictly-message="..."`

---

## Troubleshooting & FAQ
- **Q: Why do I get undefined or errors from validate()?**
  - A: Always use `await` or `.then()` with `validate()`. It returns a Promise.
- **Q: How do I make a custom validator async?**
  - A: Return a Promise or use `async` in your validator function.
- **Q: Can I use both sync and async validators?**
  - A: Yes, StrictlyJS will await all checks.
- **Q: How do I show a custom error for a field?**
  - A: Use `data-strictly-message="..."` on the input.
- **Q: How do I validate only after submit?**
  - A: Use `initError: false` in options.
- **Q: How do I style errors?**
  - A: Use the provided CSS classes or override them.

---

## Migration & Extensibility
- The `validate()` API is now always async and returns a Promise, even for synchronous validation. Update your code to use `await` or `.then()` when calling `validate()`.
- All extensibility is now via the Strictly class (no separate validators.js needed).
- For advanced use cases, extend Strictly or contribute to the project!

---

## License
MIT

