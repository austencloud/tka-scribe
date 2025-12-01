/**
 * Contact Domain Models
 *
 * Type definitions for contact form data and validation.
 */

/**
 * Contact form field data
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Contact form validation errors
 */
export interface ContactFormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/**
 * Contact form submission status
 */
export type ContactSubmitStatus = "idle" | "submitting" | "success" | "error";

/**
 * Contact information item for display cards
 */
export interface ContactInfoItem {
  icon: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}
