frappe.ui.form.on('Sales Order', {
    refresh: function (frm) {

        console.log("Sales Order Form Loaded", frm.doc.name);

        frm.add_custom_button(__('Call'), function () {
            const phoneNumber = frm.doc.contact_phone || frm.doc.contact_mobile;

            if (!phoneNumber) {
                frappe.msgprint(__('No phone number found for this Sales Order.'));
                return;
            }

            frappe.call({
                method: "frappe.client.get_value",
                args: {
                    doctype: "Tata Tele Users",
                    filters: { user: frappe.session.user },
                    fieldname: ["name"]
                },
                callback: function(r) {
                    console.log("Agent Name Response:", r);
                    if (!r.message || !r.message.name) {
                        frappe.msgprint(__('No Tata Tele User found for current user.'));
                        return;
                    }

                    const agent_name = r.message.name;

                    frappe.prompt([
                        {
                            fieldname: 'client_number',
                            label: __('Client Number'),
                            fieldtype: 'Data',
                            default: phoneNumber,
                        }
                    ], function(values) {
                        frappe.call({
                            method: "frappe.client.get_value",
                            args: {
                                doctype: "Tata Tele Users",
                                filters: { name: agent_name },
                                fieldname: ["phone_number"]
                            },
                            callback: function (response) {
                                console.log("Agent Phone Number Response:", response);
                                const agentPhoneNumber = response.message.phone_number;

                                if (!agentPhoneNumber) {
                                    frappe.msgprint(__('No phone number found for the selected agent.'));
                                    return;
                                }
                                
                                frappe.call({
                                    method: "tata_smartflow_onehash_integration.tata_smartflow_onehash_integration.api.calling_api.initiate_call",
                                    args: {
                                        doctype: "Sales Order",
                                        docname: frm.doc.name,
                                        agent_name: agent_name,
                                        client_phone_number: values.client_number,
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