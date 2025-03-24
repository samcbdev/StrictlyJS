# **Introduction**

## **Overview of Strictly.Js**

**#Strictly.js** (Client-Side Form Validation)

Strictly.js is a lightweight JavaScript library designed to simplify
client-side form validation. It allows developers to define validation
rules directly within HTML markup using ***data-strictly-\****
attributes. The library offers real time validation, error message
customization, and dynamic form handling, making it a versatile solution for form validation needs.


## **Key Features**

**HTML Attribute-Based Validation:** Define validation rules directly in
HTML using **data-strictly** attributes.

**Validation Triggering:** Supports two modes:

1.  **OnInput:** Validates fields as users type and restrict invalid
    characters.

2.  **Showerror:** Displays errors but does not restrict user input.

**Customizable Error Message Placement:** Control where error messages
appear relative to the input field.

**Support for Various Input Types:** Validate text, emails, numbers,
checkboxes, radio buttons, text areas, and select elements.

**Regular Expression and Password Validation:** Validate inputs using
regex patterns and enforce password complexity rules.

**Checkbox and Select Validation:** Set minimum and maximum selection
requirements.

**Word and Character Count Validation:** Enforce length constraints on
text inputs and text areas.

**Equal To Validation:** Ensure one field matches another.

**Dynamic Form Handling:** Automatically initialize validation for
dynamically added form elements.


# **Installation and Setup**

To use Strictly.js, include the `strictly.js` file in your HTML,
preferably before the closing **`</body>`** tag:

```html 
<script src="https://cdn.jsdelivr.net/gh/samcbdev/StrictlyJS/strictly.js"></script>
```

Or 

```html 
<script src="https://cdn.jsdelivr.net/gh/samcbdev/StrictlyJS/strictly.min.js"></script>
```

## **Initializing Strictly.Js**

You must initialize the **`Strictly`** class by selecting a target
element:

```javascript 
const validator = new Strictly('.form'); // Target a form with class 'Form'
```

You can also target other elements:

```javascript
const validator = new Strictly('#my-div'); // Target a div with ID 'my-div'
const validator = new Strictly('.email'); // Target a specific input field
```

## **Configuration and Customization**

You can pass an options object to modify validation behavior:

```javascript
var validator = new Strictly('.form', {
restrict: 'oninput',
errorMessagePosition: 'down',
errorTag: 'div'
});
```


## **Handling Dynamic Form Elements**

Strictly.js supports validation for dynamically added fields:

```javascript
setTimeout(() => {
    const formContainer = document.querySelector('.form');
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.name = 'dynamicInput';
    newInput.placeholder = 'Enter text here...';
    newInput.setAttribute("maxlength", "6");
    newInput.required = true;
    formContainer.appendChild(newInput);
}, 2000);
```


##  **Validation Options**


**<span class="mark">restrict</span>**: The restrict option determines
when validation messages should appear during user input. It offers two
modes:

1.  **showerror**: In showerror mode, validation errors are displayed
    while typing, but the user can continue entering input without
    restrictions.

2.  **oninput**: In oninput mode, validation errors are displayed in
    real time and invalid input is restricted as the user types.

**errorTag**: HTML tag for error messages (`'p'` by default, can be `'div'`).

**errorMessagePosition**: Controls error message placement (`'down'`
for after the input, `'up'` for before, `'custom'` for a specific
parent element).

**errorCustomClass**: CSS class required when `errorMessagePosition`
is set to `'custom'`.

**initError:** Show error immediately on input default `true`, if we set
`false`, it means forms won’t show the initial error. Start showing once
the form is submitted. After that, it shows oninput errors.


# **HTML Attribute-Based Validation**

| Attributes | Description | Example Usage |
| --- | --- | --- |
| **Required Fields** |  |  |
| `required` / `data-strictly-required` | Marks the field as required, unless explicitly set to "false". | `<input type="text" required>` `<input type="text" data-strictly-required="true">` |
| `data-strictly-required="false"` | Makes a field not required, even if required is present. | `<input type="text" data-strictly-required="false">` |
| **Format Validations** |  |  |
| `type="email"` / `data-strictly-type="email"` | Validate email format (e.g., user@example.com). | `<input type="text" data-strictly-type="email">` |
| `data-strictly-type="number"` | Allows negative and decimal numbers. | `<input type="text" data-strictly-type="number">` |
| `type="number"` / `data-strictly-type="integer"` | Allows only negative and whole numbers. | `<input type="text" data-strictly-type="integer">` |
| `data-strictly-type="digits"` | Allows only positive whole numbers. | `<input type="text" data-strictly-type="digits">` |
| `data-strictly-type="alphanum"` | Allows only letters and numbers. | `<input type="text" data-strictly-type="alphanum">` |
| `data-strictly-type="alphanumspace"` | Allows letters, numbers, and spaces. | `<input type="text" data-strictly-type="alphanumspace">` |
| `data-strictly-type="alphanumstrict"` | Ensures both letters and numbers are present. | `<input type="text" data-strictly-type="alphanumstrict">` |
| `type="url"` / `data-strictly-type="url"` | Validates URLs or mailto:user@example.com | `<input type="text" data-strictly-type="url">` |
| **Date & Time Validations** |  |  |
| `type="date"` | Allows only date values. | `<input type="date">` |
| `type="time"` | Allows only time values. | `<input type="time">` |
| `data-strictly-datetime` | Validates date/time format: YYYY-MM-DD, DD-MM-YYYY, YYYY-MM-DD HH:mm, DD-MMM-YYYY HH:mm, HH:mm. | `<input type="text" data-strictly-datetime="YYYY-MM-DD HH:mm">` |
| **Length Validations** |  |  |
| `minlength` / `data-strictly-minlength` | Ensures minimum character length. | `<input type="text" data-strictly-minlength="5">` |
| `maxlength` / `data-strictly-maxlength` | Ensures maximum character length. | `<input type="text" data-strictly-maxlength="20">` |
| `data-strictly-length="[min, max]"` | Ensures length is within range. | `<input type="text" data-strictly-length="[3,8]">` |
| **Numerical Range Validations** |  |  |
| `min` / `data-strictly-min` `max` / `data-strictly-max` `data-strictly-range="[min, max]"` | Ensures value is greater than or equal to min. Ensures value is less than or equal to max Ensures value is within a specific numerical range. | `<input type="number" data-strictly-min="5">` `<input type="number" data-strictly-max="100">` `<input type="number" data-strictly-range="[10,50]">` |
| **Pattern Validations** |  |  |
| `data-strictly-pattern="regex"` | Ensures input follows a specific pattern. | `<input type="text" data-strictly-pattern="^\\d{3}-\\d{2}-\\d{4}$">` |
| **Password Validation** |  |  |
| `data-strictly-password` | Ensures password follows specific rules (e.g., alpha: caps, num, min=6). | `<input type="password" data-strictly-password="alpha:caps, num, min=6 max=10">` `<input type="checkbox" name="terms">` |
| **Checkbox Validations** |  |  |
| `data-strictly-mincheck="N"` | Ensures at least N checkboxes are checked. Checkboxes are grouped based on their name attribute. | `<input type="checkbox" name="data-strictly-mincheck="1">` |
| `data-strictly-maxcheck="N"` | Ensures at most N checkboxes are checked. Checkboxes are grouped based on their name attribute. | `<input type="checkbox" name="options" data-strictly-maxcheck="3">` |
| `data-strictly-check="[min, max]"` | Ensures checkboxes fall within range. Checkboxes are grouped based on their name attribute. | `<input type="checkbox" name="choices" data-strictly-check="[1,3]">` |
| **Field Comparison** |  |  |
| `data-strictly-equalto="selector"` | Ensures input matches another field's value. | `<input type="password" id="pass1">` `<input type="password" data-strictly-equalto="#pass1">` |
| **Word Count Validations** |  |  |
| `data-strictly-minwords="N"` | Ensures at least N words. | `<input type="text" data-strictly-minwords="3">` |
| `data-strictly-maxwords="N"` | Ensures at most N words. | `<input type="text" data-strictly-maxwords="10">` |
| `data-strictly-words="[min, max]"` | Ensures word count falls within a range. | `<input type="text" data-strictly-words="[2,5]">` |
| **Character Count Validations** |  |  |
| `data-strictly-mincharacters="N"` `data-strictly-maxcharacters="N"` `data-strictly-characters="[min, max]"` | Ensures at least N characters. Ensures at most N characters. Ensures character count falls within a range. | `<input type="text" data-strictly-mincharacters="3">` `<input type="text" data-strictly-maxcharacters="12">` `<input type="text" data-strictly-characters="[5,20]">` |
| **Select Validations** |  |  |
| `data-strictly-minselect="N"` | Ensures at least N selections in a multi-select field. | `<select multiple data-strictly-minselect="2">` |
| `data-strictly-maxselect="N"` | Ensures at most N selections. | `<select multiple data-strictly-maxselect="5">` |
| `data-strictly-select="[min, max]"` | Ensures selections fall within a range. | `<select multiple data-strictly-select="[1,3]">` |


# **API and Public Method**


Strictly.js provides the following public method:

**\`validate(options = {})\`**

Strictly.JS provides an API with a public method that manually triggers validation for all targeted elements. When **formError** is set to true, validation errors are displayed on the corresponding input elements; when set to false, errors are not shown.

```javascript
let validator = new Strictly('.div-group');
var result = validator.validate({ formError: false });
console.log(result);

{
    "isValid": false,
    "errors": [
        {
            "field": "field1",
            "messages": ["field1 is required."]
        },
        {
            "field": "field2", 
            "messages": [
                "field2 is required.",
                "field2 must be a valid URL or an email with 'mailto:' prefix."
            ]
        }
    ],
    "values": {
        "field1": "",
        "field2": ""
    }
}
```


# **CSS implementation**


Customize the appearance of form validation states using CSS. By
applying predefined classes, you can style input fields and error
messages to enhance user experience.


### **Default CSS Classes in Strictly.js**


**Strictly.js** provides built-in classes for validation errors, success states, and error messages. You can customize these styles to match your design.

```
<style>
.strictly-validation-error {
    border: 1px solid #FF0000;
}
.strictly-validation-success {
    border: 1px solid #00FF00;
}
.strictly-error-message {
    font-size: 12px;
    color: #FF0000;
    font-weight: 500;
    text-transform: capitalize;
    margin: 4px 0;
}
</style>
```


# **Example Implementation**


```html
<form class="form">
<label for="email">Email:</label>
<input id="email" type="email" name="email" required>
<button type="submit">Submit</button>
</form>

<div id=”wrap”>
<label for="email">Email:</label>
<input id="email" type="email" name="email" required>
</div>

```
```javascript</p>
var formValidator = new Strictly('.form', { restrict: 'oninput' });

let validDiv = new Strictly('.wrap');
document.querySelector('#button).addEventListener('click', (e) => {
    var validationResult = validDiv.validate({ formError: false });
    console.log(validationResult);
});
```


# **Conclusion**

**Strictly.js** enhances client-side form validation by providing an
intuitive, attribute-based approach, and flexible configuration options. With real-time validation, dynamic form handling, and customizable errormessages, it ensures a seamless and user-friendly validation experience. Whether enforcing input restrictions or validating complex form structures, Strictly.js simplifies the process while maintaining efficiency and accuracy.

