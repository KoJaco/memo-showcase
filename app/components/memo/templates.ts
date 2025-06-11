import { nanoid } from "nanoid";
import { Template } from "./types";

// Default Templates
export const DEFAULT_TEMPLATES: Template[] = [
    {
        id: nanoid(8),
        name: "Restaurant Booking",
        description:
            "For speech about making restaurant reservations, booking tables, or dining requests",
        fields: [
            {
                id: "arg_customer_name",
                identifier: "customer_name",
                name: "Customer Name",
                label: "Customer Name",
                type: "text",
                required: true,
                description: "Full name of the person making the reservation",
            },
            {
                id: "arg_party_size",
                identifier: "party_size",
                name: "Party Size",
                label: "Party Size",
                type: "number",
                required: true,
                description: "Number of people for the reservation",
            },
            {
                id: "arg_date",
                identifier: "date",
                name: "Date",
                label: "Reservation Date",
                type: "date",
                required: true,
                description: "Date for the reservation",
            },
            {
                id: "arg_time",
                identifier: "time",
                name: "Time",
                label: "Reservation Time",
                type: "time",
                required: true,
                description: "Time for the reservation",
            },
            {
                id: "arg_special_requests",
                identifier: "special_requests",
                name: "Special Requests",
                label: "Special Requests",
                type: "textarea",
                required: false,
                description: "Any special dietary requirements or requests",
            },
        ],
    },

    {
        id: nanoid(8),
        name: "Meeting Scheduling",
        description:
            "For speech about scheduling meetings, appointments, or calendar events",
        fields: [
            {
                id: "arg_meeting_title",
                identifier: "meeting_title",
                name: "Meeting Title",
                label: "Meeting Title",
                type: "text",
                required: true,
                description: "Title or subject of the meeting",
            },
            {
                id: "arg_participants",
                identifier: "participants",
                name: "Participants",
                label: "Participants",
                type: "textarea",
                required: true,
                description: "List of meeting participants",
            },
            {
                id: "arg_meeting_date",
                identifier: "meeting_date",
                name: "Meeting Date",
                label: "Meeting Date",
                type: "date",
                required: true,
                description: "Date of the meeting",
            },
            {
                id: "arg_meeting_time",
                identifier: "meeting_time",
                name: "Meeting Time",
                label: "Meeting Time",
                type: "time",
                required: true,
                description: "Start time of the meeting",
            },
            {
                id: "arg_duration",
                identifier: "duration",
                name: "Duration",
                label: "Duration (minutes)",
                type: "number",
                required: true,
                description: "Meeting duration in minutes",
            },
            {
                id: "arg_location",
                identifier: "location",
                name: "Location",
                label: "Location",
                type: "select",
                required: true,
                description: "Meeting location or platform",
                options: [
                    "Conference Room A",
                    "Conference Room B",
                    "Zoom",
                    "Teams",
                    "Google Meet",
                ],
            },
        ],
    },

    {
        id: nanoid(8),
        name: "Product Ordering",
        description:
            "For speech about ordering products, making purchases, or shopping requests",
        fields: [
            {
                id: "arg_product_name",
                identifier: "product_name",
                name: "Product Name",
                label: "Product Name",
                type: "text",
                required: true,
                description: "Name of the product being ordered",
            },
            {
                id: "arg_quantity",
                identifier: "quantity",
                name: "Quantity",
                label: "Quantity",
                type: "number",
                required: true,
                description: "Number of items to order",
            },
            {
                id: "arg_customer_name",
                identifier: "customer_name",
                name: "Customer Name",
                label: "Customer Name",
                type: "text",
                required: true,
                description: "Name of the customer placing the order",
            },
            {
                id: "arg_shipping_address",
                identifier: "shipping_address",
                name: "Shipping Address",
                label: "Shipping Address",
                type: "textarea",
                required: true,
                description: "Complete shipping address",
            },
            {
                id: "arg_shipping_method",
                identifier: "shipping_method",
                name: "Shipping Method",
                label: "Shipping Method",
                type: "select",
                required: true,
                description: "Preferred shipping method",
                options: [
                    "Standard (5-7 days)",
                    "Express (2-3 days)",
                    "Overnight",
                    "Same Day",
                ],
            },
            {
                id: "arg_gift_wrap",
                identifier: "gift_wrap",
                name: "Gift Wrap",
                label: "Gift Wrap",
                type: "checkbox",
                required: false,
                description: "Whether to include gift wrapping",
            },
        ],
    },

    {
        id: nanoid(8),
        name: "Action Items",
        description:
            "For speech about creating action items, tasks, or follow-up activities",
        fields: [
            {
                id: "arg_action_type",
                identifier: "action_type",
                name: "Action Type",
                label: "Action Type",
                type: "select",
                required: true,
                description: "Type of action to be taken",
                options: [
                    "Schedule Meeting",
                    "Send Email",
                    "Make Phone Call",
                    "Create Document",
                    "Review Task",
                    "Follow Up",
                    "Research",
                    "Prepare Presentation",
                ],
            },
            {
                id: "arg_action_description",
                identifier: "action_description",
                name: "Action Description",
                label: "Action Description",
                type: "textarea",
                required: true,
                description: "Detailed description of the action to be taken",
            },
            {
                id: "arg_assignee",
                identifier: "assignee",
                name: "Assignee",
                label: "Assigned To",
                type: "text",
                required: true,
                description: "Person responsible for completing this action",
            },
            {
                id: "arg_due_date",
                identifier: "due_date",
                name: "Due Date",
                label: "Due Date",
                type: "date",
                required: true,
                description: "Date when the action should be completed",
            },
            {
                id: "arg_due_time",
                identifier: "due_time",
                name: "Due Time",
                label: "Due Time",
                type: "time",
                required: false,
                description:
                    "Specific time when the action should be completed",
            },
            {
                id: "arg_priority",
                identifier: "priority",
                name: "Priority",
                label: "Priority Level",
                type: "select",
                required: true,
                description: "Priority level of the action item",
                options: ["Low", "Medium", "High", "Urgent"],
            },
            {
                id: "arg_project",
                identifier: "project",
                name: "Project",
                label: "Related Project",
                type: "text",
                required: false,
                description: "Project or initiative this action relates to",
            },
            {
                id: "arg_notes",
                identifier: "notes",
                name: "Notes",
                label: "Additional Notes",
                type: "textarea",
                required: false,
                description: "Any additional context or notes for this action",
            },
        ],
    },

    {
        id: nanoid(8),
        name: "Travel Booking",
        description:
            "For speech about booking travel, flights, hotels, or vacation planning",
        fields: [
            {
                id: "arg_destination",
                identifier: "destination",
                name: "Destination",
                label: "Destination",
                type: "text",
                required: true,
                description: "Travel destination city or location",
            },
            {
                id: "arg_departure_date",
                identifier: "departure_date",
                name: "Departure Date",
                label: "Departure Date",
                type: "date",
                required: true,
                description: "Date of departure",
            },
            {
                id: "arg_return_date",
                identifier: "return_date",
                name: "Return Date",
                label: "Return Date",
                type: "date",
                required: false,
                description: "Date of return (for round-trip)",
            },
            {
                id: "arg_travelers",
                identifier: "travelers",
                name: "Number of Travelers",
                label: "Number of Travelers",
                type: "number",
                required: true,
                description: "Number of people traveling",
            },
            {
                id: "arg_travel_class",
                identifier: "travel_class",
                name: "Travel Class",
                label: "Travel Class",
                type: "select",
                required: true,
                description: "Preferred travel class",
                options: [
                    "Economy",
                    "Premium Economy",
                    "Business",
                    "First Class",
                ],
            },
            {
                id: "arg_accommodation_type",
                identifier: "accommodation_type",
                name: "Accommodation Type",
                label: "Accommodation Type",
                type: "select",
                required: false,
                description: "Type of accommodation needed",
                options: [
                    "Hotel",
                    "Resort",
                    "Apartment",
                    "Hostel",
                    "Bed & Breakfast",
                    "Vacation Rental",
                ],
            },
            {
                id: "arg_budget",
                identifier: "budget",
                name: "Budget",
                label: "Budget Range",
                type: "select",
                required: false,
                description: "Approximate budget for the trip",
                options: [
                    "Under $500",
                    "$500 - $1,000",
                    "$1,000 - $2,500",
                    "$2,500 - $5,000",
                    "Over $5,000",
                ],
            },
            {
                id: "arg_special_requirements",
                identifier: "special_requirements",
                name: "Special Requirements",
                label: "Special Requirements",
                type: "textarea",
                required: false,
                description: "Any special requirements or preferences",
            },
        ],
    },

    {
        id: nanoid(8),
        name: "Customer Support Ticket",
        description:
            "For speech about creating support tickets, reporting issues, or customer service requests",
        fields: [
            {
                id: "arg_customer_name",
                identifier: "customer_name",
                name: "Customer Name",
                label: "Customer Name",
                type: "text",
                required: true,
                description: "Name of the customer reporting the issue",
            },
            {
                id: "arg_customer_email",
                identifier: "customer_email",
                name: "Customer Email",
                label: "Customer Email",
                type: "email",
                required: true,
                description: "Customer's email address",
            },
            {
                id: "arg_issue_category",
                identifier: "issue_category",
                name: "Issue Category",
                label: "Issue Category",
                type: "select",
                required: true,
                description: "Category of the reported issue",
                options: [
                    "Technical Issue",
                    "Billing Problem",
                    "Account Access",
                    "Feature Request",
                    "Bug Report",
                    "General Inquiry",
                    "Refund Request",
                    "Product Question",
                ],
            },
            {
                id: "arg_priority_level",
                identifier: "priority_level",
                name: "Priority Level",
                label: "Priority Level",
                type: "select",
                required: true,
                description: "Urgency of the issue",
                options: ["Low", "Medium", "High", "Critical"],
            },
            {
                id: "arg_issue_description",
                identifier: "issue_description",
                name: "Issue Description",
                label: "Issue Description",
                type: "textarea",
                required: true,
                description: "Detailed description of the issue",
            },
            {
                id: "arg_steps_to_reproduce",
                identifier: "steps_to_reproduce",
                name: "Steps to Reproduce",
                label: "Steps to Reproduce",
                type: "textarea",
                required: false,
                description: "Steps to reproduce the issue (if applicable)",
            },
            {
                id: "arg_affected_product",
                identifier: "affected_product",
                name: "Affected Product",
                label: "Affected Product/Service",
                type: "text",
                required: false,
                description: "Product or service affected by the issue",
            },
            {
                id: "arg_browser_device",
                identifier: "browser_device",
                name: "Browser/Device Info",
                label: "Browser/Device Info",
                type: "text",
                required: false,
                description: "Browser and device information",
            },
        ],
    },

    {
        id: nanoid(8),
        name: "Event Planning",
        description:
            "For speech about planning events, parties, conferences, or gatherings",
        fields: [
            {
                id: "arg_event_name",
                identifier: "event_name",
                name: "Event Name",
                label: "Event Name",
                type: "text",
                required: true,
                description: "Name or title of the event",
            },
            {
                id: "arg_event_type",
                identifier: "event_type",
                name: "Event Type",
                label: "Event Type",
                type: "select",
                required: true,
                description: "Type of event being planned",
                options: [
                    "Birthday Party",
                    "Wedding",
                    "Corporate Meeting",
                    "Conference",
                    "Workshop",
                    "Networking Event",
                    "Product Launch",
                    "Holiday Party",
                    "Team Building",
                    "Fundraiser",
                ],
            },
            {
                id: "arg_event_date",
                identifier: "event_date",
                name: "Event Date",
                label: "Event Date",
                type: "date",
                required: true,
                description: "Date of the event",
            },
            {
                id: "arg_event_time",
                identifier: "event_time",
                name: "Event Time",
                label: "Event Start Time",
                type: "time",
                required: true,
                description: "Start time of the event",
            },
            {
                id: "arg_duration",
                identifier: "duration",
                name: "Duration",
                label: "Duration (hours)",
                type: "number",
                required: true,
                description: "Expected duration of the event in hours",
            },
            {
                id: "arg_expected_attendees",
                identifier: "expected_attendees",
                name: "Expected Attendees",
                label: "Expected Number of Attendees",
                type: "number",
                required: true,
                description: "Expected number of people attending",
            },
            {
                id: "arg_venue_type",
                identifier: "venue_type",
                name: "Venue Type",
                label: "Venue Type",
                type: "select",
                required: true,
                description: "Type of venue needed",
                options: [
                    "Indoor",
                    "Outdoor",
                    "Restaurant",
                    "Hotel Ballroom",
                    "Conference Center",
                    "Home",
                    "Office",
                    "Community Center",
                    "Virtual",
                ],
            },
            {
                id: "arg_budget_range",
                identifier: "budget_range",
                name: "Budget Range",
                label: "Budget Range",
                type: "select",
                required: false,
                description: "Budget range for the event",
                options: [
                    "Under $500",
                    "$500 - $1,000",
                    "$1,000 - $2,500",
                    "$2,500 - $5,000",
                    "$5,000 - $10,000",
                    "Over $10,000",
                ],
            },
            {
                id: "arg_catering_required",
                identifier: "catering_required",
                name: "Catering Required",
                label: "Catering Required",
                type: "checkbox",
                required: false,
                description: "Whether catering is needed",
            },
            {
                id: "arg_special_requirements",
                identifier: "special_requirements",
                name: "Special Requirements",
                label: "Special Requirements",
                type: "textarea",
                required: false,
                description:
                    "Any special requirements, dietary restrictions, or notes",
            },
        ],
    },
];

// Contact Information Extraction Template
const contactInfoTemplate: Template = {
    id: nanoid(8),
    name: "Contact Information Extraction",
    description: "Extract contact details from conversations or documents",
    fields: [
        {
            id: "fullName",
            identifier: "fullName",
            name: "Full Name",
            label: "Full Name",
            type: "text",
            description: "The person's full name",
            required: true,
        },
        {
            id: "email",
            identifier: "email",
            name: "Email Address",
            label: "Email Address",
            type: "email",
            description: "The person's email address",
            required: true,
        },
        {
            id: "phone",
            identifier: "phone",
            name: "Phone Number",
            label: "Phone Number",
            type: "text",
            description: "The person's phone number",
            required: false,
        },
        {
            id: "company",
            identifier: "company",
            name: "Company",
            label: "Company",
            type: "text",
            description: "The person's company or organization",
            required: false,
        },
        {
            id: "title",
            identifier: "title",
            name: "Job Title",
            label: "Job Title",
            type: "text",
            description: "The person's job title or role",
            required: false,
        },
        {
            id: "location",
            identifier: "location",
            name: "Location",
            label: "Location",
            type: "text",
            description: "The person's location or address",
            required: false,
        },
    ],
};

// Meeting Notes Analysis Template
const meetingNotesTemplate: Template = {
    id: nanoid(8),
    name: "Meeting Notes Analysis",
    description: "Extract key information from meeting discussions",
    fields: [
        {
            id: "participants",
            identifier: "participants",
            name: "Participants",
            label: "Participants",
            type: "text",
            description: "List of meeting participants",
            required: true,
        },
        {
            id: "date",
            identifier: "date",
            name: "Meeting Date",
            label: "Meeting Date",
            type: "date",
            description: "Date of the meeting",
            required: true,
        },
        {
            id: "time",
            identifier: "time",
            name: "Meeting Time",
            label: "Meeting Time",
            type: "time",
            description: "Time of the meeting",
            required: true,
        },
        {
            id: "agenda",
            identifier: "agenda",
            name: "Agenda Items",
            label: "Agenda Items",
            type: "textarea",
            description: "Main topics discussed",
            required: true,
        },
        {
            id: "actionItems",
            identifier: "actionItems",
            name: "Action Items",
            label: "Action Items",
            type: "textarea",
            description: "Tasks and follow-ups assigned",
            required: false,
        },
        {
            id: "decisions",
            identifier: "decisions",
            name: "Key Decisions",
            label: "Key Decisions",
            type: "textarea",
            description: "Important decisions made",
            required: false,
        },
    ],
};

// Product Review Analysis Template
const productReviewTemplate: Template = {
    id: nanoid(8),
    name: "Product Review Analysis",
    description: "Extract structured information from product reviews",
    fields: [
        {
            id: "productName",
            identifier: "productName",
            name: "Product Name",
            label: "Product Name",
            type: "text",
            description: "Name of the product being reviewed",
            required: true,
        },
        {
            id: "rating",
            identifier: "rating",
            name: "Rating",
            label: "Rating",
            type: "select",
            description: "Overall rating given",
            required: true,
            options: ["1", "2", "3", "4", "5"],
        },
        {
            id: "pros",
            identifier: "pros",
            name: "Pros",
            label: "Pros",
            type: "textarea",
            description: "Positive aspects mentioned",
            required: false,
        },
        {
            id: "cons",
            identifier: "cons",
            name: "Cons",
            label: "Cons",
            type: "textarea",
            description: "Negative aspects mentioned",
            required: false,
        },
        {
            id: "recommendation",
            identifier: "recommendation",
            name: "Recommendation",
            label: "Recommendation",
            type: "radio-group",
            description: "Whether the reviewer recommends the product",
            required: true,
            options: ["Yes", "No", "Maybe"],
        },
        {
            id: "summary",
            identifier: "summary",
            name: "Summary",
            label: "Summary",
            type: "textarea",
            description: "Overall summary of the review",
            required: false,
        },
    ],
};

// Add the new templates to the templates array
export const templates: Template[] = [
    ...DEFAULT_TEMPLATES,
    contactInfoTemplate,
    meetingNotesTemplate,
    productReviewTemplate,
];

// Template management functions
const TEMPLATES_STORAGE_KEY = "memonic_templates";

export const initializeTemplates = () => {
    // Always use the default templates as read-only constants
    // Store them in localStorage for consistency but don't allow editing
    const existingTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    console.log("🔍 Existing templates from localStorage:", existingTemplates);

    if (!existingTemplates) {
        console.log("📝 No existing templates, creating new ones");
        const templateData = {
            version: "1.0",
            templates: templates,
            lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(
            TEMPLATES_STORAGE_KEY,
            JSON.stringify(templateData)
        );
        console.log("✅ Saved default templates to localStorage");
        console.log("🎯 Returning DEFAULT_TEMPLATES:", templates[0]?.fields[0]);
        return templates;
    }

    try {
        const templateData = JSON.parse(existingTemplates);
        console.log("📋 Parsed template data:", templateData);

        // If the stored data doesn't have the expected structure, reset it
        if (!templateData.templates || !Array.isArray(templateData.templates)) {
            console.log("⚠️ Invalid template structure, resetting");
            const newTemplateData = {
                version: "1.0",
                templates: DEFAULT_TEMPLATES,
                lastUpdated: new Date().toISOString(),
            };
            localStorage.setItem(
                TEMPLATES_STORAGE_KEY,
                JSON.stringify(newTemplateData)
            );
            return DEFAULT_TEMPLATES;
        }
        console.log(
            "🎯 Returning stored templates:",
            templateData.templates[0]?.fields[0]
        );
        return templateData.templates;
    } catch (error) {
        console.log("❌ Error parsing templates:", error);
        // If parsing fails, reset to defaults
        const templateData = {
            version: "1.0",
            templates: DEFAULT_TEMPLATES,
            lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(
            TEMPLATES_STORAGE_KEY,
            JSON.stringify(templateData)
        );
        return DEFAULT_TEMPLATES;
    }
};

export const getTemplates = (): Template[] => {
    return initializeTemplates(); // Always return the initialized templates
};

export const saveTemplate = (template: Template) => {
    const templates = getTemplates();
    const updatedTemplates = [...templates, template];
    localStorage.setItem(
        TEMPLATES_STORAGE_KEY,
        JSON.stringify(updatedTemplates)
    );
    return updatedTemplates;
};

export const deleteTemplateFromStorage = (templateToDelete: Template) => {
    const templates = getTemplates();
    const updatedTemplates = templates.filter(
        (t) => t.id !== templateToDelete.id
    );

    const templateData = {
        version: "1.0",
        templates: updatedTemplates,
        lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templateData));
    console.log(
        "🗑️ Deleted template from localStorage:",
        templateToDelete.name
    );
    return updatedTemplates;
};

export const clearTemplatesFromStorage = () => {
    localStorage.removeItem(TEMPLATES_STORAGE_KEY);
    console.log("🗑️ Cleared templates from localStorage");
};
