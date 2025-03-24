/**
 * StrictlyJS - Custom JavaScript Form Validation Library
 * Author: Samcbdev
 * License: MIT
 * Created: 2025
 * Version: 1.0.0
 * Repository: https://github.com/samcbdev/StrictlyJS
 * Description: A strict form validation library to enforce real-time input constraints.
 */

'use strict'
class Strictly
{
	#target;
	#options;
	#defaultOptions;
	#initError = false;
	
	constructor(target, options = {}) {
		this.#target = target; // field, form, div

		if (this.#target == null || this.#target == '') {
			console.error('Target element is not found');
			return ;
		}

		this.#defaultOptions = Object.freeze({
			restrict: 'showerror', // Allowed values: 'showerror', 'oninput'
			fieldErrorClass: 'strictly-validation-error',
			fieldSuccessClass: 'strictly-validation-success',
			errorClass: 'strictly-error-message',
			errorTag: 'p', // Allowed values: 'p', 'div'
			errorMessagePosition: 'down', // Allowed values: 'down', 'up', 'custom'
			errorCustomClass: null, // Depends on errorMessagePosition
			initError: true, // Show error immediately on input
			// placeholderMask: false,
			// customValidators: {},
			// customErrorMessages: {}
		});

		this.#options = {...this.#defaultOptions, ...options};

		// Explicitly enforce immutability for required fields
		Object.assign(this.#options, {
			fieldErrorClass: this.#defaultOptions.fieldErrorClass,
			fieldSuccessClass: this.#defaultOptions.fieldSuccessClass,
			errorClass: this.#defaultOptions.errorClass
		});

		// Validate `restrict`
        if (!['showerror', 'oninput'].includes(this.#options.restrict)) {
            console.error(`Invalid value for 'restrict': ${this.#options.restrict}. Allowed values: 'showerror', 'oninput'`);
            return;
        }

        // Validate `errorMessagePosition`
        if (!['down', 'up', 'custom'].includes(this.#options.errorMessagePosition)) {
            console.error(`Invalid value for 'errorMessagePosition': ${this.#options.errorMessagePosition}. Allowed values: 'down', 'up', 'custom'`);
            return;
        }

        // Validate `errorCustomClass` if`errorMessagePosition` is 'custom'
		if (this.#options.errorMessagePosition === 'custom') {
		    if (!this.#options.errorCustomClass || typeof this.#options.errorCustomClass !== 'string') {
		        console.error(`Invalid or missing 'errorCustomClass'. It must be a valid class name.`);
		        return;
		    }

		    // Ensure it's a valid CSS class name (letters, numbers, underscores, dashes)
		    const validClassNameRegex = /^[a-zA-Z0-9_-]+$/;
		    if (!validClassNameRegex.test(this.#options.errorCustomClass)) {
		        console.error(`Invalid class name '${this.#options.errorCustomClass}'. Class names can only contain letters, numbers, underscores (_), and dashes (-).`);
		        return;
		    }
		}

		// Validate `errorTag`
        if (!['p', 'div'].includes(this.#options.errorTag)) {
            console.error(`Invalid value for 'errorTag': ${this.#options.errorTag}. Allowed values: 'p', 'div'`);
            return;
        }

		this.#init();
		this.#observeMutations();
	}

	#init() {
	    document.querySelectorAll(this.#target).forEach((target) => this.#initNode(target));
	}

	#observeMutations() {
		if (this.observer) return;

	    this.observer = new MutationObserver((mutations) => {
	        mutations.forEach((mutation) => {
	            mutation.addedNodes.forEach((node) => {
	                if (node.nodeType === 1) { // Ensure it's an element
	                    if (node.matches('input, textarea, select')) {
	                        this.#processField(node);
	                    } else if (node.matches(this.#target)) {
	                        this.#initNode(node); // Only initialize this new node, not the entire document
	                    } else {
	                        // Ifa div/container was added, check its children
	                        node.querySelectorAll('input, textarea, select').forEach((field) => {
	                            this.#processField(field);
	                        });
	                    }
	                }
	            });
	        });
	    });

	    this.observer.observe(document.body, { childList: true, subtree: true });
	}

	#initNode(target) {
	    if (target.tagName.toLowerCase() === 'form') {
	        target.setAttribute('novalidate', '');

	        target.querySelectorAll('input, textarea, select').forEach((field) => this.#processField(field, "form"));

	        target.addEventListener('submit', (e) => {
	            e.preventDefault();
	            
	            if (!this.#initError) {
	                this.#initError = true;
	                // After the first submit, enable live validation
	                target.querySelectorAll('input, textarea, select').forEach(field => this.#addFieldListeners(field, "form"));
	            }

	            if (this.#validateForm(e, target)) {
	            	target.submit();
	            }
	        }, true);
	    } else if (['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())) {
	        this.#processField(target, "direct");
	    } else if (target.tagName.toLowerCase() === 'div') {
	        target.querySelectorAll('input, textarea, select').forEach((field) => this.#processField(field, "div"));
	    }
	}

	#processField(field, source = null) {
	    if (!field.hasAttribute('data-strictly-connector')) {
	        if (field.type === 'checkbox') {
	            let groupName = field.getAttribute('name');
	            let firstCheckbox = document.querySelector(`input[name="${groupName}"]`);
	            if (!firstCheckbox.hasAttribute('data-strictly-connector')) {
	                let uniqueConnector = groupName + (Math.random() * 1e16).toString(36);
	                document.querySelectorAll(`input[name="${groupName}"]`).forEach(cb => {
	                    cb.setAttribute('data-strictly-connector', uniqueConnector);
	                });
	            }
	        } else {
	            field.setAttribute('data-strictly-connector', field.name + (Math.random() * 1e16).toString(36));
	        }
	    }

	    this.#createErrorElement(field);

	    // If initError is enabled, always add event listeners
	    if (this.#options.initError) {
	        this.#addFieldListeners(field, source);
	    } else {
	        // If initError is false, add event listeners only after the first submit
	        if (this.#initError) {
	            this.#addFieldListeners(field, source);
	        }
	    }
	}

	#addFieldListeners(field, source = null) {
	    ['input', 'focus', 'blur'].forEach(event => {
	        field.addEventListener('input', () => {
	            let result = this.#validateField(field);
	            if(source == "direct") {
	            	// console.log(result, source == 'direct');
	            }
	        });
	    });
	}

	#createErrorElement(field) {

		// Check ifan error element already exists for this field
	    if (document.getElementById(field.getAttribute('data-strictly-connector'))) {
	        return; // Avoid duplicate error elements
	    }

		if (field.type === 'checkbox') {
			let groupName = field.getAttribute('name');
			let firstCheckbox = document.querySelector(`input[name="${groupName}"]`);

			// Check ifan error element already exists
	        if (document.getElementById(field.getAttribute('data-strictly-connector'))) {
	            return; // Avoid duplicate error elements
	        }
		}

		// error element
		let errorTag = document.createElement(this.#options.errorTag);
		errorTag.classList.add(this.#options.errorClass);
		errorTag.setAttribute('id', field.getAttribute('data-strictly-connector'));

		switch (this.#options.errorMessagePosition) {
		case 'down':
			field.insertAdjacentElement('afterend', errorTag);
			break;
		case 'up':
			field.insertAdjacentElement('beforebegin', errorTag);
			break;
		case 'custom':
            if (this.#options.errorCustomClass) {
	            errorTag.classList.add(this.#options.errorCustomClass);
	        }
            field.parentElement.appendChild(errorTag);
		default:
			if (field.parentElement) {
                field.parentElement.appendChild(errorTag);
            }
			break;
		}
		// error element
	}

	validate(options = {}) {
		let isFormError = options.formError ?? false;
		let isValid = true;
		let errors = [];
		let values = {};

		document.querySelectorAll(this.#target).forEach(target => {
	        let fields = ['input', 'textarea', 'select'].includes(target.tagName.toLowerCase()) 
	            ? [target] 
	            : target.querySelectorAll('input, textarea, select');

	        fields.forEach(field => {
	            let result = this.#validateField(field, isFormError);
	            values[field.name] = result.value; // Store field value

	            if (result.error.length > 0) { // ✅ Only push if there are errors
	                errors.push({ field: field.name, message: result.error });
	            }
	        });
	    });

		return { isValid: errors.length === 0, values, errors };
	}

	#validateForm(e, target) {
		let isValid = true;

		target.querySelectorAll('input, textarea, select').forEach(field => {
			this.#clearError(field);

			let validate = this.#validateField(field);
			if (validate && !validate.isValid) {
				isValid = false
			}
		});

		if (!isValid) {
			e.preventDefault();
		}

		return isValid;
	}

	#validateField(field, isValidator = true) {
		let isValid = true;
		let error = [];

		if ((field.hasAttribute('required') || field.hasAttribute('data-strictly-required')) && (field.getAttribute('data-strictly-required') !== "false") && !field.value.trim()) {
			let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';

			if (field.type === 'email') {
		        error.push(`${fieldLabel} is required. Please enter a valid email address.`);
		    } else if (field.type === 'password') {
		        error.push(`${fieldLabel} is required. Please enter a password.`);
		    } else if (field.type === 'checkbox' || field.type === 'radio') {
		        error.push(`Please select at least one option for ${fieldLabel}.`);
		    } else {
		        error.push(`${fieldLabel} is required.`);
		    }

			isValid = false;
		}

		if (field.getAttribute('data-strictly-required') == "false" && !field.value.trim()) {
			isValid = true;
		}

		if (((field.getAttribute('type') == "email") || (field.getAttribute('data-strictly-type') == "email")) && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(field.value)) {
			let fieldLabel = field.getAttribute('aria-label') || field.name || 'Email';
			error.push(`${fieldLabel} must be a valid email address.`);
			isValid = false;
		}

		if ((field.getAttribute('data-strictly-type') == "number") && isNaN(Number(field.value))) {
			if (this.#options.restrict == 'oninput') {
				field.value = field.value.replace(/[^0-9.]/g, '');

				let parts = field.value.split('.');
				if (parts.length > 2) {
					field.value = parts[0] + '.' + parts.slice(1).join('');
				}
			}
			
			let fieldLabel = field.getAttribute('aria-label') || field.name || 'Value';
			error.push(`${fieldLabel} must be a valid number.`);
			isValid = false;
		}

		if (((field.getAttribute('type') == "number") || (field.getAttribute('data-strictly-type') == "integer")) && !Number.isInteger(Number(field.value))) {
			if (this.#options.restrict == 'oninput') {
				field.value = field.value.replace(/[^0-9-]/g, '');

				if (field.value.includes('-')) {
		            field.value = '-' + field.value.replace(/-/g, '');
		        }

		        field.value = field.value.replace(/^(-?)0+(\d)/, '$1$2');
			}

			if (field.value.trim() !== "" && !Number.isInteger(Number(field.value))) {
		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'Value';
    			error.push(`${fieldLabel} must be a whole number.`);
		        isValid = false;
		    }
		}

		if ((field.getAttribute('data-strictly-type') == "digits") && !/^\d+$/.test(field.value)) {
			if (this.#options.restrict == 'oninput') {
				field.value = field.value.replace(/\D/g, '');
			}

			let fieldLabel = field.getAttribute('aria-label') || field.name || 'Value';
    		error.push(`${fieldLabel} must contain only digits.`);
			isValid = false;
		}

		if ((field.getAttribute('data-strictly-type') == "alphanum") && !/^[a-zA-Z0-9]+$/.test(field.value)) {
			if (this.#options.restrict == 'oninput') {
				field.value = field.value.replace(/[^a-zA-Z0-9]/g, '');
			}

			let fieldLabel = field.getAttribute('aria-label') || field.name || 'Value';
			error.push(`${fieldLabel} must contain only letters and numbers.`);
			isValid = false;
		}

		if ((field.getAttribute('data-strictly-type') == "alphanumspace") && !/^[a-zA-Z0-9 ]+$/.test(field.value)) {
			if (this.#options.restrict == 'oninput') {
				field.value = field.value.replace(/[^a-zA-Z0-9 ]/g, '');
			}

			let fieldLabel = field.getAttribute('aria-label') || field.name || 'Value';
    		error.push(`${fieldLabel} can only contain letters, numbers, and spaces.`);
			isValid = false;
		}

		if ((field.getAttribute('data-strictly-type') == "alphanumstrict")) {
			let sanitizedValue = field.value.replace(/[^a-zA-Z0-9]/g, '');
		    let hasLetter = /[a-zA-Z]/.test(sanitizedValue);
		    let hasNumber = /\d/.test(sanitizedValue);

		    if (this.#options.restrict === 'oninput') {
		        field.value = sanitizedValue;
		    }

		    if (!(hasLetter && hasNumber)) {
		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'Value';
    			error.push(`${fieldLabel} must contain at least one letter and one number.`);
		        isValid = false;
		    }
		}

		if (((field.getAttribute('type') === "url") || (field.getAttribute('data-strictly-type') === "url")) && !/^(https?|ftp):\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}([\/?#].*)?$|^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(field.value)) {
		    if (this.#options.restrict === 'oninput') {
		        field.value = field.value.replace(/[^a-zA-Z0-9:/?&=._@+-]/g, '');
		        field.value = field.value.replace(/\.{2,}/g, '.');
		    }
		    
		    let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';
    		error.push(`${fieldLabel} must be a valid URL or an email with 'mailto:' prefix.`);
		    isValid = false;
		}

		if (field.getAttribute('type') === "date" && !field.hasAttribute('data-strictly-datetime')) {
		    let value = field.value.trim();
		    let isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(value); // Check YYYY-MM-DD format

		    if (this.#options.restrict === 'oninput') {
		        field.value = field.value.replace(/[^0-9-]/g, ''); // Allow only numbers and "-"
		    }

		    if (!isValidDate) {
		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'Date';
		        error.push(`${fieldLabel} must be a valid date (YYYY-MM-DD).`);
		        isValid = false;
		    }
		}

		if (field.getAttribute('type') === "time" && !field.hasAttribute('data-strictly-datetime')) {
		    let value = field.value.trim();
		    let isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(value); // Matches HH:MM (24-hour format)

		    if (this.#options.restrict === 'oninput') {
		        field.value = field.value.replace(/[^0-9:]/g, ''); // Allow only numbers and ":"
		    }

		    if (!isValidTime) {
		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'Time';
		        error.push(`${fieldLabel} must be a valid time (HH:MM, 24-hour format).`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-datetime')) {
		    const format = field.getAttribute('data-strictly-datetime');

		    const dateTimeObj = {
		    	'YYYY-MM-DD': {
			        regex: /^(\d{4})-(\d{2})-(\d{2})$/,
			        partialRegex: /^(\d{0,4})-?(\d{0,2})?-?(\d{0,2})?$/,
			        validate: function(value) {
			            const match = value.match(this.regex);
			            // const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
			            if (!match) return false;
			            const [_, year, month, day] = match.map(Number);
			            return isValidDate(year, month, day);
			        },
					formatPartial: function(newValue) {
					    if (newValue.length > 10) newValue = newValue.slice(0, -1);

			            let match = newValue.match(this.partialRegex);
			            if (!match) return '';

			            let [year, month, day] = match.slice(1);
			            let formatted = year || '';

			            if (year?.length === 4) formatted += '-';
			            if (month) formatted += month;
			            if (month?.length === 2) formatted += '-';
			            if (day) formatted += day;

			            return formatted.replace(/-$/, ''); // Ensure no trailing '-'
					}
			    },
			    'DD-MM-YYYY': {
			        regex: /^(\d{2})-(\d{2})-(\d{4})$/,
			        partialRegex: /^(\d{0,2})-?(\d{0,2})?-?(\d{0,4})?$/,
			        validate: function(value) {
			            const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
			            if (!match) return false;
			            const [_, day, month, year] = match.map(Number);
			            return isValidDate(year, month, day);
			        },
			        formatPartial: function(newValue) {
			        	if (newValue.length > 10) newValue = newValue.slice(0, -1);

			            let match = newValue.match(this.partialRegex);
			            if (!match) return '';

			            let [day, month, year] = match.slice(1);
			            let formatted = day || '';

			            if (day?.length === 2) formatted += '-';
			            if (month) formatted += month;
			            if (month?.length === 2) formatted += '-';
			            if (year) formatted += year;

			            return formatted.replace(/-$/, ''); // Ensure no trailing '-'
			        }
			    },
			    'YYYY-MM-DD HH:mm': {
			        regex: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/,
			        partialRegex: /^(\d{0,4})-?(\d{0,2})?-?(\d{0,2})? ?(\d{0,2})?:?(\d{0,2})?$/,
			        validate: function(value) {
			            const match = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
			            if (!match) return false;
			            const [_, year, month, day, hour, minute] = match.map(Number);
			            return isValidDate(year, month, day) && isValidTime(hour, minute);
			        },
			        formatPartial: function(newValue) {
			        	if (newValue.length > 14) newValue = newValue.slice(0, -1);

			            let match = newValue.match(this.partialRegex);
			            if (!match) return '';

			            let [year, month, day, hour, minute] = match.slice(1);
			            let formatted = year || '';

			            if (year?.length === 4) formatted += '-';
			            if (month) formatted += month;
			            if (month?.length === 2) formatted += '-';
			            if (day) formatted += day;
			            if (day?.length === 2) formatted += ' ';
			            if (hour) formatted += hour;
			            if (hour?.length === 2) formatted += ':';
			            if (minute) formatted += minute;

			            return formatted.replace(/[-: ]$/, ''); // Ensure no trailing '-', ':', or ' '
			        }
			    },
			    'DD-MM-YYYY HH:mm': {
			        regex: /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/,
			        partialRegex: /^(\d{0,2})-?(\d{0,2})?-?(\d{0,4})? ?(\d{0,2})?:?(\d{0,2})?$/,
			        validate: function(value) {
			            const match = value.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/);
			            if (!match) return false;
			            const [_, day, month, year, hour, minute] = match.map(Number);
			            return isValidDate(year, month, day) && isValidTime(hour, minute);
			        },
			        formatPartial: function(newValue) {
			        	if (newValue.length > 14) newValue = newValue.slice(0, -1);

			            let match = newValue.match(this.partialRegex);
			            if (!match) return '';

			            let [day, month, year, hour, minute] = match.slice(1);
			            let formatted = day || '';

			            if (day?.length === 2) formatted += '-';
			            if (month) formatted += month;
			            if (month?.length === 2) formatted += '-';
			            if (year) formatted += year;
			            if (year?.length === 4) formatted += ' ';
			            if (hour) formatted += hour;
			            if (hour?.length === 2) formatted += ':';
			            if (minute) formatted += minute;

			            return formatted.replace(/[-: ]$/, ''); // Ensure no trailing '-', ':', or ' '
			        }
			    },
			    'HH:mm': {
			        regex: /^(\d{2}):(\d{2})$/,
			        partialRegex: /^(\d{0,2}):?(\d{0,2})?$/,
			        validate: function(value) {
			            const match = value.match(/^(\d{2}):(\d{2})$/);
			            if (!match) return false;
			            const [_, hour, minute] = match.map(Number);
			            return isValidTime(hour, minute);
			        },
			        formatPartial: function(newValue) {
			        	if (newValue.length > 4) newValue = newValue.slice(0, -1);

			            let match = newValue.match(this.partialRegex);
			            if (!match) return '';

			            let [hour, minute] = match.slice(1);
			            let formatted = hour || '';

			            if (hour?.length === 2) formatted += ':';
			            if (minute) formatted += minute;

			            return formatted.replace(/:$/, ''); // Ensure no trailing ':'
			        }
			    }
		    };

		    if (!format || !dateTimeObj.hasOwnProperty(format)) {
		    	// console.error('Invalid format in data-strictly-pattern. Expected format: [YYYY-MM-DD, DD-MM-YYYY]');
		    	console.error(`Invalid date/time format: "${format}". Expected one of: ${Object.keys(dateTimeObj).join(', ')}`);
		        return;
		    }

			function isValidDate(year, month, day) {
			    if (month < 1 || month > 12) return false;
			    const daysInMonth = new Date(year, month, 0).getDate();
			    return day >= 1 && day <= daysInMonth;
			}

			function isValidTime(hour, minute) {
			    return hour >= 0 && hour < 24 && minute >= 0 && minute < 60;
			}

		    if (this.#options.restrict === 'oninput') {
		    	let oldValue = field.value;
		    	let cursorPosition = field.selectionStart;

			    let newValue = oldValue.replace(/[^0-9-]/g, '');
			    newValue = newValue.replace(/--+/g, '-');
			    field.value = newValue;
			    
			    let formattedValue = dateTimeObj[format].formatPartial(newValue);

			    if (!formattedValue.startsWith('-') && !formattedValue.endsWith('-') && !formattedValue.endsWith(':')) {
			        field.value = formattedValue;
			    }
		    }

		    if (!dateTimeObj[format].regex.test(field.value) || !dateTimeObj[format].validate(field.value)) {
		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'Date';
		        error.push(`${fieldLabel} must be in the correct ${format} format.`);
		        isValid = false;
		    }
		}

		if (field.getAttribute('minlength') || field.hasAttribute('data-strictly-minlength')) {
			let minLength = (field.getAttribute('minlength') || field.getAttribute('data-strictly-minlength'));
			
			if (parseInt(field.value.length, 10) < parseInt(minLength, 10)) {
				let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';
    			error.push(`${fieldLabel} must be at least ${minLength} characters long.`);
				isValid = false;
			}
		}

		if (field.getAttribute('maxlength') || field.hasAttribute('data-strictly-maxlength')) {
			let maxLength = (field.getAttribute('maxlength') || field.getAttribute('data-strictly-maxlength'));
			
			if (parseInt(field.value.length, 10) > parseInt(maxLength, 10)) {
				if (this.#options.restrict === 'oninput') {
			        field.value = field.value.substring(0, maxLength);
			    }

				let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';
    			error.push(`${fieldLabel} must not exceed ${maxLength} characters.`);
				isValid = false;
			}
		}

		if (field.hasAttribute('data-strictly-length')) {
			let lengthRange = field.getAttribute('data-strictly-length');

		    let match = lengthRange.match(/^\[\s*(\d+)\s*,\s*(\d+)\s*\]$/);
		    if (!match) {
		        console.error('Invalid format in data-strictly-length. Expected format: [min, max]');
		        return;
		    }

			let minLength = parseInt(match[1], 10);
			let maxLength = parseInt(match[2], 10);

			if (this.#options.restrict === 'oninput' && field.value.length > maxLength) {
		        field.value = field.value.substring(0, maxLength);
		    }

		    if (field.value.length < minLength || field.value.length > maxLength) {
		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';
		        error.push(`${fieldLabel} must be between ${minLength} and ${maxLength} characters.`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('min') || field.hasAttribute('data-strictly-min')) {
			let minimum = field.getAttribute('min') || field.getAttribute('data-strictly-min');

			if (this.#options.restrict === 'oninput') {
		        field.value = field.value.replace(/\D/g, '');
		    }

		    if (!/^-?\d*\.?\d+$/.test(field.value)) {
		        error.push(`Please enter a valid number.`);
		        isValid = false;
		    } else if (parseFloat(field.value) < parseFloat(minimum)) {
		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';
    			error.push(`${fieldLabel} must be at least ${minimum}.`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('max') || field.hasAttribute('data-strictly-max')) {
			let maximum = (field.getAttribute('max') || field.getAttribute('data-strictly-max'));

			if (this.#options.restrict === 'oninput') {
		        field.value = field.value.replace(/\D/g, '');
		    }

		    if (!/^-?\d*\.?\d+$/.test(field.value)) {
		        error.push(`Please enter a valid number.`);
		        isValid = false;
		    } else if (parseFloat(field.value) > parseFloat(maximum)) {
		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';
    			error.push(`${fieldLabel} must be less than or equal to ${maximum}.`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-range')) {
		    let range = field.getAttribute('data-strictly-range');

	        let match = range.match(/^\[\s*(\d+)\s*,\s*(\d+)\s*\]$/);
	        if (!match) {
	            console.error('Invalid format in data-strictly-range. Expected format: [min, max]');
	            return;
	        }

	        let minRange = parseFloat(match[1]);
	        let maxRange = parseFloat(match[2]);

	        if (this.#options.restrict === 'oninput') {
	            field.value = field.value.replace(/[^0-9.-]/g, '');
	        }

	        let value = parseFloat(field.value);

	        if (isNaN(value)) {
	            error.push('Please enter a valid number.');
	            isValid = false;
	        } else if (value < minRange || value > maxRange) {
	            let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';
	            error.push(`${fieldLabel} must be between ${minRange} and ${maxRange}.`);
	            isValid = false;
	        }
		}

		if (field.hasAttribute('data-strictly-pattern')) {
		    let pattern = field.getAttribute('data-strictly-pattern');
		    let fullPattern = new RegExp(pattern);
		    
		    if (!fullPattern.test(field.value)) {
		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';
		        error.push(`${fieldLabel} must match the required pattern.`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-password')) {
		    let rules = field.getAttribute('data-strictly-password').split(',');
		    let hasCaps = false, hasSmall = false, hasNum = false, minSpecial = 0, minLength = 0, maxLength = Infinity;

		    rules.forEach(rule => {
		        if (rule === 'alpha:caps') hasCaps = true;
		        if (rule === 'alpha:small') hasSmall = true;
		        if (rule === 'num') hasNum = true;
		        if (rule.includes('special:min=')) minSpecial = parseInt(rule.split('=')[1], 10);
		        if (rule.includes('min=')) minLength = parseInt(rule.split('=')[1], 10);
    			if (rule.includes('max=')) maxLength = parseInt(rule.split('=')[1], 10);
		    });

		    if (this.#options.restrict === 'oninput') {
	            let filteredValue = field.value.replace(/[^a-zA-Z0-9!@#$%^&*()_+~`|}{[\]:;?><,./-=]/g, '');

	            if (filteredValue.length > maxLength) {
	                filteredValue = filteredValue.substring(0, maxLength);
	            }

	            if (field.value !== filteredValue) field.value = filteredValue;
		    }

		    let value = field.value;
		    let containsCaps = /[A-Z]/.test(value);
		    let containsSmall = /[a-z]/.test(value);
		    let containsNum = /[0-9]/.test(value);
		    let specialCount = (value.match(/[^a-zA-Z0-9]/g) || []).length;

		    let errorMsg = [];

		    if (value.length < minLength) errorMsg.push(`at least ${minLength} characters`);
		    if (value.length > maxLength) errorMsg.push(`at most ${maxLength} characters`);
		    if (hasCaps && !containsCaps) errorMsg.push(`1 uppercase letter`);
		    if (hasSmall && !containsSmall) errorMsg.push(`1 lowercase letter`);
		    if (hasNum && !containsNum) errorMsg.push(`1 number`);
		    if (specialCount < minSpecial) errorMsg.push(`${minSpecial} special character(s)`);

		    if (errorMsg.length) {
		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';
		        error.push(`${fieldLabel} must contain ${errorMsg.join(', ')}.`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-mincheck')) {
			if (field.type !== 'checkbox') {
				console.error('Validation error: The field must be a checkbox.');
				return ;
			}

			let groupName = field.getAttribute('name');
			let minCheck = parseInt(field.getAttribute('data-strictly-mincheck'), 10);
			
			let checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
		    let checked = [...checkboxes].filter(cb => cb.checked).length;

		    if (checked < minCheck) {
		    	let fieldLabel = field.getAttribute('aria-label') || groupName || 'This field';
    			error.push(`${fieldLabel}: You must select at least ${minCheck} options.`);
		    	isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-maxcheck')) {
		    if (field.type !== 'checkbox') {
		        console.error('Validation error: The field must be a checkbox.');
		        return;
		    }

		    let groupName = field.getAttribute('name');
		    let maxCheck = parseInt(field.getAttribute('data-strictly-maxcheck'), 10);

		    let checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
		    let checkedCount = [...checkboxes].filter(cb => cb.checked).length;

		    if (checkedCount > maxCheck) {
		        if (this.#options.restrict === 'oninput') {
		            field.checked = false;
		        }

		        let fieldLabel = field.getAttribute('aria-label') || groupName || 'This field';
		        error.push(`${fieldLabel}: You can select up to ${maxCheck} options.`);
		        isValid = false;
		    }

		    if (!field.dataset.listenerAdded) {
		        checkboxes.forEach(cb => {
		            cb.addEventListener('change', () => {
		                let checkedNow = [...checkboxes].filter(cb => cb.checked).length;
		                if (checkedNow > maxCheck) {
		                    cb.checked = false;
		                }
		            });
		        });
		        field.dataset.listenerAdded = "true";
		    }
		}

		if (field.hasAttribute('data-strictly-check')) {
		    if (field.type !== 'checkbox') {
		        console.error('Validation error: The field must be a checkbox.');
		        return;
		    }

		    let groupName = field.getAttribute('name');
		    let checkAttr = field.getAttribute('data-strictly-check').trim();

		    let match = checkAttr.match(/^\[\s*(\d+)\s*,\s*(\d+)\s*\]$/);
		    if (!match) {
		        console.error(`Invalid format in data-strictly-check: Expected format [min, max], got '${checkAttr}'`);
		        return;
		    }

		    let minCheck = parseInt(match[1], 10);
		    let maxCheck = parseInt(match[2], 10);

		    let checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
		    let checkedCount = [...checkboxes].filter(cb => cb.checked).length;

		    if (checkedCount < minCheck || checkedCount > maxCheck) {
		        if (this.#options.restrict === 'oninput' && checkedCount > maxCheck) {
		            field.checked = false;
		        }

		        let fieldLabel = field.getAttribute('aria-label') || groupName || 'This field';
		        error.push(`${fieldLabel}: Please select between ${minCheck} and ${maxCheck} options.`);
		        isValid = false;
		    }

		    if (!field.dataset.listenerAdded) {
		        checkboxes.forEach(cb => {
		            cb.addEventListener('change', () => {
		                let checkedNow = [...checkboxes].filter(cb => cb.checked).length;
		                if (checkedNow > maxCheck) {
		                    cb.checked = false;
		                }
		            });
		        });
		        field.dataset.listenerAdded = "true";
		    }
		}

		if (field.hasAttribute('data-strictly-equalto')) {
		    let targetSelector = field.getAttribute('data-strictly-equalto');
		    let targetField = document.querySelector(targetSelector);

		    if (!targetField) {
		        console.error(`Invalid target selector in data-strictly-equalto: "${targetSelector}" does not match any element.`);
		        return;
		    }

		    if (targetField.value !== field.value) {
		        let fieldLabel = field.getAttribute('aria-label') || field.getAttribute('name') || 'This field';
		        let targetLabel = targetField.getAttribute('aria-label') || targetField.getAttribute('name') || 'the referenced field';
		        error.push(`${fieldLabel} must be equal to ${targetLabel}.`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-minwords')) {
			let minWords = field.getAttribute('data-strictly-minwords');
			minWords = parseInt(minWords, 10);

			if (isNaN(minWords) || minWords < 1) {
		        console.error(`Invalid value in data-strictly-minwords: "${minWords}". It must be a positive number.`);
		        return;
		    }

			let words = field.value.trim().split(/\s+/).filter(word => word.length > 0)
			
			if (minWords > words.length) {
				error.push(`At least ${minWords} words are required.`);
				isValid = false;
			}
		}

		if (field.hasAttribute('data-strictly-maxwords')) {
		    let maxWords = field.getAttribute('data-strictly-maxwords');
		    maxWords = parseInt(maxWords, 10);

		    if (isNaN(maxWords) || maxWords < 1) {
		        console.error(`Invalid value in data-strictly-maxwords: "${maxWords}". It must be a positive number.`);
		        return;
		    }

		    let words = field.value.trim().split(/\s+/).filter(word => word.length > 0);

		    if (words.length > maxWords) {
		        if (this.#options.restrict === 'oninput') {
		            field.value = words.slice(0, maxWords).join(' ');
		        }

		        error.push(`A maximum of ${maxWords} words are allowed.`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-words')) {
		    let wordsminmax = field.getAttribute('data-strictly-words');

		    let match = wordsminmax.match(/^\[\s*(\d+)\s*,\s*(\d+)\s*\]$/);
		    if (!match) {
		        console.error('Invalid format in data-strictly-words. Expected format: [min, max]');
		        return;
		    }

		    let minWords = parseInt(match[1], 10);
		    let maxWords = parseInt(match[2], 10);

		    if (minWords < 0 || maxWords < minWords) {
		        console.error(`Invalid min/max values in data-strictly-words: Min (${minWords}) should be non-negative, and Max (${maxWords}) should be greater than or equal to Min.`);
		        return;
		    }

		    let words = field.value.trim().split(/\s+/).filter(word => word.length > 0);

		    if (words.length < minWords || words.length > maxWords) {
		        if (this.#options.restrict === 'oninput' && words.length > maxWords) {
		            field.value = words.slice(0, maxWords).join(' ');
		        }

		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';
		        error.push(`${fieldLabel} must contain between ${minWords} and ${maxWords} words.`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-mincharacters')) {
		    let minCharacters = field.getAttribute('data-strictly-mincharacters');
		    minCharacters = parseInt(minCharacters, 10);

		    if (isNaN(minCharacters) || minCharacters < 1) {
		        console.error(`Invalid value in data-strictly-mincharacters: "${minCharacters}". It must be a positive number.`);
		        return;
		    }

		    let characterCount = field.value.trim().length;

		    if (characterCount < minCharacters) {
		        error.push(`At least ${minCharacters} characters are required.`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-maxcharacters')) {
		    let maxCharacters = field.getAttribute('data-strictly-maxcharacters');
		    maxCharacters = parseInt(maxCharacters, 10);

		    if (isNaN(maxCharacters) || maxCharacters < 1) {
		        console.error(`Invalid value in data-strictly-maxcharacters: "${maxCharacters}". It must be a positive number.`);
		        return;
		    }

		    let characterCount = field.value.trim().length;

		    if (characterCount > maxCharacters) {
		        if (this.#options.restrict === 'oninput') {
		            field.value = field.value.substring(0, maxCharacters);
		        }

		        error.push(`Maximum allowed characters: ${maxCharacters}.`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-characters')) {
		    let characters = field.getAttribute('data-strictly-characters');

		    let match = characters.match(/^\[\s*(\d+)\s*,\s*(\d+)\s*\]$/);
		    if (!match) {
		        console.error('Invalid format in data-strictly-characters. Expected format: [min, max]');
		        return;
		    }

		    let minChars = parseInt(match[1], 10);
		    let maxChars = parseInt(match[2], 10);

		    if (minChars < 0 || maxChars < minChars) {
		        console.error(`Invalid min/max values in data-strictly-characters: Min (${minChars}) should be non-negative, and Max (${maxChars}) should be greater than or equal to Min.`);
		        return;
		    }

		    let charactersCount = field.value.trim().length;

		    if (charactersCount < minChars || charactersCount > maxChars) {
		        if (this.#options.restrict === 'oninput' && charactersCount > maxChars) {
		            field.value = field.value.substring(0, maxChars);
		        }

		        let fieldLabel = field.getAttribute('aria-label') || field.name || 'This field';
		        error.push(`${fieldLabel} must contain between ${minChars} and ${maxChars} characters.`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-minselect')) {
		    if (field.tagName.toLowerCase() !== 'select') {
		        console.error(`Invalid element: data-strictly-minselect can only be used on <select> elements.`);
		        return;
		    }

		    let minSelect = parseInt(field.getAttribute('data-strictly-minselect'), 10);

		    if (isNaN(minSelect) || minSelect < 1) {
		        console.error(`Invalid value in data-strictly-minselect: "${minSelect}". It must be a number greater than 0.`);
		        return;
		    }

		    let selectedCount = [...field.options].filter(opt => opt.selected && opt.value.trim() !== '').length;

		    if (selectedCount < minSelect) {
		        error.push(`You must select at least ${minSelect} option(s).`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-maxselect')) {
		    if (field.tagName.toLowerCase() !== 'select') {
		        console.error(`Invalid element: data-strictly-maxselect can only be used on <select> elements.`);
		        return;
		    }

		    let maxSelect = parseInt(field.getAttribute('data-strictly-maxselect'), 10);

		    if (isNaN(maxSelect) || maxSelect < 1) {
		        console.error(`Invalid value in data-strictly-maxselect: "${maxSelect}". It must be a number greater than 0.`);
		        return;
		    }

		    let selectedOptions = [...field.options].filter(opt => opt.selected && opt.value.trim() !== '');

		    if (selectedOptions.length > maxSelect) {
		        if (this.#options.restrict === 'oninput') {
		            selectedOptions[selectedOptions.length - 1].selected = false;
		        }

		        error.push(`You can select a maximum of ${maxSelect} option(s).`);
		        isValid = false;
		    }
		}

		if (field.hasAttribute('data-strictly-select')) {
		    if (field.tagName.toLowerCase() !== 'select') {
		        console.error('Field must be a <select> element.');
		        return;
		    }

		    let selectRange = field.getAttribute('data-strictly-select');
		    let match = selectRange.match(/^\[\s*(\d+)\s*,\s*(\d+)\s*\]$/);

		    if (!match) {
		        console.error('Invalid format in data-strictly-select. Expected format: [min, max]');
		        return;
		    }

		    let minSelect = parseInt(match[1], 10);
		    let maxSelect = parseInt(match[2], 10);

		    if (minSelect < 0 || maxSelect < minSelect) {
		        console.error(`Invalid min/max values in data-strictly-select: Min (${minSelect}) must be non-negative, and Max (${maxSelect}) must be greater than or equal to Min.`);
		        return;
		    }

		    let selectedOptions = [...field.options].filter(opt => opt.selected && opt.value.trim() !== '');

		    if (selectedOptions.length < minSelect || selectedOptions.length > maxSelect) {
		        if (this.#options.restrict === 'oninput' && selectedOptions.length > maxSelect) {
		            selectedOptions[selectedOptions.length - 1].selected = false;
		        }

		        let fieldLabel = field.getAttribute('aria-label') || field.getAttribute('name') || 'Selection';
		        error.push(`${fieldLabel} must have between ${minSelect} and ${maxSelect} selected options.`);
		        isValid = false;
		    }
		}

		if (isValidator) {
			if (!isValid) this.#showError(field, error);
			else this.#clearError(field);
		}

		let handlers = {
	        'checkbox': () => document.querySelectorAll(`input[name="${field.name}"]:checked`).length,
	        'select-multiple': () => Array.from(field.selectedOptions).map(option => option.value)
	    };

	    const value = (handlers[field.type] || (() => field.value))();

		return { isValid, value, error };
	}

	#showError(field, message)
	{
		this.#clearError(field);
		field.classList.remove(this.#options.fieldSuccessClass);
		field.classList.add(this.#options.fieldErrorClass);

	    let customMessage = field.getAttribute('data-strictly-message');
	    if (customMessage) {
	        message = customMessage;
	    }

		let errorId = field.getAttribute('data-strictly-connector');
		if (!errorId) return;

		let errorTag = document.getElementById(errorId);
		if (errorTag) {
			errorTag.classList.add("filled");
			errorTag.innerHTML = Array.isArray(message) ? message.join("<br>") : message;
		}
	}

	#clearError(field)
	{
		if (!field || !field.hasAttribute('data-strictly-connector')) return;

		field.classList.remove(this.#options.fieldErrorClass);
	    let errorId = field.getAttribute('data-strictly-connector');
	    if (!errorId) return;
	    
	    let errorElement = document.getElementById(errorId);
	    if (errorElement) {
	        errorElement.textContent = "";
	    	errorElement.classList.remove("filled");
	    }

		field.classList.add(this.#options.fieldSuccessClass);
	}
}
