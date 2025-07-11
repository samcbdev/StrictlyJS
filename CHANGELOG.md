# StrictlyJS Changelog

## [2.0.1] - 2025-07-11
### Added
- **Initial No Space Validation:** New built-in rule `data-strictly-initialnospace` ensures input does not start with a space. Auto-corrects in `restrict: 'oninput'` mode.
- **Single Space Between Words Validation:** New built-in rule `data-strictly-singlespace` ensures only single spaces are allowed between words. Auto-corrects in `restrict: 'oninput'` mode.
- **Custom Validator Auto-Correction:** Custom validators can now return `{ valid: boolean, corrected: string }` to support auto-correction in `restrict: 'oninput'` mode. Documented in README with example.
- **Async Validation Support:** The `validate()` API is now always async and returns a Promise, even if all validators are synchronous. All validation code must use `await` or `.then()` to get results.
- **Debounced Live Validation:** New `debounce` option (in ms) for live validation. When set, input validation is debounced for smoother UX and better performance. Documented in README with example.
- **File Input Validation:** Added support for file input validation via `data-strictly-filetype` (allowed types/extensions), `data-strictly-filesize` (max size in bytes), and `data-strictly-filecount` (min/max files). Documented in README with micro-examples.
- **Robust Custom Error Placement:**
  - The `errorPlacement` callback option is now fully robust: StrictlyJS always creates an error element for each field and assigns it a unique id, even if `errorPlacement` is used.
  - The callback is responsible for placing the error element in the DOM, but the element will always be accessible by id for updates and clearing.
  - The callback should ensure the error element remains in the DOM for as long as errors need to be shown. If removed, StrictlyJS will re-create it as needed.
  - This makes custom error placement fully compatible with StrictlyJS's internal update logic and enables advanced summary/error aggregation patterns.
- **Form Submission Behavior:**
  - StrictlyJS no longer submits forms natively on successful validation. The `onSuccess` callback is now the only place to handle what happens next (AJAX, custom logic, etc.).
  - If you want native submission, you must call `form.submit()` manually in `onSuccess` (not recommended for AJAX flows).
  - This change is documented in the README with a clear AJAX example.

### Improved
- Required error messages are now only shown after the first focus, input, or blur, or on submit/API call. This improves UX by not showing errors on initial focus.
