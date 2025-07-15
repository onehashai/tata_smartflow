frappe.ui.form.on('Sales Order', {
    on_load: function (frm) {

        // Add "Call" custom button
        frm.add_custom_button(__('Call'), function () {
            const phoneNumber = frm.doc.contact_phone || frm.doc.contact_mobile;

            if (!phoneNumber) {
                frappe.msgprint(__('No phone number found for this Sales Order.'));
                return;
            }

            // First, get the Tata Tele User based on current user's email
            frappe.call({
                method: "frappe.client.get_value",
                args: {
                    doctype: "Tata Tele Users",
                    filters: { user: frappe.session.user },
                    fieldname: ["name"]
                },
                callback: function(r) {
                    if (!r.message || !r.message.name) {
                        frappe.msgprint(__('No Tata Tele User found for current user.'));
                        return;
                    }

                    const agent_name = r.message.name;

                    // Show prompt for client number
                    frappe.prompt([
                        {
                            fieldname: 'client_number',
                            label: __('Client Number'),
                            fieldtype: 'Data',
                            default: phoneNumber,
                        }
                    ], function(values) {
                        // Get agent phone number and proceed with call
                        frappe.call({
                            method: "frappe.client.get_value",
                            args: {
                                doctype: "Tata Tele Users",
                                filters: { name: agent_name },
                                fieldname: ["phone_number"]
                            },
                            callback: function (response) {
                                const agentPhoneNumber = response.message.phone_number;

                                if (!agentPhoneNumber) {
                                    frappe.msgprint(__('No phone number found for the selected agent.'));
                                    return;
                                }

                                // Call the backend API with doctype parameter
                                frappe.call({
                                    method: "tata_smartflow_onehash_integration.tata_smartflow_onehash_integration.api.calling_api.initiate_call",
                                    args: {
                                        docname: frm.doc.name,
                                        agent_name: agent_name,
                                        client_phone_number: values.client_number,
                                        doctype: "Sales Order"  // Add doctype parameter
                                    },
                                    callback: function (response) {
                                        if (response.message) {
                                            frappe.show_alert({
                                                message: __("Call Initiated"),
                                                indicator: "green"
                                            });
                                        } else {
                                            frappe.show_alert({
                                                message: __("Failed to initiate call"),
                                                indicator: "orange"
                                            });
                                        }
                                    },
                                    error: function () {
                                        frappe.show_alert({
                                            message: __("An error occurred while initiating the call"),
                                            indicator: "red"
                                        });
                                    }
                                });
                            }
                        });
                    }, __('Initiate Call'), __('Call Now'));
                }
            });
        });
    }
});